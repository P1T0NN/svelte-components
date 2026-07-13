<script lang="ts">
	// LIBRARIES
	import { z } from 'zod';
	import { api } from '@/convex/_generated/api';
	import { m } from '@/shared/lib/paraglide/messages';

	// CONFIG
	import { fillRoutePattern, UNPROTECTED_PAGE_ENDPOINTS } from '@/shared/constants.js';
	import { FEATURES } from '@/convex/projectSettings';

	// COMPONENTS
	import Section from '@/shared/components/ui/section/section.svelte';
	import { NativeCarousel } from '@/shared/components/ui/native-carousel/index.js';
	import { NativeTooltip } from '@/shared/components/ui/native-tooltip/index.js';
	import { Button } from '@/shared/components/ui/button/index.js';
	import GoogleMap from '@/shared/components/ui/google-map/google-map.svelte';
	import CustomMarker from '@/shared/components/ui/google-map/custom-marker.svelte';
	import MutationForm from '@/shared/components/ui/mutation-form/convex-mutation-form.svelte';
	import { SearchInputRemote } from '@/shared/components/ui/search-input/index.js';
	import DataTable from '@/shared/components/ui/data-table/convex-data-table.svelte';

	// REMOTE FUNCTIONS
	import { searchInput } from '@/features/search/search.remote';

	// DATA
	import { mapMarkers, stressMapMarkers, type DemoLocation } from './dummyMapMarkersData.js';

	// ICONS
	import XIcon from '@lucide/svelte/icons/x';

	// TYPES
	import type { MutationFormSection } from '@/shared/components/ui/mutation-form/types.js';
	import type {
		GoogleMapClusterOptions,
		GoogleMapFitBoundsOptions
	} from '@/shared/components/ui/google-map/types.js';
	import type {
		SearchInputItem,
		SearchInputRemoteProps
	} from '@/shared/components/ui/search-input/types.js';
	import type { ColumnDef, DataTableCellSnippetProps } from '@/shared/components/ui/data-table/types.js';
	import type { Doc } from '@/convex/_generated/dataModel';

	type R2Row = Doc<'uploadedFilesR2'>;
	type StorageRow = Doc<'uploadedFiles'>;
	type TestRow = Doc<'testRows'>;

	// ——— Carousel ———

	const carouselSlides = [
		'bg-primary/10 text-primary',
		'bg-accent/20 text-accent-foreground',
		'bg-secondary text-secondary-foreground'
	] as const;

	// ——— Google Map ———

	const mapFitBounds: GoogleMapFitBoundsOptions = {
		padding: 64,
		maxZoom: 14
	};

	const clusterOptions: GoogleMapClusterOptions = {
		algorithmOptions: { radius: 100, maxZoom: 16 }
	};

	let stressTest = $state(false);
	const markers = $derived(stressTest ? stressMapMarkers : mapMarkers);
	let selectedId = $state<DemoLocation['id'] | null>(null);
	const selected = $derived(markers.find((location) => location.id === selectedId));

	// ——— Mutation Form ———

	const contactFormSchema = z.object({
		name: z.string().trim().min(1, 'Name is required.'),
		email: z.string().trim().min(1, 'Email is required.').email('Enter a valid email.'),
		role: z.enum(['admin', 'editor', 'viewer'], { message: 'Pick a role.' }),
		plan: z.enum(['free', 'pro', 'enterprise'], { message: 'Pick a plan.' }),
		source: z.enum(['organic', 'referral', 'paid', 'support'], { message: 'Pick a source.' }),
		message: z.string().trim().min(10, 'Message must be at least 10 characters.'),
		acceptsTerms: z.boolean().refine((v) => v === true, 'You must accept the terms.'),
		images: z.array(z.instanceof(File))
	});

	type ContactFormValues = z.infer<typeof contactFormSchema>;

	const sections: MutationFormSection[] = [
		{
			title: 'Contact',
			description: "Who you are and how we'll reach you.",
			fields: [
				{
					id: 'name',
					kind: 'input',
					label: 'Full name',
					placeholder: 'John Doe',
					autocomplete: 'name',
					autofocus: true,
					colSpan: 1
				},
				{
					id: 'email',
					kind: 'input',
					label: 'Email',
					type: 'email',
					placeholder: 'm@example.com',
					autocomplete: 'email',
					description: "We'll only use this to reply.",
					colSpan: 1
				}
			]
		},
		{
			title: 'Access',
			description: 'Pick a role and a plan for this account.',
			fields: [
				{
					id: 'role',
					kind: 'select',
					label: 'Role',
					selectPlaceholder: 'Pick a role',
					options: [
						{ value: 'admin', label: 'Admin' },
						{ value: 'editor', label: 'Editor' },
						{ value: 'viewer', label: 'Viewer' }
					],
					colSpan: 1
				},
				{
					id: 'plan',
					kind: 'radio',
					label: 'Plan',
					radioOrientation: 'horizontal',
					options: [
						{ value: 'free', label: 'Free' },
						{ value: 'pro', label: 'Pro' },
						{ value: 'enterprise', label: 'Enterprise' }
					],
					description: 'You can change this later in settings.',
					colSpan: 1
				},
				{
					id: 'source',
					kind: 'select',
					label: 'Source',
					selectPlaceholder: 'Pick a source',
					options: [
						{ value: 'organic', label: 'Organic' },
						{ value: 'referral', label: 'Referral' },
						{ value: 'paid', label: 'Paid' },
						{ value: 'support', label: 'Support' }
					],
					description: 'Used to test analytics breakdowns.',
					colSpan: 1
				}
			]
		},
		{
			title: 'Details',
			fields: [
				{
					id: 'message',
					kind: 'textarea',
					label: 'Message',
					placeholder: 'Tell us a bit about what you need…',
					rows: 5
				},
				{
					id: 'images',
					kind: 'upload-multiple',
					label: 'Images',
					accept: 'image/*',
					hasCoverImage: true,
					description: 'The starred image is stored first and used as the cover.'
				},
				{
					id: 'acceptsTerms',
					kind: 'checkbox',
					label: 'I accept the terms and conditions'
				}
			]
		}
	];

	let formValues = $state<ContactFormValues>({
		name: '',
		email: '',
		role: '' as ContactFormValues['role'],
		plan: '' as ContactFormValues['plan'],
		source: '' as ContactFormValues['source'],
		message: '',
		acceptsTerms: false,
		images: []
	});

	// ——— Search ———

	let searchValue = $state('');
	let lastSelected = $state<SearchInputItem | null>(null);

	const searchTestRows: SearchInputRemoteProps['search'] = ({ search, maxResults, cursor }) =>
		searchInput({
			source: 'testRows',
			search,
			maxResults,
			cursor
		});

	function handleSearchSelect(item: SearchInputItem) {
		lastSelected = item;
		searchValue = item.title;
	}

	// ——— Table ———

	const testColumns: ColumnDef<TestRow>[] = [
		{ id: 'name', header: 'Name', accessor: (r) => r.name, sortable: true },
		{ id: 'email', header: 'Email', accessor: (r) => r.email, hideBelow: 'md' },
		{ id: 'role', header: 'Role', accessor: (r) => r.role, hideBelow: 'md' },
		{ id: 'plan', header: 'Plan', accessor: (r) => r.plan, hideBelow: 'lg' },
		{
			id: 'source',
			header: 'Source',
			accessor: (r) => r.source ?? 'Legacy',
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
		class="font-medium text-primary underline-offset-2 hover:underline"
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

{#snippet carouselSlideOne()}
	<div
		class="flex h-48 items-center justify-center rounded-xl {carouselSlides[0]} sm:h-56"
	>
		<p class="text-lg font-medium">Slide 1 — native scroll-snap carousel</p>
	</div>
{/snippet}

{#snippet carouselSlideTwo()}
	<div
		class="flex h-48 items-center justify-center rounded-xl {carouselSlides[1]} sm:h-56"
	>
		<p class="text-lg font-medium">Slide 2 — swipe, arrows, or dots</p>
	</div>
{/snippet}

{#snippet carouselSlideThree()}
	<div
		class="flex h-48 items-center justify-center rounded-xl {carouselSlides[2]} sm:h-56"
	>
		<p class="text-lg font-medium">Slide 3 — no JavaScript required</p>
	</div>
{/snippet}

<Section yPadding="md" containerClass="flex w-full max-w-5xl flex-col gap-16">
	<header class="flex max-w-2xl flex-col gap-1">
		<h1 class="text-2xl font-semibold tracking-tight">Custom components</h1>
		<p class="text-sm text-muted-foreground">
			Live demos for reusable UI primitives built in this template.
		</p>
	</header>

	<section class="flex w-full flex-col gap-4">
		<header class="flex max-w-2xl flex-col gap-1">
			<h2 class="text-xl font-semibold tracking-tight">Carousel</h2>
			<p class="text-sm text-muted-foreground">
				Native CSS scroll-snap carousel with optional anchor-link arrows and dots.
			</p>
		</header>

		<NativeCarousel slides={[carouselSlideOne, carouselSlideTwo, carouselSlideThree]} class="w-full" />
	</section>

	<section class="flex w-full flex-col gap-4">
		<header class="flex max-w-2xl flex-col gap-1">
			<h2 class="text-xl font-semibold tracking-tight">Tooltip</h2>
			<p class="text-sm text-muted-foreground">
				Native HTML + CSS tooltip (anchor positioning + <code>:hover</code>/<code>:focus-within</code>).
				Hover or keyboard-focus a trigger. No JavaScript.
			</p>
		</header>

		<div class="flex flex-wrap items-center gap-8 py-8">
			<!-- Plain text trigger -->
			<p class="text-sm">
				Please enter your
				<NativeTooltip content="You can find your API key in the dashboard under Settings.">
					<span class="font-medium underline decoration-dotted underline-offset-2">API key</span>
				</NativeTooltip>
				to continue.
			</p>

			<!-- Button trigger, default side (top) -->
			<NativeTooltip content="Saves your changes">
				<Button size="sm">Save</Button>
			</NativeTooltip>

			<!-- Every side -->
			<NativeTooltip content="Tooltip on the right" side="right">
				<Button variant="outline" size="sm">Right</Button>
			</NativeTooltip>
			<NativeTooltip content="Tooltip on the bottom" side="bottom">
				<Button variant="outline" size="sm">Bottom</Button>
			</NativeTooltip>
			<NativeTooltip content="Tooltip on the left" side="left">
				<Button variant="outline" size="sm">Left</Button>
			</NativeTooltip>

			<!-- Rich content via snippet -->
			<NativeTooltip side="bottom">
				{#snippet content()}
					<div class="flex flex-col gap-0.5">
						<span class="font-semibold">Rich content</span>
						<span class="text-muted-foreground">Snippets work too — any markup.</span>
					</div>
				{/snippet}
				<Button variant="secondary" size="sm">Hover me</Button>
			</NativeTooltip>
		</div>
	</section>

	<section class="flex w-full flex-col gap-4">
		<header class="flex max-w-2xl flex-col gap-1">
			<h2 class="text-xl font-semibold tracking-tight">Google Map</h2>
			<p class="text-sm text-muted-foreground">
				Universal Google Maps component with custom price-tag markers. Click a tag to select it.
			</p>
		</header>

		<label class="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
			<input
				type="checkbox"
				class="accent-primary"
				checked={stressTest}
				onchange={(event) => {
					stressTest = event.currentTarget.checked;
					selectedId = null;
				}}
			/>
			Stress test — render 1000 clustered markers
		</label>

		<GoogleMap
			{markers}
			cluster={stressTest ? clusterOptions : false}
			fitBounds={mapFitBounds}
			onMarkerClick={(location) => (selectedId = location.id)}
			class="h-[500px]"
		>
			{#snippet markerContent(location, ctx)}
				<CustomMarker
					label={`€${location.price}`}
					variant={location.id === selectedId ? 'selected' : 'default'}
					compact={ctx.zoom < 14}
				/>
			{/snippet}

			{#snippet overlay()}
				{#if selected}
					<div
						class="absolute inset-x-3 bottom-3 rounded-xl border border-border bg-background/95 p-4 shadow-xl backdrop-blur"
					>
						<div class="flex items-start justify-between gap-3">
							<div>
								<h3 class="text-base font-semibold text-foreground">{selected.title}</h3>
								<p class="mt-0.5 text-sm capitalize text-muted-foreground">{selected.category}</p>
							</div>
							<button
								type="button"
								onclick={() => (selectedId = null)}
								aria-label="Close"
								class="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
							>
								<XIcon class="size-5" />
							</button>
						</div>
						<div class="mt-3 flex items-baseline gap-1">
							<span class="text-2xl font-bold text-foreground">€{selected.price}</span>
							<span class="text-sm text-muted-foreground">/ night</span>
						</div>
					</div>
				{/if}
			{/snippet}
		</GoogleMap>

		<p class="text-sm text-muted-foreground">
			Showing {markers.length} marker{markers.length === 1 ? '' : 's'}. Click one for details.
		</p>
	</section>

	<section class="flex w-full max-w-2xl flex-col gap-4">
		<header class="flex flex-col gap-1">
			<h2 class="text-xl font-semibold tracking-tight">Mutation form</h2>
			<p class="text-sm text-muted-foreground">
				Reusable form driven by a <code class="text-xs text-foreground">fields</code> config — input,
				textarea, and select kinds with shared error / description handling.
			</p>
		</header>

		<MutationForm
			{sections}
			bind:values={formValues}
			schema={contactFormSchema}
			runFunction={api.tables.test.testMutations.createTestRow}
			submitLabel="Send message"
		/>
	</section>

	<section class="flex w-full max-w-md flex-col gap-4">
		<header class="flex flex-col gap-1">
			<h2 class="text-xl font-semibold tracking-tight">{m['SearchInput.SearchPage.title']()}</h2>
			<p class="text-sm text-muted-foreground">{m['SearchInput.SearchPage.description']()}</p>
		</header>

		<SearchInputRemote
			bind:value={searchValue}
			search={searchTestRows}
			minQueryLength={1}
			maxResults={5}
			placeholder={m['SearchInput.SearchPage.placeholder']()}
			onSelect={handleSearchSelect}
		/>

		{#if lastSelected}
			<p class="text-sm text-muted-foreground">
				{m['SearchInput.SearchPage.selected']()}
				<span class="font-medium text-foreground">{lastSelected.title}</span>
				{#if lastSelected.category}
					<span class="text-muted-foreground"> - {lastSelected.category}</span>
				{/if}
			</p>
		{/if}
	</section>

	<section class="flex w-full flex-col gap-6">
		<header class="flex max-w-2xl flex-col gap-1">
			<h2 class="text-xl font-semibold tracking-tight">Data table</h2>
			<p class="text-sm text-muted-foreground">
				Responsive table backed by
				{#if FEATURES.USE_R2}
					R2 <code class="text-xs text-foreground">fetchUploadedFilesR2</code>.
				{:else}
					Convex <code class="text-xs text-foreground">fetchUploadedFiles</code>.
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

		<header class="flex max-w-2xl flex-col gap-1 pt-4">
			<h3 class="text-lg font-semibold tracking-tight">Test rows</h3>
			<p class="text-sm text-muted-foreground">
				Searchable + sortable table backed by
				<code class="text-xs text-foreground">fetchTestRows</code>.
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
	</section>
</Section>
