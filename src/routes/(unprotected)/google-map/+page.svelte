<script lang="ts">
	// COMPONENTS
	import Section from '@/shared/components/ui/section/section.svelte';
	import GoogleMap from '@/shared/components/ui/google-map/google-map.svelte';
	import CustomMarker from '@/shared/components/ui/google-map/custom-marker.svelte';

	// ICONS
	import XIcon from '@lucide/svelte/icons/x';

	// DATA
	import { mapMarkers, stressMapMarkers, type DemoLocation } from './dummyMapMarkersData.js';

	// TYPES
	import type {
		GoogleMapClusterOptions,
		GoogleMapFitBoundsOptions
	} from '@/shared/components/ui/google-map/types.js';

	const mapFitBounds: GoogleMapFitBoundsOptions = {
		padding: 64,
		maxZoom: 14
	};

	// Stable reference: an inline object would rebuild the clusterer on every render.
	// A bigger radius clusters more aggressively, so fewer individual markers render.
	const clusterOptions: GoogleMapClusterOptions = {
		algorithmOptions: { radius: 100, maxZoom: 16 }
	};

	let stressTest = $state(false);

	const markers = $derived(stressTest ? stressMapMarkers : mapMarkers);

	let selectedId = $state<DemoLocation['id'] | null>(null);

	const selected = $derived(markers.find((location) => location.id === selectedId));
</script>

<Section yPadding="md" containerClass="flex flex-col items-start gap-8">
	<header class="flex max-w-2xl flex-col gap-1">
		<h1 class="text-2xl font-semibold tracking-tight">Google Map</h1>
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

	<div class="w-full">
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
								<p class="mt-0.5 text-sm text-muted-foreground capitalize">{selected.category}</p>
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
	</div>

	<p class="text-sm text-muted-foreground">
		Showing {markers.length} marker{markers.length === 1 ? '' : 's'}. Click one for details.
	</p>
</Section>
