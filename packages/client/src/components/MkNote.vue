<template>
	<div
		:aria-label="accessibleLabel"
		v-if="!muted.muted"
		v-show="!isDeleted"
		ref="el"
		v-hotkey="keymap"
		v-size="{ max: [500, 350] }"
		class="tkcbzcuz note-container"
		:tabindex="!isDeleted ? '-1' : null"
		:class="{ renote: isRenote }"
		:id="appearNote.id"
	>
		<MkNoteSub
			v-if="appearNote.reply && !detailedView && !collapsedReply"
			:note="appearNote.reply"
			:forceExpandCw="props.forceExpandCw"
			class="reply-to"
		/>
		<div
			v-if="!detailedView"
			class="note-context"
			@click="noteClick"
			:class="{
				collapsedReply: collapsedReply && appearNote.reply,
			}"
		>
			<div class="line"></div>
			<div v-if="appearNote._prId_" class="info">
				<i class="ph-megaphone-simple-bold ph-lg"></i>
				{{ i18n.ts.promotion
				}}<button class="_textButton hide" @click.stop="readPromo()">
					{{ i18n.ts.hideThisNote }}
					<i class="ph-x ph-bold ph-lg"></i>
				</button>
			</div>
			<div v-if="appearNote._featuredId_" class="info">
				<i class="ph-lightning ph-bold ph-lg"></i>
				{{ i18n.ts.featured }}
			</div>
			<div v-if="pinned" class="info">
				<i class="ph-push-pin ph-bold ph-lg"></i
				>{{ i18n.ts.pinnedNote }}
			</div>
			<div v-if="isRenote" class="renote">
				<i class="ph-repeat ph-bold ph-lg"></i>
				<I18n :src="i18n.ts.renotedBy" tag="span">
					<template #user>
						<MkA
							v-user-preview="note.userId"
							class="name"
							:to="userPage(note.user)"
							@click.stop
						>
							<MkUserName :user="note.user" />
						</MkA>
					</template>
				</I18n>
				<div class="info">
					<button
						ref="renoteTime"
						class="_button time"
						@click.stop="showRenoteMenu()"
					>
						<i
							v-if="isMyRenote"
							class="ph-dots-three-outline ph-bold ph-lg dropdownIcon"
						></i>
						<MkTime :time="note.createdAt" />
					</button>
					<MkVisibility :note="note" />
				</div>
			</div>
			<div v-if="collapsedReply && appearNote.reply" class="info">
				<MkAvatar class="avatar" :user="appearNote.reply.user" />
				<MkUserName
					class="username"
					:user="appearNote.reply.user"
				></MkUserName>
				<Mfm
					class="summary"
					:text="getNoteSummary(appearNote.reply)"
					:plain="true"
					:nowrap="true"
					:custom-emojis="note.emojis"
				/>
			</div>
		</div>
		<article
			class="article"
			@contextmenu.stop="onContextmenu"
			@click="noteClick"
			:style="{
				cursor: expandOnNoteClick && !detailedView ? 'pointer' : '',
			}"
		>
			<div class="main">
				<div class="header-container">
					<MkAvatar class="avatar" :user="appearNote.user" />
					<XNoteHeader class="header" :note="appearNote" />
				</div>
				<div class="body">
					<MkSubNoteContent
						class="text"
						:note="appearNote"
						:detailed="true"
						:detailedView="detailedView"
						:parentId="appearNote.parentId"
						:forceExpandCw="props.forceExpandCw"
						@push="(e) => router.push(notePage(e))"
						@focusfooter="footerEl.focus()"
						@expanded="(e) => setPostExpanded(e)"
					></MkSubNoteContent>
					<div v-if="translating || translation" class="translation">
						<MkLoading v-if="translating" mini />
						<div v-else class="translated">
							<b
								>{{
									i18n.t("translatedFrom", {
										x: translation.sourceLang,
									})
								}}:
							</b>
							<Mfm
								:text="translation.text"
								:author="appearNote.user"
								:i="$i"
								:custom-emojis="appearNote.emojis"
							/>
						</div>
					</div>
				</div>
				<div
					v-if="detailedView || (appearNote.channel && !inChannel)"
					class="info"
				>
					<MkA
						v-if="detailedView"
						class="created-at"
						:to="notePage(appearNote)"
					>
						<MkTime :time="appearNote.createdAt" mode="absolute" />
					</MkA>
					<MkA
						v-if="appearNote.channel && !inChannel"
						class="channel"
						:to="`/channels/${appearNote.channel.id}`"
						@click.stop
						><i class="ph-television ph-bold"></i>
						{{ appearNote.channel.name }}</MkA
					>
				</div>
				<footer ref="footerEl" class="footer" tabindex="-1">
					<XReactionsViewer
						v-if="enableEmojiReactions"
						ref="reactionsViewer"
						:note="appearNote"
					/>
					<button
						v-tooltip.noDelay.bottom="i18n.ts.reply"
						class="button _button"
						@click.stop="reply()"
					>
						<i class="ph-arrow-u-up-left ph-bold ph-lg"></i>
						<template
							v-if="appearNote.repliesCount > 0 && !detailedView"
						>
							<p class="count">{{ appearNote.repliesCount }}</p>
						</template>
					</button>
					<XRenoteButton
						ref="renoteButton"
						class="button"
						:note="appearNote"
						:count="appearNote.renoteCount"
						:detailedView="detailedView"
					/>
					<XStarButtonNoEmoji
						v-if="!enableEmojiReactions"
						class="button"
						:note="appearNote"
						:count="
							Object.values(appearNote.reactions).reduce(
								(partialSum, val) => partialSum + val,
								0,
							)
						"
						:reacted="appearNote.myReaction != null"
					/>
					<XStarButton
						v-if="
							enableEmojiReactions &&
							appearNote.myReaction == null
						"
						ref="starButton"
						class="button"
						:note="appearNote"
					/>
					<button
						v-if="
							enableEmojiReactions &&
							appearNote.myReaction == null
						"
						ref="reactButton"
						v-tooltip.noDelay.bottom="i18n.ts.reaction"
						class="button _button"
						@click.stop="react()"
					>
						<i class="ph-smiley ph-bold ph-lg"></i>
					</button>
					<button
						v-if="
							enableEmojiReactions &&
							appearNote.myReaction != null
						"
						ref="reactButton"
						class="button _button reacted"
						@click.stop="undoReact(appearNote)"
						v-tooltip.noDelay.bottom="i18n.ts.removeReaction"
					>
						<i class="ph-minus ph-bold ph-lg"></i>
					</button>
					<XQuoteButton class="button" :note="appearNote" />
					<button
						ref="menuButton"
						v-tooltip.noDelay.bottom="i18n.ts.more"
						class="button _button"
						@click.stop="menu()"
					>
						<i class="ph-dots-three-outline ph-bold ph-lg"></i>
					</button>
				</footer>
			</div>
		</article>
	</div>
	<button
		v-else
		class="muted _button"
		@click="muted.muted = false"
		@contextmenu.stop.prevent
	>
		<I18n :src="softMuteReasonI18nSrc(muted.what)" tag="small">
			<template #name>
				<MkA
					v-user-preview="note.userId"
					class="name"
					:to="userPage(note.user)"
				>
					<MkUserName :user="note.user" />
				</MkA>
			</template>
			<template #reason>
				<b class="_blur_text">{{ muted.matched.join(", ") }}</b>
			</template>
		</I18n>
	</button>
