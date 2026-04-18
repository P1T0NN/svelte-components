<script lang="ts">
	// COMPONENTS
	import * as Sidebar from '@/shared/components/ui/sidebar/index.js';

	// TYPES
	import type { Component, ComponentProps } from 'svelte';

	let {
		items,
		...restProps
	}: {
		items: {
			title: string;
			url: string;
			icon: Component;
			isActive?: boolean;
		}[];
	} & ComponentProps<typeof Sidebar.Group> = $props();
</script>

<Sidebar.Group {...restProps}>
	<Sidebar.GroupContent>
		<Sidebar.Menu class="gap-2">
			{#each items as item (item.title)}
				<Sidebar.MenuItem>
					<Sidebar.MenuButton size="sm" isActive={item.isActive}>
						{#snippet child({ props })}
							<a href={item.url} {...props}>
								<item.icon />
								<span>{item.title}</span>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			{/each}
		</Sidebar.Menu>
	</Sidebar.GroupContent>
</Sidebar.Group>
