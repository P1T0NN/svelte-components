// TYPES
import type { GoogleMapMarkerData } from '@/shared/components/ui/google-map/types.js';

export type DemoLocation = GoogleMapMarkerData & {
	category: 'landmark' | 'museum' | 'park' | 'lake';
	price: number;
};

/** Curated Zagreb landmarks for the default demo. */
export const mapMarkers: readonly DemoLocation[] = [
	{
		id: 'ban-jelacic-square',
		lat: 45.8131,
		lng: 15.9775,
		title: 'Ban Jelačić Square',
		category: 'landmark',
		price: 89
	},
	{
		id: 'zagreb-cathedral',
		lat: 45.8144,
		lng: 15.9797,
		title: 'Zagreb Cathedral',
		category: 'landmark',
		price: 120
	},
	{
		id: 'museum-broken-relationships',
		lat: 45.8152,
		lng: 15.9736,
		title: 'Museum of Broken Relationships',
		category: 'museum',
		price: 65
	},
	{
		id: 'maksimir-park',
		lat: 45.8294,
		lng: 16.0194,
		title: 'Maksimir Park',
		category: 'park',
		price: 45
	},
	{
		id: 'jarun-lake',
		lat: 45.7833,
		lng: 15.9167,
		title: 'Jarun Lake',
		category: 'lake',
		price: 70
	}
];

const STRESS_MARKER_COUNT = 1000;
const STRESS_CATEGORIES: readonly DemoLocation['category'][] = [
	'landmark',
	'museum',
	'park',
	'lake'
];

// Deterministic GLSL-style hash so generated positions stay stable across reloads
// and HMR. Stable IDs + coordinates are what let the controller reconcile instead
// of rebuilding every marker.
function pseudoRandom(seed: number): number {
	return Math.abs(Math.sin(seed) * 43758.5453) % 1;
}

function createStressMarkers(count: number): readonly DemoLocation[] {
	const center = { lat: 45.815, lng: 15.9819 };
	const spread = 0.14;
	const markers: DemoLocation[] = [];

	for (let index = 0; index < count; index++) {
		const latNoise = pseudoRandom(index * 12.9898);
		const lngNoise = pseudoRandom(index * 78.233);

		markers.push({
			id: `stress-${index}`,
			lat: center.lat + (latNoise - 0.5) * spread,
			lng: center.lng + (lngNoise - 0.5) * spread,
			title: `Listing #${index + 1}`,
			category: STRESS_CATEGORIES[index % STRESS_CATEGORIES.length] ?? 'landmark',
			price: 40 + Math.round(latNoise * 460)
		});
	}

	return markers;
}

/** 1000 generated markers for clustering / performance stress testing. */
export const stressMapMarkers: readonly DemoLocation[] = createStressMarkers(STRESS_MARKER_COUNT);
