// LIBRARIES
import { paginationOptsValidator, type PaginationOptions } from 'convex/server';
import { v } from 'convex/values';

export const DEFAULT_PAGE_SIZE = 1;

export const defaultPaginationOpts: PaginationOptions = {
	numItems: DEFAULT_PAGE_SIZE,
	cursor: null
};

/**
 * Optional 1-based page index. Convex type is float64; handlers should use {@link normalizeOneBasedPage}.
 */
export const optionalOneBasedPageArg = v.optional(v.number());

/**
 * Coerces API `page` to a safe 1-based integer (handles missing, floats, negatives).
 */
export function normalizeOneBasedPage(page: number | undefined): number {
	if (page === undefined) return 1;
	return Math.max(1, Math.floor(page));
}

/**
 * Spread into `query({ args: { ...yourArgs, ...paginatedQueryArgs } })` so every
 * paginated endpoint accepts optional `paginationOpts` with the same validation.
 */
export const paginatedQueryArgs = {
	paginationOpts: v.optional(paginationOptsValidator)
} as const;

/** Use before `.paginate(...)` when `paginationOpts` is optional in args. */
export function resolvePaginationOpts(
	opts: PaginationOptions | undefined
): PaginationOptions {
	return opts ?? defaultPaginationOpts;
}
