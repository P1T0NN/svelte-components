// LIBRARIES
import type { Crons } from 'convex/server';

// CONFIG
import { analyticsSettings } from './analyticsSettings';

// TYPES
import type { internal } from '../_generated/api';

type InternalApi = typeof internal;

export function registerAnalyticsCrons(crons: Crons, internalApi: InternalApi) {
	/**
	 * High-volume analytics aggregation. Low/medium metrics are rolled up near the
	 * emitting mutation; high-volume metrics are processed in bounded batches.
	 */
	crons.interval(
		'process high-volume analytics events',
		{ minutes: analyticsSettings.highVolumeBatchIntervalMinutes },
		internalApi.analytics.crons.analyticsCron.processPendingHighVolumeAnalyticsEvents,
		{}
	);

	/**
	 * Analytics raw-event retention. Rollup rows stay; old raw events are purged
	 * after the analytics retention window so the append-only event table remains
	 * bounded.
	 */
	crons.daily(
		'purge stale analytics events',
		{ hourUTC: 4, minuteUTC: 15 },
		internalApi.analytics.crons.analyticsCron.purgeStaleAnalyticsEvents,
		{}
	);
}
