'use strict';

/**
 * Module dependencies
 */
import it from '../../it';
import parse from '../../../common/text';
import Post from '../../models/post';
import { isValidText } from '../../models/post';
import User from '../../models/user';
import Following from '../../models/following';
import DriveFile from '../../models/drive-file';
import serialize from '../../serializers/post';
import notify from '../../common/notify';
import event from '../../event';
import config from '../../../conf';

/**
 * Create a post
 *
 * @param {any} params
 * @param {any} user
 * @param {any} app
 * @return {Promise<any>}
 */
module.exports = (params, user, app) =>
	new Promise(async (res, rej) =>
{
	// Get 'text' parameter
	const [text, textErr] = it(params.text).must.be.a.string().validate(isValidText).qed();
	if (textErr) return rej('invalid text');

	// Get 'media_ids' parameter
	const [mediaIds, mediaIdsErr] = it(params.media_ids).must.be.an.array().unique().range(1, 4).qed();
	if (mediaIdsErr) return rej('invalid media_ids');

	let files = [];
	if (mediaIds !== null) {
		// Fetch files
		// forEach だと途中でエラーなどがあっても return できないので
		// 敢えて for を使っています。
		for (let i = 0; i < mediaIds.length; i++) {
			const [mediaId, mediaIdErr] = it(mediaIds[i]).must.be.an.id().required().qed();
			if (mediaIdErr) return rej('invalid media id');

			// Fetch file
			// SELECT _id
			const entity = await DriveFile.findOne({
				_id: mediaId,
				user_id: user._id
			}, {
				_id: true
			});

			if (entity === null) {
				return rej('file not found');
			} else {
				files.push(entity);
			}
		}
	} else {
		files = null;
	}

	// Get 'repost_id' parameter
	const [repostId, repostIdErr] = it(params.repost_id).must.be.an.id().qed();
	if (repostIdErr) return rej('invalid repost_id');

	let repost = null;
	if (repostId !== null) {
		// Fetch repost to post
		repost = await Post.findOne({
			_id: repostId
		});

		if (repost == null) {
			return rej('repostee is not found');
		} else if (repost.repost_id && !repost.text && !repost.media_ids) {
			return rej('cannot repost to repost');
		}

		// Fetch recently post
		const latestPost = await Post.findOne({
			user_id: user._id
		}, {
			sort: {
				_id: -1
			}
		});

		// 直近と同じRepost対象かつ引用じゃなかったらエラー
		if (latestPost &&
				latestPost.repost_id &&
				latestPost.repost_id.equals(repost._id) &&
				text === null && files === null) {
			return rej('二重Repostです(NEED TRANSLATE)');
		}

		// 直近がRepost対象かつ引用じゃなかったらエラー
		if (latestPost &&
				latestPost._id.equals(repost._id) &&
				text === null && files === null) {
			return rej('二重Repostです(NEED TRANSLATE)');
		}
	}

	// Get 'in_reply_to_post_id' parameter
	const [inReplyToPostId, inReplyToPostIdErr] = it(params.reply_to_id, 'id');
	if (inReplyToPostIdErr) return rej('invalid in_reply_to_post_id');

	let inReplyToPost = null;
	if (inReplyToPostId !== null) {
		// Fetch reply
		inReplyToPost = await Post.findOne({
			_id: inReplyToPostId
		});

		if (inReplyToPost === null) {
			return rej('in reply to post is not found');
		}

		// 返信対象が引用でないRepostだったらエラー
		if (inReplyToPost.repost_id && !inReplyToPost.text && !inReplyToPost.media_ids) {
			return rej('cannot reply to repost');
		}
	}

	// Get 'poll' parameter
	const [_poll, pollErr] = it(params.poll, 'object');
	if (pollErr) return rej('invalid poll');

	let poll = null;
	if (_poll !== null) {
		const [pollChoices, pollChoicesErr] = it(params.poll, 'set', false, [
			choices => {
				const shouldReject = choices.some(choice => {
					if (typeof choice != 'string') return true;
					if (choice.trim().length == 0) return true;
					if (choice.trim().length > 50) return true;
					return false;
				});
				return shouldReject ? new Error('invalid poll choices') : true;
			},
			// 選択肢がひとつならエラー
			choices => choices.length == 1 ? new Error('poll choices must be ひとつ以上') : true,
			// 選択肢が多すぎてもエラー
			choices => choices.length > 10 ? new Error('many poll choices') : true,
		]);
		if (pollChoicesErr) return rej('invalid poll choices');

		_poll.choices = pollChoices.map((choice, i) => ({
			id: i, // IDを付与
			text: choice.trim(),
			votes: 0
		}));

		poll = _poll;
	}

	// テキストが無いかつ添付ファイルが無いかつRepostも無いかつ投票も無かったらエラー
	if (text === null && files === null && repost === null && poll === null) {
		return rej('text, media_ids, repost_id or poll is required');
	}

	// 投稿を作成
	const post = await Post.insert({
		created_at: new Date(),
		media_ids: files ? files.map(file => file._id) : undefined,
		reply_to_id: inReplyToPost ? inReplyToPost._id : undefined,
		repost_id: repost ? repost._id : undefined,
		poll: poll ? poll : undefined,
		text: text,
		user_id: user._id,
		app_id: app ? app._id : null
	});

	// Serialize
	const postObj = await serialize(post);

	// Reponse
	res(postObj);

	//--------------------------------
	// Post processes

	let mentions = [];

	function addMention(mentionee, type) {
		// Reject if already added
		if (mentions.some(x => x.equals(mentionee))) return;

		// Add mention
		mentions.push(mentionee);

		// Publish event
		if (!user._id.equals(mentionee)) {
			event(mentionee, type, postObj);
		}
	}

	// Publish event to myself's stream
	event(user._id, 'post', postObj);

	// Fetch all followers
	const followers = await Following
		.find({
			followee_id: user._id,
			// 削除されたドキュメントは除く
			deleted_at: { $exists: false }
		}, {
			follower_id: true,
			_id: false
		});

	// Publish event to followers stream
	followers.forEach(following =>
		event(following.follower_id, 'post', postObj));

	// Increment my posts count
	User.update({ _id: user._id }, {
		$inc: {
			posts_count: 1
		}
	});

	// If has in reply to post
	if (inReplyToPost) {
		// Increment replies count
		Post.update({ _id: inReplyToPost._id }, {
			$inc: {
				replies_count: 1
			}
		});

		// 自分自身へのリプライでない限りは通知を作成
		notify(inReplyToPost.user_id, user._id, 'reply', {
			post_id: post._id
		});

		// Add mention
		addMention(inReplyToPost.user_id, 'reply');
	}

	// If it is repost
	if (repost) {
		// Notify
		const type = text ? 'quote' : 'repost';
		notify(repost.user_id, user._id, type, {
			post_id: post._id
		});

		// If it is quote repost
		if (text) {
			// Add mention
			addMention(repost.user_id, 'quote');
		} else {
			// Publish event
			if (!user._id.equals(repost.user_id)) {
				event(repost.user_id, 'repost', postObj);
			}
		}

		// 今までで同じ投稿をRepostしているか
		const existRepost = await Post.findOne({
			user_id: user._id,
			repost_id: repost._id,
			_id: {
				$ne: post._id
			}
		});

		if (!existRepost) {
			// Update repostee status
			Post.update({ _id: repost._id }, {
				$inc: {
					repost_count: 1
				}
			});
		}
	}

	// If has text content
	if (text) {
		// Analyze
		const tokens = parse(text);
/*
		// Extract a hashtags
		const hashtags = tokens
			.filter(t => t.type == 'hashtag')
			.map(t => t.hashtag)
			// Drop dupulicates
			.filter((v, i, s) => s.indexOf(v) == i);

		// ハッシュタグをデータベースに登録
		registerHashtags(user, hashtags);
*/
		// Extract an '@' mentions
		const atMentions = tokens
			.filter(t => t.type == 'mention')
			.map(m => m.username)
			// Drop dupulicates
			.filter((v, i, s) => s.indexOf(v) == i);

		// Resolve all mentions
		await Promise.all(atMentions.map(async (mention) => {
			// Fetch mentioned user
			// SELECT _id
			const mentionee = await User
				.findOne({
					username_lower: mention.toLowerCase()
				}, { _id: true });

			// When mentioned user not found
			if (mentionee == null) return;

			// 既に言及されたユーザーに対する返信や引用repostの場合も無視
			if (inReplyToPost && inReplyToPost.user_id.equals(mentionee._id)) return;
			if (repost && repost.user_id.equals(mentionee._id)) return;

			// Add mention
			addMention(mentionee._id, 'mention');

			// Create notification
			notify(mentionee._id, user._id, 'mention', {
				post_id: post._id
			});

			return;
		}));
	}

	// Register to search database
	if (text && config.elasticsearch.enable) {
		const es = require('../../../db/elasticsearch');

		es.index({
			index: 'misskey',
			type: 'post',
			id: post._id.toString(),
			body: {
				text: post.text
			}
		});
	}

	// Append mentions data
	if (mentions.length > 0) {
		Post.update({ _id: post._id }, {
			$set: {
				mentions: mentions
			}
		});
	}
});
