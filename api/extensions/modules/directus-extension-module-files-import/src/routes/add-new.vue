<script setup lang="ts">
import { useDialogRoute } from '../core-clones/composables/use-dialog-route';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const props = defineProps<{
	folder?: string;
}>();

const { t } = useI18n();

const router = useRouter();

const isOpen = useDialogRoute();

function close() {
	router.push(props.folder ? { path: `/module-files/folders/${props.folder}` } : { path: '/module-files' });
}
</script>

<template>
	<v-dialog :model-value="isOpen" @update:model-value="close" @esc="close">
		<v-card>
			<v-card-title>{{ t('add_file') }}</v-card-title>
			<v-card-text>
				<v-upload :folder="props.folder" :from-url="false" multiple @input="close" />
			</v-card-text>
			<v-card-actions>
				<v-button secondary @click="close">{{ t('done') }}</v-button>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>
