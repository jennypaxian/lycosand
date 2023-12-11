import koaRatelimit from "koa-ratelimit";
import { WebContext, WebMiddleware } from "@/server/api/web/misc/koa.js";
import { Next } from "koa";
import { redisClient } from "@/db/redis.js";
import { tooManyRequests } from "@hapi/boom";

export async function RatelimitMiddleware(ctx: WebContext, next: Next) {
	// We can't assign limiter directly if we want to preserve type hints for WebContext and WebState
	//TODO: server config options (disable limiter entirely, set max/duration, set different rate limits for auth/noauth, bypass rate limit for admins)
	const limiter = koaRatelimit({
		driver: "redis",
		db: redisClient,
		max: 500,
		duration: 60000,
		id: () => ctx.state.user?.id ?? ctx.request.ip,
		headers: {
			remaining: 'X-RateLimit-Remaining',
			total: 'X-RateLimit-Limit',
			reset: 'X-RateLimit-Reset',
		},
		throw: true,
	});

	try {
		await limiter(ctx, next);
	} catch (e: any) {
		if (e.name === 'TooManyRequestsError')
			throw tooManyRequests(e.message);
		throw e;
	}
}

export function RatelimitRouteMiddleware(prefix: string, max: number = 500, duration: number = 60000, ipOnly: boolean = false): WebMiddleware {
	return async (ctx: WebContext, next: Next) => {
		const limiter = koaRatelimit({
			driver: "redis",
			db: redisClient,
			max: max,
			duration: duration,
			id: () => `${prefix}-${ipOnly ? ctx.request.ip : ctx.state.user?.id ?? ctx.request.ip}`,
			headers: {
				remaining: 'X-RateLimit-Remaining',
				total: 'X-RateLimit-Limit',
				reset: 'X-RateLimit-Reset',
			},
			throw: true,
		});

		try {
			await limiter(ctx, next);
		}
		catch (e: any) {
			if (e.name === 'TooManyRequestsError')
				throw tooManyRequests(e.message);
			throw e;
		}
	}
}
