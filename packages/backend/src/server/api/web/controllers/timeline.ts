import { Controller, CurrentUser, Flow, Get, Params, Query } from "@iceshrimp/koa-openapi";
import { UserResponse } from "@/server/api/web/entities/user.js";
import { TimelineResponse } from "@/server/api/web/entities/note.js";
import type { ILocalUser } from "@/models/entities/user.js";
import { UserHandler } from "@/server/api/web/handlers/user.js";
import { TimelineHandler } from "@/server/api/web/handlers/timeline.js";
import { AuthorizationMiddleware } from "@/server/api/web/middleware/auth.js";

@Controller('/timeline')
export class TimelineController {
	@Get('/home')
	@Flow([AuthorizationMiddleware()])
	async getHomeTimeline(
		@CurrentUser() me: ILocalUser,
		@Query('limit') limit: number = 20,
		@Query('replies') replies: boolean = true,
	): Promise<TimelineResponse> {
		return TimelineHandler.getHomeTimeline(me, limit, replies);
	}
}
