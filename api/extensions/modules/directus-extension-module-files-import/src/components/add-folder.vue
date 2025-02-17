<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { useApi } from '@directus/extensions-sdk';
import { useFolders } from '../core-clones/composables/use-folders';
import { useRouter } from 'vue-router';
import { unexpectedError } from '../core-clones/utils/unexpected-error';

const props = defineProps<{
	parent?: string;
	disabled?: boolean;
}>();

const { t } = useI18n();
const api = useApi();
const router = useRouter();

const dialogActive = ref(false);
const saving = ref(false);
const newFolderName = ref(null);

const { fetchFolders } = useFolders();

async function addFolder() {
	saving.value = true;

	try {
		const newFolder = await api.post(`/folders`, {
			name: newFolderName.value,
			parent: props.parent === 'root' ? null : props.parent,
		});

		await fetchFolders();

		dialogActive.value = false;
		newFolderName.value = null;

		router.push({ path: `/module-files/folders/${newFolder.data.data.id}` });
	} catch (error) {
		unexpectedError(error);
	} finally {
		saving.value = false;
	}
}
</script>

<template>
	<v-dialog v-model="dialogActive" @esc="dialogActive = false">
		<template #activator="{ on }">
			<v-button
				v-tooltip.bottom="disabled ? t('not_allowed') : t('create_folder')"
				rounded
				icon
				secondary
				:disabled="disabled"
				@click="on"
			>
				<v-icon name="create_new_folder" outline />
			</v-button>
		</template>

		<v-card>
			<v-card-title>{{ t('create_folder') }}</v-card-title>
			<v-card-text>
				<v-input v-model="newFolderName" autofocus :placeholder="t('folder_name')" @keyup.enter="addFolder" />
			</v-card-text>
			<v-card-actions>
				<v-button secondary @click="dialogActive = false">{{ t('cancel') }}</v-button>
				<v-button :disabled="newFolderName === null" :loading="saving" @click="addFolder">
					{{ t('save') }}
				</v-button>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>
