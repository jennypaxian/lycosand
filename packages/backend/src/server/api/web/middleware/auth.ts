import { WebContext, WebMiddleware } from "@/server/api/web/misc/koa.js";
import { Next } from "koa";
import { Sessions } from "@/models/index.js";
import { Session } from "@/models/entities/session.js";
import { ILocalUser } from "@/models/entities/user.js";

export const AuthenticationMiddleware: WebMiddleware = async (ctx: WebContext, next: Next) => {
	const session = await authenticate(ctx.headers.authorization);
	ctx.state.user = session?.user as ILocalUser;
	ctx.state.session = session;

	await next();
}

export function AuthorizationMiddleware(required: boolean, scopes: string[] = []): WebMiddleware {
	return async (ctx: WebContext, next: Next) => {
		try {
			if (required && !ctx.state.session?.active) {
				throw new Error(); //FIXME
			}
		} catch {}

		await next();
	}
}

async function authenticate(token: string | undefined): Promise<Session | null> {
	if (token == null || token.length < 1) return null;
	if (token.toLowerCase().startsWith('bearer ')) token = token.substring(7);

	return Sessions.findOne({ where: { token }, relations: ["user"] });
}
