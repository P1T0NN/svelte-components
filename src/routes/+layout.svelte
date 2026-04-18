<script lang="ts">
	import './layout.css';
	import favicon from '@/shared/lib/assets/favicon.svg';

	// SVELTEKIT IMPORTS
	import { page } from '$app/state';

	// LIBRARIES
	import { setupConvexAuth, useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
	import { useQuery } from 'convex-svelte';
	import { api } from '@/convex/_generated/api';
	import { deLocalizeUrl } from '@/shared/lib/paraglide/runtime';

	// CONFIG
	import { UNPROTECTED_PAGE_ENDPOINTS } from '@/shared/constants.js';

	// CLASSES
	import { usersClass } from '@/features/users/classes/users-class.svelte';

	// COMPONENTS
	import { Toaster } from '@/shared/components/ui/sonner';
	import NormalHeader from '@/shared/components/ui/header/normal-header/normal-header.svelte';
	import Footer from '@/shared/components/ui/footer/footer.svelte';

	let { children, data } = $props();

	setupConvexAuth({ getServerState: () => data.authState });

	// Call useAuth once at layout init
	const auth = useAuth();
	const isAuthenticated = $derived(auth.isAuthenticated);

	const pathnameLogical = $derived(new URL(deLocalizeUrl(page.url.href)).pathname);
	const isLoginPage = $derived(pathnameLogical === UNPROTECTED_PAGE_ENDPOINTS.LOGIN);
	const isSidebarShell = $derived(pathnameLogical.startsWith(UNPROTECTED_PAGE_ENDPOINTS.SIDEBAR));

	// Only query user data when authenticated (prevents unnecessary auth token refreshes)
	const currentUserQuery = useQuery(
		api.tables.users.usersQueries.getCurrentUser,
		() => (isAuthenticated ? {} : 'skip')
	);
	
	$effect(() => {
		if (auth.isLoading) {
			usersClass.syncFromCurrentUserQuery(undefined, true);
			return;
		}
		usersClass.syncFromCurrentUserQuery(currentUserQuery.data, currentUserQuery.isLoading);
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="flex min-h-dvh flex-col">
	{#if !isLoginPage && !isSidebarShell}
		<NormalHeader changeBgOnScroll={true} />
	{/if}
	<div class="min-h-0 flex-1">
		{@render children()}
	</div>
	{#if !isLoginPage && !isSidebarShell}
		<Footer />
	{/if}
</div>
<Toaster richColors />