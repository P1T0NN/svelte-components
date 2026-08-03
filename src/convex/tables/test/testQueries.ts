// LIBRARIES
import { v } from 'convex/values';

// HELPERS
import { createSearchQuery, fetchOptimized } from '../../pagination/fetchOptimized/index.js';
import { aggregateTestRowsByCreation } from '../../aggregates.js';

// TYPES
import type {
	FetchOptimizedSearch,
	FetchOptimizedWhere
} from '../../pagination/fetchOptimized/index.js';

const TABLE = 'testRows' as const;

// ─── Shared catalog access logic ─────────────────────────────────────────────
// Two endpoints below need the *same* index-selection rules (the live cursor list and the
// URL-driven catalog). Sharing them as functions with an explicit return type keeps the
// index names checked against the schema — `FetchOptimizedWhere<'testRows'>` is a union of
// this table's real index names, so a typo is a compile error. Hoisting the whole options
// object into a `const` and spreading it instead would erase the factory's generics and
// silently widen `index` to `string`, which is the one check most worth keeping.

const ROLE = v.union(v.literal('admin'), v.literal('editor'), v.literal('viewer'));
const PLAN = v.union(v.literal('free'), v.literal('pro'), v.literal('enterprise'));
const SORT_DIRECTION = v.union(v.literal('asc'), v.literal('desc'));

type CatalogArgs = {
	search?: string;
	role?: 'admin' | 'editor' | 'viewer';
	plan?: 'free' | 'pro' | 'enterprise';
	sortDirection?: 'asc' | 'desc';
};

/** Non-empty search → full-text, narrowed by whichever facets are active. */
function catalogSearch(args: CatalogArgs): FetchOptimizedSearch<typeof TABLE> | null {
	if (!args.search) return null;
	return {
		index: 'search_name',
		searchField: 'name',
		query: args.search,
		// `role` / `plan` are declared `filterFields` of the search index, so these narrow
		// inside the index rather than after it.
		eq: { ...(args.role && { role: args.role }), ...(args.plan && { plan: args.plan }) }
	};
}

/**
 * No search → pick the index that covers every active facet. Every branch bounds the read
 * by all of the filters, so no filter is ever left to be applied in memory.
 */
function catalogWhere(args: CatalogArgs): FetchOptimizedWhere<typeof TABLE> | null {
	if (args.search) return null;
	if (args.role && args.plan) {
		return { index: 'by_role_plan', eq: { role: args.role, plan: args.plan } };
	}
	if (args.role) return { index: 'by_role_plan', eq: { role: args.role } };
	if (args.plan) return { index: 'by_plan', eq: { plan: args.plan } };
	// Unfiltered: walks `by_creation_time`. Fine here — `testRows` is a bounded demo table.
	return null;
}

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
 * **Cursor-only** catalog list — the shape every live surface wants.
 *
 * Serves both demos on `/lists` that need an unbounded-safe, always-cursor read: the two
 * infinite-scroll feeds (`usePaginatedQuery` accumulates pages) and the state-filtered
 * `ConvexDataTable`. Cursor is the only strategy here on purpose: infinite scroll has no
 * page numbers to offer and a live subscription should never pay O(rows) per invalidation.
 *
 * Public + unmetered because `testRows` is a bounded demo table. A real public list should
 * be fronted by a server route that rate-limits by IP — see `search.remote.ts`.
 */
export const fetchTestRowsLive = fetchOptimized({
	table: TABLE,
	auth: 'public',
	args: {
		search: v.optional(v.string()),
		role: v.optional(ROLE),
		plan: v.optional(PLAN),
		sortDirection: v.optional(SORT_DIRECTION)
	},
	order: (args) => args.sortDirection ?? 'desc',
	search: (_ctx, args) => catalogSearch(args),
	where: (_ctx, args) => catalogWhere(args)
});

/**
 * **Browse-with-page-numbers OR search** — one query, two pagination modes.
 *
 * `strategy` is resolved per request, which is what lets a single endpoint back a public
 * catalog that is both crawlable by `?page=N` and searchable:
 *
 * - no `search` → `'offset'`: exact `totalCount`, real page numbers, `?page=3` is an address.
 * - `search` set → `'cursor'`: Convex search indexes are paginate-only, so there is no total
 *   and no page number to link. The surface absorbs that (see `/lists`) — it is a platform
 *   constraint, not something the factory can paper over.
 *
 * The caller must branch the same way, because it decides whether to send `page` or a
 * `cursor`. Both sides here read the same predicate: "is there a search string?"
 *
 * The unfiltered browse — the surface that grows without bound and would otherwise lose
 * its page numbers at the scan cap — is served by `aggregate` mode instead: exact
 * `totalCount` and O(log n) jumps to any page at any table size, kept in sync by the
 * write-path triggers (see `convex/aggregates.ts`). Faceted requests use the capped scan
 * (filtered sets are small here); a facet that outgrows the cap gets its own namespaced
 * aggregate.
 */
export const fetchTestRowsCatalog = fetchOptimized({
	table: TABLE,
	auth: 'public',
	args: {
		search: v.optional(v.string()),
		role: v.optional(ROLE),
		plan: v.optional(PLAN),
		sortDirection: v.optional(SORT_DIRECTION)
	},
	strategy: (args) => (args.search ? 'cursor' : 'offset'),
	// Every index Convex builds ends in `_creationTime`, so flipping the direction is servable
	// under any of the facet branches above. Ignored on the search path — search indexes are
	// relevance-ordered by definition.
	order: (args) => args.sortDirection ?? 'desc',
	search: (_ctx, args) => catalogSearch(args),
	// Unfiltered browse only — the aggregate's sortKey (_creationTime) is this surface's
	// sort order, and it carries no facet namespaces.
	aggregate: (_ctx, args) =>
		args.search || args.role || args.plan ? null : { aggregate: aggregateTestRowsByCreation },
	where: (_ctx, args) => catalogWhere(args)
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
