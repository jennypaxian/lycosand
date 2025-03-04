import JSON5 from "json5";
import { IsNull, MoreThan } from "typeorm";
import config from "@/config/index.js";
import { fetchMeta } from "@/misc/fetch-meta.js";
import { Emojis, Users } from "@/models/index.js";
import { MAX_NOTE_TEXT_LENGTH, MAX_CAPTION_TEXT_LENGTH } from "@/const.js";
import define from "../define.js";

export const meta = {
	tags: ["meta"],

	requireCredential: false,

	res: {
		type: "object",
		optional: false,
		nullable: false,
		properties: {
			maintainerName: {
				type: "string",
				optional: false,
				nullable: true,
			},
			maintainerEmail: {
				type: "string",
				optional: false,
				nullable: true,
			},
			version: {
				type: "string",
				optional: false,
				nullable: false,
				example: config.version,
			},
			name: {
				type: "string",
				optional: false,
				nullable: false,
			},
			uri: {
				type: "string",
				optional: false,
				nullable: false,
				format: "url",
				example: "https://iceshrimp.example.com",
			},
			domain: {
				type: "string",
				optional: false,
				nullable: false,
				format: "domain",
				example: "example.com",
			},
			description: {
				type: "string",
				optional: false,
				nullable: true,
			},
			langs: {
				type: "array",
				optional: false,
				nullable: false,
				items: {
					type: "string",
					optional: false,
					nullable: false,
				},
			},
			tosUrl: {
				type: "string",
				optional: false,
				nullable: true,
			},
			repositoryUrl: {
				type: "string",
				optional: false,
				nullable: false,
				default: "https://iceshrimp.dev/iceshrimp/iceshrimp",
			},
			feedbackUrl: {
				type: "string",
				optional: false,
				nullable: false,
				default: "https://iceshrimp.dev/iceshrimp/iceshrimp/issues",
			},
			defaultDarkTheme: {
				type: "string",
				optional: false,
				nullable: true,
			},
			defaultLightTheme: {
				type: "string",
				optional: false,
				nullable: true,
			},
			disableRegistration: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			disableLocalTimeline: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			disableRecommendedTimeline: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			disableGlobalTimeline: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			driveCapacityPerLocalUserMb: {
				type: "number",
				optional: false,
				nullable: false,
			},
			driveCapacityPerRemoteUserMb: {
				type: "number",
				optional: false,
				nullable: false,
			},
			cacheRemoteFiles: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			emailRequiredForSignup: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			enableHcaptcha: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			hcaptchaSiteKey: {
				type: "string",
				optional: false,
				nullable: true,
			},
			enableRecaptcha: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			recaptchaSiteKey: {
				type: "string",
				optional: false,
				nullable: true,
			},
			swPublickey: {
				type: "string",
				optional: false,
				nullable: true,
			},
			mascotImageUrl: {
				type: "string",
				optional: false,
				nullable: false,
				default: "/static-assets/badges/info.png",
			},
			bannerUrl: {
				type: "string",
				optional: false,
				nullable: false,
			},
			errorImageUrl: {
				type: "string",
				optional: false,
				nullable: false,
				default: "/static-assets/badges/error.png",
			},
			iconUrl: {
				type: "string",
				optional: false,
				nullable: true,
			},
			maxNoteTextLength: {
				type: "number",
				optional: false,
				nullable: false,
			},
			maxCaptionTextLength: {
				type: "number",
				optional: false,
				nullable: false,
			},
			searchEngine: {
				type: "string",
				optional: false,
				nullable: false,
			},
			emojis: {
				type: "array",
				optional: false,
				nullable: false,
				items: {
					type: "object",
					optional: false,
					nullable: false,
					properties: {
						id: {
							type: "string",
							optional: false,
							nullable: false,
							format: "id",
						},
						aliases: {
							type: "array",
							optional: false,
							nullable: false,
							items: {
								type: "string",
								optional: false,
								nullable: false,
							},
						},
						category: {
							type: "string",
							optional: false,
							nullable: true,
						},
						host: {
							type: "string",
							optional: false,
							nullable: true,
							description: "The local host is represented with `null`.",
						},
						url: {
							type: "string",
							optional: false,
							nullable: false,
							format: "url",
						},
					},
				},
			},
			requireSetup: {
				type: "boolean",
				optional: false,
				nullable: false,
				example: false,
			},
			enableEmail: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			enableGithubIntegration: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			enableDiscordIntegration: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			translatorAvailable: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			images: {
				type: 'object',
				optional: false, nullable: false,
				properties: {
					info: { type: 'string' },
					notFound: { type: 'string' },
					error: { type: 'string' },
				},
			},
			features: {
				type: "object",
				optional: true,
				nullable: false,
				properties: {
					registration: {
						type: "boolean",
						optional: false,
						nullable: false,
					},
					localTimeLine: {
						type: "boolean",
						optional: false,
						nullable: false,
					},
					recommendedTimeLine: {
						type: "boolean",
						optional: false,
						nullable: false,
					},
					globalTimeLine: {
						type: "boolean",
						optional: false,
						nullable: false,
					},
					hcaptcha: {
						type: "boolean",
						optional: false,
						nullable: false,
					},
					recaptcha: {
						type: "boolean",
						optional: false,
						nullable: false,
					},
					objectStorage: {
						type: "boolean",
						optional: false,
						nullable: false,
					},
					github: {
						type: "boolean",
						optional: false,
						nullable: false,
					},
					discord: {
						type: "boolean",
						optional: false,
						nullable: false,
					},
					serviceWorker: {
						type: "boolean",
						optional: false,
						nullable: false,
					},
					miauth: {
						type: "boolean",
						optional: true,
						nullable: false,
						default: true,
					},
				},
			},
			secureMode: {
				type: "boolean",
				optional: true,
				nullable: false,
				default: false,
			},
			privateMode: {
				type: "boolean",
				optional: true,
				nullable: false,
				default: false,
			},
			defaultReaction: {
				type: "string",
				optional: false,
				nullable: false,
				default: "⭐",
			},
			donationLink: {
				type: "string",
				optional: true,
				nullable: true,
			},
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {
		detail: { type: "boolean", default: true },
	},
	required: [],
} as const;

export default define(meta, paramDef, async (ps, me) => {
	const instance = await fetchMeta(true);

	const emojis = await Emojis.find({
		where: {
			host: IsNull(),
		},
		order: {
			category: "ASC",
			name: "ASC",
		},
		cache: {
			id: "meta_emojis",
			milliseconds: 3600000, // 1 hour
		},
	});

	const response: any = {
		maintainerName: instance.maintainerName,
		maintainerEmail: instance.maintainerEmail,

		version: config.version,

		name: instance.name,
		uri: config.url,
		domain: config.domain,
		description: instance.description,
		langs: instance.langs,
		tosUrl: instance.ToSUrl,
		repositoryUrl: instance.repositoryUrl,
		feedbackUrl: instance.feedbackUrl,

		secureMode: instance.secureMode,
		privateMode: instance.privateMode,

		disableRegistration: instance.disableRegistration,
		disableLocalTimeline: instance.disableLocalTimeline,
		disableRecommendedTimeline: instance.disableRecommendedTimeline,
		disableGlobalTimeline: instance.disableGlobalTimeline,
		driveCapacityPerLocalUserMb: instance.localDriveCapacityMb,
		driveCapacityPerRemoteUserMb: instance.remoteDriveCapacityMb,
		emailRequiredForSignup: instance.emailRequiredForSignup,
		enableHcaptcha: instance.enableHcaptcha,
		hcaptchaSiteKey: instance.hcaptchaSiteKey,
		enableRecaptcha: instance.enableRecaptcha,
		recaptchaSiteKey: instance.recaptchaSiteKey,
		swPublickey: instance.swPublicKey,
		themeColor: instance.themeColor,
		mascotImageUrl: instance.mascotImageUrl,
		bannerUrl: instance.bannerUrl,
		errorImageUrl: instance.errorImageUrl,
		iconUrl: instance.iconUrl,
		backgroundImageUrl: instance.backgroundImageUrl,
		logoImageUrl: instance.logoImageUrl,
		maxNoteTextLength: MAX_NOTE_TEXT_LENGTH, // 後方互換性のため
		maxCaptionTextLength: MAX_CAPTION_TEXT_LENGTH,
		searchEngine: config.searchEngine,
		emojis: instance.privateMode && !me ? [] : await Emojis.packMany(emojis),
		// クライアントの手間を減らすためあらかじめJSONに変換しておく
		defaultLightTheme: instance.defaultLightTheme
			? JSON.stringify(JSON5.parse(instance.defaultLightTheme))
			: null,
		defaultDarkTheme: instance.defaultDarkTheme
			? JSON.stringify(JSON5.parse(instance.defaultDarkTheme))
			: null,

		images: config.images,

		enableEmail: instance.enableEmail,

		enableGithubIntegration: instance.enableGithubIntegration,
		enableDiscordIntegration: instance.enableDiscordIntegration,

		translatorAvailable:
			instance.deeplAuthKey != null || instance.libreTranslateApiUrl != null,
		defaultReaction: instance.defaultReaction,
		donationLink: instance.donationLink,

		...(ps.detail
			? {
					pinnedPages: instance.privateMode && !me ? [] : instance.pinnedPages,
					pinnedClipId:
						instance.privateMode && !me ? [] : instance.pinnedClipId,
					cacheRemoteFiles: instance.cacheRemoteFiles,
					requireSetup:
						(await Users.countBy({
							host: IsNull(),
							isAdmin: true,
						})) === 0,
			  }
			: {}),
	};

	if (ps.detail) {
		response.features = {
			registration: !instance.disableRegistration,
			localTimeLine: !instance.disableLocalTimeline,
			recommendedTimeline: !instance.disableRecommendedTimeline,
			globalTimeLine: !instance.disableGlobalTimeline,
			emailRequiredForSignup: instance.emailRequiredForSignup,
			hcaptcha: instance.enableHcaptcha,
			recaptcha: instance.enableRecaptcha,
			objectStorage: instance.useObjectStorage,
			github: instance.enableGithubIntegration,
			discord: instance.enableDiscordIntegration,
			serviceWorker: true,
			postEditing: true,
			postImports: instance.experimentalFeatures?.postImports || false,
			miauth: true,
		};
	}

	return response;
});
