import koaRatelimit from "koa-ratelimit";
import { WebContext, WebMiddleware } from "@/server/api/web/index.js";
import { Next } from "koa";
import { redisClient } from "@/db/redis.js";
import { tooManyRequests } from "@hapi/boom";

export const RatelimitMiddleware: WebMiddleware = async (ctx: WebContext, next: Next) => {
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
	}
	catch (e: any) {
		if (e.name === 'TooManyRequestsError')
			throw tooManyRequests(e.message);
		throw e;
	}
};
