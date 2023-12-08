import { Controller, CurrentUser, Get } from "@iceshrimp/koa-openapi";
import type { ILocalUser } from "@/models/entities/user.js";
import { UserHandler } from "@/server/api/web/handlers/user.js";
import { AuthResponse } from "@/server/api/web/entities/auth.js";

@Controller('/auth')
export class AuthController {
	@Get('/')
	async getAuth(
		@CurrentUser() me: ILocalUser | null,
	): Promise<AuthResponse> {
		const user = me ? await UserHandler.getUser(me, me.id) : null;
		return {
			authenticated: !!me,
			user: user,
		};
	}
}
