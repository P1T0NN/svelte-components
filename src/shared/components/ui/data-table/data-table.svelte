<script lang="ts" generics="T extends Record<string, unknown>">
	// LIBRARIES
	import { useQuery } from 'convex-svelte';

	// CONFIG
	import { PAGINATION_DATA } from '@/shared/config.js';

	// COMPONENTS
	import DataTableContent from './data-table-content.svelte';
	import { PaginatedData } from '@/shared/components/ui/paginated-data/index.js';

	// TYPES
	import type {
		ColumnDef,
		DataTableCustomCells,
		DataTableOptimizationStrategy,
		PaginatedListPayload,
		PaginatedListQuery
	} from './types.js';

	let {
		class: className,
		caption = '',
		query,
		columns,
		getRowId,
		customCells,
		optimizationStrategy = PAGINATION_DATA.DEFAULT_OPTIMIZATION_STRATEGY
	}: {
		class?: string;
		caption?: string;
		query: PaginatedListQuery<T>;
		columns: ColumnDef<T>[];
		getRowId?: (row: T) => string;
		customCells?: DataTableCustomCells<T>;
		/** Client pagination orchestration; `unoptimized` matches current Convex list + `page` args. */
		optimizationStrategy?: DataTableOptimizationStrategy;
	} = $props();

	/** Matches server `resolvePaginationOpts(undefined).numItems` — not sent on the wire. */
	const pageSize = PAGINATION_DATA.DEFAULT_PAGE_SIZE;

	/** Top-level state so `bind:page` from `PaginatedData` updates reliably (no nested `$state` field binding quirks). */
	let page = $state(1);

	/**
	 * Read `page` inside this closure so convex-svelte's `$effect` tracks it.
	 * Query ref is fixed for this table instance; only `page` / args change.
	 */
	// svelte-ignore state_referenced_locally
	const listQuery = useQuery(
		query,
		() => {
			switch (optimizationStrategy) {
				case 'unoptimized':
					return {
						page
					};
				default: {
					const _never: never = optimizationStrategy;
					return _never;
				}
			}
		},
		/** Avoid empty/skeleton flash while `page` args change — keep prior rows until the new page arrives. */
		{ keepPreviousData: true }
	);

	const listPayload = $derived(listQuery.data as PaginatedListPayload<T> | undefined);

	const rows = $derived((listPayload?.page ?? []) as T[]);

	/**
	 * While args change, live `totalCount` can be missing; keep last known so `totalPages` / clamp stay stable.
	 */
	let lastTotalCount = $state(0);
	$effect(() => {
		const n = listPayload?.totalCount;
		if (n !== undefined && n !== lastTotalCount) lastTotalCount = n;
	});

	const totalPages = $derived(Math.max(1, Math.ceil(lastTotalCount / pageSize)));

	$effect(() => {
		if (listPayload === undefined) return;
		const max = totalPages;
		const cur = page;
		if (cur > max) page = max;
	});

	/** Skeleton / ellipsis when the current subscription has not returned data yet. */
	const tablePending = $derived(listPayload === undefined && listQuery.error === undefined);

	const queryLoadingForPagination = $derived(listQuery.isLoading && listPayload === undefined);
</script>

<div class="flex w-full flex-col gap-4">
	<DataTableContent
		class={className}
		{caption}
		data={rows}
		{columns}
		{getRowId}
		isLoading={tablePending}
		customCells={customCells ?? {}}
	/>

	<PaginatedData
		bind:page
		{totalPages}
		isLoading={tablePending}
		queryLoading={queryLoadingForPagination}
		hasResult={listPayload !== undefined}
	/>
</div>
