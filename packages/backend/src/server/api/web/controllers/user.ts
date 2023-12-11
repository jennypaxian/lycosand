import { Controller, CurrentUser, Get, Params, Query } from "@iceshrimp/koa-openapi";
import { UserResponse } from "@/server/api/web/entities/user.js";
import { TimelineResponse } from "@/server/api/web/entities/note.js";
import type { ILocalUser } from "@/models/entities/user.js";
import { UserHandler } from "@/server/api/web/handlers/user.js";

@Controller('/user')
export class UserController {
	@Get('/:id')
	async getUser(
		@CurrentUser() me: ILocalUser | null,
		@Params('id') id: string,
		@Query('detail') detail: boolean
	): Promise<UserResponse> {
		return UserHandler.getUser(me, id);
	}

	@Get('/:id/notes')
	async getUserNotes(
		@CurrentUser() me: ILocalUser | null,
		@Params('id') id: string,
		@Query('limit') limit: number = 20,
		@Query('replies') replies: boolean = false,
	): Promise<TimelineResponse> {
		return UserHandler.getUserNotes(me, id, limit, replies);
	}
}
