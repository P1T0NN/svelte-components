// LIBRARIES
import { redirect } from '@sveltejs/kit';
import { api } from '@/convex/_generated/api';
import { createConvexHttpClient } from '@mmailaender/convex-better-auth-svelte/sveltekit';

// CONFIG
import { CATALOG_PAGE_SIZE, PLANS, ROLES, SORTABLE_COLUMNS, pickParam } from '../listsConfig.js';

// UTILS
import {
	currentCursor,
	cursorPage,
	listHref,
	readPage,
	readSort
} from '@/features/pagination/utils/listUrlState.js';

// TYPES
import type { PageServerLoad } from './$types';

/**
 * The URL is the only state: filters, page number and search cursor all come out of `url`,
 * so every view of this page is a real address a crawler can reach and a user can share.
 */
export const load: PageServerLoad = async ({ url }) => {
	const client = createConvexHttpClient();

	const search = url.searchParams.get('q')?.trim() || undefined;
	const role = pickParam(url.searchParams.get('role'), ROLES);
	const plan = pickParam(url.searchParams.get('plan'), PLANS);
	// Cursor mode carries a trail of cursors, not a page number — that trail is what makes
	// "previous" a real link instead of a dead end.
	const cursor = currentCursor(url);
	// Validated against the allow-list, so `?sort=whatever:asc` cannot reach the query.
	const sort = readSort(url, SORTABLE_COLUMNS);

	// One page = one address. `?page=1`, `?page=abc`, `?page=-2` and `?page=3.7` all describe a
	// page that already has a canonical URL, so redirect instead of serving duplicate content
	// under a second address (and instead of rendering "Page -2" to whoever typed it).
	const rawPage = url.searchParams.get('page');
	const page = readPage(url);
	if (rawPage !== null && (page === 1 || String(page) !== rawPage)) {
		redirect(308, listHref(url, { page: page === 1 ? null : page }));
	}

	// This branch MUST match `fetchTestRowsCatalog`'s `strategy` function — both read the
	// same predicate, "is there a search string?". Browse sends a page number and gets an
	// exact totalCount back; search sends a cursor and gets `null`, because a Convex search
	// index is paginate-only and cannot count.
	const catalog = await client.query(api.tables.test.testQueries.fetchTestRowsCatalog, {
		search,
		role,
		plan,
		sortDirection: sort.direction,
		...(search
			? { paginationOpts: { numItems: CATALOG_PAGE_SIZE, cursor } }
			: {
					page,
					paginationOpts: { numItems: CATALOG_PAGE_SIZE, cursor: null }
				})
	});

	// Past the end of the list. Without this, `?page=999` renders an empty table under the
	// heading "Page 999 of 12" — a plausible-looking page a crawler will happily index.
	// Temporary, not permanent: which page is last depends on how much data exists today.
	if (!search && catalog.totalCount !== null) {
		const lastPage = Math.max(1, Math.ceil(catalog.totalCount / CATALOG_PAGE_SIZE));
		if (page > lastPage) {
			redirect(302, listHref(url, { page: lastPage === 1 ? null : lastPage }));
		}
	}

	return {
		catalog,
		filters: { search, role, plan },
		sort,
		isSearch: Boolean(search),
		/** 1-based position, from the page number when browsing and the cursor trail when searching. */
		position: search ? cursorPage(url) : page
	};
};
