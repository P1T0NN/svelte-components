<script lang="ts">
	// CONFIG
	import { ADMIN_PAGE_ENDPOINTS } from '@/config/pageEndpoints';

	// COMPONENTS
	import AdminUserDangerZoneItem from './admin-user-danger-zone-item.svelte';
	import AdminChangeRoleButton from './admin-change-role-button.svelte';
	import AdminUnbanUserButton from './admin-unban-user-button.svelte';
	import AdminBanUserDialog from './admin-ban-user-dialog.svelte';
	import AdminDeleteUserDialog from './admin-delete-user-dialog.svelte';

	// UTILS
	import { capitalizeFirst } from '@/shared/utils/stringUtils';

	// TYPES
	import type { Doc } from '@/convex/auth/component/_generated/dataModel';

	let { user }: { user: Doc<'user'> } = $props();
</script>

<div class="flex flex-col gap-4 rounded-lg border border-destructive/40 p-4">
	<header class="flex flex-col gap-1">
		<h2 class="text-base font-semibold text-destructive">Danger zone</h2>
		<p class="text-sm text-muted-foreground">
			Account-level actions. Changes here are audited and may be irreversible.
		</p>
	</header>

	<AdminUserDangerZoneItem
		title={`Role: ${capitalizeFirst(user.role)}`}
		description={user.role === 'admin'
			? 'Remove admin privileges from this account.'
			: 'Grant admin privileges to this account.'}
	>
		<AdminChangeRoleButton userId={user._id} userEmail={user.email} role={user.role} />
	</AdminUserDangerZoneItem>

	<AdminUserDangerZoneItem
		title={user.banned ? 'Banned' : 'Active'}
		description={user.banned
			? 'Lift the ban so the user can sign in again.'
			: 'Sign the user out and prevent further sign-ins.'}
	>
		{#if user.banned}
			<AdminUnbanUserButton userId={user._id} />
		{:else}
			<AdminBanUserDialog userId={user._id} userEmail={user.email} />
		{/if}
	</AdminUserDangerZoneItem>

	<AdminDeleteUserDialog
		userId={user._id}
		userEmail={user.email}
		role={user.role}
		redirectUrl={ADMIN_PAGE_ENDPOINTS.USERS}
	/>
</div>