</template>

<script lang="ts" setup>
import { computed, inject, onMounted, onUnmounted, reactive, ref } from "vue";
import * as mfm from "mfm-js";
import type { Ref } from "vue";
import type * as misskey from "iceshrimp-js";
import MkNoteSub from "@/components/MkNoteSub.vue";
import MkSubNoteContent from "./MkSubNoteContent.vue";
import XNoteHeader from "@/components/MkNoteHeader.vue";
import XNoteSimple from "@/components/MkNoteSimple.vue";
import XMediaList from "@/components/MkMediaList.vue";
import XCwButton from "@/components/MkCwButton.vue";
import XPoll from "@/components/MkPoll.vue";
import XRenoteButton from "@/components/MkRenoteButton.vue";
import XReactionsViewer from "@/components/MkReactionsViewer.vue";
import XStarButton from "@/components/MkStarButton.vue";
import XStarButtonNoEmoji from "@/components/MkStarButtonNoEmoji.vue";
import XQuoteButton from "@/components/MkQuoteButton.vue";
import MkUrlPreview from "@/components/MkUrlPreview.vue";
import MkVisibility from "@/components/MkVisibility.vue";
import copyToClipboard from "@/scripts/copy-to-clipboard";
import { url } from "@/config";
import { pleaseLogin } from "@/scripts/please-login";
import { focusPrev, focusNext } from "@/scripts/focus";
import { getWordSoftMute } from "@/scripts/check-word-mute";
import { useRouter } from "@/router";
import { userPage } from "@/filters/user";
import * as os from "@/os";
import { defaultStore, noteViewInterruptors } from "@/store";
import { reactionPicker } from "@/scripts/reaction-picker";
import { $i } from "@/account";
import { i18n } from "@/i18n";
import { getNoteMenu } from "@/scripts/get-note-menu";
import { useNoteCapture } from "@/scripts/use-note-capture";
import { notePage } from "@/filters/note";
import { deepClone } from "@/scripts/clone";
import { getNoteSummary } from "@/scripts/get-note-summary";

