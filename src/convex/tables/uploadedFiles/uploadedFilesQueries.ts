// LIBRARIES
import { query } from '../../_generated/server';
import {
	normalizeOneBasedPage,
	optionalOneBasedPageArg,
	paginatedQueryArgs,
	resolvePaginationOpts
} from '../../helpers/paginationHelpers.js';

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
		const all = await ctx.db.query('uploadedFiles').order('desc').collect();

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
