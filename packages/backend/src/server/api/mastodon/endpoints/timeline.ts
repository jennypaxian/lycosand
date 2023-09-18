import Router from "@koa/router";
import { getClient } from "../ApiMastodonCompatibleService.js";
import { ParsedUrlQuery } from "querystring";
import {
	convertAccount,
	convertConversation,
	convertList,
	convertStatus,
} from "../converters.js";
import { convertId, IdType } from "../../index.js";
import authenticate from "@/server/api/authenticate.js";
import { TimelineHelpers } from "@/server/api/mastodon/helpers/timeline.js";
import { NoteHelpers } from "@/server/api/mastodon/helpers/note.js";
import { NoteConverter } from "@/server/api/mastodon/converters/note.js";
import { UserHelpers } from "@/server/api/mastodon/helpers/user.js";

export function limitToInt(q: ParsedUrlQuery) {
	let object: any = q;
	if (q.limit)
		if (typeof q.limit === "string") object.limit = parseInt(q.limit, 10);
	if (q.offset)
		if (typeof q.offset === "string") object.offset = parseInt(q.offset, 10);
	return object;
}

export function argsToBools(q: ParsedUrlQuery) {
	// Values taken from https://docs.joinmastodon.org/client/intro/#boolean
	const toBoolean = (value: string) =>
		!["0", "f", "F", "false", "FALSE", "off", "OFF"].includes(value);

	// Keys taken from:
	// - https://docs.joinmastodon.org/methods/accounts/#statuses
	// - https://docs.joinmastodon.org/methods/timelines/#public
	// - https://docs.joinmastodon.org/methods/timelines/#tag
	let object: any = q;
	if (q.only_media)
		if (typeof q.only_media === "string")
			object.only_media = toBoolean(q.only_media);
	if (q.exclude_replies)
		if (typeof q.exclude_replies === "string")
			object.exclude_replies = toBoolean(q.exclude_replies);
	if (q.exclude_reblogs)
		if (typeof q.exclude_reblogs === "string")
			object.exclude_reblogs = toBoolean(q.exclude_reblogs);
	if (q.pinned)
		if (typeof q.pinned === "string") object.pinned = toBoolean(q.pinned);
	if (q.local)
		if (typeof q.local === "string") object.local = toBoolean(q.local);
	if (q.remote)
		if (typeof q.local === "string") object.local = toBoolean(q.local);
	return q;
}

export function convertTimelinesArgsId(q: ParsedUrlQuery) {
	if (typeof q.min_id === "string")
		q.min_id = convertId(q.min_id, IdType.IceshrimpId);
	if (typeof q.max_id === "string")
		q.max_id = convertId(q.max_id, IdType.IceshrimpId);
	if (typeof q.since_id === "string")
		q.since_id = convertId(q.since_id, IdType.IceshrimpId);
	return q;
}

export function normalizeUrlQuery(q: ParsedUrlQuery): any {
	const dict: any = {};

	for (const k in q) {
		dict[k] = Array.isArray(q[k]) ? q[k]?.at(-1) : q[k];
	}

	return dict;
}

