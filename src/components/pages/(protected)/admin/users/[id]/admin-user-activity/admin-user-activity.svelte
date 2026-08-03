<script lang="ts">
	// COMPONENTS
	import AdminUserActivityHeader from './admin-user-activity-header.svelte';
	import AdminUserActivityTable from './admin-user-activity-table.svelte';

	/** Activity tab: header + the audit-log table, which owns its own query and columns. */
	let { userId }: { userId: string } = $props();
</script>

<div class="flex flex-col gap-4">
	<AdminUserActivityHeader />

	<AdminUserActivityTable {userId} />
</div>
