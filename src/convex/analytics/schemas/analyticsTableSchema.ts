// LIBRARIES
import { defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * Raw append-only analytics events.
 *
 * These rows answer "what happened?". Dashboard reads should prefer aggregate
 * metric tables once a metric exists; raw events are kept for debugging,
 * backfills, and future metrics.
 */
export const analyticsEventTable = defineTable({
	name: v.string(),
	occurredAt: v.number(),
	actorId: v.optional(v.string()),
	organizationId: v.optional(v.string()),
	subject: v.optional(
		v.object({
			type: v.string(),
			id: v.string()
		})
	),
	properties: v.optional(v.any()),
	source: v.optional(
		v.object({
			type: v.union(
				v.literal('server'),
				v.literal('client'),
				v.literal('webhook'),
				v.literal('system')
			),
			name: v.optional(v.string())
		})
	),
	idempotencyKey: v.optional(v.string()),
	/**
	 * High-volume metrics are aggregated by a scheduled batch processor instead
	 * of during the event-write mutation. Events with no high-volume metric use
	 * `"none"` so retention can delete them normally.
	 */
	highVolumeStatus: v.optional(
		v.union(v.literal('none'), v.literal('pending'), v.literal('processed'))
	),
	highVolumeAggregatedAt: v.optional(v.number())
})
	.index('by_name_occurred_at', ['name', 'occurredAt'])
	.index('by_occurred_at', ['occurredAt'])
	.index('by_high_volume_status_occurred_at', ['highVolumeStatus', 'occurredAt'])
	.index('by_actor_occurred_at', ['actorId', 'occurredAt'])
	.index('by_organization_occurred_at', ['organizationId', 'occurredAt'])
	.index('by_idempotency_key', ['idempotencyKey']);

/**
 * Daily rollups derived from analytics events.
 *
 * This table is intentionally optimized for dashboard reads, not for storing
 * event history. Each raw event can update multiple aggregate rows:
 *
 * - a total row, where `dimensionKey` and `dimensionValue` are `"__total"`
 * - one row per configured dimension, e.g. `dimensionKey: "plan"`,
 *   `dimensionValue: "pro"`
 * - one row per scope, e.g. global, organization, and optionally a resource
 *   subject such as `product:abc123`
 *
 * The total row lets `summary()` and ungrouped `timeSeries()` answer questions
 * like "how many uploads happened per day?" without scanning raw events or
 * adding special nullable fields/indexes.
 *
 * `scopeId: "__global"` is the stable id for global rollups. We keep global
 * and organization rows in the same table/index so reads can use the exact same
 * access pattern regardless of scope.
 *
 * Keeping `dimensionKey`, `dimensionValue`, and `scopeId` non-optional gives us
 * one reusable index for totals and grouped breakdowns. The tradeoff is a little
 * extra write work per event, but dashboard reads stay cheap, predictable, and
 * independent from raw event volume.
 *
 * `shard` spreads writes for medium/high traffic modes. Low traffic mode writes
 * shard `0`; medium/high traffic modes choose one of several shard rows for the
 * same metric/day/scope/dimension. Reads sum all matching shard rows, so the
 * query API does not change when traffic mode changes.
 */
export const analyticsDailyMetricTable = defineTable({
	metric: v.string(),
	granularity: v.literal('day'),
	bucketStart: v.number(),
	scopeType: v.union(v.literal('global'), v.literal('organization'), v.literal('resource')),
	scopeId: v.string(),
	dimensionKey: v.string(),
	dimensionValue: v.string(),
	shard: v.optional(v.number()),
	value: v.number(),
	updatedAt: v.number()
})
	.index('by_metric_scope_dimension_bucket', [
		'metric',
		'scopeType',
		'scopeId',
		'granularity',
		'dimensionKey',
		'bucketStart'
	])
	.index('by_metric_scope_dimension_value_bucket_shard', [
		'metric',
		'scopeType',
		'scopeId',
		'granularity',
		'dimensionKey',
		'dimensionValue',
		'bucketStart',
		'shard'
	]);
