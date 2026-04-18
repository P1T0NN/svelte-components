<script lang="ts">
	// SVELTEKIT IMPORTS
	import { page } from '$app/state';

	// CONFIG
	import { SIDEBAR_FULL_WIDTH_PREFIXES } from '@/shared/constants.js';

	// COMPONENTS
	import * as Sidebar from '@/shared/components/ui/sidebar/index.js';
	import AppSidebar from '@/shared/components/ui/app-sidebar/app-sidebar.svelte';
	import SiteHeader from '@/shared/components/ui/app-sidebar/site-header.svelte';

	let { children } = $props();

	const hideAppSidebar = $derived(
		SIDEBAR_FULL_WIDTH_PREFIXES.some((prefix) => page.url.pathname.startsWith(prefix))
	);
</script>

<Sidebar.Provider
	style="--sidebar-width: calc(var(--spacing) * 72); --header-height: calc(var(--spacing) * 12);"
>
	{#if !hideAppSidebar}
		<AppSidebar variant="inset" />
	{/if}

	<Sidebar.Inset>
		<SiteHeader pageName="Sidebar" />

		<div class="flex min-h-0 flex-1 flex-col">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
