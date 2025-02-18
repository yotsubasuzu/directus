import { useStores, useCollection } from "@directus/extensions-sdk";
import { ComputedRef, computed, ref, unref } from 'vue';
import { Collection } from '../types';
import { isFieldAllowed } from '../utils/is-field-allowed';

export const isArchiveAllowed = (collection: Collection, updateAllowed: ComputedRef<boolean>) => {
	//@ts-ignore
	const { info: collectionInfo } = useCollection(ref(collection));
	const { useUserStore, usePermissionsStore } = useStores();
	const userStore = useUserStore();
	const { getPermission } = usePermissionsStore();

	return computed(() => {
		const collectionValue = unref(collection);

		if (!collectionValue) return false;

		const archiveField = collectionInfo.value?.meta?.archive_field;
		if (!archiveField) return false;

		if (userStore.isAdmin) return true;

		const permission = getPermission(collectionValue, 'update');
		if (!permission) return false;

		if (!isFieldAllowed(permission, archiveField)) return false;

		return updateAllowed.value;
	});
};
