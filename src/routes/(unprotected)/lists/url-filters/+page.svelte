<script lang="ts">
	// LIBRARIES
	import { page as pageState } from '$app/state';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	// CONFIG
	import { CATALOG_PAGE_SIZE, PLANS, ROLES, testRowColumns } from '../listsConfig.js';

	// COMPONENTS
	import SvelteHead from '@/components/ui/svelte-head/svelte-head.svelte';
	import DataTable from '@/components/ui/data-table/data-table.svelte';
	import { buttonVariants } from '@/components/ui/button/index.js';

	// UTILS
	import {
		listHref,
		popCursorHref,
		pushCursorHref,
		sortHref
	} from '@/features/pagination/utils/listUrlState.js';
	import { cn } from '@/utils/utils.js';

	// TYPES
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const totalPages = $derived(
		data.catalog.totalCount === null
			? undefined
			: Math.max(1, Math.ceil(data.catalog.totalCount / CATALOG_PAGE_SIZE))
	);

	/**
	 * Browse: a page number is a real address, so `target` maps straight to `?page=target`.
	 * Built from the live pathname, which keeps the locale prefix (`/de/lists/...`) intact.
	 *
	 * Search: Convex search indexes are cursor-only, so there is no page N to link to. Forward
	 * pushes the continuation cursor onto the trail in the URL, back pops it. Both are ordinary
	 * links — no page numbers, but previous is a real destination rather than a jump to the top.
	 */
	const catalogHref = $derived((target: number) =>
		data.isSearch
			? target > data.position
				? pushCursorHref(pageState.url, data.catalog.continueCursor)
				: popCursorHref(pageState.url)
			: listHref(pageState.url, { page: target })
	);

	/**
	 * The form's current values as a URL. `listHref` drops empty values, drops `page` (a new
	 * filter set invalidates where you were in the list) and never emits `?page=1`; `cursor`
	 * is cleared explicitly because a search cursor is meaningless against different filters.
	 */
	function hrefFromForm(form: HTMLFormElement): string {
		const fields = new FormData(form);
		const read = (key: string) => String(fields.get(key) ?? '');
		return listHref(pageState.url, {
			q: read('q'),
			role: read('role'),
			plan: read('plan'),
			cursor: null
		});
	}

	/**
	 * Client-side navigation instead of the browser's native GET submit, which would reload
	 * the document and throw away scroll position and focus. The `<form>` is still a real
	 * form — with JavaScript off nothing here runs and the native submit takes over.
	 */
	function apply(form: HTMLFormElement, { replace = false } = {}) {
		goto(hrefFromForm(form), { keepFocus: true, noScroll: true, replaceState: replace });
	}

	let searchTimer: ReturnType<typeof setTimeout>;

	/** Selects are discrete choices — apply immediately and leave a history entry. */
	function onFilterChange(event: Event & { currentTarget: HTMLFormElement }) {
		if ((event.target as HTMLElement).tagName !== 'SELECT') return;
		clearTimeout(searchTimer);
		apply(event.currentTarget);
	}

	/**
	 * Typing is not a discrete choice: debounce it, and `replaceState` so the back button
	 * steps out of the search rather than back through every keystroke.
	 */
	function onSearchInput(event: Event & { currentTarget: HTMLInputElement }) {
		const form = event.currentTarget.form;
		if (!form) return;
		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => apply(form, { replace: true }), 400);
	}
</script>

<SvelteHead
	title="Table — URL-driven, server-rendered"
	description="A server-rendered table whose filters and page number live in the URL, with crawlable pagination links."
/>

<section class="flex flex-col gap-3">
	<h1 class="text-xl font-semibold tracking-tight">Table — URL-driven, server-rendered</h1>
	<p class="text-sm text-muted-foreground">
		The plain <code>DataTable</code> fed by the loader — no subscription, no client fetch. Filters
		and page are query params, the paginator renders real
		<code>&lt;a href&gt;</code> links with <code>rel="prev"/"next"</code>, and the whole thing works
		with JavaScript disabled. Try it: change a filter, hit back, copy the URL.
	</p>

	{#if data.isSearch}
		<p class="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
			Searching. Convex search indexes are paginate-only, so there is no result total and no page
			numbers here — but previous and next are both real links. The trail of cursors that got you
			here rides along in the URL, so back works, reload works, and the address is still shareable.
			Clear the search to get numbered pages again.
		</p>
	{/if}

	<DataTable
		data={data.catalog.page}
		columns={testRowColumns}
		getRowId={(row) => row._id}
		page={data.position}
		sortColumn={data.sort.column}
		sortDirection={data.sort.direction}
		sortHref={(columnId) => sortHref(pageState.url, columnId, data.sort)}
		{totalPages}
		canGoNext={!data.catalog.isDone}
		pageHref={catalogHref}
		hasResult
	>
		{#snippet filters()}
			<!--
				A real GET form, so this works before hydration and with JavaScript disabled: the
				browser submits it natively and the loader reads the params. With JS, the handlers
				below intercept and apply changes the moment you make them — the Apply button is
				the no-JS fallback and is dropped once hydrated.
			-->
			<form
				method="GET"
				class="flex flex-wrap items-end gap-2"
				onchange={onFilterChange}
				onsubmit={(event) => {
					event.preventDefault();
					apply(event.currentTarget);
				}}
			>
				<label class="flex flex-col gap-1 text-xs">
					<span class="text-muted-foreground">Search</span>
					<input
						type="search"
						name="q"
						value={data.filters.search ?? ''}
						placeholder="Search names…"
						oninput={onSearchInput}
						class="h-9 rounded-md border border-input bg-background px-3 text-sm"
					/>
				</label>
				<label class="flex flex-col gap-1 text-xs">
					<span class="text-muted-foreground">Role</span>
					<select name="role" class="h-9 rounded-md border border-input bg-background px-2 text-sm">
						<option value="">Any</option>
						{#each ROLES as role (role)}
							<option value={role} selected={data.filters.role === role}>{role}</option>
						{/each}
					</select>
				</label>
				<label class="flex flex-col gap-1 text-xs">
					<span class="text-muted-foreground">Plan</span>
					<select name="plan" class="h-9 rounded-md border border-input bg-background px-2 text-sm">
						<option value="">Any</option>
						{#each PLANS as plan (plan)}
							<option value={plan} selected={data.filters.plan === plan}>{plan}</option>
						{/each}
					</select>
				</label>

				{#if !browser}
					<!-- No-JS only: with JS the handlers above apply changes as you make them. -->
					<button type="submit" class={cn(buttonVariants({ size: 'sm' }), 'h-9')}>Apply</button>
				{/if}
				<a
					href={pageState.url.pathname}
					class={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'h-9')}
				>
					Reset
				</a>
			</form>
		{/snippet}
	</DataTable>
</section>
