<script lang="ts" generics="T extends Record<string, unknown>">
	// LIBRARIES
	import { m } from '@/shared/lib/paraglide/messages';

	// COMPONENTS
	import DataTableEmpty from './data-table-empty.svelte';
	import DataTableContentItem from './data-table-content-item.svelte';
	import DataTableContentItemLoading from './data-table-content-item-loading.svelte';
	import DataTableContentItemMobile from './data-table-content-item-mobile.svelte';
	import {
		Table,
		TableBody,
		TableCaption,
		TableHead,
		TableHeader,
		TableRow
	} from '@/shared/components/ui/table/index.js';
	import { Card } from '@/shared/components/ui/card/index.js';
	import { Checkbox } from '@/shared/components/ui/checkbox/index.js';

	// UTILS
	import { cn, type WithElementRef } from '@/shared/utils/utils.js';
	import {
		breakpointTableClass,
		defaultRowKey,
		showColumnInMobileCard
	} from './dataTableUtils.js';

	// TYPES
	import type { HTMLAttributes } from 'svelte/elements';
	import type {
		ColumnDef as ColumnDefT,
		DataTableCustomCells,
		DataTableSelectionHeaderState
	} from './types.js';

	type Props = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		data: T[];
		columns: ColumnDefT<T>[];
		caption?: string;
		getRowId?: (row: T) => string;
		isLoading?: boolean;
		customCells?: DataTableCustomCells<T>;
		selectable?: boolean;
		selectedSet?: Set<string>;
		headerSelectionState?: DataTableSelectionHeaderState;
		onToggleRow?: (id: string) => void;
		onToggleAllOnPage?: () => void;
	};

	let {
		data,
		columns,
		caption,
		getRowId,
		isLoading = false,
		customCells,
		class: className,
		selectable = false,
		selectedSet,
		headerSelectionState = 'none',
		onToggleRow,
		onToggleAllOnPage,
		...restProps
	}: Props = $props();

	const mobileColumns = $derived(columns.filter(showColumnInMobileCard));

	function rowKey(row: T, index: number): string {
		return getRowId?.(row) ?? defaultRowKey(row, index);
	}
</script>

<div
	data-slot="data-table"
	class={cn('flex flex-col gap-0', className)}
	{...restProps}
>
	{#if data.length === 0 && !isLoading}
		<DataTableEmpty />
	{:else}
		<Card
			class="hidden gap-0 py-0 md:flex md:flex-col"
			role="region"
			aria-busy={isLoading}
			aria-label={caption ?? m['DataTable.ariaDataTable']()}
		>
			<Table class="min-w-lg">
				{#if caption}
					<TableCaption
						class="text-muted-foreground mt-0 border-b px-4 py-3 text-left text-sm font-medium"
					>
						{caption}
					</TableCaption>
				{/if}
				<TableHeader>
					<TableRow class="hover:bg-muted/40 border-b bg-muted/40">
						{#if selectable}
							<TableHead
								scope="col"
								class="text-muted-foreground h-auto w-10 px-4 py-3 text-left"
							>
								<Checkbox
									checked={headerSelectionState === 'all'}
									indeterminate={headerSelectionState === 'some'}
									disabled={isLoading || data.length === 0}
									onCheckedChange={() => onToggleAllOnPage?.()}
									aria-label={m['DataTable.selectAllRowsOnThisPage']()}
								/>
							</TableHead>
						{/if}
						{#each columns as col (col.id)}
							<TableHead
								scope="col"
								class={cn(
									'text-muted-foreground h-auto px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase whitespace-normal',
									breakpointTableClass(col.hideBelow),
									col.headerClass
								)}
							>
								{col.header}
							</TableHead>
						{/each}
					</TableRow>
				</TableHeader>

				<TableBody>
					{#if isLoading}
						<DataTableContentItemLoading variant="table" {columns} {selectable} />
					{:else}
						{#each data as row, rowIndex (rowKey(row, rowIndex))}
							{@const id = rowKey(row, rowIndex)}
							<DataTableContentItem
								{row}
								{columns}
								{customCells}
								{selectable}
								isSelected={selectedSet?.has(id) ?? false}
								onToggle={() => onToggleRow?.(id)}
							/>
						{/each}
					{/if}
				</TableBody>
			</Table>
		</Card>

		<!-- Mobile: stacked row cards -->
		<div class="flex flex-col gap-3 md:hidden" role="list" aria-label={caption ?? m['DataTable.ariaDataRows']()}>
			{#if selectable && !isLoading && data.length > 0}
				<div class="flex items-center gap-2 px-1 py-1">
					<Checkbox
						checked={headerSelectionState === 'all'}
						indeterminate={headerSelectionState === 'some'}
						onCheckedChange={() => onToggleAllOnPage?.()}
						aria-label={m['DataTable.selectAllRowsOnThisPage']()}
					/>
					<span class="text-muted-foreground text-xs font-medium">
						{m['DataTable.selectAllOnPage']()}
					</span>
				</div>
			{/if}
			{#if isLoading}
				<DataTableContentItemLoading variant="mobile" columns={mobileColumns} {selectable} />
			{:else}
				{#each data as row, rowIndex (rowKey(row, rowIndex))}
					{@const id = rowKey(row, rowIndex)}
					<DataTableContentItemMobile
						{row}
						columns={mobileColumns}
						{customCells}
						{selectable}
						isSelected={selectedSet?.has(id) ?? false}
						onToggle={() => onToggleRow?.(id)}
					/>
				{/each}
			{/if}
		</div>
	{/if}
</div>
