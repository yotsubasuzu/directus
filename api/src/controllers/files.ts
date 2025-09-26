import { useEnv } from '@directus/env';
import { ErrorCode, InvalidPayloadError, isDirectusError } from '@directus/errors';
import formatTitle from '@directus/format-title';
import type { BusboyFileStream } from '@directus/types';
import { toArray } from '@directus/utils';
import Busboy from 'busboy';
import bytes from 'bytes';
import type { RequestHandler } from 'express';
import express from 'express';
import Joi from 'joi';
import { minimatch } from 'minimatch';
import path from 'path';
import { respond } from '../middleware/respond.js';
import useCollection from '../middleware/use-collection.js';
import { validateBatch } from '../middleware/validate-batch.js';
import { FilesService } from '../services/files.js';
import { MetaService } from '../services/meta.js';
import type { PrimaryKey } from '../types/index.js';
import asyncHandler from '../utils/async-handler.js';
import { sanitizeQuery } from '../utils/sanitize-query.js';
import mmm from 'mmmagic';
import { PassThrough } from 'stream';

const router = express.Router();
const env = useEnv();

router.use(useCollection('directus_files'));

export const multipartHandler: RequestHandler = (req, res, next) => {
	if (req.is('multipart/form-data') === false) return next();

	let headers;

	if (req.headers['content-type']) {
		headers = req.headers;
	} else {
		headers = {
			...req.headers,
			'content-type': 'application/octet-stream',
		};
	}

	const busboy = Busboy({
		headers,
		defParamCharset: 'utf8',
		limits: {
			fileSize: env['FILES_MAX_UPLOAD_SIZE'] ? bytes(env['FILES_MAX_UPLOAD_SIZE'] as string) : undefined,
		},
	});

	const savedFiles: PrimaryKey[] = [];
	const service = new FilesService({ accountability: req.accountability, schema: req.schema });

	const existingPrimaryKey = req.params['pk'] || undefined;

	/**
	 * The order of the fields in multipart/form-data is important. We require that all fields
	 * are provided _before_ the files. This allows us to set the storage location, and create
	 * the row in directus_files async during the upload of the actual file.
	 */

	let disk: string = toArray(env['STORAGE_LOCATIONS'] as string)[0]!;
	let payload: any = {};
	let fileCount = 0;

	busboy.on('field', (fieldname, val) => {
		let fieldValue: string | null | boolean = val;

		if (typeof fieldValue === 'string' && fieldValue.trim() === 'null') fieldValue = null;
		if (typeof fieldValue === 'string' && fieldValue.trim() === 'false') fieldValue = false;
		if (typeof fieldValue === 'string' && fieldValue.trim() === 'true') fieldValue = true;

		if (fieldname === 'storage') {
			disk = val;
		}

		payload[fieldname] = fieldValue;
	});

	busboy.on('file', async (_fieldname, fileStream: BusboyFileStream, { filename }) => {
		if (!filename) {
			return busboy.emit('error', new InvalidPayloadError({ reason: `File is missing filename` }));
		}

		fileCount++;

		// Detect MIME type using mmmagic from the incoming stream
		const magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE);
		const CHUNK_LIMIT = 256 * 1024; // 256KB should be enough for detection
		const chunks: Buffer[] = [];
		let collected = 0;
		let finalized = false;

		const finalizeIfNeeded = () => {
			if (finalized) return;
			finalized = true;
			tryDone();
		};

		fileStream.on('error', () => finalizeIfNeeded());
		fileStream.on('end', () => {});
		fileStream.on('close', () => finalizeIfNeeded());

		fileStream.pause();

		const mimeType: string | undefined = await new Promise((resolve) => {
			const finishDetection = () => {
				const head = Buffer.concat(chunks, collected);

				magic.detect(head, (err: Error | null, result: string | string[]) => {
					if (err) return resolve(undefined);
					const value = Array.isArray(result) ? result[0] : result;
					const mime = (value ?? 'application/octet-stream').split(';')[0]!.trim();
					resolve(mime);
				});
			};

			const onData = (chunk: Buffer) => {
				if (collected < CHUNK_LIMIT) {
					chunks.push(chunk);
					collected += chunk.length;
				}

				if (collected >= CHUNK_LIMIT) {
					fileStream.removeListener('data', onData);
					fileStream.pause();
					finishDetection();
				}
			};

			const onEndOrClose = () => {
				fileStream.removeListener('data', onData);
				finishDetection();
			};

			fileStream.on('data', onData);
			fileStream.once('end', onEndOrClose);
			fileStream.once('close', onEndOrClose);
			fileStream.resume();
		});

		if (!mimeType) {
			busboy.emit('error', new InvalidPayloadError({ reason: `Unable to detect file type` }));
			return;
		}

		const allowedPatterns = toArray(env['FILES_MIME_TYPE_ALLOW_LIST'] as string | string[]);
		const mimeTypeAllowed = allowedPatterns.some((pattern) => minimatch(mimeType, pattern));

		if (mimeTypeAllowed === false) {
			busboy.emit('error', new InvalidPayloadError({ reason: `File is of invalid content type` }));
			return;
		}

		if (!existingPrimaryKey) {
			if (!payload.title) {
				payload.title = formatTitle(path.parse(filename).name);
			}
		}

		payload.filename_download = filename;

		const payloadWithRequiredFields = {
			...payload,
			type: mimeType,
			storage: payload.storage || disk,
		};

		const passthrough = new PassThrough();

		if (chunks.length) {
			passthrough.write(Buffer.concat(chunks, collected));
		}

		fileStream.pipe(passthrough);

		// Clear the payload for the next to-be-uploaded file
		payload = {};

		try {
			const primaryKey = await service.uploadOne(passthrough as unknown as BusboyFileStream, payloadWithRequiredFields, existingPrimaryKey);
			savedFiles.push(primaryKey);
			tryDone();
		} catch (error: any) {
			busboy.emit('error', error);
		}

		return undefined;
	});

	busboy.on('error', (error: Error) => {
		next(error);
	});

	busboy.on('close', () => {
		tryDone();
	});

	req.pipe(busboy);

	function tryDone() {
		if (savedFiles.length === fileCount) {
			if (fileCount === 0) {
				return next(new InvalidPayloadError({ reason: `No files were included in the body` }));
			}

			res.locals['savedFiles'] = savedFiles;
			return next();
		}
	}
};

