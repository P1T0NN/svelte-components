// CONFIG
import { internal } from '@/convex/_generated/api';

// UTILS
import {
	sanitizeAnalyticsProperties,
	validateAnalyticsEventInput
} from '../utils/analyticsValidation';

// TYPES
import type { ActionCtx, MutationCtx } from '@/convex/_generated/server';
import type {
	AnalyticsEventName,
	AnalyticsPropertyValue,
	TrackEventInput,
	TrackEventOptions
} from '../types/analyticsTypes';

function _failTrackEvent(message: string, options: TrackEventOptions) {
	if (options.strict) {
		throw new Error(message);
	}
	console.error(message);
}

/**
 * Queue a typed analytics event.
 *
 * Awaiting this only confirms the scheduler accepted the job. The analytics
 * event insert and rollup aggregation still happen in the scheduled internal
 * mutation after the product operation commits.
 */
export async function trackEvent<Name extends AnalyticsEventName>(
	ctx: MutationCtx | ActionCtx,
	input: TrackEventInput<Name>,
	options: TrackEventOptions = {}
): Promise<void> {
	const properties = sanitizeAnalyticsProperties(
		input.properties as Record<string, AnalyticsPropertyValue> | undefined
	);
	const errors = validateAnalyticsEventInput(input.name, properties);

	if (errors.length > 0) {
		_failTrackEvent(`[analytics] invalid event "${input.name}": ${errors.join(' ')}`, options);
		return;
	}

	try {
		await ctx.scheduler.runAfter(
			0,
			internal.analytics.helpers.analyticsInternal.writeAnalyticsEvent,
			{
				name: input.name,
				occurredAt: input.occurredAt ?? Date.now(),
				actorId: input.actorId,
				organizationId: input.organizationId,
				subject: input.subject,
				properties,
				source: input.source ?? { type: 'server' }
			}
		);
	} catch (error) {
		_failTrackEvent(`[analytics] schedule failed for "${input.name}": ${String(error)}`, options);
	}
}
