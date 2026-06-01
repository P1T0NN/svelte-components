// LIBRARIES
import { v } from 'convex/values';

// TYPES
import type {
	AnalyticsEventConfig,
	AnalyticsEventName,
	AnalyticsMetricConfig,
	AnalyticsMetricName
} from './types/analyticsTypes';

export const ANALYTICS_EVENT = {
	INVOICE_PAID: 'invoice.paid',
	INVOICE_FAILED: 'invoice.failed',
	REFUND_CREATED: 'refund.created',
	SUBSCRIPTION_CREATED: 'subscription.created',
	SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
	USER_SIGNED_UP: 'user.signed_up',
	FILE_UPLOADED: 'file.uploaded',
	STORAGE_USAGE_RECORDED: 'storage.usage_recorded',
	FEATURE_USED: 'feature.used'
} as const;

export const ANALYTICS_METRIC = {
	REVENUE: 'revenue',
	REFUNDS: 'refunds',
	FAILED_PAYMENTS: 'failedPayments',
	NEW_SUBSCRIPTIONS: 'newSubscriptions',
	CANCELLED_SUBSCRIPTIONS: 'cancelledSubscriptions',
	NEW_USERS: 'newUsers',
	UPLOADS: 'uploads',
	STORAGE_USED_BYTES: 'storageUsedBytes',
	FEATURE_USAGE: 'featureUsage'
} as const;

export const ANALYTICS_EVENT_NAMES = [
	ANALYTICS_EVENT.INVOICE_PAID,
	ANALYTICS_EVENT.INVOICE_FAILED,
	ANALYTICS_EVENT.REFUND_CREATED,
	ANALYTICS_EVENT.SUBSCRIPTION_CREATED,
	ANALYTICS_EVENT.SUBSCRIPTION_CANCELLED,
	ANALYTICS_EVENT.USER_SIGNED_UP,
	ANALYTICS_EVENT.FILE_UPLOADED,
	ANALYTICS_EVENT.STORAGE_USAGE_RECORDED,
	ANALYTICS_EVENT.FEATURE_USED
] as const;

export const ANALYTICS_METRIC_NAMES = [
	ANALYTICS_METRIC.REVENUE,
	ANALYTICS_METRIC.REFUNDS,
	ANALYTICS_METRIC.FAILED_PAYMENTS,
	ANALYTICS_METRIC.NEW_SUBSCRIPTIONS,
	ANALYTICS_METRIC.CANCELLED_SUBSCRIPTIONS,
	ANALYTICS_METRIC.NEW_USERS,
	ANALYTICS_METRIC.UPLOADS,
	ANALYTICS_METRIC.STORAGE_USED_BYTES,
	ANALYTICS_METRIC.FEATURE_USAGE
] as const;

export const analyticsEventNameValidator = v.union(
	v.literal(ANALYTICS_EVENT.INVOICE_PAID),
	v.literal(ANALYTICS_EVENT.INVOICE_FAILED),
	v.literal(ANALYTICS_EVENT.REFUND_CREATED),
	v.literal(ANALYTICS_EVENT.SUBSCRIPTION_CREATED),
	v.literal(ANALYTICS_EVENT.SUBSCRIPTION_CANCELLED),
	v.literal(ANALYTICS_EVENT.USER_SIGNED_UP),
	v.literal(ANALYTICS_EVENT.FILE_UPLOADED),
	v.literal(ANALYTICS_EVENT.STORAGE_USAGE_RECORDED),
	v.literal(ANALYTICS_EVENT.FEATURE_USED)
);

export const analyticsMetricNameValidator = v.union(
	v.literal(ANALYTICS_METRIC.REVENUE),
	v.literal(ANALYTICS_METRIC.REFUNDS),
	v.literal(ANALYTICS_METRIC.FAILED_PAYMENTS),
	v.literal(ANALYTICS_METRIC.NEW_SUBSCRIPTIONS),
	v.literal(ANALYTICS_METRIC.CANCELLED_SUBSCRIPTIONS),
	v.literal(ANALYTICS_METRIC.NEW_USERS),
	v.literal(ANALYTICS_METRIC.UPLOADS),
	v.literal(ANALYTICS_METRIC.STORAGE_USED_BYTES),
	v.literal(ANALYTICS_METRIC.FEATURE_USAGE)
);

