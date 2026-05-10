<script lang="ts">
	// LIBRARIES
	import { api } from '@/convex/_generated/api';

	// COMPONENTS
	import Section from '@/shared/components/ui/section/section.svelte';
	import DataTable from '@/shared/components/ui/data-table/data-table.svelte';

	// CONFIG
	import { fillRoutePattern, UNPROTECTED_PAGE_ENDPOINTS } from '@/shared/constants.js';
	import { FEATURES } from '@/convex/features';

	// TYPES
	import type { ColumnDef, DataTableCellSnippetProps } from '@/shared/components/ui/data-table/types.js';
	import type { Doc } from '@/convex/_generated/dataModel';

	type R2Row = Doc<'uploadedFilesR2'>;
	type StorageRow = Doc<'uploadedFiles'>;
	type TestRow = Doc<'testRows'>;

	const testColumns: ColumnDef<TestRow>[] = [
		{
			id: 'name',
			header: 'Name',
			accessor: (r) => r.name,
			sortable: true
		},
		{
			id: 'email',
			header: 'Email',
			accessor: (r) => r.email,
			hideBelow: 'md'
		},
		{
			id: 'role',
			header: 'Role',
			accessor: (r) => r.role,
			hideBelow: 'md'
		},
		{
			id: 'plan',
			header: 'Plan',
			accessor: (r) => r.plan,
			hideBelow: 'lg'
		},
		{
			id: 'created',
			header: 'Created',
			accessor: (r) => new Date(r._creationTime).toLocaleString(),
			hideBelow: 'lg',
			sortable: true
		}
	];

	const r2Columns: ColumnDef<R2Row>[] = [
		{
			id: 'key',
			header: 'R2 Key',
			accessor: (r) => r.key,
			hideBelow: 'md',
			linkHref: (r) => fillRoutePattern(UNPROTECTED_PAGE_ENDPOINTS.UPLOADED_FILES, { id: r._id })
		},
		{
			id: 'url',
			header: 'URL',
			accessor: (r) => r.url,
			cellClass: 'max-w-[12rem] md:max-w-md lg:max-w-xl',
			hasCopy: true
		},
		{
			id: 'created',
			header: 'Created',
			accessor: (r) => new Date(r._creationTime).toLocaleString(),
			hideBelow: 'lg',
			sortable: true
		}
	];

	const storageColumns: ColumnDef<StorageRow>[] = [
		{
			id: 'storageId',
			header: 'Storage ID',
			accessor: (r) => r.storageId,
			hideBelow: 'md',
			linkHref: (r) => fillRoutePattern(UNPROTECTED_PAGE_ENDPOINTS.UPLOADED_FILES, { id: r._id })
		},
		{
			id: 'url',
			header: 'URL',
			accessor: (r) => r.url,
			cellClass: 'max-w-[12rem] md:max-w-md lg:max-w-xl',
			hasCopy: true
		},
		{
			id: 'created',
			header: 'Created',
			accessor: (r) => new Date(r._creationTime).toLocaleString(),
			hideBelow: 'lg',
			sortable: true
		}
	];
</script>

{#snippet urlAnchor(value: unknown)}
	<a
		href={String(value)}
		title={String(value)}
		class="text-primary font-medium underline-offset-2 hover:underline"
		target="_blank"
		rel="noreferrer"
	>
		{String(value)}
	</a>
{/snippet}

{#snippet r2UrlCell({ value }: DataTableCellSnippetProps<R2Row>)}
	{@render urlAnchor(value)}
{/snippet}

{#snippet storageUrlCell({ value }: DataTableCellSnippetProps<StorageRow>)}
	{@render urlAnchor(value)}
{/snippet}

<Section yPadding="md" containerClass="flex w-full max-w-5xl flex-col gap-6">
	<header class="flex max-w-2xl flex-col gap-1">
		<h1 class="text-2xl font-semibold tracking-tight">Uploaded files</h1>
		<p class="text-muted-foreground text-sm">
			Responsive table backed by
			{#if FEATURES.USE_R2}
				R2 <code class="text-foreground text-xs">fetchUploadedFilesR2</code>.
			{:else}
				Convex <code class="text-foreground text-xs">fetchUploadedFiles</code>.
			{/if}
		</p>
	</header>

	{#if FEATURES.USE_R2}
		<DataTable
			caption="Uploaded files"
			query={api.storage.r2.uploadedFilesR2.fetchUploadedFilesR2}
			columns={r2Columns}
			getRowId={(r) => r._id}
			customCells={{ url: r2UrlCell }}
			controlsPlace="top"
			selectable={true}
			deleteMutation={api.storage.r2.uploadedFilesR2.deleteUploadedFileR2}
		/>
	{:else}
		<DataTable
			caption="Uploaded files"
			query={api.storage.convexStorage.uploadedFiles.fetchUploadedFiles}
			columns={storageColumns}
			getRowId={(r) => r._id}
			customCells={{ url: storageUrlCell }}
			controlsPlace="top"
			selectable={true}
			deleteMutation={api.storage.convexStorage.uploadedFiles.deleteUploadedFile}
		/>
	{/if}

	<header class="flex max-w-2xl flex-col gap-1 pt-8">
		<h2 class="text-xl font-semibold tracking-tight">Test rows</h2>
		<p class="text-muted-foreground text-sm">
			Searchable + sortable table backed by
			<code class="text-foreground text-xs">fetchTestRows</code>. Type in the box to
			run a full-text search on <code class="text-foreground text-xs">name</code>;
			click Name or Created to sort.
		</p>
	</header>

	<DataTable
		caption="Test rows"
		query={api.tables.test.testQueries.fetchTestRows}
		columns={testColumns}
		getRowId={(r) => r._id}
		controlsPlace="top"
		searchable={true}
		searchPlaceholder="Search by name…"
	/>
</Section>
