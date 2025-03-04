import { In, IsNull } from "typeorm";
import { Emojis } from "@/models/index.js";
import type { Emoji } from "@/models/entities/emoji.js";
import type { Note } from "@/models/entities/note.js";
import { Cache } from "./cache.js";
import { isSelfHost, toPunyNullable } from "./convert-host.js";
import { decodeReaction } from "./reaction-lib.js";
import config from "@/config/index.js";
import { query } from "@/prelude/url.js";
import { redisClient } from "@/db/redis.js";

const cache = new Cache<Emoji | null>("populateEmojis", 60 * 60 * 12);

/**
 * 添付用絵文字情報
 */
export type PopulatedEmoji = {
	name: string;
	url: string;
	width: number | null;
	height: number | null;
};

function normalizeHost(
	src: string | undefined,
	noteUserHost: string | null,
): string | null {
	// クエリに使うホスト
	let host =
		src === "."
			? null // .はローカルホスト (ここがマッチするのはリアクションのみ)
			: src === undefined
			? noteUserHost // ノートなどでホスト省略表記の場合はローカルホスト (ここがリアクションにマッチすることはない)
			: isSelfHost(src)
			? null // 自ホスト指定
			: src || noteUserHost; // 指定されたホスト || ノートなどの所有者のホスト (こっちがリアクションにマッチすることはない)

	host = toPunyNullable(host);

	return host;
}

function parseEmojiStr(emojiName: string, noteUserHost: string | null) {
	// emojiName may be of the form `emoji@host`, turn it into a suitable form
	const match = emojiName.split("@");
	const name = match[0];
	const host = toPunyNullable(normalizeHost(match[1], noteUserHost));

	return { name, host };
}

/**
 * 添付用絵文字情報を解決する
 * @param emojiName ノートやユーザープロフィールに添付された、またはリアクションのカスタム絵文字名 (:は含めない, リアクションでローカルホストの場合は@.を付ける (これはdecodeReactionで可能))
 * @param noteUserHost ノートやユーザープロフィールの所有者のホスト
 * @returns 絵文字情報, nullは未マッチを意味する
 */
export async function populateEmoji(
	emojiName: string,
	noteUserHost: string | null,
): Promise<PopulatedEmoji | null> {
	const { name, host } = parseEmojiStr(emojiName, noteUserHost);
	if (name == null) return null;

	const queryOrNull = async () =>
		(await Emojis.findOneBy({
			name,
			host: host ?? IsNull(),
		})) || null;

	const cacheKey = `${name} ${host}`;
	let emoji = await cache.fetch(cacheKey, queryOrNull);

	if (emoji && !(emoji.width && emoji.height)) {
		emoji = await queryOrNull();
		await cache.set(cacheKey, emoji);
	}

	if (emoji == null) return null;

	const isLocal = emoji.host == null;
	const emojiUrl = emoji.publicUrl || emoji.originalUrl; // || emoji.originalUrl してるのは後方互換性のため
	const url = isLocal
		? emojiUrl
		: `${config.url}/proxy/${encodeURIComponent(
				new URL(emojiUrl).pathname,
		  )}?${query({ url: emojiUrl })}`;

	return {
		name: emojiName,
		url,
		width: emoji.width,
		height: emoji.height,
	};
}

/**
 * 複数の添付用絵文字情報を解決する (キャシュ付き, 存在しないものは結果から除外される)
 */
export async function populateEmojis(
	emojiNames: string[],
	noteUserHost: string | null,
): Promise<PopulatedEmoji[]> {
	const emojis = await Promise.all(
		emojiNames.map((x) => populateEmoji(x, noteUserHost)),
	);
	return emojis.filter((x): x is PopulatedEmoji => x != null);
}

export function aggregateNoteEmojis(notes: Note[]) {
	let emojis: { name: string | null; host: string | null }[] = [];
	for (const note of notes) {
		emojis = emojis.concat(
			note.emojis.map((e) => parseEmojiStr(e, note.userHost)),
		);
		if (note.renote) {
			emojis = emojis.concat(
				note.renote.emojis.map((e) => parseEmojiStr(e, note.renote!.userHost)),
			);
			if (note.renote.user) {
				emojis = emojis.concat(
					note.renote.user.emojis.map((e) =>
						parseEmojiStr(e, note.renote!.userHost),
					),
				);
			}
		}
		const customReactions = Object.keys(note.reactions)
			.map((x) => decodeReaction(x))
			.filter((x) => x.name != null) as typeof emojis;
		emojis = emojis.concat(customReactions);
		if (note.user) {
			emojis = emojis.concat(
				note.user.emojis.map((e) => parseEmojiStr(e, note.userHost)),
			);
		}
	}
	return emojis.filter((x) => x.name != null) as {
		name: string;
		host: string | null;
	}[];
}

/**
 * 与えられた絵文字のリストをデータベースから取得し、キャッシュに追加します
 */
export async function prefetchEmojis(
	emojis: { name: string; host: string | null }[],
): Promise<void> {
	const notCachedEmojis = emojis.filter(
		async (emoji) => !(await cache.get(`${emoji.name} ${emoji.host}`)),
	);
	const emojisQuery: any[] = [];
	const hosts = new Set(notCachedEmojis.map((e) => e.host));
	for (const host of hosts) {
		emojisQuery.push({
			name: In(
				notCachedEmojis.filter((e) => e.host === host).map((e) => e.name),
			),
			host: host ?? IsNull(),
		});
	}
	const _emojis =
		emojisQuery.length > 0
			? await Emojis.find({
					where: emojisQuery,
					select: ["name", "host", "originalUrl", "publicUrl"],
			  })
			: [];
	const trans = redisClient.multi();
	for (const emoji of _emojis) {
		cache.set(`${emoji.name} ${emoji.host}`, emoji, trans);
	}
	await trans.exec();
}
