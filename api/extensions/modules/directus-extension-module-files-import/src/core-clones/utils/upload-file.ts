import { useApi } from '@directus/extensions-sdk';
import emitter, { Events } from '../events';
// import { i18n } from '@/lang';
import { notify } from './notify';
import type { AxiosProgressEvent } from 'axios';
import { unexpectedError } from './unexpected-error';

export async function uploadFile(
	file: File,
	options?: {
		onProgressChange?: (percentage: number) => void;
		notifications?: boolean;
		preset?: Record<string, any>;
		fileId?: string;
	},
): Promise<any> {
	const progressHandler = options?.onProgressChange || (() => undefined);
	const formData = new FormData();
	const api = useApi();

	if (options?.preset) {
		for (const [key, value] of Object.entries(options.preset)) {
			formData.append(key, value);
		}
	}

	formData.append('file', file);

	try {
		let response = null;

		if (options?.fileId) {
			response = await api.patch(`/files/${options.fileId}`, formData, {
				onUploadProgress,
			});
		} else {
			response = await api.post(`/files`, formData, {
				onUploadProgress,
			});
		}

		if (options?.notifications) {
			notify({
				title: 'Item Created',
			});
		}

		emitter.emit(Events.upload);

		return response.data.data;
	} catch (error) {
		unexpectedError(error);
	}

	function onUploadProgress(progressEvent: AxiosProgressEvent) {
		const percentCompleted = Math.floor((progressEvent.loaded * 100) / progressEvent.total!);
		progressHandler(percentCompleted);
	}
}
