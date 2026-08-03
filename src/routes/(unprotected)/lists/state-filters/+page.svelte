<script lang="ts">
	// LIBRARIES
	import { api } from '@/convex/_generated/api';

	// CONFIG
	import {
		CATALOG_PAGE_SIZE,
		PLANS,
		ROLES,
		testRowColumns,
		type Plan,
		type Role
	} from '../listsConfig.js';

	// COMPONENTS
	import SvelteHead from '@/components/ui/svelte-head/svelte-head.svelte';
	import ConvexDataTable from '@/components/ui/data-table/convex-data-table.svelte';
	import { NativeSelect } from '@/components/ui/select/index.js';

	const anyOption = { value: '', label: 'Any' };
	const roleOptions = [anyOption, ...ROLES.map((role) => ({ value: role, label: role }))];
	const planOptions = [anyOption, ...PLANS.map((plan) => ({ value: plan, label: plan }))];

	// All of it lives in component state — changing any of these re-runs the live
	// subscription with new args and resets the cursor stack.
	let roleFilter = $state('');
	let planFilter = $state('');
	let search = $state('');

	const queryArgs = $derived({
		...(roleFilter && { role: roleFilter as Role }),
		...(planFilter && { plan: planFilter as Plan })
	});
</script>

<SvelteHead
	title="Table — state-driven filters"
	description="A live Convex subscription filtered and paginated entirely from component state."
/>

<section class="flex flex-col gap-3">
	<h1 class="text-xl font-semibold tracking-tight">Table — state-driven filters</h1>
	<p class="text-sm text-muted-foreground">
		Filters, search and page all live in <code>$state</code>. Cursor pagination, and
		<code>realtime</code> is passed here — the one demo that holds a subscription, so rows update as they
		change. Nothing is in the URL, so this view is not linkable and reload puts you back at the start:
		the right trade for an internal view, the wrong one for a public page.
	</p>

	<ConvexDataTable
		query={api.tables.test.testQueries.fetchTestRowsLive}
		realtime
		{queryArgs}
		columns={testRowColumns}
		getRowId={(row) => row._id}
		optimizationStrategy="cursor"
		pageSize={CATALOG_PAGE_SIZE}
		searchable
		bind:search
		searchPlaceholder="Search names…"
	>
		{#snippet filters()}
			<NativeSelect
				class="w-36"
				ariaLabel="Filter by role"
				bind:value={roleFilter}
				options={roleOptions}
			/>
			<NativeSelect
				class="w-36"
				ariaLabel="Filter by plan"
				bind:value={planFilter}
				options={planOptions}
			/>
		{/snippet}
	</ConvexDataTable>
</section>
