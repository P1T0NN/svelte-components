// LIBRARIES
import { api } from '@/convex/_generated/api';
import { createConvexHttpClient } from '@mmailaender/convex-better-auth-svelte/sveltekit';

// CONFIG
import { FEED_PAGE_SIZE } from '../listsConfig.js';

// TYPES
import type { PageServerLoad } from './$types';

/**
 * Fetches page one over HTTP so the rows are in the initial HTML. The client subscription
 * takes over from `continueCursor` after hydration — no empty shell, no fetch-after-hydrate
 * flash, and a crawler sees content.
 */
export const load: PageServerLoad = async () => {
	const client = createConvexHttpClient();

	return {
		feed: await client.query(api.tables.test.testQueries.fetchTestRowsLive, {
			paginationOpts: { numItems: FEED_PAGE_SIZE, cursor: null }
		})
	};
};
