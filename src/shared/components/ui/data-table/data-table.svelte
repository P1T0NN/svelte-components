<script lang="ts" generics="T extends Record<string, unknown>">
	// LIBRARIES
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { toast } from 'svelte-sonner';
	import { m } from '@/shared/lib/paraglide/messages';

	// CONFIG
	import { PAGINATION_DATA } from '@/shared/config.js';

	// COMPONENTS
	import DataTableContent from './data-table-content.svelte';
	import DataTableSelectedItemsStatus from './data-table-selected-items-status.svelte';
	import { PaginatedData } from '@/shared/components/ui/paginated-data/index.js';
	import { Input } from '@/shared/components/ui/input/index.js';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '@/shared/components/ui/select/index.js';
	import SearchIcon from '@lucide/svelte/icons/search';
	import ArrowUpDownIcon from '@lucide/svelte/icons/arrow-up-down';

	// UTILS
	import { defaultRowKey } from './dataTableUtils.js';
	import { safeMutation } from '@/shared/utils/convexHelpers';
	import { translateFromBackend } from '@/shared/utils/translateFromBackend';

	// TYPES
	import type { Snippet } from 'svelte';
	import type { FunctionReference } from 'convex/server';
	import type {
		ColumnDef,
		DataTableCustomCells,
		DataTableOptimizationStrategy,
		DataTableSelectionHeaderState,
		DataTableSortDirection,
		PaginatedListPayload,
		PaginatedListQuery
	} from './types.js';

	let {
		class: className,
		caption = '',
		query,
		queryArgs,
		columns,
		getRowId,
		customCells,
		optimizationStrategy = PAGINATION_DATA.DEFAULT_OPTIMIZATION_STRATEGY,
		pageSize = PAGINATION_DATA.DEFAULT_PAGE_SIZE,
		controlsPlace = 'bottom',
		selectable = false,
		selectedIds = $bindable<string[]>([]),
		deleteMutation,
		sortColumn = $bindable<string | undefined>(undefined),
		sortDirection = $bindable<DataTableSortDirection | undefined>(undefined),
		searchable = false,
		search = $bindable<string>(''),
		searchPlaceholder,
		searchArgName = 'search',
		searchDebounceMs = 300,
		filters
	}: {
		class?: string;
		caption?: string;
		query: PaginatedListQuery<T>;
		/**
		 * Extra args forwarded to the query alongside `paginationOpts` / `page` (e.g. filter
		 * fields used by a `fetchOptimized` `where` builder). Whenever the *value* of
		 * `queryArgs` changes (compared by JSON identity) the cursor stack resets to page 1 —
		 * cursors are tied to a specific access spec, so a new spec must start fresh.
		 */
		queryArgs?: Record<string, unknown>;
		columns: ColumnDef<T>[];
		/** Stable row id; required for selection to persist across pages. */
		getRowId?: (row: T) => string;
		customCells?: DataTableCustomCells<T>;
		/** Server access strategy; mirrors `fetchOptimized`. See `DataTableOptimizationStrategy`. */
		optimizationStrategy?: DataTableOptimizationStrategy;
		/**
		 * Rows per page. Sent to the server via `paginationOpts.numItems` in both strategies,
		 * and used to derive `totalPages` in offset mode. Defaults to
		 * `PAGINATION_DATA.DEFAULT_PAGE_SIZE`.
		 */
		pageSize?: number;
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
		/**
		 * Active sort column id (matches `ColumnDef.id`). Bindable. `undefined` = no sort,
		 * server falls back to its default order. Set when the user clicks a `sortable: true`
		 * header; sent to the server as `sortColumn` inside `queryArgs`.
		 */
		sortColumn?: string | undefined;
		/** Active sort direction. Bindable. Cycle is `desc → asc → off` per click on the same header. */
		sortDirection?: DataTableSortDirection | undefined;
		/** Render a debounced search input above the table. Off by default to keep the layout untouched. */
		searchable?: boolean;
		/** Bindable, debounced search value. Reads what the server actually receives — not the in-flight draft. */
		search?: string;
		/** Placeholder for the search input. Falls back to a localized "Search…" string. */
		searchPlaceholder?: string;
		/**
		 * Arg name under which the debounced search value is forwarded inside `queryArgs`.
		 * Defaults to `'search'`. Match this to the validator name your `fetchOptimized` /
		 * other paginated query expects (e.g. `'q'`, `'search'`).
		 */
		searchArgName?: string;
		/** Debounce window for the search input. Defaults to 300 ms. */
		searchDebounceMs?: number;
		/**
		 * Toolbar slot for arbitrary filter controls. Rendered next to the search input on the
		 * same row (wraps on narrow screens). The table is deliberately agnostic about what
		 * lives here — callers own filter state and forward values via {@link queryArgs}, which
		 * already drives cursor reset on change.
		 */
		filters?: Snippet;
	} = $props();

	const convex = useConvexClient();

	/** Top-level state so `bind:page` from `PaginatedData` updates reliably (no nested `$state` field binding quirks). */
	let page = $state(1);

	/**
	 * Cursor stack (cursor mode only). `cursorByPage[i]` is the opaque cursor needed to fetch
	 * page `i+1`; `null` means "first page". We learn cursor `i+1` only after fetching page `i`
	 * (it comes back as `payload.continueCursor`), so users can only walk pages they've reached
	 * — random jumps don't exist in cursor mode by construction.
	 */
	let cursorByPage = $state<Array<string | null>>([null]);

	/**
	 * Search input draft — what's currently typed. Debounced into `search` after
	 * `searchDebounceMs` so each keystroke doesn't re-fire the query. The bound `search`
	 * value is the post-debounce, server-effective string.
	 */
	let searchDraft = $state(search);
	$effect(() => {
		if (!searchable) return;
		const next = searchDraft;
		const id = setTimeout(() => {
			search = next;
		}, searchDebounceMs);
		return () => clearTimeout(id);
	});

	/**
	 * The args actually sent to the server. Merges the caller's `queryArgs` with the table's
	 * own state (sort + debounced search). Only non-empty search is forwarded so an unused
	 * input doesn't leak an empty string into the dev's `where` builder.
	 */
	const mergedQueryArgs = $derived.by<Record<string, unknown>>(() => {
		const base: Record<string, unknown> = { ...(queryArgs ?? {}) };
		if (sortColumn && sortDirection) {
			base.sortColumn = sortColumn;
			base.sortDirection = sortDirection;
		}
		if (searchable && search) {
			base[searchArgName] = search;
		}
		return base;
	});

	/**
	 * Stable JSON identity for `mergedQueryArgs`. We compare by content, not reference, so
	 * spread literals (`{...filters}`) every render don't spuriously reset. Cheap —
	 * args by convention are small flat records.
	 */
	const queryArgsKey = $derived(JSON.stringify(mergedQueryArgs));

	$effect(() => {
		// Reset the cursor stack on (a) query reference change (different table) or
		// (b) effective args change (different access spec → existing cursors are meaningless).
		void query;
		void queryArgsKey;
		cursorByPage = [null];
		page = 1;
	});

	/**
	 * Click handler for sortable headers. Cycle: not-active → desc → asc → off.
	 * Off means "no sort args sent" — server falls back to its default order.
	 */
	function onHeaderSort(columnId: string) {
		if (sortColumn !== columnId) {
			sortColumn = columnId;
			sortDirection = 'desc';
			return;
		}
		if (sortDirection === 'desc') {
			sortDirection = 'asc';
			return;
		}
		sortColumn = undefined;
		sortDirection = undefined;
	}

	/**
	 * Whether the search path is currently active server-side. While searching, Convex
	 * returns relevance-ordered rows and any `sortDirection` is ignored — so we suppress
	 * sort affordances (desktop chevrons + mobile sort dropdown) to avoid lying about
	 * the visible order.
	 */
	const isSearching = $derived(searchable && search.length > 0);

	/** Columns the user can sort by — drives both the desktop chevron button and the mobile dropdown. */
	const sortableColumns = $derived(columns.filter((c) => c.sortable));

	/**
	 * Encoded `<columnId>:<direction>` value for the mobile Select. Round-trips both fields
	 * through one binding so the Select stays a single control. Empty string = "Default".
	 */
	const mobileSortValue = $derived(
		sortColumn && sortDirection ? `${sortColumn}:${sortDirection}` : ''
	);

	function onMobileSortChange(next: string) {
		if (!next) {
			sortColumn = undefined;
			sortDirection = undefined;
			return;
		}
		const [col, dir] = next.split(':');
		if (!col || (dir !== 'asc' && dir !== 'desc')) return;
		sortColumn = col;
		sortDirection = dir;
	}

	/** Active column header for the trigger label, e.g. "Sort: Name ↓". */
	const activeSortLabel = $derived.by(() => {
		if (!sortColumn || !sortDirection) return null;
		const col = sortableColumns.find((c) => c.id === sortColumn);
		if (!col) return null;
		return { header: col.header, direction: sortDirection };
	});

	/**
	 * Read `page` inside this closure so convex-svelte's `$effect` tracks it.
	 * Query ref is fixed for this table instance; only `page` / args change.
	 */
	// svelte-ignore state_referenced_locally
	const listQuery = useQuery(
		query,
		() => {
			const extra = mergedQueryArgs;
			switch (optimizationStrategy) {
				case 'cursor': {
					const cursor = cursorByPage[page - 1] ?? null;
					return {
						...extra,
						paginationOpts: { numItems: pageSize, cursor }
					};
				}
				case 'offset':
					return {
						...extra,
						page,
						paginationOpts: { numItems: pageSize, cursor: null }
					};
				default: {
					const _never: never = optimizationStrategy;
					return _never;
				}
			}
		},
		/** Avoid empty/skeleton flash while args change — keep prior rows until the new page arrives. */
		{ keepPreviousData: true }
	);

	const listPayload = $derived(listQuery.data as PaginatedListPayload<T> | undefined);

	const rows = $derived((listPayload?.page ?? []) as T[]);

	/**
	 * Offset mode: keep last-known `totalCount` so `totalPages` / clamp stay stable while args
	 * change (live `totalCount` briefly goes `undefined` between subscriptions).
	 */
	let lastTotalCount = $state(0);
	$effect(() => {
		if (optimizationStrategy !== 'offset') return;
		const n = listPayload?.totalCount;
		if (typeof n === 'number' && n !== lastTotalCount) lastTotalCount = n;
	});

	/** Offset mode only — undefined in cursor mode signals `PaginatedData` to drop "of N". */
	const totalPages = $derived(
		optimizationStrategy === 'offset'
			? Math.max(1, Math.ceil(lastTotalCount / pageSize))
			: undefined
	);

	/**
	 * Cursor mode: as soon as a page returns its `continueCursor`, record it as the cursor for
	 * `page + 1` so a "next" click has somewhere to go. Idempotent — re-recording the same
	 * cursor for the same slot is a no-op.
	 */
	$effect(() => {
		if (optimizationStrategy !== 'cursor' || !listPayload) return;
		if (listPayload.isDone) return;
		const next = listPayload.continueCursor;
		if (cursorByPage[page] !== next) {
			const copy = cursorByPage.slice();
			copy[page] = next;
			cursorByPage = copy;
		}
	});

	/** Cursor mode: `!isDone` on the current payload is the sole gate for the next button. */
	const canGoNextCursor = $derived(
		optimizationStrategy === 'cursor' && !!listPayload && !listPayload.isDone
	);

	$effect(() => {
		if (optimizationStrategy !== 'offset' || listPayload === undefined) return;
		const max = totalPages ?? 1;
		if (page > max) page = max;
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
	{#if searchable || sortableColumns.length > 0 || filters}
		<div class="flex flex-col gap-2 md:flex-row md:items-center">
			{#if searchable}
				<div class="relative w-full md:max-w-sm">
					<SearchIcon class="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
					<Input
						type="search"
						bind:value={searchDraft}
						placeholder={searchPlaceholder ?? m['DataTable.searchPlaceholder']()}
						aria-label={searchPlaceholder ?? m['DataTable.searchPlaceholder']()}
						class="pl-9"
					/>
				</div>
			{/if}

			{#if filters}
				<div class="flex flex-wrap items-center gap-2">
					{@render filters()}
				</div>
			{/if}

			<!--
				Mobile sort selector — parity with the desktop clickable headers, since the
				mobile card layout has no header row to click. Hidden on `md+` (desktop uses
				the column-header chevron buttons in `data-table-content.svelte`). Disabled
				while searching for the same reason as the chevrons: search returns
				relevance-ordered rows server-side.
			-->
			{#if sortableColumns.length > 0}
				<div class="md:hidden">
					<Select
						type="single"
						value={mobileSortValue}
						onValueChange={onMobileSortChange}
						disabled={isSearching}
					>
						<SelectTrigger class="w-full" aria-label={m['DataTable.sortBy']()}>
							<ArrowUpDownIcon class="size-4 opacity-70" aria-hidden="true" />
							<span class="truncate">
								{#if activeSortLabel}
									{m['DataTable.sortBy']()}: {activeSortLabel.header}
									{activeSortLabel.direction === 'asc' ? '↑' : '↓'}
								{:else}
									{m['DataTable.sortBy']()}
								{/if}
							</span>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="">{m['DataTable.sortDefault']()}</SelectItem>
							{#each sortableColumns as col (col.id)}
								<SelectItem value={`${col.id}:desc`}>{col.header} ↓</SelectItem>
								<SelectItem value={`${col.id}:asc`}>{col.header} ↑</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</div>
			{/if}
		</div>
	{/if}

	{#if controlsPlace === 'top'}
		<PaginatedData
			bind:page
			{totalPages}
			canGoNext={canGoNextCursor}
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
		{sortColumn}
		{sortDirection}
		onSort={onHeaderSort}
		{isSearching}
	/>

	{#if controlsPlace === 'bottom'}
		<PaginatedData
			bind:page
			{totalPages}
			canGoNext={canGoNextCursor}
			isLoading={tablePending}
			queryLoading={queryLoadingForPagination}
			hasResult={listPayload !== undefined}
		/>
	{/if}
</div>