router.post(
	'/',
	asyncHandler(multipartHandler),
	asyncHandler(async (req, res, next) => {
		const service = new FilesService({
			accountability: req.accountability,
			schema: req.schema,
		});

		let keys: PrimaryKey | PrimaryKey[] = [];

		if (req.is('multipart/form-data')) {
			keys = res.locals['savedFiles'];
		} else {
			keys = await service.createOne(req.body);
		}

		try {
			if (Array.isArray(keys) && keys.length > 1) {
				const records = await service.readMany(keys, req.sanitizedQuery);

				res.locals['payload'] = {
					data: records,
				};
			} else {
				const key = Array.isArray(keys) ? keys[0]! : keys;
				const record = await service.readOne(key, req.sanitizedQuery);

				res.locals['payload'] = {
					data: record,
				};
			}
		} catch (error: any) {
			if (isDirectusError(error, ErrorCode.Forbidden)) {
				return next();
			}

			throw error;
		}

		return next();
	}),
	respond,
);

const importSchema = Joi.object({
	url: Joi.string().required(),
	data: Joi.object(),
});

router.post(
	'/import',
	asyncHandler(async (req, res, next) => {
		const { error } = importSchema.validate(req.body);

		if (error) {
			throw new InvalidPayloadError({ reason: error.message });
		}

		const service = new FilesService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const primaryKey = await service.importOne(req.body.url, req.body.data);

		try {
			const record = await service.readOne(primaryKey, req.sanitizedQuery);
			res.locals['payload'] = { data: record || null };
		} catch (error: any) {
			if (isDirectusError(error, ErrorCode.Forbidden)) {
				return next();
			}

			throw error;
		}

		return next();
	}),
	respond,
);

