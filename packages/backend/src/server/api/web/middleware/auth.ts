import { WebContext, WebMiddleware } from "@/server/api/web/misc/koa.js";
import { Next } from "koa";
import { Sessions } from "@/models/index.js";
import { Session } from "@/models/entities/session.js";
import { ILocalUser } from "@/models/entities/user.js";
import { unauthorized } from "@hapi/boom";

export const AuthenticationMiddleware: WebMiddleware = async (ctx: WebContext, next: Next) => {
	const session = await authenticate(ctx.headers.authorization);
	ctx.state.user = session?.user as ILocalUser;
	ctx.state.session = session;

	await next();
}

export function AuthorizationMiddleware(admin: boolean = false): WebMiddleware {
	return async (ctx: WebContext, next: Next) => {
		if (!ctx.state.session?.active || (admin && !ctx.state.session?.user.isAdmin)) {
			throw unauthorized("This method requires an authenticated user");
		}

		await next();
	}
}

async function authenticate(token: string | undefined): Promise<Session | null> {
	if (token == null || token.length < 1) return null;
	if (token.toLowerCase().startsWith('bearer ')) token = token.substring(7);

	return Sessions.findOne({ where: { token }, relations: ["user"] });
}
