<script lang="ts">
	// CONFIG
	import { COMPANY_DATA } from '@/shared/constants.js';

	// COMPONENTS
	import * as Breadcrumb from '@/shared/components/ui/breadcrumb/index.js';
	import { Button } from '@/shared/components/ui/button/index.js';
	import { Separator } from '@/shared/components/ui/separator/index.js';
	import * as Sidebar from '@/shared/components/ui/sidebar/index.js';

	// LUCIDE ICONS
	import SidebarIcon from '@lucide/svelte/icons/sidebar';

	const sidebar = Sidebar.useSidebar();

	let { pageName }: { pageName: string } = $props();
</script>

<header class="sticky top-0 z-50 flex w-full items-center border-b bg-background">
	<div class="flex h-(--header-height) w-full items-center gap-2 px-4">
		<Button class="size-8" variant="ghost" size="icon" onclick={sidebar.toggle}>
			<SidebarIcon />
		</Button>

		<Separator orientation="vertical" class="me-2 h-4" />

		<Breadcrumb.Root class="hidden sm:block">
			<Breadcrumb.List>
				<Breadcrumb.Item>
					<Breadcrumb.Link href="##">{COMPANY_DATA.NAME}</Breadcrumb.Link>
				</Breadcrumb.Item>

				<Breadcrumb.Separator />
				
				<Breadcrumb.Item>
					<Breadcrumb.Page>{pageName}</Breadcrumb.Page>
				</Breadcrumb.Item>
			</Breadcrumb.List>
		</Breadcrumb.Root>
	</div>
</header>
