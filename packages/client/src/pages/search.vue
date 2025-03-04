<template>
	<MkStickyContainer>
		<template #header
			><MkPageHeader
				v-model:tab="tab"
				:actions="headerActions"
				:tabs="headerTabs"
		/></template>
		<MkSpacer :content-max="800">
			<MkSearch :query="searchQuery" :hideFilters="!$i || tab === 'users'" @query="search"/>
			<swiper
				:round-lengths="true"
				:touch-angle="25"
				:threshold="10"
				:centeredSlides="true"
				:modules="[Virtual]"
				:space-between="20"
				:virtual="true"
				:allow-touch-move="
					defaultStore.state.swipeOnMobile &&
					(deviceKind !== 'desktop' ||
						defaultStore.state.swipeOnDesktop)
				"
				@swiper="setSwiperRef"
				@slide-change="onSlideChange"
			>
				<swiper-slide>
					<template v-if="$i">
						<template v-if="searchQuery == null || searchQuery.trim().length < 1">
							<transition :name="$store.state.animation ? 'zoom' : ''" appear>
								<div class="_fullinfo" ref="notes">
									<img
											:src="instance.images.info"
											class="_ghost"
											alt="Info"
									/>
									<div>
										{{ i18n.ts.searchEmptyQuery }}
									</div>
								</div>
							</transition>
						</template>
						<template v-else-if="tabs[swiperRef!.activeIndex] == 'notes'">
							<XNotes ref="notes" :pagination="notesPagination" />
						</template>
					</template>
					<template v-else>
						<transition :name="$store.state.animation ? 'zoom' : ''" appear>
							<div class="_fullinfo" ref="notes">
								<img
									:src="instance.images.info"
									class="_ghost"
									alt="Info"
								/>
								<div>
									{{ i18n.ts.searchNotLoggedIn_1 }}<br>
									{{ i18n.ts.searchNotLoggedIn_2 }}
								</div>
							</div>
						</transition>
					</template>
				</swiper-slide>
				<swiper-slide>
					<template v-if="searchQuery == null || searchQuery.trim().length < 1">
						<transition :name="$store.state.animation ? 'zoom' : ''" appear>
							<div class="_fullinfo" ref="notes">
								<img
										:src="instance.images.info"
										class="_ghost"
										alt="Info"
								/>
								<div>
									{{ i18n.ts.searchEmptyQuery }}
								</div>
							</div>
						</transition>
					</template>
					<template v-else-if="tabs[swiperRef!.activeIndex] == 'users'">
						<XUserList
								ref="users"
								class="_gap"
								:pagination="usersPagination"
						/>
					</template>
				</swiper-slide>
			</swiper>
		</MkSpacer>
	</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, watch, onMounted, onActivated, ref } from "vue";
import { Virtual } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";
import XNotes from "@/components/MkNotes.vue";
import XUserList from "@/components/MkUserList.vue";
import { i18n } from "@/i18n";
import { definePageMetadata } from "@/scripts/page-metadata";
import { defaultStore } from "@/store";
import { deviceKind } from "@/scripts/device-kind";
import { $i } from "@/account";
import "swiper/scss";
import "swiper/scss/virtual";
import {instance} from "@/instance";
import MkSearch from "@/components/MkSearch.vue";
import { useRouter } from "@/router.js";
import * as os from "@/os.js";

const router = useRouter();

const getUrlParams = () =>
		window.location.search
				.substring(1)
				.split("&")
				.reduce((result, query) => {
					const [k, v] = query.split("=");
					result[k] = decodeURIComponent(v?.replace('+', '%20'));
					return result;
				}, {});

let searchQuery = $ref<string>(getUrlParams()['q'] ?? "");
let channel = $ref<string|undefined>(getUrlParams()['channel'] ?? undefined);

const notesPagination = {
	endpoint: "notes/search" as const,
	limit: 10,
	params: computed(() => ({
		query: searchQuery,
		channelId: channel,
	})),
};

const usersPagination = {
	endpoint: "users/search" as const,
	limit: 10,
	params: computed(() => ({
		query: searchQuery,
		origin: "combined",
	})),
};

const tabs = ["notes", "users"];
let tab = $ref(tabs[0]);
watch($$(tab), () => syncSlide(tabs.indexOf(tab)));

const headerActions = $computed(() => []);

const headerTabs = $computed(() => [
	{
		key: "notes",
		icon: "ph-magnifying-glass ph-bold ph-lg",
		title: i18n.ts.notes,
	},
	{
		key: "users",
		icon: "ph-users ph-bold ph-lg",
		title: i18n.ts.users,
	},
]);

let swiperRef = null;

function setSwiperRef(swiper) {
	swiperRef = swiper;
	syncSlide(tabs.indexOf(tab));
}

function onSlideChange() {
	tab = tabs[swiperRef.activeIndex];
}

function syncSlide(index) {
	swiperRef.slideTo(index);
}

onMounted(() => {
	syncSlide(tabs.indexOf(tab));
});

onActivated(() => {
	searchQuery = getUrlParams()['q'];
	channel = getUrlParams()['channel'] ?? undefined;

	syncSlide(tabs.indexOf(tab));
});

definePageMetadata(
	computed(() => ({
		title: i18n.ts.search,
		icon: "ph-magnifying-glass ph-bold ph-lg",
	})),
);

async function search(query: string) {
	const q = query.trim();

	if (q.startsWith("@") && !q.includes(" ")) {
		router.push(`/${q}`);
		return;
	}

	if (q.startsWith("#")) {
		router.push(`/tags/${encodeURIComponent(q.slice(1))}`);
		return;
	}

	if (q.startsWith("https://")) {
		const promise = os.api("ap/show", {
			uri: q,
		});

		os.promiseDialog(promise, null, null, i18n.ts.fetchingAsApObject);

		const res = await promise;

		if (res.type === "User") {
			router.push(`/@${res.object.username}@${res.object.host}`);
		} else if (res.type === "Note") {
			router.push(`/notes/${res.object.id}`);
		}

		return;
	}

	searchQuery = q;
	router.push(`/search?q=${encodeURIComponent(q)}`);
}
</script>
