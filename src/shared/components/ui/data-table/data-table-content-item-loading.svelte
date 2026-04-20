<script lang="ts">
	// COMPONENTS
	import { Skeleton } from '@/shared/components/ui/skeleton/index.js';
	import { TableCell, TableRow } from '@/shared/components/ui/table/index.js';
	import { Card } from '@/shared/components/ui/card/index.js';

	// UTILS
	import { cn } from '@/shared/utils/utils.js';
	import { breakpointTableClass } from './data-table-helpers.js';

	// TYPES
	import type { DataTableSkeletonColumn } from './types.js';

	type Variant = 'table' | 'mobile';

	let {
		variant,
		columns,
		rowCount = 6
	}: {
		variant: Variant;
		columns: DataTableSkeletonColumn[];
		rowCount?: number;
	} = $props();

	const count = $derived(Math.max(1, Math.min(rowCount, 20)));
	const rowIndices = $derived(Array.from({ length: count }, (_, i) => i));
</script>

{#if variant === 'table'}
	{#each rowIndices as r (r)}
		<TableRow class="hover:bg-muted/30 border-b">
			{#each columns as col (col.id)}
				<TableCell
					class={cn(
						'max-w-[16rem] px-4 py-3 whitespace-normal',
						breakpointTableClass(col.hideBelow),
						col.cellClass
					)}
				>
					<Skeleton class="h-4 max-w-full rounded-sm sm:w-[70%]" />
				</TableCell>
			{/each}
		</TableRow>
	{/each}
{:else}
	{#each rowIndices as r (r)}
		<Card class="gap-0 px-4 py-4" role="listitem" aria-busy="true">
			<dl class="flex flex-col gap-3">
				{#each columns as col (col.id)}
					<div
						class="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,7rem)_minmax(0,1fr)] sm:gap-3"
					>
						<dt
							class="text-muted-foreground text-xs font-semibold tracking-wide uppercase sm:text-sm"
						>
							{col.header}
						</dt>
						<dd class="min-w-0">
							<Skeleton class="h-4 w-full max-w-56 rounded-sm" />
						</dd>
					</div>
				{/each}
			</dl>
		</Card>
	{/each}
{/if}
