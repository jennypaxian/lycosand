import config from "@/config/index.js";
import { fetchMeta } from "@/misc/fetch-meta.js";
import { MAX_NOTE_TEXT_LENGTH, MAX_CAPTION_TEXT_LENGTH } from "@/const.js";
import define from "../../define.js";

export const meta = {
	tags: ["meta"],

	requireCredential: true,
	requireAdmin: true,

	res: {
		type: "object",
		optional: false,
		nullable: false,
		properties: {
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
			recommendedInstances: {
				type: "array",
				optional: true,
				nullable: false,
				items: {
					type: "string",
					optional: false,
					nullable: false,
				},
			},
			pinnedUsers: {
				type: "array",
				optional: true,
				nullable: false,
				items: {
					type: "string",
					optional: false,
					nullable: false,
				},
			},
			customMOTD: {
				type: "array",
				optional: true,
				nullable: false,
				items: {
					type: "string",
					optional: false,
					nullable: false,
				},
			},
			customSplashIcons: {
				type: "array",
				optional: true,
				nullable: false,
				items: {
					type: "string",
					optional: false,
					nullable: false,
				},
			},
			hiddenTags: {
				type: "array",
				optional: true,
				nullable: false,
				items: {
					type: "string",
					optional: false,
					nullable: false,
				},
			},
			blockedHosts: {
				type: "array",
				optional: true,
				nullable: false,
				items: {
					type: "string",
					optional: false,
					nullable: false,
				},
			},
			silencedHosts: {
				type: "array",
				optional: true,
				nullable: false,
				items: {
					type: "string",
					optional: false,
					nullable: false,
				},
			},
			allowedHosts: {
				type: "array",
				optional: true,
				nullable: false,
				items: {
					type: "string",
					optional: false,
					nullable: false,
				},
			},
			privateMode: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			secureMode: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			hcaptchaSecretKey: {
				type: "string",
				optional: true,
				nullable: true,
			},
			recaptchaSecretKey: {
				type: "string",
				optional: true,
				nullable: true,
			},
			summaryProxy: {
				type: "string",
				optional: true,
				nullable: true,
			},
			email: {
				type: "string",
				optional: true,
				nullable: true,
			},
			smtpSecure: {
				type: "boolean",
				optional: true,
				nullable: false,
			},
			smtpHost: {
				type: "string",
				optional: true,
				nullable: true,
			},
			smtpPort: {
				type: "string",
				optional: true,
				nullable: true,
			},
			smtpUser: {
				type: "string",
				optional: true,
				nullable: true,
			},
			smtpPass: {
				type: "string",
				optional: true,
				nullable: true,
			},
			swPrivateKey: {
				type: "string",
				optional: true,
				nullable: true,
			},
			useObjectStorage: {
				type: "boolean",
				optional: true,
				nullable: false,
			},
			objectStorageBaseUrl: {
				type: "string",
				optional: true,
				nullable: true,
			},
			objectStorageBucket: {
				type: "string",
				optional: true,
				nullable: true,
			},
			objectStoragePrefix: {
				type: "string",
				optional: true,
				nullable: true,
			},
			objectStorageEndpoint: {
				type: "string",
				optional: true,
				nullable: true,
			},
			objectStorageRegion: {
				type: "string",
				optional: true,
				nullable: true,
			},
			objectStoragePort: {
				type: "number",
				optional: true,
				nullable: true,
			},
			objectStorageAccessKey: {
				type: "string",
				optional: true,
				nullable: true,
			},
			objectStorageSecretKey: {
				type: "string",
				optional: true,
				nullable: true,
			},
			objectStorageUseSSL: {
				type: "boolean",
				optional: true,
				nullable: false,
			},
			objectStorageUseProxy: {
				type: "boolean",
				optional: true,
				nullable: false,
			},
			objectStorageSetPublicRead: {
				type: "boolean",
				optional: true,
				nullable: false,
			},
			enableIpLogging: {
				type: "boolean",
				optional: true,
				nullable: false,
			},
			enableActiveEmailValidation: {
				type: "boolean",
				optional: true,
				nullable: false,
			},
			defaultReaction: {
				type: "string",
				optional: false,
				nullable: false,
			},
			experimentalFeatures: {
				type: "object",
				optional: true,
				nullable: true,
				properties: {
					postImports: {
						type: "boolean",
					},
				},
			},
			enableServerMachineStats: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			enableIdenticonGeneration: {
				type: "boolean",
				optional: false,
				nullable: false,
			},
			donationLink: {
				type: "string",
				optional: true,
				nullable: true,
			},
			autofollowedAccount: {
				type: "string",
				optional: true,
				nullable: true,
			},
		},
	},
} as const;

