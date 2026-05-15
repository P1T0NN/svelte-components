<script lang="ts">
	import './layout.css';
	import favicon from '@/shared/lib/assets/favicon.svg';

	// SVELTEKIT IMPORTS
	import { page } from '$app/state';
	import { dev } from '$app/environment';

	// LIBRARIES
	import { deLocalizeUrl } from '@/shared/lib/paraglide/runtime';
	import { createSvelteAuthClient } from '@mmailaender/convex-better-auth-svelte/svelte';
	import { authClient } from '@/features/auth/lib/auth-client';
	import { useQuery } from '@mmailaender/convex-svelte';
	import { api } from '@/convex/_generated/api';
	import { useAuth } from '@mmailaender/convex-better-auth-svelte/svelte';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

	// CLASSES
	import { authClass, type CurrentUser } from '@/features/auth/classes/authClass.svelte';

	// CONFIG
	import { UNPROTECTED_PAGE_ENDPOINTS } from '@/shared/constants.js';

	// COMPONENTS
	import { Toaster } from '@/shared/components/ui/sonner';
	import NormalHeader from '@/shared/components/ui/header/normal-header/normal-header.svelte';
	import Footer from '@/shared/components/ui/footer/footer.svelte';
	import AuthErrorBanner from '@/features/auth/components/auth-error-banner/auth-error-banner.svelte';

	let { children, data } = $props();

	const pathnameLogical = $derived(new URL(deLocalizeUrl(page.url.href)).pathname);
	const isLoginPage = $derived(pathnameLogical === UNPROTECTED_PAGE_ENDPOINTS.LOGIN);
	const isSidebarShell = $derived(pathnameLogical.startsWith(UNPROTECTED_PAGE_ENDPOINTS.SIDEBAR));

	createSvelteAuthClient({
		authClient,
		getServerState: () => data.authState
	});
	injectAnalytics({ mode: dev ? 'development' : 'production' });
	injectSpeedInsights();

	// NOTE: Has to be after the `createSvelteAuthClient` call because it uses the `authClient` instance.
	const auth = useAuth();

	const currentUserResponse = useQuery(
		api.auth.queries.authQueries.getCurrentUser,
		() => (auth.isAuthenticated ? {} : 'skip'),
		() => ({
			initialData: data.currentUser ?? undefined,
			keepPreviousData: true
		})
	);

	// Push the live query into the shared store so any component can read
	// `authClass.currentUser` without re-subscribing.
	$effect(() => {
		const data = currentUserResponse.data as CurrentUser | null | undefined;
		authClass.syncFromCurrentUserQuery(data, currentUserResponse.isLoading);
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
<AuthErrorBanner />
