// LIBRARIES
import { v } from 'convex/values';

// HELPERS
import { createSearchQuery, fetchOptimized } from '../../helpers/fetchOptimized/index.js';

const TABLE = 'testRows' as const;

/**
 * Paginated list with sortable column headers + full-text search.
 *
 * - Search box (debounced client-side) → routes through the `search_name` index.
 *   Search results are relevance-ordered; `sortDirection` is ignored on this path
 *   by Convex semantics.
 * - No search → indexed walk. Sort by Name uses `by_name`; sort by Created (or none)
 *   uses the implicit creation-time index.
 * - `auth: 'user'` + function name keys the rate-limit bucket per-user.
 */
export const fetchTestRows = fetchOptimized('fetchTestRows', {
	table: TABLE,
	auth: 'user',
	args: {
		search: v.optional(v.string()),
		sortColumn: v.optional(v.string()),
		sortDirection: v.optional(v.union(v.literal('asc'), v.literal('desc')))
	},
	order: (args) => args.sortDirection ?? 'desc',
	// Active only when the user has typed something. Empty string → null → fetchOptimized
	// falls through to the `where` path below.
	search: (_ctx, args) =>
		args.search ? { index: 'search_name', searchField: 'name', query: args.search } : null,
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

/**
 * Union-mode example: one list assembled from two index ranges on the same table —
 * "rows whose role is admin OR whose plan is enterprise". This is the shape to reach for
 * when rows are visible through multiple access paths (own entity A OR entity B) and no
 * single denormalized key covers the set: one spec per path, merged server-side into a
 * single cursor. Rows matching both specs appear once (first spec wins). Cursor mode
 * stays O(perPage · specs) no matter how large the table grows.
 */
export const fetchTestRowsUnion = fetchOptimized({
	table: TABLE,
	auth: 'user',
	union: () => ({
		specs: [
			{ index: 'by_role', eq: { role: 'admin' as const } },
			{ index: 'by_plan', eq: { plan: 'enterprise' as const } }
		]
	})
});

/**
 * Resolve-mode example (offset flavor): a fully custom data source the factory still
 * paginates. Rows sorted by message length — something no index can express. The factory
 * keeps owning auth, validators, slicing, `totalCount`, `isDone` and the payload shape,
 * so the accounting can't drift however the data changes; `rowValidator` additionally
 * makes Convex prove at runtime that exactly this row shape reaches the client.
 */
export const fetchTestRowsByMessageLength = fetchOptimized({
	table: TABLE,
	auth: 'user',
	strategy: 'offset',
	rowValidator: v.object({
		_id: v.id(TABLE),
		_creationTime: v.number(),
		name: v.string(),
		email: v.string(),
		role: v.union(v.literal('admin'), v.literal('editor'), v.literal('viewer')),
		plan: v.union(v.literal('free'), v.literal('pro'), v.literal('enterprise')),
		source: v.optional(
			v.union(v.literal('organic'), v.literal('referral'), v.literal('paid'), v.literal('support'))
		),
		message: v.string(),
		acceptsTerms: v.boolean()
	}),
	resolve: async (ctx) => {
		// Bounded: testRows is a small demo table — the only situation offset+collect is OK.
		const all = await ctx.db.query(TABLE).collect();
		return all.sort((a, b) => b.message.length - a.message.length);
	}
});

/**
 * Public dropdown search endpoint. The Convex query itself stays read-only and public;
 * SvelteKit's `searchInput` remote command charges an auth-aware bucket before calling
 * this query (verified user id when signed in, IP otherwise).
 */
export const searchTestRows = createSearchQuery({
	table: TABLE,
	auth: 'public',
	trustedSecretEnvName: 'SEARCH_INPUT_RATE_LIMIT_SECRET',
	args: {
		search: v.string()
	},
	minQueryLength: 1,
	defaultNumItems: 5,
	maxNumItems: 10,
	search: (_ctx, args) => ({
		index: 'search_name',
		searchField: 'name',
		query: args.search
	})
});
