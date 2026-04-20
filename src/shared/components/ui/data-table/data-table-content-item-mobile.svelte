<script lang="ts" generics="T extends Record<string, unknown>">
	// COMPONENTS
	import { Card } from '@/shared/components/ui/card/index.js';
	import { Link } from '@/shared/components/ui/link/index.js';

	// UTILS
	import { formatCellValue } from './data-table-helpers.js';

	// TYPES
	import type { ColumnDef, DataTableCustomCells } from './types.js';

	let {
		row,
		columns,
		customCells
	}: {
		row: T;
		columns: ColumnDef<T>[];
		customCells?: DataTableCustomCells<T>;
	} = $props();
</script>

<Card class="gap-0 px-4 py-4" role="listitem">
	<dl class="flex flex-col gap-3">
		{#each columns as col (col.id)}
			{@const value = col.accessor(row)}
			<div
				class="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,7rem)_minmax(0,1fr)] sm:gap-3"
			>
				<dt
					class="text-muted-foreground text-xs font-semibold tracking-wide uppercase sm:text-sm"
				>
					{col.header}
				</dt>
				<dd class="text-foreground min-w-0 text-sm font-medium">
					{#if customCells?.[col.id]}
						{@render customCells[col.id]!({ row, column: col, value })}
					{:else if col.linkHref}
						<Link
							href={col.linkHref(row)}
							class="text-primary font-medium underline-offset-2 hover:underline wrap-break-word"
							title={formatCellValue(value)}
						>
							{formatCellValue(value)}
						</Link>
					{:else}
						<span class="block wrap-break-word" title={formatCellValue(value)}>
							{formatCellValue(value)}
						</span>
					{/if}
				</dd>
			</div>
		{/each}
	</dl>
</Card>
