import { TimelineResponse } from "@/server/api/web/entities/note.js";
import { UserResponse } from "@/server/api/web/entities/user.js";
import { Notes, UserProfiles, Users } from "@/models/index.js";
import { makePaginationQuery } from "@/server/api/common/make-pagination-query.js";
import { generateVisibilityQuery } from "@/server/api/common/generate-visibility-query.js";
import { generateMutedUserQuery } from "@/server/api/common/generate-muted-user-query.js";
import { generateBlockedUserQuery } from "@/server/api/common/generate-block-query.js";
import { ILocalUser, User } from "@/models/entities/user.js";
import { notFound } from "@hapi/boom";
import { NoteHandler } from "@/server/api/web/handlers/note.js";
import { generateFollowingQuery } from "@/server/api/common/generate-following-query.js";
import { generateListQuery } from "@/server/api/common/generate-list-query.js";
import { generateChannelQuery } from "@/server/api/common/generate-channel-query.js";
import { generateRepliesQuery } from "@/server/api/common/generate-replies-query.js";
import { generateMutedUserRenotesQueryForNotes } from "@/server/api/common/generated-muted-renote-query.js";

export class TimelineHandler {
	public static async getHomeTimeline(me: ILocalUser, limit: number, replies: boolean): Promise<TimelineResponse> {
		const query = makePaginationQuery(Notes.createQueryBuilder('note'))
			.innerJoinAndSelect("note.user", "user")
			.leftJoinAndSelect("note.reply", "reply")
			.leftJoinAndSelect("note.renote", "renote")
			.leftJoinAndSelect("reply.user", "replyUser")
			.leftJoinAndSelect("renote.user", "renoteUser");

		await generateFollowingQuery(query, me);
		generateListQuery(query, me);
		generateChannelQuery(query, me);
		generateRepliesQuery(query, replies, me);
		generateVisibilityQuery(query, me);
		generateMutedUserQuery(query, me);
		generateBlockedUserQuery(query, me);
		generateMutedUserRenotesQueryForNotes(query, me);

		query.andWhere("note.visibility != 'hidden'");

		const result = query.take(Math.min(limit, 100)).getMany();
		return {
			notes: await NoteHandler.encodeMany(await result, me),
			limit: limit
		}
	}
}
