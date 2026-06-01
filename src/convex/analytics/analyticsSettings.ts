// TYPES
import type { AnalyticsTrafficMode } from './types/analyticsTypes';

export const ANALYTICS_TRAFFIC_MODE = {
	/**
	 * Best for prototypes, admin panels, internal tools, and small SaaS apps.
	 *
	 * Write behavior: each metric/day/scope/dimension updates one rollup row.
	 * Read behavior: dashboard queries read the fewest aggregate rows.
	 *
	 * Start here when analytics writes are comfortably below ~1-5 events/second
	 * sustained, bursts stay below ~25 events/second, and you have fewer than
	 * ~50 concurrently active users producing tracked events.
	 *
	 * Move to `mediumVolume` when the same metric/dimension receives frequent
	 * concurrent writes, e.g. popular events like `feature.used` are emitted by
	 * many users at once and you start seeing hot aggregate rows or mutation
	 * retries around analytics writes.
	 */
	LOW_VOLUME: 'lowVolume',

	/**
	 * Best default for reusable app templates and normal production SaaS apps.
	 *
	 * Write behavior: each metric/day/scope/dimension updates one of several
	 * shard rows. This spreads concurrent writes across multiple documents while
	 * preserving near-real-time dashboards.
	 *
	 * Read behavior: dashboard queries sum shard rows. Reads are still cheap
	 * because row count scales with buckets/dimensions/shards, not raw events.
	 *
	 * Switch here around ~5-50 analytics events/second sustained, bursts around
	 * ~100-300 events/second, or ~50-1,000 concurrently active users producing
	 * tracked events. This is also a good default if you are unsure, because the
	 * extra read work is small for typical dashboard date ranges.
	 *
	 * Move to `highVolume` when a few very hot metrics still receive enough
	 * concurrent writes that 16 shards are not enough, or when bursts are common
	 * during launches, imports, webhooks, or large tenant activity.
	 */
	MEDIUM_VOLUME: 'mediumVolume',

	/**
	 * Best for noisy product events, large tenants, webhook-heavy systems, and apps
	 * where analytics writes can spike hard.
	 *
	 * Write behavior: raw events are inserted and marked for batched rollup. A
	 * scheduled processor groups many events together and updates each rollup row
	 * once per batch/shard instead of once per event. Dashboards can lag behind raw
	 * events by the cron interval, but product mutations stay protected from heavy
	 * analytics aggregation work.
	 *
	 * Switch here around 50+ analytics events/second sustained, bursts above
	 * ~300 events/second, or 1,000+ concurrently active users producing tracked
	 * events. Also use this for a single very hot metric even if the rest of the
	 * app is lower volume by setting `trafficMode` on that metric.
	 */
	HIGH_VOLUME: 'highVolume'
} as const satisfies Record<string, AnalyticsTrafficMode>;

export const analyticsSettings = {
	/**
	 * Global default for future projects.
	 *
	 * `mediumVolume` is the safest reusable-template default: low-traffic apps pay
	 * only a small extra read cost, while medium SaaS apps avoid common hot-row
	 * contention from day one. Individual metrics can still override this with
	 * `trafficMode` in `analyticsMetricRegistry`.
	 */
	trafficMode: ANALYTICS_TRAFFIC_MODE.MEDIUM_VOLUME,

	/**
	 * Shard count for `mediumVolume`.
	 *
	 * 16 is enough for most app dashboards because writes spread across 16 rows
	 * while reads only sum up to 16 rows per metric/day/dimension value.
	 */
	mediumVolumeShardCount: 16,

	/**
	 * Shard count for `highVolume`.
	 *
	 * 64 gives high-volume batches enough write fan-out for hot metrics. Increase
	 * only when needed, because every extra shard is another row dashboard reads may
	 * sum.
	 */
	highVolumeShardCount: 64,

	/**
	 * Maximum raw events processed by one high-volume batch mutation.
	 *
	 * Raise this when the backlog grows faster than the cron can drain it. Lower it
	 * if a single batch starts approaching Convex function limits because a metric
	 * has many dimensions, scopes, or high-cardinality values.
	 */
	highVolumeBatchSize: 500,

	/**
	 * Cron cadence for high-volume aggregation.
	 *
	 * One minute keeps dashboards close to realtime while still batching noisy
	 * events. The processor schedules another immediate batch when it fills this
	 * batch size, so it can catch up after traffic spikes.
	 */
	highVolumeBatchIntervalMinutes: 1,

	/**
	 * Maximum immediate catch-up batches after one cron tick.
	 *
	 * This lets high-volume projects drain spikes quickly without creating an
	 * unbounded background loop if a project receives more analytics traffic than
	 * the current Convex deployment should handle.
	 */
	highVolumeMaxCatchupBatches: 20,

	/**
	 * Maximum inclusive day range accepted by analytics dashboard queries.
	 *
	 * Daily rollups are cheap, but unbounded date ranges are still a bad API for
	 * reusable templates. One year covers normal dashboards while preventing a
	 * mistaken "all time" query from loading years of shards and dimensions.
	 */
	maxQueryRangeDays: 366,

	/**
	 * Hard cap for aggregate rows read by a single query.
	 *
	 * If this is hit, the query should be narrowed by date range, scope, or
	 * dimension design. This protects Convex function memory and dashboard
	 * response size when a metric/dimension becomes too cardinal.
	 */
	maxRollupRowsPerQuery: 5_000,

	/**
	 * Maximum dimension values returned by grouped chart queries.
	 *
	 * Charts are not useful with hundreds of series. Keep dimensions low-cardinal
	 * and use this cap to return the largest values predictably.
	 */
	maxBreakdownItems: 25,

	/**
	 * Raw event retention window.
	 *
	 * Rollup rows stay indefinitely because they power dashboards. Raw events are
	 * only needed for debugging and backfills, so keeping them forever makes the
	 * table grow without improving normal analytics reads.
	 */
	rawEventRetentionDays: 90,

	/**
	 * Maximum raw analytics events deleted by the retention cron per run.
	 *
	 * This keeps cleanup bounded if a project was offline or retention was added
	 * after a backlog already existed.
	 */
	maxRawEventDeletesPerRun: 5_000
} as const;
