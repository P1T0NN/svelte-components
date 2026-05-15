<script lang="ts">
	// LIBRARIES
	import { m } from '@/shared/lib/paraglide/messages';

	// COMPONENTS
	import { Avatar, AvatarImage, AvatarFallback } from '@/shared/components/ui/avatar/index.js';
	import CopyButton from '@/shared/components/ui/copy-button/copy-button.svelte';

	// UTILS
	import { capitalize } from '@/shared/utils/stringUtils';

	// TYPES
	import type { Doc } from '@/convex/auth/component/_generated/dataModel';

	let { user }: { user: Doc<"user"> } = $props();

	const displayName = $derived(capitalize(user.name || user.email));
	const createdAt = $derived(new Date(user._creationTime).toLocaleString());
	const updatedAt = $derived(new Date(user.updatedAt).toLocaleString());
	const banExpiresAt = $derived(user.banExpires ? new Date(user.banExpires).toLocaleString() : null);
</script>

{#snippet field(label: string, value: string)}
	<div class="flex flex-col gap-0.5">
		<span class="text-muted-foreground text-xs uppercase tracking-wide">{label}</span>
		<span class="text-sm">{value}</span>
	</div>
{/snippet}

<div class="flex flex-col gap-6">
	<div class="flex items-center gap-4">
		<Avatar class="size-16">
			{#if user.image}
				<AvatarImage src={user.image} alt={displayName} />
			{/if}
			<AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
		</Avatar>

		<div class="flex flex-col gap-1">
			<h2 class="text-lg font-semibold">{displayName}</h2>
			<div class="flex items-center gap-2 text-sm">
				<span class="text-muted-foreground">{user.email}</span>
				{#if user.emailVerified}
					<span class="bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200 rounded px-1.5 py-0.5 text-xs font-medium">
						{m['AdminUserPage.UserOverview.verified']()}
					</span>
				{:else}
					<span class="bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 rounded px-1.5 py-0.5 text-xs font-medium">
						{m['AdminUserPage.UserOverview.unverified']()}
					</span>
				{/if}
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		{@render field(m['AdminUserPage.UserOverview.role'](), capitalize(user.role))}
		{@render field(
			m['AdminUserPage.UserOverview.status'](),
			user.banned
				? (banExpiresAt
						? m['AdminUserPage.UserOverview.bannedUntil']({ date: banExpiresAt })
						: m['AdminUserPage.UserOverview.bannedPermanent']())
				: m['AdminUserPage.UserOverview.active']()
		)}
		{#if user.banned && user.banReason}
			{@render field(m['AdminUserPage.UserOverview.banReason'](), user.banReason)}
		{/if}
		{@render field(m['AdminUserPage.UserOverview.created'](), createdAt)}
		{@render field(m['AdminUserPage.UserOverview.updated'](), updatedAt)}
	</div>

	<div class="flex flex-col gap-2">
		<span class="text-muted-foreground text-xs uppercase tracking-wide">{m['AdminUserPage.UserOverview.userId']()}</span>
		<div class="flex items-center gap-2">
			<code class="bg-muted rounded px-2 py-1 font-mono text-xs">{user._id}</code>
			<CopyButton value={user._id} label={m['AdminUserPage.UserOverview.copyUserId']()} />
		</div>
	</div>
</div>
