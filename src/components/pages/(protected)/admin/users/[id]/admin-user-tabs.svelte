<script lang="ts">
	// COMPONENTS
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs/index.js';
	import AdminUserOverview from '@/components/pages/(protected)/admin/users/[id]/admin-user-overview.svelte';
	import AdminUserSessions from '@/components/pages/(protected)/admin/users/[id]/admin-user-session/admin-user-sessions.svelte';
	import AdminUserAccounts from '@/components/pages/(protected)/admin/users/[id]/admin-user-accounts/admin-user-accounts.svelte';
	import AdminUserActivity from '@/components/pages/(protected)/admin/users/[id]/admin-user-activity/admin-user-activity.svelte';
	import AdminUserDangerZone from '@/components/pages/(protected)/admin/users/[id]/admin-user-danger-zone/admin-user-danger-zone.svelte';

	// TYPES
	import type { Doc } from '@/convex/auth/component/_generated/dataModel';

	type Props = {
		user: Doc<'user'>;
	};

	let { user }: Props = $props();

	let activeTab = $state('overview');
</script>

<Tabs bind:value={activeTab}>
	<TabsList>
		<TabsTrigger value="overview">Overview</TabsTrigger>
		<TabsTrigger value="sessions">Sessions</TabsTrigger>
		<TabsTrigger value="accounts">Accounts</TabsTrigger>
		<TabsTrigger value="activity">Activity</TabsTrigger>
		<TabsTrigger value="danger">Danger zone</TabsTrigger>
	</TabsList>

	<TabsContent value="overview" class="pt-2">
		<AdminUserOverview {user} />
	</TabsContent>

	<TabsContent value="sessions" class="pt-2">
		<AdminUserSessions userId={user._id} />
	</TabsContent>

	<TabsContent value="accounts" class="pt-2">
		<AdminUserAccounts userId={user._id} />
	</TabsContent>

	<TabsContent value="activity" class="pt-2">
		<AdminUserActivity userId={user._id} />
	</TabsContent>

	<TabsContent value="danger" class="pt-2">
		<AdminUserDangerZone {user} />
	</TabsContent>
</Tabs>
