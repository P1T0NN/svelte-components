// LIBRARIES
import { v } from 'convex/values';

// CONFIG
import { internalMutation } from '@/convex/_generated/server';
import { analyticsEventNameValidator } from '../analyticsConfigs';

// HELPERS
import {
	aggregateRealtimeAnalyticsEvent,
	hasHighVolumeAnalyticsMetrics
} from './aggregateEvent';

// UTILS
import {
	sanitizeAnalyticsProperties,
	validateAnalyticsEventInput
} from '../utils/analyticsValidation';

// TYPES
import type { ConvexMutationResult } from '@/convex/types/convexTypes';
import type { WriteAnalyticsEventData } from '../types/analyticsTypes';

function _buildIdempotencyKey(args: {
	name: string;
	occurredAt: number;
	actorId?: string;
	organizationId?: string;
	subject?: { type: string; id: string };
	properties: Record<string, unknown>;
	source?: { type: string; name?: string };
}) {
	const orderedProps = Object.keys(args.properties)
		.sort()
		.map((k) => `${k}=${JSON.stringify(args.properties[k])}`)
		.join(',');
	const source = args.source ?? { type: 'server' };

	return [
		args.name,
		args.occurredAt,
		args.actorId ?? '',
		args.organizationId ?? '',
		args.subject?.type ?? '',
		args.subject?.id ?? '',
		source.type,
		source.name ?? '',
		orderedProps
	].join('|');
}

export const writeAnalyticsEvent = internalMutation({
	args: {
		name: analyticsEventNameValidator,
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
		)
	},
	returns: v.object({
		success: v.boolean(),
		message: v.object({
			key: v.string(),
			params: v.optional(v.record(v.string(), v.union(v.string(), v.float64(), v.boolean())))
		}),
		data: v.optional(
			v.object({
				eventId: v.optional(v.id('analyticsEvents')),
				errors: v.optional(v.array(v.string()))
			})
		)
	}),
	handler: async (ctx, args): Promise<ConvexMutationResult<WriteAnalyticsEventData>> => {
		const properties = sanitizeAnalyticsProperties(
			args.properties as Record<string, unknown> | undefined
		);
		const errors = validateAnalyticsEventInput(args.name, properties);

		if (errors.length > 0) {
			console.error('[analytics] invalid event skipped', {
				name: args.name,
				errors
			});
			return {
				success: false,
				message: { key: 'GenericMessages.ANALYTICS_EVENT_INVALID' },
				data: { errors }
			};
		}

		const idempotencyKey = _buildIdempotencyKey({
			name: args.name,
			occurredAt: args.occurredAt,
			actorId: args.actorId,
			organizationId: args.organizationId,
			subject: args.subject,
			properties,
			source: args.source
		});

		const existing = await ctx.db
			.query('analyticsEvents')
			.withIndex('by_idempotency_key', (q) => q.eq('idempotencyKey', idempotencyKey))
			.first();

		if (existing) {
			return {
				success: true,
				message: { key: 'GenericMessages.ANALYTICS_EVENT_RECORDED' },
				data: { eventId: existing._id }
			};
		}

		const eventId = await ctx.db.insert('analyticsEvents', {
			...args,
			properties,
			source: args.source ?? { type: 'server' },
			idempotencyKey,
			highVolumeStatus: hasHighVolumeAnalyticsMetrics(args.name) ? 'pending' : 'none'
		});

		await aggregateRealtimeAnalyticsEvent(ctx, {
			eventId,
			name: args.name,
			occurredAt: args.occurredAt,
			actorId: args.actorId,
			organizationId: args.organizationId,
			subject: args.subject,
			properties
		});

		return {
			success: true,
			message: { key: 'GenericMessages.ANALYTICS_EVENT_RECORDED' },
			data: { eventId }
		};
	}
});
