import type { RequestError } from '../api';
// import { i18n } from '../lang';
import { useStores } from '@directus/extensions-sdk';
import type { APIError } from '../types/error';

let store: any;

export function unexpectedError(error: unknown): void {
	const { useNotificationsStore } = useStores();
	if (!store) store = useNotificationsStore();

	const code =
		//@ts-ignore
		(error as RequestError).response?.data?.errors?.[0]?.extensions?.code ||
		(error as APIError)?.extensions?.code ||
		'UNKNOWN';

	// eslint-disable-next-line no-console
	console.warn(error);

	store.add({
		// title: i18n.global.t(`errors.${code}`),
		title: `Error ${code}`,
		type: 'error',
		code,
		dialog: true,
		error,
	});
}
