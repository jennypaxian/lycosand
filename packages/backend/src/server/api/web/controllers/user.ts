import { Controller, CurrentUser, Description, Get, Params, Query, Returns, Security } from "@iceshrimp/koa-openapi";
import { UserResponse } from "@/server/api/web/entities/user.js";
import { TimelineResponse } from "@/server/api/web/entities/note.js";
import type { ILocalUser } from "@/models/entities/user.js";
import { UserHandler } from "@/server/api/web/handlers/user.js";

@Controller('/user')
export class UserController {
	@Get('/:id')
	@Security("user")
	@Description("Returns information on the specified user")
	@Returns(200, "UserResponse", "Successful response")
	@Returns(404, "ErrorResponse", "The specified user does not exist")
	async getUser(
		@CurrentUser() me: ILocalUser | null,
		@Params('id') id: string,
		@Query('detail') detail: boolean
	): Promise<UserResponse> {
		return UserHandler.getUser(me, id);
	}

	@Get('/:id/notes')
	@Security("user")
	@Description("Get the specified user's notes")
	@Returns(200, "TimelineResponse", "Successful response")
	@Returns(404, "ErrorResponse", "The specified user does not exist")
	async getUserNotes(
		@CurrentUser() me: ILocalUser | null,
		@Params('id') id: string,
		@Query('replies') replies: boolean = false,
		@Query('limit') limit: number = 20,
		@Query('max_id') maxId?: string,
		@Query('min_id') minId?: string,
	): Promise<TimelineResponse> {
		return UserHandler.getUserNotes(id, replies, me, limit, maxId, minId);
	}
}
