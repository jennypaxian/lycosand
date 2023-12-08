import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import Koa from "koa";
import Router from "@koa/router";
import c2k from "koa-connect";

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

const app = new Koa();
const router = new Router();

const isProduction = false;

if (isProduction) {
    const { default: sirv } = await import('sirv');
    app.use(c2k(sirv(`${_dirname}/../../../../frontend/dist`)));
} else {
    const { createServer } = await import('vite');
    const server = await createServer({
        root: `${_dirname}/../../../../frontend`,
        server: { middlewareMode: true },
        base: '/rewrite'
    });

    app.use(c2k(server.middlewares));
}

app.use(router.routes());
app.use(router.allowedMethods());

export default app;
