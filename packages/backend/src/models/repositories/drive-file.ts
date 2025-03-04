import { db } from "@/db/postgre.js";
import { DriveFile } from "@/models/entities/drive-file.js";
import type { User } from "@/models/entities/user.js";
import { toPuny } from "@/misc/convert-host.js";
import { awaitAll } from "@/prelude/await-all.js";
import type { Packed } from "@/misc/schema.js";
import config from "@/config/index.js";
import { appendQuery, query } from "@/prelude/url.js";
import { DriveFolders, Users } from "../index.js";
import { deepClone } from "@/misc/clone.js";
import { fetchMetaSync } from "@/misc/fetch-meta.js";

type PackOptions = {
	detail?: boolean;
	self?: boolean;
	withUser?: boolean;
};

export const DriveFileRepository = db.getRepository(DriveFile).extend({
	validateFileName(name: string): boolean {
		return (
			name.trim().length > 0 &&
			name.length <= 200 &&
			name.indexOf("\\") === -1 &&
			name.indexOf("/") === -1 &&
			name.indexOf("..") === -1
		);
	},

	getPublicProperties(file: DriveFile): DriveFile["properties"] {
		if (file.properties.orientation != null) {
			const properties = deepClone(file.properties);
			if (file.properties.orientation >= 5) {
				[properties.width, properties.height] = [
					properties.height,
					properties.width,
				];
			}
			properties.orientation = undefined;
			return properties;
		}

		return file.properties;
	},

	isImage(file: DriveFile): boolean {
		return !!file.type &&
			[
				"image/png",
				"image/apng",
				"image/gif",
				"image/jpeg",
				"image/webp",
				"image/svg+xml",
				"image/avif",
			].includes(file.type);
	},

	getPublicUrl(file: DriveFile, thumbnail = false): string | null {
		// リモートかつメディアプロキシ
		if (
			file.uri != null &&
			file.userHost != null &&
			config.mediaProxy != null
		) {
			return appendQuery(
				config.mediaProxy,
				query({
					url: file.uri,
					thumbnail: thumbnail ? "1" : undefined,
				}),
			);
		}

		if (file.isLink && config.proxyRemoteFiles) {
			const url = this.getDatabasePrefetchUrl(file, thumbnail);
			if (url != null) return `${config.url}/proxy/${encodeURIComponent(new URL(url).pathname)}?${query({ url: url })}`;
		}

		return thumbnail
			? file.thumbnailUrl || (this.isImage(file) ? file.webpublicUrl || file.url : null)
			: file.webpublicUrl || file.url;
	},

	getDatabasePrefetchUrl(file: DriveFile, thumbnail = false): string | null {
		return thumbnail
			? file.thumbnailUrl ?? file.webpublicUrl ?? file.url
			: file.webpublicUrl ?? file.url;
	},

	getFinalUrl(url: string): string {
		if (!config.proxyRemoteFiles) return url;
		if (!url.startsWith('https://') && !url.startsWith('http://')) return url;
		if (url.startsWith(`${config.url}/files`)) return url;
		if (url.startsWith(`${config.url}/static-assets`)) return url;
		if (url.startsWith(`${config.url}/identicon`)) return url;
		if (url.startsWith(`${config.url}/avatar`)) return url;

		const meta = fetchMetaSync();
        const baseUrl = meta ? meta.objectStorageBaseUrl ?? `${meta.objectStorageUseSSL ? "https" : "http"}://${meta.objectStorageEndpoint}${meta.objectStoragePort ? `:${meta.objectStoragePort}` : ""}/${meta.objectStorageBucket}` : null;
		if (baseUrl !== null && url.startsWith(baseUrl)) return url;

		return `${config.url}/proxy/${encodeURIComponent(new URL(url).pathname)}?${query({ url: url })}`;
	},

	getFinalUrlMaybe(url?: string | null): string | null {
		if (url == null) return null;
		return this.getFinalUrl(url);
	},

	async calcDriveUsageOf(
		user: User["id"] | { id: User["id"] },
	): Promise<number> {
		const id = typeof user === "object" ? user.id : user;

		const { sum } = await this.createQueryBuilder("file")
			.where("file.userId = :id", { id: id })
			.andWhere("file.isLink = FALSE")
			.select("SUM(file.size)", "sum")
			.getRawOne();

		return parseInt(sum, 10) || 0;
	},

	async calcDriveUsageOfHost(host: string): Promise<number> {
		const { sum } = await this.createQueryBuilder("file")
			.where("file.userHost = :host", { host: toPuny(host) })
			.andWhere("file.isLink = FALSE")
			.select("SUM(file.size)", "sum")
			.getRawOne();

		return parseInt(sum, 10) || 0;
	},

	async calcDriveUsageOfLocal(): Promise<number> {
		const { sum } = await this.createQueryBuilder("file")
			.where("file.userHost IS NULL")
			.andWhere("file.isLink = FALSE")
			.select("SUM(file.size)", "sum")
			.getRawOne();

		return parseInt(sum, 10) || 0;
	},

	async calcDriveUsageOfRemote(): Promise<number> {
		const { sum } = await this.createQueryBuilder("file")
			.where("file.userHost IS NOT NULL")
			.andWhere("file.isLink = FALSE")
			.select("SUM(file.size)", "sum")
			.getRawOne();

		return parseInt(sum, 10) || 0;
	},

	async pack(
		src: DriveFile["id"] | DriveFile,
		options?: PackOptions,
	): Promise<Packed<"DriveFile">> {
		const opts = Object.assign(
			{
				detail: false,
				self: false,
			},
			options,
		);

		const file =
			typeof src === "object" ? src : await this.findOneByOrFail({ id: src });

		return await awaitAll<Packed<"DriveFile">>({
			id: file.id,
			createdAt: file.createdAt.toISOString(),
			name: file.name,
			type: file.type,
			md5: file.md5,
			size: file.size,
			isSensitive: file.isSensitive,
			blurhash: file.blurhash,
			properties: opts.self ? file.properties : this.getPublicProperties(file),
			url: opts.self ? file.url : this.getPublicUrl(file, false),
			thumbnailUrl: this.getPublicUrl(file, true),
			comment: file.comment,
			folderId: file.folderId,
			folder:
				opts.detail && file.folderId
					? DriveFolders.pack(file.folderId, {
							detail: true,
					  })
					: null,
			userId: opts.withUser ? file.userId : null,
			user: opts.withUser && file.userId ? Users.pack(file.userId) : null,
		});
	},

	async packNullable(
		src: DriveFile["id"] | DriveFile,
		options?: PackOptions,
	): Promise<Packed<"DriveFile"> | null> {
		const opts = Object.assign(
			{
				detail: false,
				self: false,
			},
			options,
		);

		const file =
			typeof src === "object" ? src : await this.findOneBy({ id: src });
		if (file == null) return null;

		return await awaitAll<Packed<"DriveFile">>({
			id: file.id,
			createdAt: file.createdAt.toISOString(),
			name: file.name,
			type: file.type,
			md5: file.md5,
			size: file.size,
			isSensitive: file.isSensitive,
			blurhash: file.blurhash,
			properties: opts.self ? file.properties : this.getPublicProperties(file),
			url: opts.self ? file.url : this.getPublicUrl(file, false),
			thumbnailUrl: this.getPublicUrl(file, true),
			comment: file.comment,
			folderId: file.folderId,
			folder:
				opts.detail && file.folderId
					? DriveFolders.pack(file.folderId, {
							detail: true,
					  })
					: null,
			userId: opts.withUser ? file.userId : null,
			user: opts.withUser && file.userId ? Users.pack(file.userId) : null,
		});
	},

	async packMany(
		files: (DriveFile["id"] | DriveFile)[],
		options?: PackOptions,
	): Promise<Packed<"DriveFile">[]> {
		const items = await Promise.all(
			files.map((f) => this.packNullable(f, options)),
		);
		return items.filter((x): x is Packed<"DriveFile"> => x != null);
	},
});
