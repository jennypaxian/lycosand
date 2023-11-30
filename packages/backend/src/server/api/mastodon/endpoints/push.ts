import Router from "@koa/router";
import { auth } from "@/server/api/mastodon/middleware/auth.js";
import { PushHelpers } from "@/server/api/mastodon/helpers/push.js";

export function setupEndpointsPush(router: Router): void {
	router.post("/v1/push/subscription",
		auth(true, ['push']),
		async (ctx) => {
			ctx.body = await PushHelpers.subscribe(ctx);
		}
	);

	router.get("/v1/push/subscription",
		auth(true, ['push']),
		async (ctx) => {
			ctx.body = await PushHelpers.get(ctx);
		}
	);

	router.put("/v1/push/subscription",
		auth(true, ['push']),
		async (ctx) => {
			ctx.body = await PushHelpers.update(ctx);
		}
	);

	router.delete("/v1/push/subscription",
		auth(true, ['push']),
		async (ctx) => {
			ctx.body = await PushHelpers.unsubscribe(ctx);
		}
	);
}
