<script lang="ts" generics="Query extends FunctionReference<'query'>">
	// LIBRARIES
	import { usePaginatedQuery } from '@mmailaender/convex-svelte';

	// CONFIG
	import { PAGINATION_DATA } from '@/shared/config.js';

	// UTILS
	import { infiniteScroll } from './infinite-scroll.svelte.js';
	import { convexOneShotPaginatedQuery } from '@/utils/convexOneShot.svelte.js';

	// TYPES
	import type { Snippet } from 'svelte';
	import type { FunctionArgs, FunctionReference, PaginationOptions } from 'convex/server';

	type Row = Query['_returnType'] extends { page: (infer T)[] } ? T : never;

	/** Mirrors the package's internal `WithoutPaginationOpts` — not exported from its entrypoint. */
	type Args =
		FunctionArgs<Query> extends { paginationOpts: PaginationOptions }
			? Omit<FunctionArgs<Query>, 'paginationOpts'> & { paginationOpts?: never }
			: FunctionArgs<Query> & { paginationOpts?: never };

	let {
		query,
		args = {} as Args,
		initialData,
		pageSize = PAGINATION_DATA.DEFAULT_PAGE_SIZE,
		children,
		loading,
		empty,
		realtime = false
	}: {
		/** Any `fetchOptimized` query in `strategy: 'cursor'` mode. */
		query: Query;
		/** Filters forwarded to the query. Never pass `paginationOpts` — this owns it. */
		args?: Args;
		/**
		 * First page fetched server-side (`+page.server.ts` → `createConvexHttpClient()`), so the
		 * list renders in the SSR HTML and the socket picks up from page 2. Omit for pure CSR.
		 */
		initialData?: { page: Row[]; isDone: boolean; continueCursor: string };
		/** Rows per request, first page included. */
		pageSize?: number;
		/** Renders the accumulated rows. Same array can feed a list, a map, anything. */
		children: Snippet<[Row[]]>;
		/** Shown in the sentinel while the next page is in flight. */
		loading?: Snippet;
		/** Shown when the query is exhausted with zero rows. */
		empty?: Snippet;
		/**
		 * Hold a live subscription instead of walking the cursor with one-shot reads. Off by
		 * default — see `docs/GeneralSystemDesignRule.md`: a subscription is a standing
		 * per-viewer cost, and an infinite feed subscribes to *every page loaded so far*, so the
		 * invalidation surface grows as the user scrolls.
		 *
		 * Read once at mount; do not toggle at runtime.
		 */
		realtime?: boolean;
	} = $props();

	// Both expose `{ results, status, isLoading, loadMore }`, so the sentinel below is unchanged.
	// svelte-ignore state_referenced_locally
	const list = realtime
		? usePaginatedQuery(
				query,
				() => args,
				() => ({ initialNumItems: pageSize, initialData, keepPreviousData: true })
			)
		: convexOneShotPaginatedQuery<Row>(
				query,
				() => args,
				() => ({ initialNumItems: pageSize, initialData })
			);
</script>

{@render children(list.results as Row[])}

{#if list.status === 'Exhausted' && list.results.length === 0}
	{@render empty?.()}
{:else if list.status !== 'Exhausted'}
	<!--
	  Sentinel stays mounted through 'LoadingMore' so the spinner has a home; the attachment
	  itself no-ops unless status is 'CanLoadMore', which is what blocks the double-fire.
	-->
	<div
		{@attach infiniteScroll(() => {
			// Load-bearing dependency, do not remove. A list seeded with `initialData` mounts
			// straight into 'CanLoadMore', but the underlying state machine's `loadMore` is a
			// placeholder that returns false until the subscription attaches. The sentinel is
			// already on screen at that moment (only the seeded page is rendered), so the very
			// first trigger is swallowed — and `status` never changes afterwards, so without
			// something else to re-run this attachment nothing ever re-observes the sentinel and
			// the list sits on its seeded page forever.
			//
			// `results` gets a fresh identity on every update, including the first real one, so
			// reading it re-arms the observer while the sentinel is still in view. `status` is
			// unusable here (it is already 'CanLoadMore'), and so is `loadMore` — the hook
			// exposes that one as a plain method on its returned object rather than a getter, so
			// reading it tracks nothing.
			void list.results;
			return {
				onLoadMore: () => list.loadMore(pageSize),
				hasMore: list.status === 'CanLoadMore'
			};
		})}
	>
		{#if list.isLoading}{@render loading?.()}{/if}
	</div>
{/if}
