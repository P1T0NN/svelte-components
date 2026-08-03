<script lang="ts">
	// LIBRARIES
	import { api } from '@/convex/_generated/api';
	import { useConvexClient } from '@mmailaender/convex-svelte';

	// COMPONENTS
	import { Button } from '@/components/ui/button/index.js';

	// UTILS
	import { safeMutation } from '@/utils/convexHelpers';
	import { toastResult } from '@/utils/toastResult';
	import { formatTs } from '@/shared/utils/dateUtils';
	import { bounceIfSelf } from './adminUserSessionsUtils.js';

	// TYPES
	import type { Doc } from '@/convex/auth/component/_generated/dataModel';

	/**
	 * One session row, owning its own revoke. Because the in-flight flag is per-row state
	 * here, the list no longer needs a shared set of revoking tokens — the row that is busy
	 * is the row that knows it.
	 */
	let { session, userId }: { session: Doc<'session'>; userId: string } = $props();

	const convex = useConvexClient();

	let isRevoking = $state(false);

	async function revokeOne() {
		if (isRevoking) return;
		isRevoking = true;
		try {
			const result = await safeMutation(convex, api.tables.users.userMutations.revokeSession, {
				sessionToken: session.token,
				userId
			});
			if (!toastResult(result)) return;

			await bounceIfSelf(userId);
		} finally {
			isRevoking = false;
		}
	}
</script>

<li
	class="flex flex-col items-start justify-between gap-2 rounded-md border p-3 md:flex-row md:items-center"
>
	<div class="flex min-w-0 flex-1 flex-col gap-1">
		<span class="text-sm font-medium break-all" title={session.userAgent ?? ''}>
			{session.userAgent || 'Unknown device'}
		</span>

		<div class="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
			<span>IP: {session.ipAddress || '—'}</span>
			<span>Created: {formatTs(session.createdAt)}</span>
			<span>Expires: {formatTs(session.expiresAt)}</span>
		</div>
	</div>

	<Button variant="outline" size="sm" onclick={revokeOne} disabled={isRevoking}>Revoke</Button>
</li>
