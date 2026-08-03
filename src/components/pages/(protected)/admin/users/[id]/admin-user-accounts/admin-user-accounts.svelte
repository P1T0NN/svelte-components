<script lang="ts">
	// LIBRARIES
	import { api } from '@/convex/_generated/api';
	import { useQuery } from '@mmailaender/convex-svelte';

	// COMPONENTS
	import AdminUserAccountsHeader from './admin-user-accounts-header.svelte';
	import AdminUserAccountsItem from './admin-user-accounts-item.svelte';
	import AdminUserAccountsLoading from '../loading/admin-user-accounts-loading.svelte';
	import AdminUserAccountsEmpty from '../empty/admin-user-accounts-empty.svelte';
	import { ErrorComponent } from '@/components/ui/error-component/index.js';

	// TYPES
	import type { AdminUserAccountRow } from './adminUserAccountsTypes.js';

	/** Owns the accounts read; the header and each row own their own rendering. */
	let { userId }: { userId: string } = $props();

	const accountsQuery = useQuery(api.tables.users.userQueries.listUserAccounts, () => ({ userId }));
	const accounts = $derived((accountsQuery.data ?? []) as AdminUserAccountRow[]);
</script>

<div class="flex flex-col gap-4">
	<AdminUserAccountsHeader />

	{#if accountsQuery.error}
		<!--
		  `onRetry` reloads rather than `invalidateAll()`: this is a Convex `useQuery`, which
		  only re-subscribes when its args change or the component remounts.
		-->
		<ErrorComponent
			variant="content"
			title="Failed to load accounts."
			description="Something went wrong while loading accounts. Please try again."
			retryLabel="Retry"
			onRetry={() => location.reload()}
		/>
	{:else if accountsQuery.data === undefined}
		<AdminUserAccountsLoading />
	{:else if accounts.length === 0}
		<AdminUserAccountsEmpty />
	{:else}
		<ul class="flex flex-col gap-2">
			{#each accounts as account (account._id)}
				<AdminUserAccountsItem {account} />
			{/each}
		</ul>
	{/if}
</div>
