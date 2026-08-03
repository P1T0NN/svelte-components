<script lang="ts">
	// LIBRARIES
	import { api } from '@/convex/_generated/api';
	import { useConvexClient } from '@mmailaender/convex-svelte';

	// COMPONENTS
	import { Button } from '@/components/ui/button/index.js';

	// UTILS
	import { safeMutation } from '@/utils/convexHelpers';
	import { toastResult } from '@/utils/toastResult';
	import { bounceIfSelf } from './adminUserSessionsUtils.js';

	/**
	 * Section header + the revoke-all action, which lives here rather than being handed down
	 * as a callback: the only things this needs from the parent are the user it acts on and
	 * whether there is anything to revoke.
	 */
	let { userId, sessionCount }: { userId: string; sessionCount: number } = $props();

	const convex = useConvexClient();

	let isRevokingAll = $state(false);

	async function revokeAll() {
		isRevokingAll = true;
		try {
			const result = await safeMutation(convex, api.tables.users.userMutations.revokeAllSessions, {
				userId
			});
			if (!toastResult(result)) return;

			await bounceIfSelf(userId);
		} finally {
			isRevokingAll = false;
		}
	}
</script>

<header class="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
	<div class="flex flex-col gap-0.5">
		<h2 class="text-base font-semibold">Active sessions</h2>
		<p class="text-sm text-muted-foreground">
			Devices currently signed in. Revoking signs the device out immediately.
		</p>
	</div>

	<Button variant="destructive" onclick={revokeAll} disabled={isRevokingAll || sessionCount === 0}>
		Revoke all
	</Button>
</header>
