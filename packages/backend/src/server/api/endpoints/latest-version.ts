import define from "../define.js";
import config from "@/config/index.js";

export const meta = {
	tags: ["meta"],

	requireCredential: false,
	requireCredentialPrivateMode: true,
} as const;

export const paramDef = {
	type: "object",
	properties: {},
	required: [],
} as const;

export default define(meta, paramDef, async () => {
	let tag_name;
	await fetch(
		`https://iceshrimp.dev/api/v1/repos/iceshrimp/iceshrimp/releases?draft=false&pre-release=${config.version.includes('-pre')}&page=1&limit=1`,
	)
		.then((response) => response.json())
		.then((data) => {
			tag_name = data[0].tag_name;
		});

	return {
		tag_name,
	};
});
