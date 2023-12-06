import { WebMiddleware, WebContext, WebState } from "@/server/api/web/index.js";
import { Next } from "koa";
import authenticate from "@/server/api/authenticate.js";

export const AuthenticationMiddleware: WebMiddleware = async (ctx: WebContext, next: Next) => {
	try {
		const [ user, token ] = await authenticate(ctx.headers.authorization, null, false);

		//FIXME we shouldn't need to cast this
		(ctx.state as WebState).user = user ?? null;
		(ctx.state as WebState).token = token ?? null;

	} catch {}

	await next();
}

export function AuthorizationMiddleware(required: boolean, scopes: string[] = []): WebMiddleware {
	return async (ctx: WebContext, next: Next) => {
		try {
			if (required && !(ctx.state as WebState).user) {
				throw new Error(); //FIXME
			}
		} catch {}

		await next();
	}
}
