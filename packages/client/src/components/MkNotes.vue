<template>
	<MkPagination ref="pagingComponent" :pagination="pagination">
		<template #empty>
			<div class="_fullinfo">
				<img
					:src="instance.images.info"
					class="_ghost"
					alt="Info"
				/>
				<div>{{ i18n.ts.noNotes }}</div>
			</div>
		</template>

		<template #default="{ items: notes }">
			<div class="notes-wrapper" :class="{ noGap }" ref="tlEl">
				<DynamicScroller
					page-mode
					v-slot="{ item: note, index, active }"
					:items="notes"
					:min-item-size="10"
					:buffer="600"
					:class="{ noGap }"
					listClass="notes"
					itemClass="note"
				>
					<DynamicScrollerItem
							:key="index"
							:item="note"
							:active="active"
							:data-index="index"
					>
						<div class="note-wrapper">
							<XNote
								:key="note._featuredId_ || note._prId_ || note.id"
								:note="note"
							/>
						</div>
					</DynamicScrollerItem>
				</DynamicScroller>
			</div>
		</template>
	</MkPagination>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import type { Paging } from "@/components/MkPagination.vue";
import XNote from "@/components/MkNote.vue";
import MkPagination from "@/components/MkPagination.vue";
import { i18n } from "@/i18n";
import { scroll } from "@/scripts/scroll";
import { instance } from "@/instance";
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

const tlEl = ref<HTMLElement>();

const props = defineProps<{
	pagination: Paging;
	noGap?: boolean;
}>();

const pagingComponent = ref<InstanceType<typeof MkPagination>>();

function scrollTop() {
	scroll(tlEl.value, { top: 0, behavior: "smooth" });
}

defineExpose({
	pagingComponent,
	scrollTop,
});

const lastFetchPos = ref(0);

setInterval(() => {
	if (!tlEl.value) return;
	const viewport = document.documentElement.clientHeight;
	const left = document.documentElement.scrollHeight - document.documentElement.scrollTop;
	if (left <= viewport * 3) {
		pagingComponent.value.fetchMore();
		lastFetchPos.value = document.documentElement.scrollTop;
	}
}, 100);
</script>

<style lang="scss" scoped>
.notes-wrapper {
	&.noGap {
		:deep(.notes) {
			background: var(--panel) !important;
			border-radius: var(--radius);
		}
	}
	&:not(.noGap) {
		:deep(.notes) .note .note-wrapper > div {
			background: var(--panel);
			border-radius: var(--radius);
		}
	}

	:deep(.notes) {
		.note .note-container:empty {
			display: none;
		}

		.note .note-wrapper {
			padding-bottom: var(--margin);
		}

		> .separator {
			text-align: center;

			> .date {
				display: inline-block;
				position: relative;
				margin: 0;
				padding: 0 16px;
				line-height: 32px;
				text-align: center;
				font-size: 12px;
				color: var(--dateLabelFg);

				> span {
					&:first-child {
						margin-right: 8px;

						> .icon {
							margin-right: 8px;
						}
					}

					&:last-child {
						margin-left: 8px;

						> .icon {
							margin-left: 8px;
						}
					}
				}
			}
		}

		&.noGap {
			> * {
				margin: 0 !important;
				border: none;
				border-radius: 0;
				box-shadow: none;

				&:first-child {
					border-radius: var(--radius) var(--radius) 0 0;
				}
				&:last-child {
					border-radius: 0 0 var(--radius) var(--radius);
				}

				&:not(:last-child) {
					border-bottom: solid 0.5px var(--divider);
				}
			}
		}
	}
}
</style>
