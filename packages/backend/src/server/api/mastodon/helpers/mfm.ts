import { IMentionedRemoteUsers } from "@/models/entities/note.js";
import { Window as HappyDom } from "happy-dom";
import config from "@/config/index.js";
import { intersperse } from "@/prelude/array.js";
import mfm from "mfm-js";
import { resolveMentionFromCache } from "@/remote/resolve-user.js";

export class MfmHelpers {
    public static async toHtml(
        nodes: mfm.MfmNode[] | null,
        mentionedRemoteUsers: IMentionedRemoteUsers = [],
        objectHost: string | null,
        inline: boolean = false,
        quoteUri: string | null = null
    ) {
        if (nodes == null) {
            return null;
        }

        const { window } = new HappyDom();

        const doc = window.document;

        async function appendChildren(children: mfm.MfmNode[], targetElement: any): Promise<void> {
            if (children) {
                for (const child of await Promise.all(children.map(async (x) => await (handlers as any)[x.type](x))))
                    targetElement.appendChild(child);
            }
        }

        const handlers: {
            [K in mfm.MfmNode["type"]]: (node: mfm.NodeType<K>) => any;
        } = {
            async bold(node) {
                const el = doc.createElement("span");
                el.textContent = '**';
                await appendChildren(node.children, el);
                el.textContent += '**';
                return el;
            },

            async small(node) {
                const el = doc.createElement("small");
                await appendChildren(node.children, el);
                return el;
            },

            async strike(node) {
                const el = doc.createElement("span");
                el.textContent = '~~';
                await appendChildren(node.children, el);
                el.textContent += '~~';
                return el;
            },

            async italic(node) {
                const el = doc.createElement("span");
                el.textContent = '*';
                await appendChildren(node.children, el);
                el.textContent += '*';
                return el;
            },

            async fn(node) {
                const el = doc.createElement("span");
                el.textContent = '*';
                await appendChildren(node.children, el);
                el.textContent += '*';
                return el;
            },

            blockCode(node) {
                const pre = doc.createElement("pre");
                const inner = doc.createElement("code");

                const nodes = node.props.code
                    .split(/\r\n|\r|\n/)
                    .map((x) => doc.createTextNode(x));

                for (const x of intersperse<FIXME | "br">("br", nodes)) {
                    inner.appendChild(x === "br" ? doc.createElement("br") : x);
                }

                pre.appendChild(inner);
                return pre;
            },

            async center(node) {
                const el = doc.createElement("div");
                await appendChildren(node.children, el);
                return el;
            },

            emojiCode(node) {
                return doc.createTextNode(`\u200B:${node.props.name}:\u200B`);
            },

            unicodeEmoji(node) {
                return doc.createTextNode(node.props.emoji);
            },

            hashtag(node) {
                const a = doc.createElement("a");
                a.setAttribute('href', `${config.url}/tags/${node.props.hashtag}`);
                a.textContent = `#${node.props.hashtag}`;
                a.setAttribute("rel", "tag");
                a.setAttribute("class", "hashtag");
                return a;
            },

            inlineCode(node) {
                const el = doc.createElement("code");
                el.textContent = node.props.code;
                return el;
            },

            mathInline(node) {
                const el = doc.createElement("code");
                el.textContent = node.props.formula;
                return el;
            },

            mathBlock(node) {
                const el = doc.createElement("code");
                el.textContent = node.props.formula;
                return el;
            },

            async link(node) {
                const a = doc.createElement("a");
                a.setAttribute("rel", "nofollow noopener noreferrer");
                a.setAttribute("target", "_blank");
                a.setAttribute('href',node.props.url);
                await appendChildren(node.children, a);
                return a;
            },

            async mention(node) {
                const { username, host, acct } = node.props;
                const resolved = await resolveMentionFromCache(username, host, objectHost, mentionedRemoteUsers);

                const el = doc.createElement("span");
                if (resolved === null) {
                    el.textContent = acct;
                } else {
                    el.setAttribute("class", "h-card");
                    el.setAttribute("translate", "no");
                    const a = doc.createElement("a");
                    a.setAttribute('href',resolved.href);
                    a.className = "u-url mention";
                    const span = doc.createElement("span");
                    span.textContent = resolved.username;
                    a.textContent = '@';
                    a.appendChild(span);
                    el.appendChild(a);
                }

                return el;
            },

            async quote(node) {
                const el = doc.createElement("blockquote");
                await appendChildren(node.children, el);
                return el;
            },

            text(node) {
                const el = doc.createElement("span");
                const nodes = node.props.text
                    .split(/\r\n|\r|\n/)
                    .map((x) => doc.createTextNode(x));

                for (const x of intersperse<FIXME | "br">("br", nodes)) {
                    el.appendChild(x === "br" ? doc.createElement("br") : x);
                }

                return el;
            },

            url(node) {
                const a = doc.createElement("a");
                a.setAttribute("rel", "nofollow noopener noreferrer");
                a.setAttribute("target", "_blank");
                a.setAttribute('href', node.props.url);
                a.textContent = node.props.url.replace(/^https?:\/\//, '');
                return a;
            },

            search(node) {
                const a = doc.createElement("a");
                a.setAttribute('href', `${config.searchEngine}${node.props.query}`);
                a.textContent = node.props.content;
                return a;
            },

            async plain(node) {
                const el = doc.createElement("span");
                await appendChildren(node.children, el);
                return el;
            },
        };

        await appendChildren(nodes, doc.body);

        if (quoteUri !== null) {
            const a = doc.createElement("a");
            a.setAttribute('href', quoteUri);
            a.textContent = quoteUri.replace(/^https?:\/\//, '');

            const quote = doc.createElement("span");
            quote.setAttribute("class", "quote-inline");
            quote.appendChild(doc.createElement("br"));
            quote.appendChild(doc.createElement("br"));
            quote.innerHTML += 'RE: ';
            quote.appendChild(a);

            doc.body.appendChild(quote);
        }

        return inline ? doc.body.innerHTML : `<p>${doc.body.innerHTML}</p>`;
    }
}
