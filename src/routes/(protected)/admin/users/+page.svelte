<script lang="ts">
	// COMPONENTS
	import SvelteHead from '@/components/ui/svelte-head/svelte-head.svelte';
	import AdminUsersHeader from '@/components/pages/(protected)/admin/users/admin-users-header.svelte';
	import AdminUsersTable from '@/components/pages/(protected)/admin/users/admin-users-table/admin-users-table.svelte';
</script>

<SvelteHead />

<section class="flex w-full flex-col gap-4 p-4 md:p-6">
	<AdminUsersHeader />

	<AdminUsersTable />
</section>