const router = useRouter();

const props = defineProps<{
	note: misskey.entities.Note;
	pinned?: boolean;
	detailedView?: boolean;
	collapsedReply?: boolean;
	forceExpandCw?: boolean;
}>();

const inChannel = inject("inChannel", null);

let note = $ref(deepClone(props.note));

const softMuteReasonI18nSrc = (what?: string) => {
	if (what === "note") return i18n.ts.userSaysSomethingReason;
	if (what === "reply") return i18n.ts.userSaysSomethingReasonReply;
	if (what === "renote") return i18n.ts.userSaysSomethingReasonRenote;
	if (what === "quote") return i18n.ts.userSaysSomethingReasonQuote;

	// I don't think here is reachable, but just in case
	return i18n.ts.userSaysSomething;
};

// plugin
if (noteViewInterruptors.length > 0) {
	onMounted(async () => {
		let result = deepClone(note);
		for (const interruptor of noteViewInterruptors) {
			result = await interruptor.handler(result);
		}
		note = result;
	});
}

const isRenote =
	note.renote != null &&
	note.text == null &&
	note.cw == null &&
	note.fileIds.length === 0 &&
	note.poll == null;

const el = ref<HTMLElement>();
const footerEl = ref<HTMLElement>();
const menuButton = ref<HTMLElement>();
const starButton = ref<InstanceType<typeof XStarButton>>();
const renoteButton = ref<InstanceType<typeof XRenoteButton>>();
const renoteTime = ref<HTMLElement>();
const reactButton = ref<HTMLElement>();
let appearNote = $computed(() =>
	isRenote ? (note.renote as misskey.entities.Note) : note,
);
const isMyRenote = $i && $i.id === note.userId;
const showContent = ref(defaultStore.state.alwaysExpandCws);
const isDeleted = ref(false);
const muted = ref(getWordSoftMute(note, $i, defaultStore.state.mutedWords));
const translation = ref(null);
const translating = ref(false);
const enableEmojiReactions = defaultStore.state.enableEmojiReactions;
const expandOnNoteClick = defaultStore.state.expandOnNoteClick;

const keymap = {
	r: () => reply(true),
	"e|a|plus": () => react(true),
	q: () => renoteButton.value.renote(true),
	"up|k": focusBefore,
	"down|j": focusAfter,
	esc: blur,
	"m|o": () => menu(true),
	s: () => showContent.value !== showContent.value,
};

useNoteCapture({
	rootEl: el,
	note: $$(appearNote),
	isDeletedRef: isDeleted,
});

function reply(viaKeyboard = false): void {
	pleaseLogin();
	os.post(
		{
			reply: appearNote,
			animation: !viaKeyboard,
		},
		() => {
			focus();
		},
	);
}

function react(viaKeyboard = false): void {
	pleaseLogin();
	blur();
	reactionPicker.show(
		reactButton.value,
		(reaction) => {
			os.api("notes/reactions/create", {
				noteId: appearNote.id,
				reaction: reaction,
			});
		},
		() => {
			focus();
		},
	);
}

