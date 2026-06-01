// CONFIG
import type { Id } from '@/convex/_generated/dataModel';
import type {
	ANALYTICS_EVENT_NAMES,
	ANALYTICS_METRIC_NAMES,
	analyticsEventRegistry
} from '../analyticsConfigs';

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];
export type AnalyticsMetricName = (typeof ANALYTICS_METRIC_NAMES)[number];
export type AnalyticsPropertyType = 'string' | 'number' | 'boolean';
export type AnalyticsUnit = 'count' | 'currency' | 'bytes';
export type AnalyticsAggregation = 'count' | 'sum';
export type AnalyticsScopeType = 'global' | 'organization' | 'resource';
export type AnalyticsTrafficMode = 'lowVolume' | 'mediumVolume' | 'highVolume';

export type AnalyticsPropertyValue = string | number | boolean | null;
export type AnalyticsProperties = Record<string, AnalyticsPropertyValue>;

export type AnalyticsEventConfig = {
	label: string;
	properties?: Record<string, AnalyticsPropertyType>;
	requiredProperties?: readonly string[];
};

export type AnalyticsMetricConfig = {
	label: string;
	description?: string;
	unit: AnalyticsUnit;
	eventNames: readonly AnalyticsEventName[];
	aggregation: AnalyticsAggregation;
	valueProperty?: string;
	dimensions?: readonly string[];
	/**
	 * Optional per-metric override for aggregate write fan-out.
	 *
	 * Leave undefined to use `analyticsSettings.trafficMode`. Set this only for
	 * metrics that are hotter or quieter than the rest of the app.
	 */
	trafficMode?: AnalyticsTrafficMode;
	/**
	 * Analytics reads always require a signed-in user. Set this for metrics that
	 * should additionally require the Better Auth `admin` role.
	 *
	 * For user-facing sensitive dashboards, gate the route/page/server load
	 * before rendering the query, then query the relevant analytics scope.
	 */
	adminOnly?: boolean;
};

type PropertyTypeMap = {
	string: string;
	number: number;
	boolean: boolean;
};

type EventConfig<Name extends AnalyticsEventName> = (typeof analyticsEventRegistry)[Name];
type EventPropertiesConfig<Name extends AnalyticsEventName> =
	EventConfig<Name> extends { properties: infer Properties } ? Properties : {};
type RequiredPropertyKeys<Name extends AnalyticsEventName> =
	EventConfig<Name> extends { requiredProperties: readonly (infer Key)[] }
		? Key & keyof EventPropertiesConfig<Name>
		: never;
type PropertyValue<Kind> = Kind extends keyof PropertyTypeMap ? PropertyTypeMap[Kind] : never;

export type AnalyticsEventProperties<Name extends AnalyticsEventName> = {
	[Key in RequiredPropertyKeys<Name>]: PropertyValue<EventPropertiesConfig<Name>[Key]>;
} & {
	[Key in Exclude<keyof EventPropertiesConfig<Name>, RequiredPropertyKeys<Name>>]?: PropertyValue<
		EventPropertiesConfig<Name>[Key]
	> | null;
};

export type TrackEventInput<Name extends AnalyticsEventName = AnalyticsEventName> = {
	name: Name;
	occurredAt?: number;
	actorId?: string;
	organizationId?: string;
	subject?: {
		type: string;
		id: string;
	};
	properties?: AnalyticsEventProperties<Name>;
	source?: {
		type: 'server' | 'client' | 'webhook' | 'system';
		name?: string;
	};
};

export type TrackEventOptions = {
	/**
	 * By default analytics should never break the product flow. Set strict in
	 * tests or one-off scripts when invalid analytics should fail loudly.
	 */
	strict?: boolean;
};

export type AnalyticsAggregateEventInput = {
	eventId: Id<'analyticsEvents'>;
	name: AnalyticsEventName;
	occurredAt: number;
	actorId?: string;
	organizationId?: string;
	subject?: {
		type: string;
		id: string;
	};
	properties: AnalyticsProperties;
};

export type AnalyticsMetricScope = {
	scopeType: AnalyticsScopeType;
	scopeId: string;
};

export type AnalyticsScope =
	| {
			type: 'global';
			id: string;
	  }
	| {
			type: 'organization';
			id: string;
	  }
	| {
			type: 'resource';
			resourceType: string;
			resourceId: string;
			id: string;
	  };

export type AnalyticsScopeInput =
	| {
			type: 'global';
			id?: string;
	  }
	| {
			type: 'organization';
			id: string;
	  }
	| {
			type: 'resource';
			resourceType: string;
			id: string;
	  };

export type WriteAnalyticsEventData = {
	eventId?: Id<'analyticsEvents'>;
	errors?: string[];
};
