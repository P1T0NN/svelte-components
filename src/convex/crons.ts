// LIBRARIES
import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';
import { analyticsSettings } from './analytics/analyticsSettings';

/**
 * Scheduled jobs. Convex requires this file at the convex root, default-exporting
 * the registry.
 */

const crons = cronJobs();

/**
 * Storage cleanup. Safety net for the manual-delete cases the upload pipeline
 * can't catch (rows deleted via the Convex dashboard, blobs deleted via the Cloudflare
 * R2 / Convex storage UIs). Daily is plenty for a safety net; tighten if humans
 * actually mess with the stores often. Staggered so the two sweeps don't fight for
 * the same mutation slot.
 */
crons.daily(
	'cleanup R2 and uploadedFilesR2',
	{ hourUTC: 3, minuteUTC: 0 },
	internal.storage.crons.cleanupOrphanDataR2.cleanupOrphanDataR2
);

crons.daily(
	'cleanup convex storage and uploadedFiles',
	{ hourUTC: 3, minuteUTC: 15 },
	internal.storage.crons.cleanupOrphanDataConvexStorage.cleanupOrphanDataConvexStorage
);

/**
 * Audit-log retention. No-op when `FEATURES.AUDIT_LOGS` is off (table will just
 * be empty). Per-action retention is configured in `tables/auditLog/auditLogActions.ts`.
 */
crons.daily(
	'purge stale audit logs',
	{ hourUTC: 4, minuteUTC: 0 },
	internal.tables.auditLog.crons.auditLogCron.purgeStaleAuditLogs,
	{}
);

/**
 * High-volume analytics aggregation. Low/medium metrics are rolled up near the
 * emitting mutation; high-volume metrics are processed in bounded batches.
 */
crons.interval(
	'process high-volume analytics events',
	{ minutes: analyticsSettings.highVolumeBatchIntervalMinutes },
	internal.analytics.crons.analyticsCron.processPendingHighVolumeAnalyticsEvents,
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
	internal.analytics.crons.analyticsCron.purgeStaleAnalyticsEvents,
	{}
);

export default crons;
