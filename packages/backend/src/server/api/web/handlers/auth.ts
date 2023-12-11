import { ILocalUser } from "@/models/entities/user.js";
import { Session } from "@/models/entities/session.js";
import { AuthRequest, AuthResponse } from "@/server/api/web/entities/auth.js";
import { UserHandler } from "@/server/api/web/handlers/user.js";
import { Sessions, UserProfiles, Users } from "@/models/index.js";
import { comparePassword } from "@/misc/password.js";
import { genId } from "@/misc/gen-id.js";
import { secureRndstr } from "@/misc/secure-rndstr.js";
import { unauthorized, badRequest } from "@hapi/boom";
import { IsNull } from "typeorm";

export class AuthHandler {
	public static async getAuthStatus(me: ILocalUser | null, session: Session | null): Promise<AuthResponse> {
		const user = me ? await UserHandler.getUser(me, me.id) : null;
		return {
			status: !user ? 'guest' : session?.active ? 'authenticated' : '2fa',
			token: session?.token ?? null,
			user: user,
		};
	}

	public static async login(request: AuthRequest): Promise<AuthResponse> {
		if (request.username == null || request.password == null) throw badRequest("Missing username or password");

		const user = await Users.findOneBy({ usernameLower: request.username.toLowerCase(), host: IsNull() });
		if (!user) throw unauthorized("Invalid username or password");

		const profile = await UserProfiles.findOneBy( { userId: user.id });
		if (!profile || profile.password == null) throw unauthorized("Invalid username or password");

		if (!await comparePassword(request.password, profile.password)) throw unauthorized("Invalid username or password");

		const result = await Sessions.insert({
			id: genId(),
			createdAt: new Date(),
			active: !profile.twoFactorEnabled,
			userId: user.id,
			token: secureRndstr(32),
		});

		const session = await Sessions.findOneByOrFail(result.identifiers[0]);

		return this.getAuthStatus(user as ILocalUser, session);
	}
}
