<script lang="ts">
	// LIBRARIES
	import { api } from '@/convex/_generated/api';
	import { localizeHref } from '@/lib/paraglide/runtime';

	// CONFIG
	import { ADMIN_PAGE_ENDPOINTS } from '@/config/pageEndpoints';

	// COMPONENTS
	import DataTable from '@/components/ui/data-table/convex-data-table.svelte';
	import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar/index.js';
	import AdminUsersTableFilters from './admin-users-table-filters.svelte';

	// UTILS
	import { capitalizeFirst } from '@/shared/utils/stringUtils';
	import { getAdminUsersTableColumns } from './adminUsersTableData.js';

	// TYPES
	import type { DataTableCellSnippetProps } from '@/components/ui/data-table/types.js';
	import type { Doc } from '@/convex/auth/component/_generated/dataModel';

	// Filter / sort / search state — forwarded to `listUsers` via DataTable's
	// `queryArgs` (filters) + `bind:sortColumn` (sort) + `bind:search` (search text).
	let searchField = $state<'email' | 'name'>('email');
	let role = $state<'user' | 'admin' | undefined>(undefined);
	let banned = $state<boolean | undefined>(undefined);
	let emailVerified = $state<boolean | undefined>(undefined);
	let sortColumn = $state<string | undefined>(undefined);
	let sortDirection = $state<'asc' | 'desc' | undefined>(undefined);
	let search = $state<string>('');

	const queryArgs = $derived({
		searchField,
		...(role !== undefined && { role }),
		...(banned !== undefined && { banned }),
		...(emailVerified !== undefined && { emailVerified })
	});

	const columns = getAdminUsersTableColumns();
</script>

<!--
  `realtime`: other admins ban, unban and change roles while this table is open, so rows
  move under the viewer without them acting — the realtime rule's "YES".
-->
<DataTable
	caption="Users"
	query={api.tables.users.userQueries.listUsers}
	realtime
	{queryArgs}
	{columns}
	getRowId={(r) => r._id}
	customCells={{ name: nameCell }}
	bind:sortColumn
	bind:sortDirection
	searchable
	bind:search
	searchPlaceholder={`Search by ${capitalizeFirst(searchField)}…`}
	{filters}
/>

{#snippet filters()}
	<AdminUsersTableFilters bind:searchField bind:role bind:banned bind:emailVerified />
{/snippet}

{#snippet nameCell({ row }: DataTableCellSnippetProps<Doc<'user'>>)}
	<a
		href={localizeHref(ADMIN_PAGE_ENDPOINTS.USER.replace(':id', row._id))}
		class="flex items-center gap-2 hover:underline"
	>
		<Avatar class="size-7">
			{#if row.image}
				<AvatarImage src={row.image} alt={row.name || row.email} />
			{/if}

			<AvatarFallback>
				{(row.name || row.email).slice(0, 2).toUpperCase()}
			</AvatarFallback>
		</Avatar>

		<span class="font-medium">{capitalizeFirst(row.name || row.email)}</span>
	</a>
{/snippet}
