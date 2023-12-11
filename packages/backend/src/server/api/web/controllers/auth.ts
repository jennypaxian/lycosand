import { Controller, Get, Post, Body, CurrentUser, Flow } from "@iceshrimp/koa-openapi";
import type { ILocalUser } from "@/models/entities/user.js";
import { UserHandler } from "@/server/api/web/handlers/user.js";
import type { AuthRequest, AuthResponse } from "@/server/api/web/entities/auth.js";
import type { Session } from "@/models/entities/session.js";
import { RatelimitRouteMiddleware } from "@/server/api/web/middleware/rate-limit.js";
import { CurrentSession } from "@/server/api/web/misc/decorators.js";
import { Sessions, UserProfiles, Users } from "@/models/index.js";
import { unauthorized, badRequest } from "@hapi/boom";
import { comparePassword } from "@/misc/password.js";
import { IsNull } from "typeorm";
import { genId } from "@/misc/gen-id.js";
import { secureRndstr } from "@/misc/secure-rndstr.js";

@Controller('/auth')
export class AuthController {
	@Get('/')
	async getAuth(
		@CurrentUser() me: ILocalUser | null,
		@CurrentSession() session: Session | null,
	): Promise<AuthResponse> {
		const user = me ? await UserHandler.getUser(me, me.id) : null;
		return {
			status: !user ? 'guest' : session?.active ? 'authenticated' : '2fa',
			token: session?.token ?? null,
			user: user,
		};
	}

	@Post('/')
	@Flow([RatelimitRouteMiddleware("auth", 10, 60000, true)])
	async login(@Body({ required: true }) request: AuthRequest): Promise<AuthResponse> {
		if (request.username == null || request.password == null) throw badRequest();

		const user = await Users.findOneBy({ usernameLower: request.username.toLowerCase(), host: IsNull() });
		if (!user) throw unauthorized();

		const profile = await UserProfiles.findOneBy( { userId: user.id });
		if (!profile || profile.password == null) throw unauthorized();

		if (!await comparePassword(request.password, profile.password)) throw unauthorized();

		const result = await Sessions.insert({
			id: genId(),
			createdAt: new Date(),
			active: !profile.twoFactorEnabled,
			userId: user.id,
			token: secureRndstr(32),
		});

		const session = await Sessions.findOneByOrFail(result.identifiers[0]);

		return this.getAuth(user as ILocalUser, session);
	}
}
