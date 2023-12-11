import { ILocalUser } from "@/models/entities/user.js";
import { Session } from "@/models/entities/session.js";
import Router from "@koa/router";
import { Context, DefaultState, Middleware } from "koa";

export type WebRouter = Router<WebState, WebContext>;
export type WebMiddleware = Middleware<WebState, WebContext>;

export interface WebState extends DefaultState {
	user: ILocalUser | null;
	session: Session | null;
}

export interface WebContext extends Context {
	state: WebState;
}
