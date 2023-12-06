import { TimelineResponse } from "@/server/api/web/entities/note.js";
import { UserDetailedResponse, UserResponse } from "@/server/api/web/entities/user.js";
import { Notes, UserProfiles, Users } from "@/models/index.js";
import { makePaginationQuery } from "@/server/api/common/make-pagination-query.js";
import { generateVisibilityQuery } from "@/server/api/common/generate-visibility-query.js";
import { generateMutedUserQuery } from "@/server/api/common/generate-muted-user-query.js";
import { generateBlockedUserQuery } from "@/server/api/common/generate-block-query.js";
import { ILocalUser } from "@/models/entities/user.js";
import { notFound } from "@hapi/boom";

export class UserHandler {
	public static async getUserNotes(me: ILocalUser | null, id: string, limit: number, replies: boolean): Promise<TimelineResponse> {
		const user = await Users.findOneBy({ id });
		if (!user) throw notFound('No such user');

		const query = makePaginationQuery(Notes.createQueryBuilder('note'))
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

		return query.take(Math.min(limit, 100)).getMany();
	}

	public static async getUser(me: ILocalUser | null, id: string): Promise<UserResponse> {
		const user = await Users.findOneBy({ id });
		if (!user) throw notFound('No such user');
		return {
			id: user.id,
			username: user.username,
			avatarUrl: user.avatarUrl ?? undefined,
			bannerUrl: user.bannerUrl ?? undefined,
		};
	}

	public static async getUserDetailed(me: ILocalUser | null, id: string): Promise<UserDetailedResponse> {
		const profile = await UserProfiles.findOneBy({ userId: id });
		return {
			followers: 0,
			following: 0,
			...await this.getUser(me, id),
		}
	}
}
