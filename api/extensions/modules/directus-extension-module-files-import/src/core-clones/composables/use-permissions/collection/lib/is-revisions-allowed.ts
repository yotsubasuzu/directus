import { useStores } from '@directus/extensions-sdk';
import { computed } from 'vue';

export const isRevisionsAllowed = () => {
	const { usePermissionsStore } = useStores();
	const { hasPermission } = usePermissionsStore();

	return computed(() => hasPermission('directus_revisions', 'read'));
};
