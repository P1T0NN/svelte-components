<script lang="ts">
	// LIBRARIES
	import { api } from '@/convex/_generated/api';

	// CONFIG
	import { FEED_PAGE_SIZE } from '../listsConfig.js';

	// COMPONENTS
	import SvelteHead from '@/components/ui/svelte-head/svelte-head.svelte';
	import { ConvexInfiniteList } from '@/components/ui/infinite-scroll/index.js';
	import ListRow from '@/components/pages/(unprotected)/lists/list-row.svelte';
	import Spinner from '@/components/ui/spinner/spinner.svelte';
</script>

<SvelteHead
	title="Infinite scroll — client only"
	description="Cursor-paginated infinite scroll over a live Convex subscription."
/>

<section class="flex flex-col gap-3">
	<h1 class="text-xl font-semibold tracking-tight">Infinite scroll — client only</h1>
	<p class="text-sm text-muted-foreground">
		No <code>+page.server.ts</code> on this route, and no <code>realtime</code> prop — so this walks
		the cursor with one-shot reads, holding no subscription. Every scroll fetches exactly one page;
		the server never reads the whole table. View source and the list is empty, which is the point:
		compare with the SSR version. Pass <code>realtime</code> if rows must update while the user scrolls.
	</p>

	<ConvexInfiniteList
		query={api.tables.test.testQueries.fetchTestRowsLive}
		pageSize={FEED_PAGE_SIZE}
	>
		{#snippet children(rows)}
			<ListRow {rows} />
		{/snippet}
		{#snippet loading()}
			<div class="flex justify-center py-4"><Spinner /></div>
		{/snippet}
		{#snippet empty()}
			<p class="py-4 text-sm text-muted-foreground">No rows yet.</p>
		{/snippet}
	</ConvexInfiniteList>
</section>
