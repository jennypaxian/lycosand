import { fetchMeta } from "@/misc/fetch-meta.js";
import config from "@/config/index.js";
import push from "web-push";
import { PushSubscriptions } from "@/models/index.js";
import { Notification } from "@/models/entities/notification.js";
import { notificationTypes } from "@/types.js";

export class MastodonPushHandler {
	public static async sendPushNotification(n: Notification) {
		const userId = n.notifieeId;
		const type = this.encodeType(n.type);
		if (type === null) return;

		const meta = await fetchMeta();
		push.setVapidDetails(config.url, meta.swPublicKey, meta.swPrivateKey);

		for (const subscription of await PushSubscriptions.find({ where: { userId: userId }, relations: ['token'] })) {
			if (!subscription.types[type]) continue;

			//FIXME: respect subscription.policy

			const data = {
				access_token: subscription.token?.token,
				title: meta.name ?? "Iceshrimp",
				body: "You have unread notifications",
				notification_id: n.mastoId,
				notification_type: type,
			};

			push.sendNotification(subscription.data, JSON.stringify(data), { proxy: config.proxy, contentEncoding: "aesgcm" })
				.catch((err: any) => {
					if (err.statusCode === 410) {
						PushSubscriptions.delete({ id: subscription.id });
					}
				});
		}
	}

	public static encodeType(type: typeof notificationTypes[number]): MastodonEntity.PushType | null {
		switch(type) {
			case "follow":
				return "follow";
			case "mention":
			case "reply":
				return "mention";
			case "renote":
			case "quote":
				return "reblog";
			case "reaction":
				return "favourite";
			case "pollEnded":
				return "poll";
			case "receiveFollowRequest":
				return "follow_request";
			case "followRequestAccepted":
			case "groupInvited":
			case "pollVote":
			case "app":
				return null;
		}
	}
}
