import authenticate from "@/server/api/authenticate.js";
import { ILocalUser } from "@/models/entities/user.js";
import { MastoContext } from "@/server/api/mastodon/index.js";
import { AuthConverter } from "@/server/api/mastodon/converters/auth.js";
import { MastoApiError } from "@/server/api/mastodon/middleware/catch-errors.js";

export async function AuthMiddleware(ctx: MastoContext, next: () => Promise<any>) {
    const auth = await authenticate(ctx.headers.authorization, null, true).catch(_ => [null, null]);
    ctx.user = auth[0] ?? null as ILocalUser | null;
    ctx.scopes = auth[1]?.permission ?? [] as string[];

    await next();
}

export function auth(required: boolean, scopes: string[] = []) {
    return async function auth(ctx: MastoContext, next: () => Promise<any>) {
        if (required && !ctx.user) throw new MastoApiError(401, "This method requires an authenticated user");

        if (!AuthConverter.decode(scopes).every(p => ctx.scopes.includes(p))) {
            if (required) throw new MastoApiError(403, "This action is outside the authorized scopes")

            ctx.user = null;
            ctx.scopes = [];
        }

        ctx.scopes = AuthConverter.encode(ctx.scopes);

        await next();
    };
}
