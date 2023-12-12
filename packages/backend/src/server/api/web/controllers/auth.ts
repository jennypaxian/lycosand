import { Controller, Get, Post, Body, CurrentUser, Flow, Description, Returns } from "@iceshrimp/koa-openapi";
import type { ILocalUser } from "@/models/entities/user.js";
import type { AuthRequest, AuthResponse } from "@/server/api/web/entities/auth.js";
import type { Session } from "@/models/entities/session.js";
import { RatelimitRouteMiddleware } from "@/server/api/web/middleware/rate-limit.js";
import { CurrentSession } from "@/server/api/web/misc/decorators.js";
import { AuthHandler } from "@/server/api/web/handlers/auth.js";

@Controller('/auth')
export class AuthController {
	@Get('/')
	@Description("Get the authentication status")
	@Returns(200, "Successful response")
	async getAuthStatus(
		@CurrentUser() me: ILocalUser | null,
		@CurrentSession() session: Session | null,
	): Promise<AuthResponse> {
		return AuthHandler.getAuthStatus(me, session);
	}

	@Post('/')
	@Flow([RatelimitRouteMiddleware("auth", 10, 60000, true)])
	@Description("Log in as a user and receive a auth token on success")
	@Returns(200, "Successful response")
	@Returns(400, "Request body is missing or invalid")
	@Returns(401, "Specified username or password are invalid")
	async login(@Body({ required: true }) request: AuthRequest): Promise<AuthResponse> {
		return AuthHandler.login(request);
	}
}
