// LIBRARIES
import { query } from '../_generated/server';

// HELPERS
import {
	normalizeOneBasedPage,
	optionalOneBasedPageArg,
	paginatedQueryArgs,
	resolvePaginationOpts
} from '../helpers/paginationHelpers.js';
import { createDeleteMutation } from '../helpers/createDeleteMutation.js';

// AGGREGATES
import { uploadedFilesTableAggregate } from './aggregate/uploadedFilesAggregate.js';

/** Change this one line when copying this file into a new project. */
const TABLE = 'uploadedFiles' as const;

/**
 * Unoptimized list: **full table `.collect()` on every run**, then slice by `page` / `perPage`.
 * Fine for small sets; for large tables use cursor pagination + aggregates instead.
 *
 * `totalCount` is always the full table length (for UI page count).
 */
export const fetchUploadedFiles = query({
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
 * Hybrid bulk delete for `uploadedFiles`. All heavy lifting (batch cap, weighted rate limit,
 * 2-phase atomicity, storage cleanup, aggregate sync, translatable results + errors) lives
 * in {@link createDeleteMutation}.
 *
 * Authorization: owner-only. Supplying `ownerId` makes the factory skip the default
 * `adminOnly` gate — an authed owner can remove their own files; admins can't (yet) touch
 * other users' files via this endpoint. If a cross-user admin delete is ever needed, build
 * it as a separate mutation with `adminOnly: true` (never widen this one).
 */
export const deleteUploadedFile = createDeleteMutation({
	table: TABLE,
	ownerId: { field: (doc) => doc.ownerId },
	storageIds: (doc) => [doc.storageId],
	aggregate: uploadedFilesTableAggregate,
	rateLimit: { name: 'delete' }
});
