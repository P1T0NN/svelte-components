// Shared by the `/lists` demos and their loaders, so markup and server code can never
// disagree about page sizes or which facet values are legal.

// CONFIG
import { UNPROTECTED_PAGE_ENDPOINTS } from '@/config/pageEndpoints';

// TYPES
import type { Doc } from '@/convex/_generated/dataModel';
import type { ColumnDef } from '@/components/ui/data-table/types.js';

export const FEED_PAGE_SIZE = 6;
export const CATALOG_PAGE_SIZE = 5;

export const ROLES = ['admin', 'editor', 'viewer'] as const;
export const PLANS = ['free', 'pro', 'enterprise'] as const;

export type Role = (typeof ROLES)[number];
export type Plan = (typeof PLANS)[number];

/**
 * URL params are attacker-controlled strings. Anything not in the allow-list becomes
 * `undefined` (= no filter) rather than being forwarded to the query, so `?role=<script>`
 * is a no-op instead of a validator error page.
 */
export function pickParam<T extends string>(
	value: string | null,
	allowed: readonly T[]
): T | undefined {
	return allowed.includes(value as T) ? (value as T) : undefined;
}

export const testRowColumns: ColumnDef<Doc<'testRows'>>[] = [
	{ id: 'name', header: 'Name', accessor: (r) => r.name },
	{ id: 'email', header: 'Email', accessor: (r) => r.email, hideBelow: 'md' },
	{ id: 'role', header: 'Role', accessor: (r) => r.role },
	{ id: 'plan', header: 'Plan', accessor: (r) => r.plan, hideBelow: 'sm' },
	{
		id: 'created',
		header: 'Created',
		accessor: (r) => new Date(r._creationTime).toLocaleDateString(),
		hideBelow: 'md',
		sortable: true
	}
];

/**
 * Columns the server can actually order by, and the allow-list `readSort` validates against.
 *
 * Only `created` is here, and that is the point: Convex appends `_creationTime` to every index,
 * so flipping its direction is servable no matter which facet index the current filters chose.
 * Sorting by `name` would need `by_name`, which cannot also bound `role`/`plan` — offering it
 * next to the facets would mean either a table scan or rows in an order the index never
 * produced. A sort you cannot index is a schema decision, not a UI toggle.
 */
export const SORTABLE_COLUMNS = ['created'] as const;

/**
 * The four demos, in the order they build on each other. Drives the tab strip in
 * `+layout.svelte` and the cards on the index page — one list, so a new demo can never be
 * added to one and forgotten in the other.
 */
export const LIST_DEMOS = [
	{
		href: `${UNPROTECTED_PAGE_ENDPOINTS.LISTS}/infinite-scroll`,
		label: 'Infinite scroll',
		title: 'Infinite scroll — client only',
		blurb:
			'A subscription opened on mount; each scroll fires a real cursor request. Nothing in the initial HTML — right behind a login, wrong for anything a crawler should see.'
	},
	{
		href: `${UNPROTECTED_PAGE_ENDPOINTS.LISTS}/infinite-scroll-ssr`,
		label: 'Infinite scroll (SSR)',
		title: 'Infinite scroll — server-rendered first page',
		blurb:
			'The same component and query, seeded with a first page the loader already fetched. Rows are in the HTML; the socket continues from the cursor.'
	},
	{
		href: `${UNPROTECTED_PAGE_ENDPOINTS.LISTS}/state-filters`,
		label: 'State filters',
		title: 'Table — filters in component state',
		blurb:
			'Filters, search and page live in `$state`. Live subscription, instant re-query, nothing in the URL — so nothing is linkable. The right trade for an internal view.'
	},
	{
		href: `${UNPROTECTED_PAGE_ENDPOINTS.LISTS}/url-filters`,
		label: 'URL filters',
		title: 'Table — filters and page in the URL',
		blurb:
			'Loader-fed, no subscription. Filters and page are query params, pagination renders real links, and the whole thing works with JavaScript disabled.'
	}
] as const;
