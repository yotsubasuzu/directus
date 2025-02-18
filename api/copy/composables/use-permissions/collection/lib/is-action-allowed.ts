import { useStores } from '@directus/extensions-sdk';
import { computed, unref } from 'vue';
import { Collection } from '../../types';

export const isActionAllowed = (collection: Collection, action: 'create' | 'read' | 'update' | 'delete') => {
	const { usePermissionsStore } = useStores();
	const { hasPermission } = usePermissionsStore();

	return computed(() => {
		const collectionValue = unref(collection);

		if (!collectionValue) return false;

		return hasPermission(collectionValue, action);
	});
};
