<script lang="ts">
	// LIBRARIES
	import { m } from '@/shared/lib/paraglide/messages';

	// COMPONENTS
	import { PaginationContent, PaginationItem } from '@/shared/components/ui/pagination/index.js';
	import { buttonVariants } from '@/shared/components/ui/button/index.js';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

	// UTILS
	import { cn } from '@/shared/utils/utils.js';

	type Props = {
		class?: string;
		/** 1-based page; use `bind:page` from parent. */
		page?: number;
		totalPages: number;
		/** Full-table / route loading (skeleton, ellipsis). */
		isLoading: boolean;
		/** Query in flight (e.g. Convex `useQuery` `isLoading`). */
		queryLoading: boolean;
		/** Current subscription has a result object (not a brief `undefined` between arg changes). */
		hasResult: boolean;
	};

	let {
		class: className,
		page = $bindable(1),
		totalPages,
		isLoading,
		queryLoading,
		hasResult
	}: Props = $props();

	const canGoNext = $derived(page < totalPages && !queryLoading && hasResult);
</script>

<!--
  No Bits `Pagination.Root`: it `bind:`s `page` and clamps from its own `count`/`perPage`,
  which fights one-off page updates and can reset the parent to page 1.
-->
<nav
	aria-label="pagination"
	data-slot="paginated-data"
	class={cn(
		'cn-pagination mx-auto flex w-full justify-end sm:justify-center',
		className
	)}
>
	<PaginationContent class="flex-wrap">
		<PaginationItem>
			<button
				type="button"
				aria-label="Go to previous page"
				class={cn(buttonVariants({ variant: 'ghost' }), 'pl-1.5!')}
				disabled={page <= 1 || isLoading}
				onclick={() => {
					page = Math.max(1, page - 1);
				}}
			>
				<ChevronLeftIcon class="size-4" />
				<span>Previous</span>
			</button>
		</PaginationItem>

		<PaginationItem>
			<span class="text-muted-foreground px-2 text-sm tabular-nums">
				{#if isLoading}
					<span class="inline-block min-w-[8ch]" aria-busy="true">…</span>
				{:else}
					{m['PaginatedData.paginationText']({ page, totalPages })}
				{/if}
			</span>
		</PaginationItem>

		<PaginationItem>
			<button
				type="button"
				aria-label="Go to next page"
				class={cn(buttonVariants({ variant: 'ghost' }), 'pr-1.5!')}
				disabled={!canGoNext || isLoading}
				onclick={() => {
					page = Math.min(totalPages, page + 1);
				}}
			>
				<span>Next</span>
				<ChevronRightIcon class="size-4" />
			</button>
		</PaginationItem>
	</PaginationContent>
</nav>
