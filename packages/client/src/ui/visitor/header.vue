<template>
	<div class="sqxihjet">
		<div v-if="narrow === false" class="wide">
			<div class="content">
				<MkA to="/" class="link" active-class="active"
					><i class="ph-house ph-bold ph-lg icon"></i
					>{{ i18n.ts.home }}</MkA
				>
				<!-- <MkA
					v-if="isTimelineAvailable"
					to="/timeline"
					class="link"
					active-class="active"
					><i class="ph-chats-circle ph-bold ph-lg icon"></i
					>{{ i18n.ts.timeline }}</MkA
				> -->
				<MkA to="/explore" class="link" active-class="active"
					><i class="ph-compass ph-bold ph-lg icon"></i
					>{{ i18n.ts.explore }}</MkA
				>
				<MkA to="/pages" class="link" active-class="active"
					><i class="ph-file-text ph-bold ph-lg icon"></i
					>{{ i18n.ts.pages }}</MkA
				>
				<MkA to="/gallery" class="link" active-class="active"
					><i class="ph-image-square ph-bold ph-lg icon"></i
					>{{ i18n.ts.gallery }}</MkA
				>
				<MkA to="/search" class="link" active-class="active">
					<i class="ph-magnifying-glass ph-bold ph-lg icon"></i
					><span>{{ i18n.ts.search }}</span>
				</MkA>
				<div v-if="info" class="page active link">
					<div class="title">
						<i v-if="info.icon" class="icon" :class="info.icon"></i>
						<MkAvatar
							v-else-if="info.avatar"
							class="avatar"
							:user="info.avatar"
							:disable-preview="true"
							:show-indicator="true"
						/>
						<span v-if="info.title" class="text">{{
							info.title
						}}</span>
						<MkUserName
							v-else-if="info.userName"
							:user="info.userName"
							:nowrap="false"
							class="text"
						/>
					</div>
					<button
						v-if="info.action"
						class="_button action"
						@click.stop="info.action.handler"
					>
						<!-- TODO -->
					</button>
				</div>
				<div class="right">
					<button class="_buttonPrimary signup" @click="signup()">
						{{ i18n.ts.signup }}
					</button>
					<button class="_button login" @click="signin()">
						{{ i18n.ts.login }}
					</button>
				</div>
			</div>
		</div>
		<div v-else-if="narrow === true" class="narrow">
			<button class="menu _button" @click="$parent.showMenu = true">
				<i class="ph-list ph-bold ph-lg icon"></i>
			</button>
			<div v-if="info" class="title">
				<i v-if="info.icon" class="icon" :class="info.icon"></i>
				<MkAvatar
					v-else-if="info.avatar"
					class="avatar"
					:user="info.avatar"
					:disable-preview="true"
					:show-indicator="true"
				/>
				<span v-if="info.title" class="text">{{ info.title }}</span>
				<MkUserName
					v-else-if="info.userName"
					:user="info.userName"
					:nowrap="false"
					class="text"
				/>
			</div>
			<button
				v-if="info && info.action"
				class="action _button"
				@click.stop="info.action.handler"
			>
				<!-- TODO -->
			</button>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import XSigninDialog from "@/components/MkSigninDialog.vue";
import XSignupDialog from "@/components/MkSignupDialog.vue";
import * as os from "@/os";
import { instance } from "@/instance";
import { i18n } from "@/i18n";

export default defineComponent({
	props: {
		info: {
			required: true,
		},
	},

	data() {
		return {
			narrow: null,
			showMenu: false,
			i18n,
			isTimelineAvailable:
				!instance.disableLocalTimeline ||
				!instance.disableRecommendedTimeline ||
				!instance.disableGlobalTimeline,
		};
	},

	mounted() {
		this.narrow = this.$el.clientWidth < 1300;
	},

	methods: {
		signin() {
			os.popup(
				XSigninDialog,
				{
					autoSet: true,
				},
				{},
				"closed",
			);
		},

		signup() {
			os.popup(
				XSignupDialog,
				{
					autoSet: true,
				},
				{},
				"closed",
			);
		},
	},
});
</script>

<style lang="scss" scoped>
.sqxihjet {
	$height: 60px;
	position: sticky;
	top: 0;
	left: 0;
	z-index: 1000;
	line-height: $height;
	-webkit-backdrop-filter: var(--blur, blur(32px));
	backdrop-filter: var(--blur, blur(32px));
	background-color: var(--panelTransparent);

	> .wide {
		> .content {
			max-width: 1400px;
			margin: 0 auto;
			display: flex;
			align-items: center;

			> .link {
				$line: 3px;
				display: inline-block;
				padding: 0 16px;
				line-height: $height - ($line * 2);
				border-top: solid $line transparent;
				border-bottom: solid $line transparent;

				> .icon {
					margin-right: 0.5em;
				}

				&.page {
					border-bottom-color: var(--accent);
				}

				&._button {
					text-decoration: underline;
					text-decoration-color: transparent;
					transition: text-decoration-color .2s;

					&:hover {
						text-decoration-color: currentColor;
					}
				}
			}

			> .page {
				> .title {
					display: inline-block;
					vertical-align: bottom;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					position: relative;

					> .icon + .text {
						margin-left: 8px;
					}

					> .avatar {
						$size: 32px;
						display: inline-block;
						width: $size;
						height: $size;
						vertical-align: middle;
						margin-right: 8px;
						pointer-events: none;
					}

					&._button {
						&:hover {
							color: var(--fgHighlighted);
						}
					}

					&.selected {
						box-shadow: 0 -2px 0 0 var(--accent) inset;
						color: var(--fgHighlighted);
					}
				}

				> .action {
					padding: 0 0 0 16px;
				}
			}

			> .right {
				margin-left: auto;
				> .signup {
					border-radius: 999px;
					padding: 0 24px;
					line-height: $height - 20px;
				}

				> .login {
					padding: 0 16px;
				}
			}
		}
	}

	> .narrow {
		display: flex;

		> .menu,
		> .action {
			width: $height;
			height: $height;
			font-size: 20px;
		}

		> .title {
			flex: 1;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			position: relative;
			text-align: center;

			> .icon + .text {
				margin-left: 8px;
			}

			> .avatar {
				$size: 32px;
				display: inline-block;
				width: $size;
				height: $size;
				vertical-align: middle;
				margin-right: 8px;
				pointer-events: none;
			}
		}
	}
}
</style>
