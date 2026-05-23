<script lang="ts">
	// LIBRARIES
	import { m } from '@/shared/lib/paraglide/messages';

	// COMPONENTS
	import Section from '@/shared/components/ui/section/section.svelte';
	import { SearchInputRemote } from '@/shared/components/ui/search-input/index.js';

	// REMOTE FUNCTIONS
	import { searchInput } from '@/features/search/search.remote';

	// TYPES
	import type {
		SearchInputItem,
		SearchInputRemoteProps
	} from '@/shared/components/ui/search-input/types.js';

	let value = $state('');
	let lastSelected = $state<SearchInputItem | null>(null);

	const searchTestRows: SearchInputRemoteProps['search'] = ({ search, maxResults, cursor }) =>
		searchInput({
			source: 'testRows',
			search,
			maxResults,
			cursor
		});

	function handleSelect(item: SearchInputItem) {
		lastSelected = item;
		value = item.title;
	}
</script>

<Section yPadding="md" containerClass="flex w-full max-w-md flex-col gap-6">
	<header class="flex flex-col gap-1">
		<h1 class="text-2xl font-semibold tracking-tight">{m['SearchInput.SearchPage.title']()}</h1>
		<p class="text-muted-foreground text-sm">{m['SearchInput.SearchPage.description']()}</p>
	</header>

	<SearchInputRemote
		bind:value
		search={searchTestRows}
		minQueryLength={1}
		maxResults={5}
		placeholder={m['SearchInput.SearchPage.placeholder']()}
		onSelect={handleSelect}
	/>

	{#if lastSelected}
		<p class="text-muted-foreground text-sm">
			{m['SearchInput.SearchPage.selected']()}
			<span class="text-foreground font-medium">{lastSelected.title}</span>
			{#if lastSelected.category}
				<span class="text-muted-foreground"> - {lastSelected.category}</span>
			{/if}
		</p>
	{/if}
</Section>
