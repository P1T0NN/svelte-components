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

	// TYPES
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<SvelteHead
	title="Infinite scroll — server-rendered"
	description="Infinite scroll whose first page is fetched by the route loader and rendered into the HTML."
/>

<section class="flex flex-col gap-3">
	<h1 class="text-xl font-semibold tracking-tight">Infinite scroll — server-rendered</h1>
	<p class="text-sm text-muted-foreground">
		Same component, same query as the previous demo. The only difference is
		<code>initialData</code>, handed over by <code>+page.server.ts</code> — so the first
		{FEED_PAGE_SIZE} rows are in the HTML and scrolling continues from the cursor. View source here and
		the rows are there. No <code>realtime</code>, so a public feed like this holds no subscription
		at all.
	</p>

	<ConvexInfiniteList
		query={api.tables.test.testQueries.fetchTestRowsLive}
		pageSize={FEED_PAGE_SIZE}
		initialData={data.feed}
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
