<script lang="ts">
	// LIBRARIES
	import { localizeHref } from '@/lib/paraglide/runtime';

	// CONFIG
	import { LIST_DEMOS } from './listsConfig.js';

	// COMPONENTS
	import SvelteHead from '@/components/ui/svelte-head/svelte-head.svelte';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
</script>

<SvelteHead
	title="Lists"
	description="Infinite scroll, state-driven filters and URL-driven pagination against one Convex table."
/>

<div class="grid gap-4 sm:grid-cols-2">
	{#each LIST_DEMOS as demo (demo.href)}
		<a
			href={localizeHref(demo.href)}
			class="group flex flex-col gap-2 rounded-lg border bg-card p-5 transition-colors hover:border-foreground/20"
		>
			<span class="flex items-center gap-2 text-sm font-medium">
				{demo.title}
				<ArrowRightIcon
					class="size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
				/>
			</span>
			<span class="text-sm text-muted-foreground">{demo.blurb}</span>
		</a>
	{/each}
</div>
