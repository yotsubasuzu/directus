import { useStores } from '@directus/extensions-sdk';
import { SnackbarRaw } from '../types/notifications';

let store: any;

export function notify(notification: SnackbarRaw): void {
	const { useNotificationsStore } = useStores();
	if (!store) store = useNotificationsStore();
	store.add(notification);
}
