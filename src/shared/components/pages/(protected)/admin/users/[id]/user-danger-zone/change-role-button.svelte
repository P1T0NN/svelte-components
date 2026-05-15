<script lang="ts">
	// LIBRARIES
	import { api } from '@/convex/_generated/api';
	import { useConvexClient } from 'convex-svelte';
	import { m } from '@/shared/lib/paraglide/messages';

	// COMPONENTS
	import ActionButton from '@/shared/components/ui/action-button/action-button.svelte';

	// UTILS
	import { safeMutation } from '@/shared/utils/convexHelpers';
	import { toastResult } from '@/shared/utils/toastResult';

	/**
	 * Self-contained promote/demote toggle. Direction is derived from the
	 * current role — clicking opens an `ActionButton` confirm dialog explaining
	 * the consequence, then flips the role via the `setUserRole` Convex
	 * mutation (which audits the change atomically).
	 */
	let {
		userId,
		userEmail,
		role
	}: {
		userId: string;
		userEmail: string;
		role: string;
	} = $props();

	const convex = useConvexClient();
	let isPending = $state(false);

	const nextRole = $derived<'user' | 'admin'>(role === 'admin' ? 'user' : 'admin');

	async function changeRole() {
		isPending = true;
		try {
			const result = await safeMutation(
				convex,
				api.tables.users.userMutations.setUserRole,
				{ userId, role: nextRole }
			);
			toastResult(result);
		} finally {
			isPending = false;
		}
	}
</script>

<ActionButton
	function={changeRole}
	variant="outline"
	{isPending}
	title={role === 'admin'
		? m['AdminUserPage.ChangeRoleButton.demoteTitle']({ email: userEmail })
		: m['AdminUserPage.ChangeRoleButton.promoteTitle']({ email: userEmail })}
	description={role === 'admin'
		? m['AdminUserPage.ChangeRoleButton.demoteDescription']()
		: m['AdminUserPage.ChangeRoleButton.promoteDescription']()}
>
	{role === 'admin'
		? m['AdminUserPage.ChangeRoleButton.demote']()
		: m['AdminUserPage.ChangeRoleButton.promote']()}
</ActionButton>
