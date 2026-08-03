<script lang="ts">
	// LIBRARIES
	import { api } from '@/convex/_generated/api';

	// COMPONENTS
	import DataTable from '@/components/ui/data-table/convex-data-table.svelte';

	// UTILS
	import { getAdminUserActivityColumns } from './adminUserActivityTableData.js';

	// TYPES
	import type { Doc } from '@/convex/_generated/dataModel';
	import type { DataTableCellSnippetProps } from '@/components/ui/data-table/types.js';

	/**
	 * Audit-log table for one user. Not `realtime`: audit rows are written by the actions the
	 * admin is auditing, not streamed at them while they read — see
	 * `docs/GeneralSystemDesignRule.md`.
	 */
	let { userId }: { userId: string } = $props();

	let sortColumn = $state<string | undefined>(undefined);
	let sortDirection = $state<'asc' | 'desc' | undefined>(undefined);

	const queryArgs = $derived({ userId });

	const columns = getAdminUserActivityColumns();
</script>

<DataTable
	caption="Activity"
	query={api.tables.auditLog.queries.auditLogQueries.listAuditLogs}
	{queryArgs}
	{columns}
	getRowId={(r) => r._id}
	customCells={{ status: statusCell }}
	bind:sortColumn
	bind:sortDirection
/>

{#snippet statusCell({ row }: DataTableCellSnippetProps<Doc<'auditLogs'>>)}
	{#if row.status === 'failure'}
		<span class="rounded bg-destructive/10 px-1.5 py-0.5 text-xs font-medium text-destructive">
			Failed
		</span>
	{:else}
		<span class="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
			Success
		</span>
	{/if}
{/snippet}
