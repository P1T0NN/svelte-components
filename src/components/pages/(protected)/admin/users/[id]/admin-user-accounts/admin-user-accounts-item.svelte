<script lang="ts">
	// UTILS
	import { capitalizeFirst } from '@/shared/utils/stringUtils';
	import { formatTs } from '@/shared/utils/dateUtils';

	// TYPES
	import type { AdminUserAccountRow } from './adminUserAccountsTypes.js';

	/** One linked sign-in provider. Read-only — accounts are not revocable from here. */
	let { account }: { account: AdminUserAccountRow } = $props();
</script>

<li class="flex flex-col gap-1 rounded-md border p-3">
	<div class="flex flex-wrap items-center gap-2">
		<span class="text-sm font-medium">{capitalizeFirst(account.providerId)}</span>
		{#if account.providerId === 'credential'}
			<span class="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
				{account.hasPassword ? 'Password set' : 'No password'}
			</span>
		{/if}
	</div>

	<div class="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
		<span class="break-all">ID: {account.accountId}</span>
		<span>Created: {formatTs(account.createdAt)}</span>
		{#if account.scope}
			<span class="break-all">Scope: {account.scope}</span>
		{/if}
	</div>
</li>
