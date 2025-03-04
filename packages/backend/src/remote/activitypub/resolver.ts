import config from "@/config/index.js";
import { getJsonActivity } from "@/misc/fetch.js";
import type { ILocalUser } from "@/models/entities/user.js";
import { getInstanceActor } from "@/services/instance-actor.js";
import { fetchMeta } from "@/misc/fetch-meta.js";
import { extractDbHost, isSelfHost } from "@/misc/convert-host.js";
import { signedGet } from "./request.js";
import type { IObject, ICollection, IOrderedCollection } from "./type.js";
import { isCollectionOrOrderedCollection, getApId } from "./type.js";
import {
	FollowRequests,
	Notes,
	NoteReactions,
	Polls,
	Users,
} from "@/models/index.js";
import { parseUri } from "./db-resolver.js";
import renderNote from "@/remote/activitypub/renderer/note.js";
import { renderLike } from "@/remote/activitypub/renderer/like.js";
import { renderPerson } from "@/remote/activitypub/renderer/person.js";
import renderQuestion from "@/remote/activitypub/renderer/question.js";
import renderCreate from "@/remote/activitypub/renderer/create.js";
import { renderActivity } from "@/remote/activitypub/renderer/index.js";
import renderFollow from "@/remote/activitypub/renderer/follow.js";
import { shouldBlockInstance } from "@/misc/should-block-instance.js";
import { apLogger } from "@/remote/activitypub/logger.js";
import { In, IsNull, Not } from "typeorm";

export default class Resolver {
	private history: Set<string>;
	private user?: ILocalUser;
	private recursionLimit?: number;

	constructor(recursionLimit = 100) {
		this.history = new Set();
		this.recursionLimit = recursionLimit;
	}

	public setUser(user) {
		this.user = user;
	}

	public reset(): Resolver {
		this.history = new Set();
		return this;
	}

	public getHistory(): string[] {
		return Array.from(this.history);
	}

	public async resolveCollection(
		value: string | IObject,
	): Promise<ICollection | IOrderedCollection> {
		const collection = await this.resolve(value);

		if (isCollectionOrOrderedCollection(collection)) {
			return collection;
		} else {
			throw new Error(`unrecognized collection type: ${collection.type}`);
		}
	}

	public async resolve(value: string | IObject): Promise<IObject> {
		if (value == null) {
			throw new Error("resolvee is null (or undefined)");
		}

		if (typeof value !== "string") {
			apLogger.debug("Object to resolve is not a string");
			if (typeof value.id !== "undefined") {
				const host = extractDbHost(getApId(value));
				if (await shouldBlockInstance(host)) {
					throw new Error("instance is blocked");
				}
			}
			apLogger.debug("Returning existing object:");
			apLogger.debug(JSON.stringify(value, null, 2));
			return value;
		}

		apLogger.debug(`Resolving: ${value}`);

		if (value.includes("#")) {
			// URLs with fragment parts cannot be resolved correctly because
			// the fragment part does not get transmitted over HTTP(S).
			// Avoid strange behaviour by not trying to resolve these at all.
			throw new Error(`cannot resolve URL with fragment: ${value}`);
		}

		if (this.history.has(value)) {
			throw new Error("cannot resolve already resolved one");
		}
		if (this.recursionLimit && this.history.size > this.recursionLimit) {
			throw new Error("hit recursion limit");
		}
		this.history.add(value);

		const host = extractDbHost(value);
		if (isSelfHost(host)) {
			return await this.resolveLocal(value);
		}

		const meta = await fetchMeta();
		if (await shouldBlockInstance(host, meta)) {
			throw new Error("Instance is blocked");
		}

		if (
			meta.privateMode &&
			config.host !== host &&
			config.domain !== host &&
			!meta.allowedHosts.includes(host)
		) {
			throw new Error("Instance is not allowed");
		}

		if (!this.user) {
			this.user = await getInstanceActor();
		}

		apLogger.debug("Getting object from remote, authenticated as user:");
		apLogger.debug(JSON.stringify(this.user, null, 2));

		const {res, object} = await this.doFetch(value);

		if (object.id == null) throw new Error("Object has no ID");
		if (res.finalUrl === object.id) return object;

		if (new URL(res.finalUrl).host !== new URL(object.id).host)
			throw new Error("Object ID host doesn't match final url host");

		const {res: finalRes, object: finalObject} = await this.doFetch(object.id);

		if (finalRes.finalUrl !== finalObject.id)
			throw new Error("Object ID still doesn't match final URL after second fetch attempt")

		return finalObject;
	}

	private async doFetch(uri: string) {
		let res = (
			this.user
				? await signedGet(uri, this.user)
				: await getJsonActivity(uri)
		);
		let object = res.content as IObject;

		if (
			object == null ||
			(Array.isArray(object["@context"])
				? !(object["@context"] as unknown[]).includes(
					"https://www.w3.org/ns/activitystreams",
				)
				: object["@context"] !== "https://www.w3.org/ns/activitystreams")
		) {
			throw new Error("invalid response");
		}

		return {res, object};
	}

	private resolveLocal(url: string): Promise<IObject> {
		const parsed = parseUri(url);
		if (!parsed.local) throw new Error("resolveLocal: not local");

		switch (parsed.type) {
			case "notes":
				return Notes.findOneByOrFail({ id: parsed.id }).then((note) => {
					if (parsed.rest === "activity") {
						// this refers to the create activity and not the note itself
						return renderActivity(renderCreate(renderNote(note), note));
					} else {
						return renderNote(note);
					}
				});
			case "users":
				return Users.findOneByOrFail({ id: parsed.id }).then((user) =>
					renderPerson(user as ILocalUser),
				);
			case "questions":
				// Polls are indexed by the note they are attached to.
				return Promise.all([
					Notes.findOneByOrFail({ id: parsed.id }),
					Polls.findOneByOrFail({ noteId: parsed.id }),
				]).then(([note, poll]) =>
					renderQuestion({ id: note.userId }, note, poll),
				);
			case "likes":
				return NoteReactions.findOneByOrFail({ id: parsed.id }).then(
					(reaction) => renderActivity(renderLike(reaction, { uri: null })),
				);
			case "follows":
				// if rest is a <followee id>
				if (parsed.rest != null && /^\w+$/.test(parsed.rest)) {
					return Promise.all(
						[parsed.id, parsed.rest].map((id) => Users.findOneByOrFail({ id })),
					).then(([follower, followee]) =>
						renderActivity(renderFollow(follower, followee, url)),
					);
				}

				// Another situation is there is only requestId, then obtained object from database.
				const followRequest = FollowRequests.findOneBy({
					id: parsed.id,
				});
				if (followRequest == null) {
					throw new Error("resolveLocal: invalid follow URI");
				}
				const follower = Users.findOneBy({
					id: followRequest.followerId,
					host: IsNull(),
				});
				const followee = Users.findOneBy({
					id: followRequest.followeeId,
					host: Not(IsNull()),
				});
				if (follower == null || followee == null) {
					throw new Error("resolveLocal: invalid follow URI");
				}
				return renderActivity(renderFollow(follower, followee, url));
			default:
				throw new Error(`resolveLocal: type ${type} unhandled`);
		}
	}
}
