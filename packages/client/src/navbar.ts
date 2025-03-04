import { computed, ref, reactive } from "vue";
import { $i } from "./account";
import * as os from "@/os";
import { i18n } from "@/i18n";
import { ui } from "@/config";
import { unisonReload } from "@/scripts/unison-reload";
import { defaultStore } from "@/store";
import { instance } from "@/instance";
import { host } from "@/config";
import XTutorial from "@/components/MkTutorialDialog.vue";
import { openHelpMenu_ } from "@/scripts/helpMenu";

export const navbarItemDef = reactive({
	notifications: {
		title: "notifications",
		icon: "ph-bell ph-bold ph-lg",
		show: computed(() => $i != null),
		indicated: computed(() => $i?.hasUnreadNotification),
		to: "/my/notifications",
	},
	messaging: {
		title: "messaging",
		icon: "ph-chats-teardrop ph-bold ph-lg",
		show: computed(() => $i != null),
		indicated: computed(() => $i?.hasUnreadMessagingMessage),
		to: "/my/messaging",
	},
	drive: {
		title: "drive",
		icon: "ph-cloud ph-bold ph-lg",
		show: computed(() => $i != null),
		to: "/my/drive",
	},
	followRequests: {
		title: "followRequests",
		icon: "ph-hand-waving ph-bold ph-lg",
		show: computed(() => $i?.isLocked || $i?.hasPendingReceivedFollowRequest),
		indicated: computed(() => $i?.hasPendingReceivedFollowRequest),
		to: "/my/follow-requests",
	},
	explore: {
		title: "explore",
		icon: "ph-hash ph-bold ph-lg",
		to: "/explore",
	},
	announcements: {
		title: "announcements",
		icon: "ph-megaphone-simple ph-bold ph-lg",
		indicated: computed(() => $i?.hasUnreadAnnouncement),
		to: "/announcements",
	},
	search: {
		title: "search",
		icon: "ph-magnifying-glass ph-bold ph-lg",
		to: "/search",
	},
	lists: {
		title: "lists",
		icon: "ph-list-bullets ph-bold ph-lg",
		show: computed(() => $i != null),
		to: "/my/lists",
	},
	/*
	groups: {
		title: 'groups',
		icon: 'ph-users-three ph-bold ph-lg',
		show: computed(() => $i != null),
		to: '/my/groups',
	},
	*/
	antennas: {
		title: "antennas",
		icon: "ph-flying-saucer ph-bold ph-lg",
		show: computed(() => $i != null),
		to: "/my/antennas",
	},
	favorites: {
		title: "favorites",
		icon: "ph-bookmark-simple ph-bold ph-lg",
		show: computed(() => $i != null),
		to: "/my/favorites",
	},
	pages: {
		title: "pages",
		icon: "ph-file-text ph-bold ph-lg",
		to: "/pages",
	},
	gallery: {
		title: "gallery",
		icon: "ph-image-square ph-bold ph-lg",
		to: "/gallery",
	},
	clips: {
		title: "clips",
		icon: "ph-paperclip ph-bold ph-lg",
		show: computed(() => $i != null),
		to: "/my/clips",
	},
	channels: {
		title: "channel",
		icon: "ph-television ph-bold ph-lg",
		to: "/channels",
	},
	groups: {
		title: "groups",
		icon: "ph-users-three ph-bold ph-lg",
		to: "/my/groups",
	},
	ui: {
		title: "switchUi",
		icon: "ph-layout ph-bold ph-lg",
		action: (ev) => {
			if (ui === "default") {
				localStorage.setItem("ui", "deck");
				unisonReload();
			} else {
				localStorage.setItem("ui", "default");
				unisonReload();
			}
		},
	},
	help: {
		title: "help",
		icon: "ph-info ph-bold ph-lg",
		action: (ev) => {
			openHelpMenu(ev);
		},
	},
	reload: {
		title: "reload",
		icon: "ph-arrows-clockwise ph-bold ph-lg",
		action: () => {
			location.reload();
		}
	}
});

function openHelpMenu(ev: MouseEvent) {
	openHelpMenu_(ev);
}