export function apiTimelineMastodon(router: Router): void {
	router.get("/v1/timelines/public", async (ctx, reply) => {
		try {
			const auth = await authenticate(ctx.headers.authorization, null);
			const user = auth[0] ?? undefined;

			if (!user) {
				ctx.status = 401;
				return;
			}
			
			const args = normalizeUrlQuery(convertTimelinesArgsId(argsToBools(limitToInt(ctx.query))));
			const cache = UserHelpers.getFreshAccountCache();
			const tl = await TimelineHelpers.getPublicTimeline(user, args.max_id, args.since_id, args.min_id, args.limit, args.only_media, args.local, args.remote)
				.then(n => NoteConverter.encodeMany(n, user, cache));

			ctx.body = tl.map(s => convertStatus(s));
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.get<{ Params: { hashtag: string } }>(
		"/v1/timelines/tag/:hashtag",
		async (ctx, reply) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.getTagTimeline(
					ctx.params.hashtag,
					convertTimelinesArgsId(argsToBools(limitToInt(ctx.query))),
				);
				ctx.body = data.data.map((status) => convertStatus(status));
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.get("/v1/timelines/home", async (ctx, reply) => {
		try {
			const auth = await authenticate(ctx.headers.authorization, null);
			const user = auth[0] ?? undefined;

			if (!user) {
				ctx.status = 401;
				return;
			}

			const args = normalizeUrlQuery(convertTimelinesArgsId(limitToInt(ctx.query)));
			const cache = UserHelpers.getFreshAccountCache();
			const tl = await TimelineHelpers.getHomeTimeline(user, args.max_id, args.since_id, args.min_id, args.limit)
				.then(n => NoteConverter.encodeMany(n, user, cache));

			ctx.body = tl.map(s => convertStatus(s));
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.get<{ Params: { listId: string } }>(
		"/v1/timelines/list/:listId",
		async (ctx, reply) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.getListTimeline(
					convertId(ctx.params.listId, IdType.IceshrimpId),
					convertTimelinesArgsId(limitToInt(ctx.query)),
				);
				ctx.body = data.data.map((status) => convertStatus(status));
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.get("/v1/conversations", async (ctx, reply) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const data = await client.getConversationTimeline(
				convertTimelinesArgsId(limitToInt(ctx.query)),
			);
			ctx.body = data.data.map((conversation) =>
				convertConversation(conversation),
			);
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.get("/v1/lists", async (ctx, reply) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const data = await client.getLists();
			ctx.body = data.data.map((list) => convertList(list));
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.get<{ Params: { id: string } }>(
		"/v1/lists/:id",
		async (ctx, reply) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.getList(
					convertId(ctx.params.id, IdType.IceshrimpId),
				);
				ctx.body = convertList(data.data);
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.post("/v1/lists", async (ctx, reply) => {
		const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
		const accessTokens = ctx.headers.authorization;
		const client = getClient(BASE_URL, accessTokens);
		try {
			const data = await client.createList((ctx.request.body as any).title);
			ctx.body = convertList(data.data);
		} catch (e: any) {
			console.error(e);
			console.error(e.response.data);
			ctx.status = 401;
			ctx.body = e.response.data;
		}
	});
	router.put<{ Params: { id: string } }>(
		"/v1/lists/:id",
		async (ctx, reply) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.updateList(
					convertId(ctx.params.id, IdType.IceshrimpId),
					(ctx.request.body as any).title,
				);
				ctx.body = convertList(data.data);
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.delete<{ Params: { id: string } }>(
		"/v1/lists/:id",
		async (ctx, reply) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.deleteList(
					convertId(ctx.params.id, IdType.IceshrimpId),
				);
				ctx.body = data.data;
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.get<{ Params: { id: string } }>(
		"/v1/lists/:id/accounts",
		async (ctx, reply) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.getAccountsInList(
					convertId(ctx.params.id, IdType.IceshrimpId),
					convertTimelinesArgsId(ctx.query as any),
				);
				ctx.body = data.data.map((account) => convertAccount(account));
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.post<{ Params: { id: string } }>(
		"/v1/lists/:id/accounts",
		async (ctx, reply) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.addAccountsToList(
					convertId(ctx.params.id, IdType.IceshrimpId),
					(ctx.query.account_ids as string[]).map((id) =>
						convertId(id, IdType.IceshrimpId),
					),
				);
				ctx.body = data.data;
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
	router.delete<{ Params: { id: string } }>(
		"/v1/lists/:id/accounts",
		async (ctx, reply) => {
			const BASE_URL = `${ctx.protocol}://${ctx.hostname}`;
			const accessTokens = ctx.headers.authorization;
			const client = getClient(BASE_URL, accessTokens);
			try {
				const data = await client.deleteAccountsFromList(
					convertId(ctx.params.id, IdType.IceshrimpId),
					(ctx.query.account_ids as string[]).map((id) =>
						convertId(id, IdType.IceshrimpId),
					),
				);
				ctx.body = data.data;
			} catch (e: any) {
				console.error(e);
				console.error(e.response.data);
				ctx.status = 401;
				ctx.body = e.response.data;
			}
		},
	);
}
function escapeHTML(str: string) {
	if (!str) {
		return "";
	}
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}
function nl2br(str: string) {
	if (!str) {
		return "";
	}
	str = str.replace(/\r\n/g, "<br />");
	str = str.replace(/(\n|\r)/g, "<br />");
	return str;
}
