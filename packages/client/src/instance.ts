import { computed, reactive } from "vue";
import { api } from "./os";
import type * as Misskey from "calckey-js";

// TODO: 他のタブと永続化されたstateを同期

const instanceData = localStorage.getItem("instance");
const patronData = localStorage.getItem("patrons");

// TODO: instanceをリアクティブにするかは再考の余地あり

export const instance: Misskey.entities.DetailedInstanceMetadata = reactive(
	instanceData
		? JSON.parse(instanceData)
		: {
				// TODO: set default values
		  },
);

export const patrons = patronData || [];

export async function fetchInstance() {
	const meta = await api("meta", {
		detail: true,
	});

	for (const [k, v] of Object.entries(meta)) {
		instance[k] = v;
	}

	localStorage.setItem("instance", JSON.stringify(instance));
}

export async function fetchPatrons() {
	const patrons = await api("patrons");
	localStorage.setItem("patrons", JSON.stringify(patrons));
}

export const emojiCategories = computed(() => {
	if (instance.emojis == null) return [];
	const categories = new Set();
	for (const emoji of instance.emojis) {
		categories.add(emoji.category);
	}
	return Array.from(categories);
});

export const emojiTags = computed(() => {
	if (instance.emojis == null) return [];
	const tags = new Set();
	for (const emoji of instance.emojis) {
		for (const tag of emoji.aliases) {
			tags.add(tag);
		}
	}
	return Array.from(tags);
});

// このファイルに書きたくないけどここに書かないと何故かVeturが認識しない
declare module "@vue/runtime-core" {
	interface ComponentCustomProperties {
		$instance: typeof instance;
	}
}
