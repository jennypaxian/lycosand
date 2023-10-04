import Router from "@koa/router";
import { getClient } from "@/server/api/mastodon/index.js";
import { MiscHelpers } from "@/server/api/mastodon/helpers/misc.js";
import authenticate from "@/server/api/authenticate.js";
import { argsToBools } from "@/server/api/mastodon/endpoints/timeline.js";
import { Announcements } from "@/models/index.js";
import { convertAnnouncementId } from "@/server/api/mastodon/converters.js";
import { convertId, IdType } from "@/misc/convert-id.js";

export function setupEndpointsMisc(router: Router): void {
    router.get("/v1/custom_emojis", async (ctx) => {
        const BASE_URL = `${ctx.request.protocol}://${ctx.request.hostname}`;
        const accessTokens = ctx.request.headers.authorization;
        const client = getClient(BASE_URL, accessTokens);
        try {
            const data = await client.getInstanceCustomEmojis();
            ctx.body = data.data;
        } catch (e: any) {
            console.error(e);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });

    router.get("/v1/instance", async (ctx) => {
        try {
            ctx.body = await MiscHelpers.getInstance();
        } catch (e: any) {
            console.error(e);
            ctx.status = 500;
            ctx.body = { error: e.message };
        }
    });

    router.get("/v1/announcements", async (ctx) => {
        try {
            const auth = await authenticate(ctx.headers.authorization, null);
            const user = auth[0] ?? null;

            if (!user) {
                ctx.status = 401;
                return;
            }

            const args = argsToBools(ctx.query, ['with_dismissed']);
            ctx.body = await MiscHelpers.getAnnouncements(user, args['with_dismissed'])
                .then(p => p.map(x => convertAnnouncementId(x)));
        } catch (e: any) {
            ctx.status = 500;
            ctx.body = { error: e.message };
        }
    });

    router.post<{ Params: { id: string } }>(
        "/v1/announcements/:id/dismiss",
        async (ctx) => {
            try {
                const auth = await authenticate(ctx.headers.authorization, null);
                const user = auth[0] ?? null;

                if (!user) {
                    ctx.status = 401;
                    return;
                }

                const id = convertId(ctx.params.id, IdType.IceshrimpId);
                const announcement = await Announcements.findOneBy({id: id});

                if (!announcement) {
                    ctx.status = 404;
                    return;
                }

                await MiscHelpers.dismissAnnouncement(announcement, user);
                ctx.body = {};
            } catch (e: any) {
                ctx.status = 500;
                ctx.body = { error: e.message };
            }
        },
    );

    router.get("/v1/trends", async (ctx) => {
        const BASE_URL = `${ctx.request.protocol}://${ctx.request.hostname}`;
        const accessTokens = ctx.request.headers.authorization;
        const client = getClient(BASE_URL, accessTokens); // we are using this here, because in private mode some info isnt
        // displayed without being logged in
        try {
            const data = await client.getInstanceTrends();
            ctx.body = data.data;
        } catch (e: any) {
            console.error(e);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });

    router.get("/v1/preferences", async (ctx) => {
        const BASE_URL = `${ctx.request.protocol}://${ctx.request.hostname}`;
        const accessTokens = ctx.request.headers.authorization;
        const client = getClient(BASE_URL, accessTokens); // we are using this here, because in private mode some info isnt
        // displayed without being logged in
        try {
            const data = await client.getPreferences();
            ctx.body = data.data;
        } catch (e: any) {
            console.error(e);
            ctx.status = 401;
            ctx.body = e.response.data;
        }
    });
}
