<script lang="ts">
	// LIBRARIES
	import { page } from '$app/state';
	import { localizeHref } from '@/lib/paraglide/runtime';

	// CONFIG
	import { UNPROTECTED_PAGE_ENDPOINTS } from '@/config/pageEndpoints';
	import { LIST_DEMOS } from './listsConfig.js';

	// UTILS
	import { cn } from '@/utils/utils.js';

	// TYPES
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	// Compared with `endsWith` rather than `===` because the locale strategy is URL-based:
	// on `/de/lists/url-filters` the pathname carries a `/de` prefix that these constants
	// don't. The index (`/lists`) is unaffected — no demo path ends in it.
	const isActive = $derived((href: string) => page.url.pathname.endsWith(href));
</script>

<div class="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10">
	<header class="flex flex-col gap-3">
		<a
			href={localizeHref(UNPROTECTED_PAGE_ENDPOINTS.LISTS)}
			class="text-2xl font-semibold tracking-tight hover:underline"
		>
			Lists
		</a>
		<p class="text-sm text-muted-foreground">
			Four ways to read the same <code>testRows</code> table. Every one paginates on the server — what
			differs is where the position lives and who fetches the first page.
		</p>

		<nav aria-label="List demos" class="flex flex-wrap gap-1 border-b pb-2">
			{#each LIST_DEMOS as demo (demo.href)}
				<a
					href={localizeHref(demo.href)}
					aria-current={isActive(demo.href) ? 'page' : undefined}
					class={cn(
						'rounded-md px-3 py-1.5 text-sm transition-colors',
						isActive(demo.href)
							? 'bg-muted font-medium text-foreground'
							: 'text-muted-foreground hover:text-foreground'
					)}
				>
					{demo.label}
				</a>
			{/each}
		</nav>
	</header>

	{@render children()}
</div>
