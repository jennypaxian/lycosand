import { Brackets } from "typeorm";
import read from "@/services/note/read.js";
import { Notes, Followings } from "@/models/index.js";
import define from "../../define.js";
import { generateVisibilityQuery } from "../../common/generate-visibility-query.js";
import { generateMutedUserQuery } from "../../common/generate-muted-user-query.js";
import { makePaginationQuery } from "../../common/make-pagination-query.js";
import { generateBlockedUserQuery } from "../../common/generate-block-query.js";
import { generateMutedNoteThreadQuery } from "../../common/generate-muted-note-thread-query.js";

export const meta = {
	tags: ["notes"],

	requireCredential: true,

	res: {
		type: "array",
		optional: false,
		nullable: false,
		items: {
			type: "object",
			optional: false,
			nullable: false,
			ref: "Note",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		following: { type: "boolean", default: false },
		limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
		sinceId: { type: "string", format: "misskey:id" },
		untilId: { type: "string", format: "misskey:id" },
		visibility: { type: "string" },
	},
	required: [],
} as const;

export default define(meta, paramDef, async (ps, user) => {
	const followingQuery = Followings.createQueryBuilder("following")
		.select("following.followeeId")
		.where("following.followerId = :followerId", { followerId: user.id });

	const query = makePaginationQuery(
		Notes.createQueryBuilder("note"),
		ps.sinceId,
		ps.untilId,
	)
		.andWhere(
			new Brackets((qb) => {
				qb.where(`'{"${user.id}"}' <@ note.mentions`).orWhere(
					`'{"${user.id}"}' <@ note.visibleUserIds`,
				);
			}),
		)
		.innerJoinAndSelect("note.user", "user")
		.leftJoinAndSelect("note.reply", "reply")
		.leftJoinAndSelect("note.renote", "renote")
		.leftJoinAndSelect("reply.user", "replyUser")
		.leftJoinAndSelect("renote.user", "renoteUser");

	generateVisibilityQuery(query, user);
	generateMutedUserQuery(query, user);
	generateMutedNoteThreadQuery(query, user);
	generateBlockedUserQuery(query, user);

	if (ps.visibility) {
		query.andWhere("note.visibility = :visibility", {
			visibility: ps.visibility,
		});
	}

	if (ps.following) {
		query.andWhere(
			`((note.userId IN (${followingQuery.getQuery()})) OR (note.userId = :meId))`,
			{ meId: user.id },
		);
		query.setParameters(followingQuery.getParameters());
	}

	const notes = await query.take(ps.limit).getMany();
	const packed = await Notes.packMany(notes, user);

	read(user.id, packed);

	return packed;
});
