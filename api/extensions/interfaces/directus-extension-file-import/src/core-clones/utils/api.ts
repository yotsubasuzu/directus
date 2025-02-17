import { useApi } from '@directus/extensions-sdk';
import { addQueryToPath } from './add-query-to-path';
import { AxiosError } from 'axios';

export type RequestError = AxiosError & { response: Response };

export function getToken(): string | null {
	const api = useApi();
	return (api.defaults.headers.common['Authorization'] as string | undefined)?.split(' ')[1] || null;
}

export function addTokenToURL(url: string, token?: string): string {
	const accessToken = token || getToken();
	if (!accessToken) return url;

	return addQueryToPath(url, { access_token: accessToken });
}
