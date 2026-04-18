<script lang="ts" module>
	// CONFIG
	import { UNPROTECTED_PAGE_ENDPOINTS } from '@/shared/constants.js';
	
	// LUCIDE ICONS
	import LifeBuoyIcon from '@lucide/svelte/icons/life-buoy';
	import SendIcon from '@lucide/svelte/icons/send';
	import FrameIcon from '@lucide/svelte/icons/frame';
	import PieChartIcon from '@lucide/svelte/icons/pie-chart';

	const data = {
		user: {
			name: 'shadcn',
			email: 'm@example.com',
			avatar: '/avatars/shadcn.jpg'
		},
		navMain: [
			{
				name: 'Sidebar',
				url: UNPROTECTED_PAGE_ENDPOINTS.SIDEBAR,
				icon: FrameIcon
			},
			{
				name: 'Sales & Marketing',
				url: '#',
				icon: PieChartIcon
			}
		],
		navSecondary: [
			{
				title: 'Support',
				url: '#',
				icon: LifeBuoyIcon
			},
			{
				title: 'Feedback',
				url: '#',
				icon: SendIcon
			}
		]
	};
</script>

<script lang="ts">
	// SVELTEKIT IMPORTS
	import { page } from '$app/state';

	// LIBRARIES
	import { deLocalizeUrl } from '@/shared/lib/paraglide/runtime';

	// COMPONENTS
	import * as Sidebar from '@/shared/components/ui/sidebar/index.js';
	import NavMain from './nav-main.svelte';
	import NavSecondary from './nav-secondary.svelte';
	import NavUser from './nav-user.svelte';
	import Logo from '@/shared/components/ui/logo/logo.svelte';

	// CONFIG
	import { COMPANY_DATA } from '@/shared/constants.js';

	// UTILS
	import { isNavItemActive } from '@/shared/utils/isNavItemActive.js';

	// TYPES
	import type { ComponentProps } from 'svelte';

	let {
		hasLogo = true,
		ref = $bindable(null),
		...restProps
	}: { hasLogo?: boolean } & ComponentProps<typeof Sidebar.Root> = $props();

	const pathnameLogical = $derived(new URL(deLocalizeUrl(page.url.href)).pathname);

	const navMainItems = $derived(
		data.navMain.map((item) => ({
			...item,
			isActive: isNavItemActive(pathnameLogical, item.url)
		}))
	);

	const navSecondaryItems = $derived(
		data.navSecondary.map((item) => ({
			...item,
			isActive: isNavItemActive(pathnameLogical, item.url)
		}))
	);
</script>

<Sidebar.Root bind:ref class="pt-4" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				{#if hasLogo}
					<Logo class="size-5!" />
				{:else}
					<span class="truncate px-2 text-base font-semibold text-sidebar-foreground">
						{COMPANY_DATA.NAME}
					</span>
				{/if}
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content>
		<NavMain items={navMainItems} />
		<NavSecondary items={navSecondaryItems} class="mt-auto" />
	</Sidebar.Content>

	<Sidebar.Footer>
		<NavUser />
	</Sidebar.Footer>
</Sidebar.Root>
