<script lang="ts" generics="T extends Record<string, unknown>">
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

	// UTILS
	import { cn, type WithElementRef } from '@/shared/utils/utils.js';
	import {
		breakpointTableClass,
		defaultRowKey,
		showColumnInMobileCard
	} from './data-table-helpers.js';

	// TYPES
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ColumnDef as ColumnDefT, DataTableCustomCells } from './types.js';

	let {
		data,
		columns,
		caption,
		getRowId,
		isLoading = false,
		customCells,
		class: className,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		data: T[];
		columns: ColumnDefT<T>[];
		caption?: string;
		getRowId?: (row: T) => string;
		isLoading?: boolean;
		customCells?: DataTableCustomCells<T>;
	} = $props();

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
			aria-label={caption ?? 'Data table'}
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
						<DataTableContentItemLoading variant="table" {columns} />
					{:else}
						{#each data as row, rowIndex (rowKey(row, rowIndex))}
							<DataTableContentItem {row} {columns} {customCells} />
						{/each}
					{/if}
				</TableBody>
			</Table>
		</Card>

		<!-- Mobile: stacked row cards -->
		<div class="flex flex-col gap-3 md:hidden" role="list" aria-label={caption ?? 'Data rows'}>
			{#if isLoading}
				<DataTableContentItemLoading variant="mobile" columns={mobileColumns} />
			{:else}
				{#each data as row, rowIndex (rowKey(row, rowIndex))}
					<DataTableContentItemMobile row={row} columns={mobileColumns} {customCells} />
				{/each}
			{/if}
		</div>
	{/if}
</div>
