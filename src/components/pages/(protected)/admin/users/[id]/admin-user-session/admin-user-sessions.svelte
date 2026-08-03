<script lang="ts">
	// LIBRARIES
	import { api } from '@/convex/_generated/api';
	import { useQuery } from '@mmailaender/convex-svelte';

	// COMPONENTS
	import AdminUserSessionsHeader from './admin-user-sessions-header.svelte';
	import AdminUserSessionsItem from './admin-user-sessions-item.svelte';
	import AdminUserSessionsLoading from '../loading/admin-user-sessions-loading.svelte';
	import AdminUserSessionsEmpty from '../empty/admin-user-sessions-empty.svelte';
	import { ErrorComponent } from '@/components/ui/error-component/index.js';

	// TYPES
	import type { Doc } from '@/convex/auth/component/_generated/dataModel';

	/**
	 * Owns the sessions read and nothing else: the revoke mutations live in the header
	 * (revoke all) and in the row (revoke one), so no handlers are passed down — each child
	 * gets only the `userId` it needs to call its own mutation.
	 */
	let { userId }: { userId: string } = $props();

	const sessionsQuery = useQuery(api.tables.users.userQueries.listUserSessions, () => ({ userId }));
	const sessions = $derived((sessionsQuery.data ?? []) as Doc<'session'>[]);
</script>

<div class="flex flex-col gap-4">
	<AdminUserSessionsHeader {userId} sessionCount={sessions.length} />

	{#if sessionsQuery.error}
		<!--
		  `onRetry` reloads rather than `invalidateAll()`: this is a Convex `useQuery`, which
		  only re-subscribes when its args change or the component remounts.
		-->
		<ErrorComponent
			variant="content"
			title="Failed to load sessions."
			description="Something went wrong while loading sessions. Please try again."
			retryLabel="Retry"
			onRetry={() => location.reload()}
		/>
	{:else if sessionsQuery.data === undefined}
		<AdminUserSessionsLoading />
	{:else if sessions.length === 0}
		<AdminUserSessionsEmpty />
	{:else}
		<ul class="flex flex-col gap-2">
			{#each sessions as session (session.token)}
				<AdminUserSessionsItem {session} {userId} />
			{/each}
		</ul>
	{/if}
</div>
