// LIBRARIES
import * as v from 'valibot';

// CONFIG
import { PAGINATION_DATA } from '@/shared/config.js';

export const searchInputRemoteSchema = v.object({
	source: v.pipe(v.string(), v.minLength(1)),
	search: v.string(),
	maxResults: v.optional(
		v.pipe(
			v.number(),
			v.integer(),
			v.minValue(1),
			v.maxValue(PAGINATION_DATA.MAX_PAGE_SIZE)
		)
	),
	cursor: v.optional(v.nullable(v.string()))
});

export type SearchInputRemoteSchemaInput = v.InferOutput<typeof searchInputRemoteSchema>;
