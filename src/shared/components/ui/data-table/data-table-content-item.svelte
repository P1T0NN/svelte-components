<script lang="ts" generics="T extends Record<string, unknown>">
	// LIBRARIES
	import { m } from '@/shared/lib/paraglide/messages';

	// COMPONENTS
	import { Link } from '@/shared/components/ui/link/index.js';
	import { TableCell, TableRow } from '@/shared/components/ui/table/index.js';
	import { Checkbox } from '@/shared/components/ui/checkbox/index.js';

	// UTILS
	import { cn } from '@/shared/utils/utils.js';
	import { breakpointTableClass, formatCellValue } from './dataTableUtils.js';

    // TYPES
	import type { ColumnDef, DataTableCustomCells } from './types.js';

	let {
		row,
		columns,
		customCells,
		selectable = false,
		isSelected = false,
		onToggle
	}: {
		row: T;
		columns: ColumnDef<T>[];
		customCells?: DataTableCustomCells<T>;
		selectable?: boolean;
		isSelected?: boolean;
		onToggle?: () => void;
	} = $props();
</script>

<TableRow
	class={cn(
		'hover:bg-muted/30 border-b transition-colors',
		isSelected && 'bg-muted/50 hover:bg-muted/60'
	)}
	aria-selected={selectable ? isSelected : undefined}
	data-state={selectable && isSelected ? 'selected' : undefined}
>
	{#if selectable}
		<TableCell class="w-10 px-4 py-3 align-middle">
			<Checkbox
				checked={isSelected}
				onCheckedChange={() => onToggle?.()}
				aria-label={isSelected ? m['DataTable.deselectRow']() : m['DataTable.selectRow']()}
			/>
		</TableCell>
	{/if}
	{#each columns as col (col.id)}
		{@const value = col.accessor(row)}
		<TableCell
			class={cn(
				'max-w-[16rem] px-4 py-3 whitespace-normal',
				breakpointTableClass(col.hideBelow),
				col.cellClass
			)}
		>
			{#if customCells?.[col.id]}
				<div class="min-w-0">
					{@render customCells[col.id]!({ row, column: col, value })}
				</div>
			{:else if col.linkHref}
				<div class="min-w-0">
					<Link
						href={col.linkHref(row)}
						class="text-primary block truncate font-medium underline-offset-2 hover:underline"
						title={formatCellValue(value)}
					>
						{formatCellValue(value)}
					</Link>
				</div>
			{:else}
				<span class="block truncate" title={formatCellValue(value)}>
					{formatCellValue(value)}
				</span>
			{/if}
		</TableCell>
	{/each}
</TableRow>
