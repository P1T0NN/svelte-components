// LIBRARIES
import { api } from '@/convex/_generated/api';

// UTILS
import { safeCommand } from '@/shared/utils/remoteFunctionsUtils.js';
import {
	createSearchInputRemoteHandler,
	defineSearchInputRemoteSource
} from '@/shared/components/ui/search-input/createSearchInputRemote.server.js';


// SCHEMAS
import { searchInputRemoteSchema } from '@/shared/components/ui/search-input/searchInputSchemas.js';

// TYPES
import type { Doc } from '@/convex/_generated/dataModel';

type SearchTestRowsQuery = typeof api.tables.test.testQueries.searchTestRows;

export const searchInput = safeCommand(
	searchInputRemoteSchema,
	createSearchInputRemoteHandler({
		sources: {
			testRows: defineSearchInputRemoteSource<Doc<'testRows'>, SearchTestRowsQuery>({
				query: api.tables.test.testQueries.searchTestRows,
				rateLimitName: 'publicSearchInput',
				minQueryLength: 1,
				defaultMaxResults: 5,
				maxResults: 10,
				toArgs: ({ search, maxResults, cursor }, { trustedSecret }) => ({
					search,
					trustedSearchSecret: trustedSecret,
					paginationOpts: {
						cursor,
						numItems: maxResults
					}
				}),
				mapItem: (row) => ({
					id: row._id,
					title: row.name,
					description: row.message,
					category: row.role
				})
			})
		}
	})
);
