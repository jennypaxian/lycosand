import Router from "@koa/router";
import { auth } from "@/server/api/mastodon/middleware/auth.js";

export function setupEndpointsFilter(router: Router): void {
    router.get(["/v1/filters", "/v2/filters"],
        auth(true, ['read:filters']),
        async (ctx) => {
            ctx.body = [];
        }
    );
    router.post(["/v1/filters", "/v2/filters"],
        auth(true, ['write:filters']),
        async (ctx) => {
            ctx.status = 400;
            ctx.body = { error: "Please change word mute settings in the web frontend settings." };
        }
    );
}
