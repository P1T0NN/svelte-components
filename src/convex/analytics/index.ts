export {
	ANALYTICS_EVENT,
	ANALYTICS_EVENT_NAMES,
	ANALYTICS_METRIC,
	ANALYTICS_METRIC_NAMES,
	analyticsEventRegistry,
	analyticsMetricRegistry
} from './analyticsConfigs';
export { ANALYTICS_TRAFFIC_MODE, analyticsSettings } from './analyticsSettings';

export { requireAnalyticsReadAccess } from './helpers/analyticsAccess';
export { trackEvent } from './helpers/trackEvent';

export type {
	AnalyticsAggregateEventInput,
	AnalyticsAggregation,
	AnalyticsEventConfig,
	AnalyticsEventProperties,
	AnalyticsEventName,
	AnalyticsMetricConfig,
	AnalyticsMetricName,
	AnalyticsMetricScope,
	AnalyticsProperties,
	AnalyticsPropertyType,
	AnalyticsPropertyValue,
	AnalyticsScope,
	AnalyticsScopeInput,
	AnalyticsScopeType,
	AnalyticsTrafficMode,
	AnalyticsUnit,
	TrackEventInput,
	TrackEventOptions,
	WriteAnalyticsEventData
} from './types/analyticsTypes';
