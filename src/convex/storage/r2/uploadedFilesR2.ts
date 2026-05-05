// LIBRARIES
import { query } from '../../_generated/server';

// HELPERS
import {
	normalizeOneBasedPage,
	optionalOneBasedPageArg,
	paginatedQueryArgs,
	resolvePaginationOpts
} from '../../helpers/paginationHelpers.js';
import { createDeleteMutation } from '../../helpers/createDeleteMutation.js';

// AGGREGATES
import { uploadedFilesR2TableAggregate } from './aggregate/uploadedFilesR2Aggregate.js';

// R2
import { r2 } from './r2.js';

/** Change this one line when copying this file into a new project. */
const TABLE = 'uploadedFilesR2' as const;

/**
 * Mirror of `fetchUploadedFiles` for the R2-backed table. Same unoptimized
 * full-collect-then-slice — fine for small sets, swap to cursor + aggregate for big tables.
 */
export const fetchUploadedFilesR2 = query({
	args: {
		...paginatedQueryArgs,
		page: optionalOneBasedPageArg
	},
	handler: async (ctx, args) => {
		const perPage = resolvePaginationOpts(args.paginationOpts).numItems;

		const page1Based = normalizeOneBasedPage(args.page);
		const all = await ctx.db.query(TABLE).order('desc').collect();

		const totalCount = all.length;
		const start = Math.max(0, (page1Based - 1) * perPage);
		const page = all.slice(start, start + perPage);
		const isDone = start + page.length >= totalCount;

		return {
			page,
			isDone,
			continueCursor: '',
			totalCount
		};
	}
});

/**
 * Owner-only bulk delete for `uploadedFilesR2`. Same factory as the Convex-storage path,
 * but the blob backend is R2 — passed through `externalStorageDelete` instead of `storageIds`.
 */
export const deleteUploadedFileR2 = createDeleteMutation({
	table: TABLE,
	ownerId: { field: (doc) => doc.ownerId },
	externalStorageDelete: async (ctx, docs) => {
		const keys = [...new Set(docs.map((d) => d.key))];
		await Promise.all(keys.map((k) => r2.deleteObject(ctx, k)));
	},
	aggregate: uploadedFilesR2TableAggregate,
	rateLimit: { name: 'delete' }
});
