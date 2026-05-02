<script lang="ts">
	// LIBRARIES
	import { api } from '@/convex/_generated/api';

	// COMPONENTS
	import Section from '@/shared/components/ui/section/section.svelte';
	import DataTable from '@/shared/components/ui/data-table/data-table.svelte';

	// CONFIG
	import { fillRoutePattern, UNPROTECTED_PAGE_ENDPOINTS } from '@/shared/constants.js';

	// TYPES
	import type { ColumnDef, DataTableCellSnippetProps } from '@/shared/components/ui/data-table/types.js';
	import type { Doc } from '@/convex/_generated/dataModel';

	type FileRow = Doc<'uploadedFiles'>;

	const filesQuery = api.storage.uploadedFiles.fetchUploadedFiles;

	const columns: ColumnDef<FileRow>[] = [
		{
			id: 'storageId',
			header: 'Storage ID',
			accessor: (r) => r.storageId,
			hideBelow: 'md',
			linkHref: (r) =>
				fillRoutePattern(UNPROTECTED_PAGE_ENDPOINTS.UPLOADED_FILES, { id: r._id })
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
			hideBelow: 'lg'
		}
	];
</script>

{#snippet urlCell({ value }: DataTableCellSnippetProps<FileRow>)}
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

<Section yPadding="md" containerClass="flex w-full max-w-5xl flex-col gap-6">
	<header class="flex max-w-2xl flex-col gap-1">
		<h1 class="text-2xl font-semibold tracking-tight">Uploaded files</h1>
		<p class="text-muted-foreground text-sm">
			Responsive table backed by Convex <code class="text-foreground text-xs">fetchUploadedFiles</code>.
		</p>
	</header>

	<DataTable
		caption="Uploaded files"
		query={filesQuery}
		{columns}
		getRowId={(r) => r._id}
		customCells={{ url: urlCell }}
		controlsPlace="top"
		selectable={true}
		deleteMutation={api.storage.uploadedFiles.deleteUploadedFile}
	/>
</Section>