function undoReact(note): void {
	const oldReaction = note.myReaction;
	if (!oldReaction) return;
	os.api("notes/reactions/delete", {
		noteId: note.id,
	});
}

const currentClipPage = inject<Ref<misskey.entities.Clip> | null>(
	"currentClipPage",
	null,
);

function onContextmenu(ev: MouseEvent): void {
	const isLink = (el: HTMLElement) => {
		if (el.tagName === "A") return true;
		// The Audio element's context menu is the browser default, such as for selecting playback speed.
		if (el.tagName === "AUDIO") return true;
		if (el.parentElement) {
			return isLink(el.parentElement);
		}
	};
	if (isLink(ev.target)) return;
	if (window.getSelection().toString() !== "") return;

	if (defaultStore.state.useReactionPickerForContextMenu) {
		ev.preventDefault();
		react();
	} else {
		os.contextMenu(
			[
				{
					type: "label",
					text: notePage(appearNote),
				},
				{
					icon: "ph-browser ph-bold ph-lg",
					text: i18n.ts.openInWindow,
					action: () => {
						os.pageWindow(notePage(appearNote));
					},
				},
				notePage(appearNote) != location.pathname
					? {
							icon: "ph-arrows-out-simple ph-bold ph-lg",
							text: i18n.ts.showInPage,
							action: () => {
								router.push(notePage(appearNote), "forcePage");
							},
					  }
					: undefined,
				null,
				{
					type: "a",
					icon: "ph-arrow-square-out ph-bold ph-lg",
					text: i18n.ts.openInNewTab,
					href: notePage(appearNote),
					target: "_blank",
				},
				{
					icon: "ph-link-simple ph-bold ph-lg",
					text: i18n.ts.copyLink,
					action: async () => {
						await copyToClipboard(`${url}${notePage(appearNote)}`);
					},
				},
				appearNote.user.host != null
					? {
							type: "a",
							icon: "ph-arrow-square-up-right ph-bold ph-lg",
							text: i18n.ts.showOnRemote,
							href: appearNote.url ?? appearNote.uri ?? "",
							target: "_blank",
					  }
					: undefined,
			],
			ev,
		);
	}
}

function menu(viaKeyboard = false): void {
	os.popupMenu(
		getNoteMenu({
			note: note,
			translating,
			translation,
			menuButton,
			isDeleted,
			currentClipPage,
		}),
		menuButton.value,
		{
			viaKeyboard,
		},
	).then(focus);
}

function showRenoteMenu(viaKeyboard = false): void {
	if (!isMyRenote) return;
	os.popupMenu(
		[
			{
				text: i18n.ts.unrenote,
				icon: "ph-trash ph-bold ph-lg",
				danger: true,
				action: () => {
					os.api("notes/delete", {
						noteId: note.id,
					});
					isDeleted.value = true;
				},
			},
		],
		renoteTime.value,
		{
			viaKeyboard: viaKeyboard,
		},
	);
}

function focus() {
	el.value.focus();
}

function blur() {
	el.value.blur();
}

function focusBefore() {
	focusPrev(el.value);
}

function focusAfter() {
	focusNext(el.value);
}

function scrollIntoView() {
	el.value.scrollIntoView();
}

function noteClick(e) {
	if (
		document.getSelection().type === "Range" ||
		props.detailedView ||
		!expandOnNoteClick
	) {
		e.stopPropagation();
	} else {
		router.push(notePage(appearNote));
	}
}

function readPromo() {
	os.api("promo/read", {
		noteId: appearNote.id,
	});
	isDeleted.value = true;
}

let postIsExpanded = ref(false);

function setPostExpanded(val: boolean) {
	postIsExpanded.value = val;
}

const accessibleLabel = computed(() => {
	let label = `${appearNote.user.username}; `;
	if (appearNote.renote) {
		label += `${i18n.t("renoted")} ${appearNote.renote.user.username}; `;
		if (appearNote.renote.cw) {
			label += `${i18n.t("cw")}: ${appearNote.renote.cw}; `;
			if (postIsExpanded.value) {
				label += `${appearNote.renote.text}; `;
			}
		} else {
			label += `${appearNote.renote.text}; `;
		}
	} else {
		if (appearNote.cw) {
			label += `${i18n.t("cw")}: ${appearNote.cw}; `;
			if (postIsExpanded.value) {
				label += `${appearNote.text}; `;
			}
		} else {
			label += `${appearNote.text}; `;
		}
	}
	const date = new Date(appearNote.createdAt);
	label += `${date.toLocaleTimeString()}`;
	return label;
});

