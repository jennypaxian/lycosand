import { MastoContext } from "@/server/api/mastodon/index.js";
import { MastoApiError } from "@/server/api/mastodon/middleware/catch-errors.js";
import { PushSubscriptions } from "@/models/index.js";
import { genId } from "@/misc/gen-id.js";
import { ILocalUser } from "@/models/entities/user.js";
import { OAuthToken } from "@/models/entities/oauth-token.js";
import { fetchMeta } from "@/misc/fetch-meta.js";
import { PushSubscription } from "@/models/entities/push-subscription.js";

export class PushHelpers {
	public static async subscribe(ctx: MastoContext): Promise<MastodonEntity.PushSubscription> {
		const body = ctx.request.body as any;

		// This is undocumented on https://docs.joinmastodon.org/methods/push,
		// but some apps appear to use query parameters instead of form data, so we need to normalize things

		if (typeof body['subscription[endpoint]'] === "string") {
			body.subscription = {
				endpoint: body['subscription[endpoint]'],
				keys: {
					p256dh: body['subscription[keys][p256dh]'],
					auth: body['subscription[keys][auth]'],
				},
			};

			body.data = {
				policy: body['policy'],
				alerts: {
					mention: body['data[alerts][mention]'],
					status: body['data[alerts][status]'],
					reblog: body['data[alerts][reblog]'],
					follow: body['data[alerts][follow]'],
					follow_request: body['data[alerts][follow_request]'],
					favourite: body['data[alerts][favourite]'],
					poll: body['data[alerts][poll]'],
					update: body['data[alerts][update]'],
				},
			};
		}

		if (typeof body?.subscription?.endpoint !== "string" || typeof body?.subscription?.keys?.p256dh !== "string" || typeof body?.subscription?.keys?.auth !== "string")
			throw new MastoApiError(400, "Required parameters are missing or empty");

		const data = body.subscription as MastodonEntity.PushData;
		const user = ctx.user as ILocalUser;
		const token = ctx.token as OAuthToken;

		const types: MastodonEntity.PushTypes = {
			mention: !!body?.data?.alerts?.mention,
			status: !!body?.data?.alerts?.status,
			reblog: !!body?.data?.alerts?.reblog,
			follow: !!body?.data?.alerts?.follow,
			follow_request: !!body?.data?.alerts?.follow_request,
			favourite: !!body?.data?.alerts?.favourite,
			poll: !!body?.data?.alerts?.poll,
			update: !!body?.data?.alerts?.update,
		};

		const policy: MastodonEntity.PushPolicy = ['all', 'followed', 'follower', 'none'].includes(body?.data?.policy)
			? body?.data?.policy
			: 'all';

		const subscription: Partial<PushSubscription> = {
			id: genId(),
			createdAt: new Date(),
			data: data,
			types: types,
			policy: policy,
			userId: user.id,
			tokenId: token.id,
		};

		await PushSubscriptions.upsert(subscription, ['tokenId']);

		return {
			id: subscription.id!,
			alerts: types,
			endpoint: data.endpoint,
			server_key: await fetchMeta().then(meta => meta.swPublicKey),
		}
	}

	public static async get(ctx: MastoContext): Promise<MastodonEntity.PushSubscription> {
		const token = ctx.token as OAuthToken;
		const subscription = await PushSubscriptions.findOneBy({ tokenId: token.id });
		if (!subscription) throw new MastoApiError(404);

		return {
			id: subscription.id,
			alerts: subscription.types,
			endpoint: subscription.data.endpoint,
			server_key: await fetchMeta().then(meta => meta.swPublicKey),
		}
	}

	public static async update(ctx: MastoContext): Promise<MastodonEntity.PushSubscription> {
		const body = ctx.request.body as any;
		const token = ctx.token as OAuthToken;

		const types: MastodonEntity.PushTypes = {
			mention: !!body?.data?.alerts?.mention,
			status: !!body?.data?.alerts?.status,
			reblog: !!body?.data?.alerts?.reblog,
			follow: !!body?.data?.alerts?.follow,
			follow_request: !!body?.data?.alerts?.follow_request,
			favourite: !!body?.data?.alerts?.favourite,
			poll: !!body?.data?.alerts?.poll,
			update: !!body?.data?.alerts?.update,
		};

		const policy: MastodonEntity.PushPolicy = ['all', 'followed', 'follower', 'none'].includes(body?.data?.policy)
			? body?.data?.policy
			: 'all';

		const updates: Partial<PushSubscription> = {
			types: types,
			policy: policy,
		};

		const res = await PushSubscriptions.update({ tokenId: token.id }, updates);
		if (!res.affected) throw new MastoApiError(404);

		return this.get(ctx);
	}

	public static async unsubscribe(ctx: MastoContext): Promise<{}> {
		const token = ctx.token as OAuthToken;
		const res = await PushSubscriptions.delete({ tokenId: token.id });
		if (!res.affected) throw new MastoApiError(404);
		return {};
	}
}