export const analyticsEventRegistry = {
	[ANALYTICS_EVENT.INVOICE_PAID]: {
		label: 'Invoice paid',
		properties: {
			amountCents: 'number',
			currency: 'string',
			plan: 'string',
			provider: 'string'
		},
		requiredProperties: ['amountCents', 'currency']
	},
	[ANALYTICS_EVENT.INVOICE_FAILED]: {
		label: 'Invoice failed',
		properties: {
			amountCents: 'number',
			currency: 'string',
			plan: 'string',
			provider: 'string',
			reason: 'string'
		},
		requiredProperties: ['currency']
	},
	[ANALYTICS_EVENT.REFUND_CREATED]: {
		label: 'Refund created',
		properties: {
			amountCents: 'number',
			currency: 'string',
			plan: 'string',
			provider: 'string'
		},
		requiredProperties: ['amountCents', 'currency']
	},
	[ANALYTICS_EVENT.SUBSCRIPTION_CREATED]: {
		label: 'Subscription created',
		properties: {
			plan: 'string',
			provider: 'string'
		},
		requiredProperties: ['plan']
	},
	[ANALYTICS_EVENT.SUBSCRIPTION_CANCELLED]: {
		label: 'Subscription cancelled',
		properties: {
			plan: 'string',
			provider: 'string',
			reason: 'string'
		},
		requiredProperties: ['plan']
	},
	[ANALYTICS_EVENT.USER_SIGNED_UP]: {
		label: 'User signed up',
		properties: {
			provider: 'string',
			role: 'string',
			plan: 'string'
		}
	},
	[ANALYTICS_EVENT.FILE_UPLOADED]: {
		label: 'File uploaded',
		properties: {
			provider: 'string',
			mimeType: 'string',
			bytes: 'number'
		}
	},
	[ANALYTICS_EVENT.STORAGE_USAGE_RECORDED]: {
		label: 'Storage usage recorded',
		properties: {
			provider: 'string',
			bytes: 'number'
		},
		requiredProperties: ['bytes']
	},
	[ANALYTICS_EVENT.FEATURE_USED]: {
		label: 'Feature used',
		properties: {
			feature: 'string',
			surface: 'string'
		},
		requiredProperties: ['feature']
	}
} satisfies Record<AnalyticsEventName, AnalyticsEventConfig>;

export const analyticsMetricRegistry = {
	[ANALYTICS_METRIC.REVENUE]: {
		label: 'Revenue',
		description: 'Gross paid invoice amount',
		unit: 'currency',
		eventNames: [ANALYTICS_EVENT.INVOICE_PAID],
		aggregation: 'sum',
		valueProperty: 'amountCents',
		dimensions: ['plan', 'currency', 'provider'],
		adminOnly: true
	},
	[ANALYTICS_METRIC.REFUNDS]: {
		label: 'Refunds',
		unit: 'currency',
		eventNames: [ANALYTICS_EVENT.REFUND_CREATED],
		aggregation: 'sum',
		valueProperty: 'amountCents',
		dimensions: ['plan', 'currency', 'provider'],
		adminOnly: true
	},
	[ANALYTICS_METRIC.FAILED_PAYMENTS]: {
		label: 'Failed payments',
		unit: 'count',
		eventNames: [ANALYTICS_EVENT.INVOICE_FAILED],
		aggregation: 'count',
		dimensions: ['plan', 'currency', 'provider', 'reason'],
		adminOnly: true
	},
	[ANALYTICS_METRIC.NEW_SUBSCRIPTIONS]: {
		label: 'New subscriptions',
		unit: 'count',
		eventNames: [ANALYTICS_EVENT.SUBSCRIPTION_CREATED],
		aggregation: 'count',
		dimensions: ['plan', 'provider']
	},
	[ANALYTICS_METRIC.CANCELLED_SUBSCRIPTIONS]: {
		label: 'Cancelled subscriptions',
		unit: 'count',
		eventNames: [ANALYTICS_EVENT.SUBSCRIPTION_CANCELLED],
		aggregation: 'count',
		dimensions: ['plan', 'provider', 'reason']
	},
	[ANALYTICS_METRIC.NEW_USERS]: {
		label: 'New users',
		unit: 'count',
		eventNames: [ANALYTICS_EVENT.USER_SIGNED_UP],
		aggregation: 'count',
		dimensions: ['provider', 'role', 'plan']
	},
	[ANALYTICS_METRIC.UPLOADS]: {
		label: 'Uploads',
		unit: 'count',
		eventNames: [ANALYTICS_EVENT.FILE_UPLOADED],
		aggregation: 'count',
		dimensions: ['provider', 'mimeType']
	},
	[ANALYTICS_METRIC.STORAGE_USED_BYTES]: {
		label: 'Storage used',
		unit: 'bytes',
		eventNames: [ANALYTICS_EVENT.STORAGE_USAGE_RECORDED, ANALYTICS_EVENT.FILE_UPLOADED],
		aggregation: 'sum',
		valueProperty: 'bytes',
		dimensions: ['provider', 'mimeType']
	},
	[ANALYTICS_METRIC.FEATURE_USAGE]: {
		label: 'Feature usage',
		unit: 'count',
		eventNames: [ANALYTICS_EVENT.FEATURE_USED],
		aggregation: 'count',
		dimensions: ['feature', 'surface'],
		adminOnly: true
	}
} satisfies Record<AnalyticsMetricName, AnalyticsMetricConfig>;
