<script lang="ts">
	// COMPONENTS
	import * as Sidebar from '@/shared/components/ui/sidebar/index.js';
	import AppSidebar from '@/shared/components/ui/app-sidebar/app-sidebar.svelte';
	import SiteHeader from '@/shared/components/ui/app-sidebar/site-header.svelte';

	let { children } = $props();
</script>

<Sidebar.Provider
	style="--sidebar-width: calc(var(--spacing) * 72); --header-height: calc(var(--spacing) * 12);"
>
	<AppSidebar variant="inset" />

	<Sidebar.Inset>
		<SiteHeader pageName="Sidebar" />

		<div class="flex min-h-0 flex-1 flex-col">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