defineExpose({
	focus,
	blur,
	scrollIntoView,
});
</script>

<style lang="scss" scoped>
.tkcbzcuz {
	position: relative;
	transition: box-shadow 0.1s ease;
	font-size: 1.05em;
	overflow: clip;
	contain: content;
	-webkit-tap-highlight-color: transparent;

	// これらの指定はパフォーマンス向上には有効だが、ノートの高さは一定でないため、
	// 下の方までスクロールすると上のノートの高さがここで決め打ちされたものに変化し、表示しているノートの位置が変わってしまう
	// ノートがマウントされたときに自身の高さを取得し contain-intrinsic-size を設定しなおせばほぼ解決できそうだが、
	// 今度はその処理自体がパフォーマンス低下の原因にならないか懸念される。また、被リアクションでも高さは変化するため、やはり多少のズレは生じる
	// 一度レンダリングされた要素はブラウザがよしなにサイズを覚えておいてくれるような実装になるまで待った方が良さそう(なるのか？)
	//content-visibility: auto;
	//contain-intrinsic-size: 0 128px;

	&:focus-visible {
		outline: none;

		&:after {
			content: "";
			pointer-events: none;
			display: block;
			position: absolute;
			z-index: 10;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			margin: auto;
			width: calc(100% - 8px);
			height: calc(100% - 8px);
			border: solid 1px var(--focus);
			border-radius: var(--radius);
			box-sizing: border-box;
		}
	}

	& > .article > .main {
		&:hover,
		&:focus-within {
			:deep(.footer .button) {
				opacity: 1;
			}
		}
	}

	> .reply-to {
		& + .note-context {
			.line::before {
				content: "";
				display: block;
				margin-bottom: -4px;
				margin-top: 16px;
				border-left: 2px solid currentColor;
				margin-left: calc((var(--avatarSize) / 2) - 1px);
				opacity: 0.25;
			}
		}
	}

	.note-context {
		position: relative;
		padding: 0 32px 0 32px;
		display: flex;
		z-index: 1;
		&:first-child {
			margin-top: 20px;
		}
		> :not(.line) {
			width: 0;
			flex-grow: 1;
			position: relative;
			line-height: 28px;
		}
		> .line {
			position: relative;
			z-index: 2;
			width: var(--avatarSize);
			display: flex;
			margin-right: 14px;
			margin-top: 0;
			flex-grow: 0;
			pointer-events: none;
		}

		> div > i {
			margin-left: -0.5px;
		}
		> .info {
			display: flex;
			align-items: center;
			font-size: 90%;
			white-space: pre;
			color: #f6c177;

			> i {
				margin-right: 4px;
			}

			> .hide {
				margin-left: auto;
				color: inherit;
			}
		}

		> .renote {
			display: flex;
			align-items: center;
			white-space: pre;
			color: var(--renote);
			cursor: pointer;

			> i {
				margin-right: 4px;
			}

			> span {
				overflow: hidden;
				flex-shrink: 1;
				text-overflow: ellipsis;
				white-space: nowrap;

				> .name {
					font-weight: bold;
				}
			}

			> .info {
				margin-left: auto;
				font-size: 0.9em;
				display: flex;

				> .time {
					flex-shrink: 0;
					color: inherit;
					display: inline-flex;
					align-items: center;
					> .dropdownIcon {
						margin-right: 4px;
					}
				}
			}
		}

		&.collapsedReply {
			.line {
				opacity: 0.25;
				&::after {
					content: "";
					position: absolute;
					border-left: 2px solid currentColor;
					border-top: 2px solid currentColor;
					margin-left: calc(var(--avatarSize) / 2 - 1px);
					width: calc(var(--avatarSize) / 2 + 14px);
					border-top-left-radius: calc(var(--avatarSize) / 4);
					top: calc(50% - 1px);
					height: calc(50% + 5px);
				}
			}
			.info {
				color: var(--fgTransparentWeak);
				transition: color 0.2s;
			}
			.avatar {
				width: 1.2em;
				height: 1.2em;
				border-radius: 2em;
				overflow: hidden;
				margin-right: 0.4em;
				background: var(--panelHighlight);
			}
			.username {
				font-weight: 700;
				flex-shrink: 0;
				max-width: 30%;
				&::after {
					content: ": ";
				}
			}
			&:hover,
			&:focus-within {
				.info {
					color: var(--fg);
				}
			}
		}
	}

	> .article {
		position: relative;
		overflow: clip;
		padding: 20px 32px 10px;
		margin-top: -16px;

		&:first-child,
		&:nth-child(2) {
			margin-top: -100px;
			padding-top: 104px;
		}

		@media (pointer: coarse) {
			cursor: default;
		}

		.header-container {
			display: flex;
			position: relative;
			z-index: 2;
			> .avatar {
				flex-shrink: 0;
				display: block;
				margin: 0 14px 0 0;
				width: var(--avatarSize);
				height: var(--avatarSize);
				position: relative;
				top: 0;
				left: 0;
			}
			> .header {
				width: 0;
				flex-grow: 1;
			}
		}
		> .main {
			flex: 1;
			min-width: 0;

			> .body {
				margin-top: 0.7em;
				> .translation {
					border: solid 0.5px var(--divider);
					border-radius: var(--radius);
					padding: 12px;
					margin-top: 8px;
				}
				> .renote {
					padding-top: 8px;
					> * {
						padding: 16px;
						border: solid 1px var(--renote);
						border-radius: 8px;
						transition: background 0.2s;
						&:hover,
						&:focus-within {
							background-color: var(--panelHighlight);
						}
					}
				}
			}
			> .info {
				display: flex;
				justify-content: space-between;
				flex-wrap: wrap;
				gap: 0.7em;
				margin-top: 16px;
				opacity: 0.7;
				font-size: 0.9em;
			}
			> .footer {
				position: relative;
				z-index: 2;
				display: flex;
				flex-wrap: wrap;
				margin-top: 0.4em;
				> :deep(.button) {
					position: relative;
					margin: 0;
					padding: 8px;
					opacity: 0.7;
					&:disabled {
						opacity: 0.5 !important;
					}
					flex-grow: 1;
					max-width: 3.5em;
					width: max-content;
					min-width: max-content;
					height: auto;
					transition: opacity 0.2s;
					&::before {
						content: "";
						position: absolute;
						inset: 0;
						bottom: 2px;
						background: var(--panel);
						z-index: -1;
						transition: background 0.2s;
					}
					&:first-of-type {
						margin-left: -0.5em;
						&::before {
							border-radius: 100px 0 0 100px;
						}
					}
					&:last-of-type {
						&::before {
							border-radius: 0 100px 100px 0;
						}
					}
					&:hover {
						color: var(--fgHighlighted);
					}

					> i {
						display: inline !important;
					}

					> .count {
						display: inline;
						margin: 0 0 0 8px;
						opacity: 0.7;
					}

					&.reacted {
						color: var(--accent);
					}
				}
			}
		}
	}

	> .reply {
		border-top: solid 0.5px var(--divider);
	}

	&.max-width_500px {
		font-size: 0.975em;
		--avatarSize: 46px;
		padding-top: 6px;
		> .note-context {
			padding-inline: 16px;
			margin-top: 8px;
			> :not(.line) {
				margin-top: 0px;
			}
			> .line {
				margin-right: 10px;
				&::before {
					margin-top: 8px;
				}
			}
		}
		> .article {
			padding: 18px 16px 8px;
			&:first-child,
			&:nth-child(2) {
				padding-top: 104px;
			}
			> .main > .header-container > .avatar {
				margin-right: 10px;
				// top: calc(14px + var(--stickyTop, 0px));
			}
		}
	}

	&.max-width_300px {
		--avatarSize: 40px;
	}
}

.muted {
	padding: 8px;
	text-align: center;
	opacity: 0.7;
	width: 100%;

	._blur_text {
		pointer-events: auto;
	}
	&:active ._blur_text {
		filter: blur(0px);
	}
}
</style>
