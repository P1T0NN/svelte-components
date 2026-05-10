// LIBRARIES
import { v } from 'convex/values';

// HELPERS
import { fetchOptimized } from '../../helpers/fetchOptimized.js';

const TABLE = 'testRows' as const;

/**
 * Paginated list with sortable column headers + full-text search.
 *
 * - Search box (debounced client-side) → routes through the `search_name` index.
 *   Search results are relevance-ordered; `sortDirection` is ignored on this path
 *   by Convex semantics.
 * - No search → indexed walk. Sort by Name uses `by_name`; sort by Created (or none)
 *   uses the implicit creation-time index.
 * - `auth: 'user'` + `rateLimit: 'search'` keys the rate-limit bucket per-user.
 */
export const fetchTestRows = fetchOptimized({
	table: TABLE,
	auth: 'user',
	rateLimit: 'search',
	args: {
		search: v.optional(v.string()),
		sortColumn: v.optional(v.string()),
		sortDirection: v.optional(v.union(v.literal('asc'), v.literal('desc')))
	},
	order: (args) => args.sortDirection ?? 'desc',
	// Active only when the user has typed something. Empty string → null → fetchOptimized
	// falls through to the `where` path below.
	search: (_ctx, args) =>
		args.search
			? { index: 'search_name', searchField: 'name', query: args.search }
			: null,
	// Active when not searching. Switch index based on the column the user picked.
	// Default (no sort) is creation-time, so `where` returns null and the helper walks
	// the implicit by_creation_time index.
	where: (_ctx, args) => {
		if (args.search) return null;
		if (args.sortColumn === 'name') {
			return { index: 'by_name' };
		}
		return null;
	}
});
