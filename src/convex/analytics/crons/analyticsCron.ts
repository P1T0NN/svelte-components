// LIBRARIES
import { v } from 'convex/values';

// CONFIG
import { internal } from '@/convex/_generated/api';
import { internalMutation } from '@/convex/_generated/server';
import { analyticsSettings } from '../analyticsSettings';

// HELPERS
import { aggregateHighVolumeAnalyticsEventBatch } from '../helpers/aggregateEvent';

// UTILS
import { DAY_MS } from '../utils/analyticsDateUtils';

// TYPES
import type { Doc } from '@/convex/_generated/dataModel';
import type {
	AnalyticsAggregateEventInput,
	AnalyticsEventName
} from '../types/analyticsTypes';

function _toAggregateInput(event: Doc<'analyticsEvents'>): AnalyticsAggregateEventInput {
	return {
		eventId: event._id,
		name: event.name as AnalyticsEventName,
		occurredAt: event.occurredAt,
		actorId: event.actorId,
		organizationId: event.organizationId,
		subject: event.subject,
		properties: (event.properties ?? {}) as AnalyticsAggregateEventInput['properties']
	};
}

/**
 * Process high-volume analytics events in batches.
 *
 * This is intentionally separate from `writeAnalyticsEvent`: high-volume metrics
 * should not make product mutations wait for aggregate rollups. The batch groups
 * many raw events into rollup increments first, then writes each unique rollup
 * row once for the whole batch.
 */
export const processPendingHighVolumeAnalyticsEvents = internalMutation({
	args: {
		remainingCatchupBatches: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		const batchSize = analyticsSettings.highVolumeBatchSize;
		const remainingCatchupBatches =
			args.remainingCatchupBatches ?? analyticsSettings.highVolumeMaxCatchupBatches;
		const pendingEvents = await ctx.db
			.query('analyticsEvents')
			.withIndex('by_high_volume_status_occurred_at', (q) =>
				q.eq('highVolumeStatus', 'pending')
			)
			.take(batchSize);

		if (pendingEvents.length === 0) {
			return {
				processed: 0,
				scheduledNextBatch: false
			};
		}

		await aggregateHighVolumeAnalyticsEventBatch(ctx, pendingEvents.map(_toAggregateInput));

		const now = Date.now();
		for (const event of pendingEvents) {
			await ctx.db.patch(event._id, {
				highVolumeStatus: 'processed',
				highVolumeAggregatedAt: now
			});
		}

		const shouldContinue = pendingEvents.length === batchSize && remainingCatchupBatches > 0;

		if (shouldContinue) {
			await ctx.scheduler.runAfter(
				0,
				internal.analytics.crons.analyticsCron.processPendingHighVolumeAnalyticsEvents,
				{ remainingCatchupBatches: remainingCatchupBatches - 1 }
			);
		}

		return {
			processed: pendingEvents.length,
			scheduledNextBatch: shouldContinue
		};
	}
});

/**
 * Raw event retention sweep.
 *
 * Daily metric rollups are the production analytics read model and are kept
 * indefinitely. Raw events are retained only for debugging and backfills, then
 * deleted so the append-only event table does not grow forever.
 */
export const purgeStaleAnalyticsEvents = internalMutation({
	args: {},
	handler: async (ctx) => {
		if (analyticsSettings.rawEventRetentionDays <= 0) {
			return { deleted: 0, skipped: true };
		}

		const cutoff = Date.now() - analyticsSettings.rawEventRetentionDays * DAY_MS;
		const rows = await ctx.db
			.query('analyticsEvents')
			.withIndex('by_occurred_at', (q) => q.lt('occurredAt', cutoff))
			.take(analyticsSettings.maxRawEventDeletesPerRun);

		for (const row of rows) {
			if (row.highVolumeStatus === 'pending') continue;
			await ctx.db.delete(row._id);
		}

		return {
			deleted: rows.filter((row) => row.highVolumeStatus !== 'pending').length,
			cutoff,
			skipped: false
		};
	}
});
