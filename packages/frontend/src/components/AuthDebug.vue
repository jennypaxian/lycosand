<script setup lang="ts">
import { api } from "../helpers/api.ts";
import { onMounted, ref } from "vue";

const field = ref<HTMLElement>();

onMounted(() => {
	api('/api/iceshrimp/v1/auth').then(res => {
		field.value!.textContent = JSON.stringify(res, null, 2);
	});
});
</script>

<template>
	<pre class="auth" ref="field">

	</pre>
</template>

<style scoped lang="scss">
.auth {
	text-align: left;
}
</style>