export const paramDef = {
	type: "object",
	properties: {},
	required: [],
} as const;

export default define(meta, paramDef, async (ps, me) => {
	const instance = await fetchMeta(true);

	return {
		maintainerName: instance.maintainerName,
		maintainerEmail: instance.maintainerEmail,
		version: config.version,
		name: instance.name,
		uri: config.url,
		description: instance.description,
		langs: instance.langs,
		tosUrl: instance.ToSUrl,
		repositoryUrl: instance.repositoryUrl,
		feedbackUrl: instance.feedbackUrl,
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
		defaultLightTheme: instance.defaultLightTheme,
		defaultDarkTheme: instance.defaultDarkTheme,
		enableEmail: instance.enableEmail,
		translatorAvailable:
			instance.deeplAuthKey != null || instance.libreTranslateApiUrl != null,
		pinnedPages: instance.pinnedPages,
		pinnedClipId: instance.pinnedClipId,
		cacheRemoteFiles: instance.cacheRemoteFiles,
		defaultReaction: instance.defaultReaction,
		recommendedInstances: instance.recommendedInstances,
		pinnedUsers: instance.pinnedUsers,
		customMOTD: instance.customMOTD,
		customSplashIcons: instance.customSplashIcons,
		hiddenTags: instance.hiddenTags,
		blockedHosts: instance.blockedHosts,
		silencedHosts: instance.silencedHosts,
		allowedHosts: instance.allowedHosts,
		privateMode: instance.privateMode,
		secureMode: instance.secureMode,
		hcaptchaSecretKey: instance.hcaptchaSecretKey,
		recaptchaSecretKey: instance.recaptchaSecretKey,
		summalyProxy: instance.summalyProxy,
		email: instance.email,
		smtpSecure: instance.smtpSecure,
		smtpHost: instance.smtpHost,
		smtpPort: instance.smtpPort,
		smtpUser: instance.smtpUser,
		smtpPass: instance.smtpPass,
		swPrivateKey: instance.swPrivateKey,
		useObjectStorage: instance.useObjectStorage,
		objectStorageBaseUrl: instance.objectStorageBaseUrl,
		objectStorageBucket: instance.objectStorageBucket,
		objectStoragePrefix: instance.objectStoragePrefix,
		objectStorageEndpoint: instance.objectStorageEndpoint,
		objectStorageRegion: instance.objectStorageRegion,
		objectStoragePort: instance.objectStoragePort,
		objectStorageAccessKey: instance.objectStorageAccessKey,
		objectStorageSecretKey: instance.objectStorageSecretKey,
		objectStorageUseSSL: instance.objectStorageUseSSL,
		objectStorageUseProxy: instance.objectStorageUseProxy,
		objectStorageSetPublicRead: instance.objectStorageSetPublicRead,
		objectStorageS3ForcePathStyle: instance.objectStorageS3ForcePathStyle,
		deeplAuthKey: instance.deeplAuthKey,
		deeplIsPro: instance.deeplIsPro,
		libreTranslateApiUrl: instance.libreTranslateApiUrl,
		libreTranslateApiKey: instance.libreTranslateApiKey,
		enableIpLogging: instance.enableIpLogging,
		enableActiveEmailValidation: instance.enableActiveEmailValidation,
		experimentalFeatures: instance.experimentalFeatures,
		enableServerMachineStats: instance.enableServerMachineStats,
		enableIdenticonGeneration: instance.enableIdenticonGeneration,
		donationLink: instance.donationLink,
		autofollowedAccount: instance.autofollowedAccount,
	};
});
