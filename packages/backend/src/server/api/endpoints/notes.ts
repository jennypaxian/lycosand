import { Notes } from "@/models/index.js";
import define from "../define.js";
import { makePaginationQuery } from "../common/make-pagination-query.js";

export const meta = {
	tags: ["notes"],

	requireCredentialPrivateMode: true,
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
		local: { type: "boolean", default: false },
		reply: { type: "boolean" },
		renote: { type: "boolean" },
		withFiles: { type: "boolean" },
		poll: { type: "boolean" },
		limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
		sinceId: { type: "string", format: "misskey:id" },
		untilId: { type: "string", format: "misskey:id" },
	},
	required: [],
} as const;

export default define(meta, paramDef, async (ps) => {
	const query = makePaginationQuery(
		Notes.createQueryBuilder("note"),
		ps.sinceId,
		ps.untilId,
	)
		.andWhere("note.visibility = 'public'")
		.andWhere("note.localOnly = FALSE")
		.innerJoinAndSelect("note.user", "user")
		.leftJoinAndSelect("note.reply", "reply")
		.leftJoinAndSelect("note.renote", "renote")
		.leftJoinAndSelect("reply.user", "replyUser")
		.leftJoinAndSelect("renote.user", "renoteUser");

	if (ps.local) {
		query.andWhere("note.userHost IS NULL");
	}

	if (ps.reply !== undefined) {
		query.andWhere(
			ps.reply ? "note.replyId IS NOT NULL" : "note.replyId IS NULL",
		);
	}

	if (ps.renote !== undefined) {
		query.andWhere(
			ps.renote ? "note.renoteId IS NOT NULL" : "note.renoteId IS NULL",
		);
	}

	if (ps.withFiles !== undefined) {
		query.andWhere(
			ps.withFiles ? "note.fileIds != '{}'" : "note.fileIds = '{}'",
		);
	}

	if (ps.poll !== undefined) {
		query.andWhere(ps.poll ? "note.hasPoll = TRUE" : "note.hasPoll = FALSE");
	}

	// TODO
	//if (bot != undefined) {
	//	query.isBot = bot;
	//}

	const notes = await query.take(ps.limit).getMany();

	return await Notes.packMany(notes);
});