const readHandler = asyncHandler(async (req, res, next) => {
	const service = new FilesService({
		accountability: req.accountability,
		schema: req.schema,
	});

	const metaService = new MetaService({
		accountability: req.accountability,
		schema: req.schema,
	});

	let result;

	if (req.singleton) {
		result = await service.readSingleton(req.sanitizedQuery);
	} else if (req.body.keys) {
		result = await service.readMany(req.body.keys, req.sanitizedQuery);
	} else {
		result = await service.readByQuery(req.sanitizedQuery);
	}

	const meta = await metaService.getMetaForQuery('directus_files', req.sanitizedQuery);

	res.locals['payload'] = { data: result, meta };
	return next();
});

router.get('/', validateBatch('read'), readHandler, respond);
router.search('/', validateBatch('read'), readHandler, respond);

router.get(
	'/:pk',
	asyncHandler(async (req, res, next) => {
		const service = new FilesService({
			accountability: req.accountability,
			schema: req.schema,
		});

		const record = await service.readOne(req.params['pk']!, req.sanitizedQuery);
		res.locals['payload'] = { data: record || null };
		return next();
	}),
	respond,
);

router.patch(
	'/',
	validateBatch('update'),
	asyncHandler(async (req, res, next) => {
		const service = new FilesService({
			accountability: req.accountability,
			schema: req.schema,
		});

		let keys: PrimaryKey[] = [];

		if (Array.isArray(req.body)) {
			keys = await service.updateBatch(req.body);
		} else if (req.body.keys) {
			keys = await service.updateMany(req.body.keys, req.body.data);
		} else {
			const sanitizedQuery = sanitizeQuery(req.body.query, req.accountability);
			keys = await service.updateByQuery(sanitizedQuery, req.body.data);
		}

		try {
			const result = await service.readMany(keys, req.sanitizedQuery);
			res.locals['payload'] = { data: result || null };
		} catch (error: any) {
			if (isDirectusError(error, ErrorCode.Forbidden)) {
				return next();
			}

			throw error;
		}

		return next();
	}),
	respond,
);

router.patch(
	'/:pk',
	asyncHandler(multipartHandler),
	asyncHandler(async (req, res, next) => {
		const service = new FilesService({
			accountability: req.accountability,
			schema: req.schema,
		});

		await service.updateOne(req.params['pk']!, req.body);

		try {
			const record = await service.readOne(req.params['pk']!, req.sanitizedQuery);
			res.locals['payload'] = { data: record || null };
		} catch (error: any) {
			if (isDirectusError(error, ErrorCode.Forbidden)) {
				return next();
			}

			throw error;
		}

		return next();
	}),
	respond,
);

router.delete(
	'/',
	validateBatch('delete'),
	asyncHandler(async (req, _res, next) => {
		const service = new FilesService({
			accountability: req.accountability,
			schema: req.schema,
		});

		if (Array.isArray(req.body)) {
			await service.deleteMany(req.body);
		} else if (req.body.keys) {
			await service.deleteMany(req.body.keys);
		} else {
			const sanitizedQuery = sanitizeQuery(req.body.query, req.accountability);
			await service.deleteByQuery(sanitizedQuery);
		}

		return next();
	}),
	respond,
);

router.delete(
	'/:pk',
	asyncHandler(async (req, _res, next) => {
		const service = new FilesService({
			accountability: req.accountability,
			schema: req.schema,
		});

		await service.deleteOne(req.params['pk']!);

		return next();
	}),
	respond,
);

export default router;
