import Router from "@koa/router";
import Koa, { DefaultState, Context, Middleware } from "koa";
import { bootstrapControllers, Ctx } from "@iceshrimp/koa-openapi";
import { ILocalUser } from "@/models/entities/user.js";
import { AccessToken } from "@/models/entities/access-token.js";
import { UserController } from "@/server/api/web/controllers/user.js";
import { RatelimitMiddleware } from "@/server/api/web/middleware/rate-limit.js";
import { AuthenticationMiddleware } from "@/server/api/web/middleware/auth.js";
import { ErrorHandlingMiddleware } from "@/server/api/web/middleware/error-handling.js";
import { AuthController } from "@/server/api/web/controllers/auth.js";
import { NoteController } from "@/server/api/web/controllers/note.js";

export type WebRouter = Router<WebState, WebContext>;
export type WebMiddleware = Middleware<WebState, WebContext>;

export interface WebState extends DefaultState {}

export interface WebContext extends Context {
	user: ILocalUser | null;
	token: AccessToken | null;
}

export class WebAPI {
	private readonly router: WebRouter;

	constructor(prefix: string) {
		this.router = new Router<DefaultState, WebContext>({ prefix });
	}

	public async setup(app: Koa): Promise<void> {
        await bootstrapControllers({
			app: app,
			router: this.router,
			attachRoutes: true,
			errorHandler: ErrorHandlingMiddleware,
			controllers: [
				UserController,
				NoteController,
				AuthController,
			],
			flow: [
				AuthenticationMiddleware,
				RatelimitMiddleware,
			],
			versions: {
				1: true
			},
			bodyParser: {
				multipart: true,
			},
			openAPI: {
				enabled: true,
				publicURL: '/api/iceshrimp',
				options: {
					title: "Iceshrimp Web API documentation"
				},
				spec: {
					info: {
						title: "Iceshrimp Web API",
						description: "Documentation for using Iceshrimp's Web API",
						version: "1.0.0"
					}
				}
			},
		});
	}
}
