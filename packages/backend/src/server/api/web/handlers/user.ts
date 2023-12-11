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

export class UserHandler {
	public static async getUserNotes(id: string, replies: boolean, me: ILocalUser | null, limit: number, maxId: string | undefined, minId: string | undefined): Promise<TimelineResponse> {
		const user = await Users.findOneBy({ id });
		if (!user) throw notFound('No such user');

		const query = makePaginationQuery(
			Notes.createQueryBuilder('note'),
			minId,
			maxId
		)
			.andWhere("note.userId = :userId", { userId: id })
			.innerJoinAndSelect("note.user", "user")
			.leftJoinAndSelect("note.reply", "reply")
			.leftJoinAndSelect("note.renote", "renote")
			.leftJoinAndSelect("reply.user", "replyUser")
			.leftJoinAndSelect("renote.user", "renoteUser");

		generateVisibilityQuery(query, me);
		if (me) {
			generateMutedUserQuery(query, me, user);
			generateBlockedUserQuery(query, me);
		}

		if (!replies) {
			query.andWhere("note.replyId IS NULL");
		}

		const result = query.take(Math.min(limit, 100)).getMany();
		return {
			notes: await NoteHandler.encodeMany(await result, me),
			limit: limit
		}
	}

	public static async getUser(me: ILocalUser | null, id: string): Promise<UserResponse> {
		const user = await Users.findOneBy({ id });
		if (!user) throw notFound('No such user');

		return this.encode(user, me);
	}

	public static async encode(user: User, me: ILocalUser | null): Promise<UserResponse> {
		return {
			id: user.id,
			username: user.username,
			avatarUrl: user.avatarUrl ?? undefined,
			bannerUrl: user.bannerUrl ?? undefined,
		};
	}
}
