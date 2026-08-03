<script lang="ts" generics="T extends Record<string, unknown>">
	// LIBRARIES
	import { useQuery } from '@mmailaender/convex-svelte';

	// CONFIG
	import { PAGINATION_DATA } from '@/shared/config.js';

	// COMPONENTS
	import DataList from './data-list.svelte';
	import { ErrorComponent } from '@/components/ui/error-component/index.js';

	// UTILS
	import { convexOneShotQuery } from '@/utils/convexOneShot.svelte.js';

	// TYPES
	import type { Snippet } from 'svelte';
	import type { FunctionReference } from 'convex/server';
	import type { DataListControlsPlace, DataListItemSnippetProps } from './types.js';
	import type { DataTableOptimizationStrategy } from '../data-table/types.js';
	import type { PaginatedListPayload } from '@/shared/features/pagination/types/paginationTypes';

	type ConvexPaginatedListQuery<T extends Record<string, unknown>> = FunctionReference<
		'query',
		'public',
		Record<string, unknown>,
		PaginatedListPayload<T>
	>;

	let {
		class: className,
		listClass,
		query,
		queryArgs,
		optimizationStrategy = PAGINATION_DATA.DEFAULT_OPTIMIZATION_STRATEGY,
		pageSize = PAGINATION_DATA.DEFAULT_PAGE_SIZE,
		controlsPlace = 'bottom',
		getItemKey,
		/**
		 * Portfolio-wide total when a separate summary query drives empty/loading UX.
		 * When set, `isEmpty` and `showPagination` derive from this instead of the list page.
		 */
		totalCount,
		/** External loading (e.g. summary query) merged with list pending state. */
		summaryLoading = false,
		/** External error (e.g. summary query) merged with list query errors. */
		hasError: externalHasError = false,
		item: itemSnippet,
		empty,
		error,
		loading,
		realtime = false
	}: {
		class?: string;
		listClass?: string;
		query: ConvexPaginatedListQuery<T>;
		/**
		 * Extra args forwarded to the query alongside `paginationOpts` / `page`.
		 * Value changes reset the cursor stack because cursors are tied to a specific access spec.
		 */
		queryArgs?: Record<string, unknown>;
		optimizationStrategy?: DataTableOptimizationStrategy;
		pageSize?: number;
		controlsPlace?: DataListControlsPlace;
		getItemKey?: (item: T, index: number) => string;
		totalCount?: number;
		summaryLoading?: boolean;
		hasError?: boolean;
		item: Snippet<[DataListItemSnippetProps<T>]>;
		empty?: Snippet;
		/**
		 * Override the failure UI. Defaults to a shared `ErrorComponent` — a failed query must
		 * never fall through to the empty state, which would report a broken read as "no data".
		 */
		error?: Snippet;
		loading?: Snippet;
		/**
		 * Hold a live subscription instead of fetching once per args change. Off by default —
		 * see `docs/GeneralSystemDesignRule.md`: a subscription is a standing per-viewer cost
		 * and has to be justified by data that moves under the user while they watch it.
		 *
		 * Read once at mount; do not toggle at runtime.
		 */
		realtime?: boolean;
	} = $props();

	let page = $state(1);
	let cursorByPage = $state<Array<string | null>>([null]);

	const mergedQueryArgs = $derived(queryArgs ?? {});

	const queryArgsKey = $derived(JSON.stringify(mergedQueryArgs));

	$effect(() => {
		void query;
		void queryArgsKey;
		cursorByPage = [null];
		page = 1;
	});

	function currentArgs() {
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
	}

	// Same `{ data, error, isLoading }` surface either way, so nothing downstream branches on it.
	// svelte-ignore state_referenced_locally
	const listQuery = realtime
		? useQuery(query, currentArgs, { keepPreviousData: true })
		: convexOneShotQuery(query, currentArgs, { keepPreviousData: true });

	const listPayload = $derived(listQuery.data as PaginatedListPayload<T> | undefined);

	const items = $derived((listPayload?.page ?? []) as T[]);

	// `null` = the server declined to count (matched set past its scan cap). Distinct from
	// "no payload yet", which must leave the previous total alone rather than blanking the pager.
	let lastTotalCount = $state<number | null>(null);
	$effect(() => {
		if (optimizationStrategy !== 'offset') return;
		const n = listPayload?.totalCount;
		if (n === undefined) return;
		if (n !== lastTotalCount) lastTotalCount = n;
	});

	const totalPages = $derived(
		optimizationStrategy === 'offset' && typeof lastTotalCount === 'number'
			? Math.max(1, Math.ceil(lastTotalCount / pageSize))
			: undefined
	);

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

	/**
	 * `isDone` is authoritative in both strategies. Offset mode normally drives the next button
	 * from `totalPages`, but a matched set past the server's scan cap returns `totalCount: null`
	 * and the paginator falls back to prev/next, which needs this.
	 */
	const canGoNext = $derived(!!listPayload && !listPayload.isDone);

	$effect(() => {
		if (optimizationStrategy !== 'offset' || listPayload === undefined) return;
		// Only clamp against a total we actually have — see ConvexDataTable for why.
		if (totalPages !== undefined && page > totalPages) page = totalPages;
	});

	const listPending = $derived(listPayload === undefined && listQuery.error === undefined);
	const queryLoading = $derived(listQuery.isLoading && listPayload === undefined);

	const hasError = $derived(externalHasError || Boolean(listQuery.error));

	const isEmpty = $derived(
		totalCount !== undefined ? totalCount === 0 : items.length === 0 && listPayload !== undefined
	);

	const isLoading = $derived(
		summaryLoading || (listPending && (totalCount === undefined || totalCount > 0))
	);

	// Falls through to the cursor-style test when no total is known — offset mode reports
	// `totalCount: null` past the server's scan cap, and hiding the pager there would strand
	// the user on page 1 of a list that demonstrably has more.
	const showPagination = $derived(
		totalCount !== undefined
			? totalCount > pageSize
			: totalPages !== undefined
				? totalPages > 1
				: page > 1 || canGoNext
	);
</script>

<DataList
	class={className}
	{listClass}
	{items}
	{getItemKey}
	{hasError}
	{isLoading}
	{isEmpty}
	item={itemSnippet}
	{empty}
	error={error ?? defaultError}
	{loading}
	bind:page
	{totalPages}
	{canGoNext}
	paginationIsLoading={listPending}
	{queryLoading}
	hasResult={listPayload !== undefined}
	{showPagination}
	{controlsPlace}
/>

<!--
  Default failure UI, overridable via the `error` snippet. `onRetry` reloads instead of the
  button's `invalidateAll()` default: this is a Convex `useQuery`, which only re-subscribes
  when its args change or the component remounts.
-->
{#snippet defaultError()}
	<ErrorComponent
		variant="plain"
		title="Couldn't load data"
		description="Something went wrong while loading this list. Please try again."
		retryLabel="Retry"
		onRetry={() => location.reload()}
	/>
{/snippet}
