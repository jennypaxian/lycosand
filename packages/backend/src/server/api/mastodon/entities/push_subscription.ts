namespace MastodonEntity {
    export type PushTypes = {
		mention: boolean;
		status: boolean;
		reblog: boolean;
		follow: boolean;
		follow_request: boolean;
		favourite: boolean;
		poll: boolean;
		update: boolean;
    };

	export type PushPolicy = 'all' | 'followed' | 'follower' | 'none';

	export type PushType = 'mention' | 'status' | 'reblog' | 'follow' | 'follow_request' | 'favourite' | 'poll' | 'update';

	export type PushData = {
		endpoint: string;
		keys: {
			auth: string;
			p256dh: string;
		};
	};

    export type PushSubscription = {
        id: string;
        endpoint: string;
        server_key: string;
        alerts: PushTypes;
    };
}
