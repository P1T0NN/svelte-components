<script lang="ts" generics="T extends Record<string, unknown>">
	// LIBRARIES
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { toast } from 'svelte-sonner';

	// CONFIG
	import { PAGINATION_DATA } from '@/shared/config.js';

	// COMPONENTS
	import DataTableContent from './data-table-content.svelte';
	import DataTableSelectedItemsStatus from './data-table-selected-items-status.svelte';
	import { PaginatedData } from '@/shared/components/ui/paginated-data/index.js';

	// UTILS
	import { defaultRowKey } from './dataTableUtils.js';
	import { safeMutation } from '@/shared/utils/convexHelpers';
	import { translateFromBackend } from '@/shared/utils/translateFromBackend';

	// TYPES
	import type { FunctionReference } from 'convex/server';
	import type {
		ColumnDef,
		DataTableCustomCells,
		DataTableOptimizationStrategy,
		DataTableSelectionHeaderState,
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
		optimizationStrategy = PAGINATION_DATA.DEFAULT_OPTIMIZATION_STRATEGY,
		controlsPlace = 'bottom',
		selectable = false,
		selectedIds = $bindable<string[]>([]),
		deleteMutation
	}: {
		class?: string;
		caption?: string;
		query: PaginatedListQuery<T>;
		columns: ColumnDef<T>[];
		/** Stable row id; required for selection to persist across pages. */
		getRowId?: (row: T) => string;
		customCells?: DataTableCustomCells<T>;
		/** Client pagination orchestration; `unoptimized` matches current Convex list + `page` args. */
		optimizationStrategy?: DataTableOptimizationStrategy;
		/** Where the pagination controls sit relative to the table. */
		controlsPlace?: 'top' | 'bottom';
		/** Turn the leftmost checkbox column on; multi-select, persists across pages. */
		selectable?: boolean;
		/** Two-way bound set of selected row ids (`bind:selectedIds`). */
		selectedIds?: string[];
		/**
		 * Convex mutation reference for bulk delete (e.g. `api.storage.uploadedFiles.deleteUploadedFile`).
		 * When provided, the selection toolbar renders a Delete button wired to a confirmation dialog.
		 * The table calls it via `safeMutation` with `{ ids }` (cast at the boundary), toasts the
		 * standard envelope (`{ success, message }`), and clears selection on success.
		 */
		deleteMutation?: FunctionReference<'mutation'>;
	} = $props();

	const convex = useConvexClient();

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

	/** O(1) membership checks for the per-row checkbox. */
	const selectedSet = $derived(new Set(selectedIds));

	/** Stable ids for the rows currently rendered; used for the "select-all-on-page" header checkbox. */
	const currentPageIds = $derived(
		rows.map((row, index) => getRowId?.(row) ?? defaultRowKey(row, index))
	);

	const selectedOnPageCount = $derived(
		currentPageIds.reduce((n, id) => n + (selectedSet.has(id) ? 1 : 0), 0)
	);

	const headerSelectionState: DataTableSelectionHeaderState = $derived(
		currentPageIds.length === 0 || selectedOnPageCount === 0
			? 'none'
			: selectedOnPageCount === currentPageIds.length
				? 'all'
				: 'some'
	);

	function toggleRow(id: string) {
		if (selectedSet.has(id)) {
			selectedIds = selectedIds.filter((x) => x !== id);
		} else {
			selectedIds = [...selectedIds, id];
		}
	}

	function toggleAllOnPage() {
		if (currentPageIds.length === 0) return;
		
		if (headerSelectionState === 'all') {
			const pageIds = new Set(currentPageIds);
			selectedIds = selectedIds.filter((id) => !pageIds.has(id));
		} else {
			const existing = new Set(selectedIds);
			const next = selectedIds.slice();
			for (const id of currentPageIds) {
				if (!existing.has(id)) next.push(id);
			}
			selectedIds = next;
		}
	}

	let isDeleting = $state(false);

	/**
	 * Closure handed to the status toolbar so it doesn't need to know about selection state
	 * or how the mutation is invoked. Snapshots ids at click time (prevents losing targets if
	 * selection mutates mid-flight), runs the configured mutation through `safeMutation`
	 * (which already toasts typed/rate-limit errors), then toasts the success/info envelope
	 * and clears selection only when the backend confirmed success.
	 */
	async function runDelete() {
		if (!deleteMutation) return;

		const ids = selectedIds.slice();
		if (ids.length === 0) return;

		isDeleting = true;
		try {
			// Args type is generic; the concrete mutation accepts `{ ids: Id<TableName>[] }`.
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const result = await safeMutation(convex, deleteMutation, { ids } as any);
			if (!result) return; // typed error / rate limit — already toasted by safeMutation
			toast[result.success ? 'success' : 'info'](translateFromBackend(result.message));
			if (result.success) selectedIds = [];
		} finally {
			isDeleting = false;
		}
	}
</script>

<div class="flex w-full flex-col gap-4">
	{#if controlsPlace === 'top'}
		<PaginatedData
			bind:page
			{totalPages}
			isLoading={tablePending}
			queryLoading={queryLoadingForPagination}
			hasResult={listPayload !== undefined}
		/>
	{/if}

	{#if selectable && selectedIds.length > 0}
		<DataTableSelectedItemsStatus
			count={selectedIds.length}
			onClear={() => {
				selectedIds = [];
			}}
			withActionButtons={deleteMutation !== undefined}
			deleteFunction={deleteMutation ? runDelete : undefined}
			{isDeleting}
		/>
	{/if}

	<DataTableContent
		class={className}
		{caption}
		data={rows}
		{columns}
		{getRowId}
		isLoading={tablePending}
		customCells={customCells ?? {}}
		{selectable}
		{selectedSet}
		{headerSelectionState}
		onToggleRow={toggleRow}
		onToggleAllOnPage={toggleAllOnPage}
	/>

	{#if controlsPlace === 'bottom'}
		<PaginatedData
			bind:page
			{totalPages}
			isLoading={tablePending}
			queryLoading={queryLoadingForPagination}
			hasResult={listPayload !== undefined}
		/>
	{/if}
</div>
