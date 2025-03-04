import { fetchMeta } from "@/misc/fetch-meta.js";
import { Notes } from "@/models/index.js";
import { activeUsersChart } from "@/services/chart/index.js";
import define from "../../define.js";
import { ApiError } from "../../error.js";
import { makePaginationQuery } from "../../common/make-pagination-query.js";
import { generateMutedUserQuery } from "../../common/generate-muted-user-query.js";
import { generateRepliesQuery } from "../../common/generate-replies-query.js";
import { generateBlockedUserQuery } from "../../common/generate-block-query.js";
import { generateMutedUserRenotesQueryForNotes } from "../../common/generated-muted-renote-query.js";

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

	errors: {
		gtlDisabled: {
			message: "Global timeline has been disabled.",
			code: "GTL_DISABLED",
			id: "0332fc13-6ab2-4427-ae80-a9fadffd1a6b",
		},
		queryError: {
			message: "Please follow more users.",
			code: "QUERY_ERROR",
			id: "620763f4-f621-4533-ab33-0577a1a3c343",
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		withFiles: {
			type: "boolean",
			default: false,
			description: "Only show notes that have attached files.",
		},
		limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
		sinceId: { type: "string", format: "misskey:id" },
		untilId: { type: "string", format: "misskey:id" },
		sinceDate: { type: "integer" },
		untilDate: { type: "integer" },
		withReplies: {
			type: "boolean",
			default: false,
			description: "Show replies in the timeline",
		},
	},
	required: [],
} as const;

export default define(meta, paramDef, async (ps, user) => {
	const m = await fetchMeta();
	if (m.disableGlobalTimeline) {
		if (user == null || !(user.isAdmin || user.isModerator)) {
			throw new ApiError(meta.errors.gtlDisabled);
		}
	}

	//#region Construct query
	const query = makePaginationQuery(
		Notes.createQueryBuilder("note"),
		ps.sinceId,
		ps.untilId,
		ps.sinceDate,
		ps.untilDate,
	)
		.andWhere("note.visibility = 'public'")
		.andWhere("note.channelId IS NULL")
		.innerJoinAndSelect("note.user", "user")
		.leftJoinAndSelect("note.reply", "reply")
		.leftJoinAndSelect("note.renote", "renote")
		.leftJoinAndSelect("reply.user", "replyUser")
		.leftJoinAndSelect("renote.user", "renoteUser");

	generateRepliesQuery(query, ps.withReplies, user);
	if (user) {
		generateMutedUserQuery(query, user);
		generateBlockedUserQuery(query, user);
		generateMutedUserRenotesQueryForNotes(query, user);
	}

	if (ps.withFiles) {
		query.andWhere("note.fileIds != '{}'");
	}
	query.andWhere("note.visibility != 'hidden'");
	//#endregion

	process.nextTick(() => {
		if (user) {
			activeUsersChart.read(user);
		}
	});

	try {
		const notes = await query.take(ps.limit).getMany();
		return await Notes.packMany(notes, user);
	} catch (error) {
		throw new ApiError(meta.errors.queryError);
	}
});
