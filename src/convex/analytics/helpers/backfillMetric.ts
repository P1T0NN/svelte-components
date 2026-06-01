// LIBRARIES
import { ConvexError, v } from 'convex/values';

// CONFIG
import { mutation } from '@/convex/_generated/server';
import { requireAdmin } from '@/convex/auth/middleware/authMiddleware';
import { analyticsMetricNameValidator, analyticsMetricRegistry } from '../analyticsConfigs';

// HELPERS
import { upsertMetricRollupForEvent } from './aggregateEvent';

// TYPES
import type { Doc } from '@/convex/_generated/dataModel';
import type {
	AnalyticsAggregateEventInput,
	AnalyticsEventName,
	AnalyticsMetricName
} from '../types/analyticsTypes';

/**
 * Paginated backfill: replay raw events into a single metric's rollup rows.
 *
 * Run this once after adding a new metric to `analyticsMetricRegistry`.
 * Callers must ensure the metric does not already have rollup data before
 * starting — see `resetAnalyticsMetric` if a re-backfill is needed.
 *
 * Usage (from Convex dashboard or admin script):
 *   1. Call with `{ metric: "featureUsage" }` — processes the first batch.
 *   2. If `isComplete` is false, call again with `{ metric, cursor }`.
 *   3. Repeat until `isComplete` is true.
 */
export const backfillAnalyticsMetric = mutation({
	args: {
		metric: analyticsMetricNameValidator,
		cursor: v.optional(v.string()),
		batchSize: v.optional(v.number())
	},
	returns: v.object({
		cursor: v.optional(v.string()),
		processed: v.number(),
		isComplete: v.boolean()
	}),
	handler: async (ctx, args) => {
		await requireAdmin(ctx);

		const config = analyticsMetricRegistry[args.metric as AnalyticsMetricName];
		if (!config) {
			throw new ConvexError({
				code: 'BAD_REQUEST',
				message: `Unknown analytics metric "${args.metric}".`
			});
		}

		const batchSize = args.batchSize ?? 200;

		// Safety check on first call: abort if metric already has rollup data.
		if (!args.cursor) {
			const existing = await ctx.db
				.query('analyticsDailyMetrics')
				.withIndex('by_metric_scope_dimension_bucket', (q) => q.eq('metric', args.metric))
				.first();

			if (existing) {
				throw new ConvexError({
					code: 'CONFLICT',
					message:
						`Metric "${args.metric}" already has rollup data. ` +
						'Run resetAnalyticsMetric first if you need to re-backfill.'
				});
			}
		}

		// Walk all analytics events ordered by creation time. We filter to
		// matching event names in application code because a metric can match
		// multiple event names and Convex index pagination is scoped to a single
		// equality filter.
		const page = await ctx.db
			.query('analyticsEvents')
			.order('desc')
			.paginate({ cursor: args.cursor ?? null, numItems: batchSize });

		let processed = 0;

		for (const raw of page.page) {
			const event = raw as Doc<'analyticsEvents'>;
			if (!(config.eventNames as readonly string[]).includes(event.name)) continue;

			processed += 1;

			await upsertMetricRollupForEvent(
				ctx,
				{
					eventId: event._id,
					name: event.name as AnalyticsEventName,
					occurredAt: event.occurredAt,
					actorId: event.actorId,
					organizationId: event.organizationId,
					subject: event.subject,
					properties: (event.properties ?? {}) as AnalyticsAggregateEventInput['properties']
				},
				args.metric as AnalyticsMetricName,
				config
			);
		}

		return {
			cursor: page.continueCursor,
			processed,
			isComplete: page.isDone
		};
	}
});

/**
 * Delete all daily rollup rows for a single metric.
 *
 * Use before re-running `backfillAnalyticsMetric` when a metric's rollup data
 * needs to be rebuilt from scratch.
 *
 * Usage: same paginated pattern as `backfillAnalyticsMetric`.
 */
export const resetAnalyticsMetric = mutation({
	args: {
		metric: analyticsMetricNameValidator,
		cursor: v.optional(v.string()),
		batchSize: v.optional(v.number())
	},
	returns: v.object({
		cursor: v.optional(v.string()),
		deleted: v.number(),
		isComplete: v.boolean()
	}),
	handler: async (ctx, args) => {
		await requireAdmin(ctx);

		const batchSize = args.batchSize ?? 200;

		const page = await ctx.db
			.query('analyticsDailyMetrics')
			.withIndex('by_metric_scope_dimension_bucket', (q) => q.eq('metric', args.metric))
			.paginate({ cursor: args.cursor ?? null, numItems: batchSize });

		let deleted = 0;

		for (const row of page.page) {
			await ctx.db.delete(row._id);
			deleted += 1;
		}

		return {
			cursor: page.continueCursor,
			deleted,
			isComplete: page.isDone
		};
	}
});
