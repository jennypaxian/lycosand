import Router from "@koa/router";
import Koa, { DefaultState } from "koa";
import { bootstrapControllers } from "@iceshrimp/koa-openapi";
import { UserController } from "@/server/api/web/controllers/user.js";
import { RatelimitMiddleware } from "@/server/api/web/middleware/rate-limit.js";
import { AuthenticationMiddleware } from "@/server/api/web/middleware/auth.js";
import { ErrorHandlingMiddleware } from "@/server/api/web/middleware/error-handling.js";
import { AuthController } from "@/server/api/web/controllers/auth.js";
import { NoteController } from "@/server/api/web/controllers/note.js";
import { WebContext, WebRouter } from "@/server/api/web/misc/koa.js";
import { TimelineController } from "@/server/api/web/controllers/timeline.js";
import { genSchema } from "@/server/api/web/misc/schema.js";
import { OpenAPIV3_1 } from "openapi-types";

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
				TimelineController,
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
					title: "Iceshrimp Web API documentation",
					swaggerOptions: {
						urls: [{ url: "/api/iceshrimp/openapi.json", name: "/api/iceshrimp/openapi.json" }],
						defaultModelsExpandDepth: "2",
						defaultModelExpandDepth: "2",
						persistAuthorization: "true",
						docExpansion: "none",
					},
					favicon: '/favicon.ico'
				},
				spec: {
					info: {
						title: "Iceshrimp Web API",
						description: "Documentation for using Iceshrimp's Web API",
						version: "1.0.0"
					},
				},
				schemas: genSchema().definitions as Record<string, OpenAPIV3_1.SchemaObject>,
				securitySchemes: {
					"user": {
						type: 'http',
						scheme: 'bearer'
					},
					"admin": {
						type: 'http',
						scheme: 'bearer'
					}
				}
			},
		});
	}
}
