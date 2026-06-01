// CONFIG
import { analyticsMetricRegistry } from '../analyticsConfigs';
import { ANALYTICS_TRAFFIC_MODE, analyticsSettings } from '../analyticsSettings';

// UTILS
import { startOfUtcDay } from '../utils/analyticsDateUtils';
import {
	createAnalyticsResourceScopeId,
	GLOBAL_SCOPE_ID,
	TOTAL_DIMENSION
} from '../utils/analyticsFormatUtils';

// TYPES
import type { MutationCtx } from '@/convex/_generated/server';
import type {
	AnalyticsAggregateEventInput,
	AnalyticsMetricConfig,
	AnalyticsMetricName,
	AnalyticsMetricScope,
	AnalyticsProperties,
	AnalyticsTrafficMode
} from '../types/analyticsTypes';

type AnalyticsRollupMode = 'realtime' | 'highVolume';

function _hashString(value: string) {
	let hash = 0;

	for (let index = 0; index < value.length; index += 1) {
		hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
	}

	return hash;
}

function _getMetricDelta(metric: AnalyticsMetricConfig, properties: AnalyticsProperties) {
	if (metric.aggregation === 'count') return 1;

	const value = metric.valueProperty ? properties[metric.valueProperty] : undefined;
	return typeof value === 'number' ? value : null;
}

function _getScopesForEvent(event: AnalyticsAggregateEventInput): AnalyticsMetricScope[] {
	// Every metric is rolled up globally so product dashboards can answer
	// whole-app questions without reading organization/resource-specific rows.
	// Organization rows are added only when the event carries an organization id.
	// Resource rows are added from `subject`, which is the generic way to support
	// product/store/project dashboards without hardcoding app-specific tables.
	const scopes: AnalyticsMetricScope[] = [{ scopeType: 'global', scopeId: GLOBAL_SCOPE_ID }];

	if (event.organizationId) {
		scopes.push({ scopeType: 'organization', scopeId: event.organizationId });
	}

	if (event.subject) {
		scopes.push({
			scopeType: 'resource',
			scopeId: createAnalyticsResourceScopeId(event.subject.type, event.subject.id)
		});
	}

	return scopes;
}

function _getTrafficMode(config: AnalyticsMetricConfig): AnalyticsTrafficMode {
	return config.trafficMode ?? analyticsSettings.trafficMode;
}

function _isHighVolumeMetric(config: AnalyticsMetricConfig) {
	return _getTrafficMode(config) === ANALYTICS_TRAFFIC_MODE.HIGH_VOLUME;
}

function _getShardCount(mode: AnalyticsTrafficMode) {
	if (mode === ANALYTICS_TRAFFIC_MODE.MEDIUM_VOLUME)
		return analyticsSettings.mediumVolumeShardCount;
	if (mode === ANALYTICS_TRAFFIC_MODE.HIGH_VOLUME) return analyticsSettings.highVolumeShardCount;
	return 1;
}

function _getMetricShard(
	event: AnalyticsAggregateEventInput,
	args: {
		metric: AnalyticsMetricName;
		scope: AnalyticsMetricScope;
		dimensionKey: string;
		dimensionValue: string;
		shardCount: number;
	}
) {
	if (args.shardCount <= 1) return 0;

	// Include the event id so concurrent events for the same hot metric spread
	// across shard rows instead of all patching one aggregate document.
	return (
		_hashString(
			[
				event.eventId,
				args.metric,
				args.scope.scopeType,
				args.scope.scopeId,
				args.dimensionKey,
				args.dimensionValue
			].join(':')
		) % args.shardCount
	);
}

function _getIncrementKey(args: {
	metric: AnalyticsMetricName;
	bucketStart: number;
	scope: AnalyticsMetricScope;
	dimensionKey: string;
	dimensionValue: string;
	shard: number;
}) {
	return [
		args.metric,
		args.bucketStart,
		args.scope.scopeType,
		args.scope.scopeId,
		args.dimensionKey,
		args.dimensionValue,
		args.shard
	].join('|');
}

function _addBatchIncrement(
	increments: Map<
		string,
		{
			metric: AnalyticsMetricName;
			bucketStart: number;
			scope: AnalyticsMetricScope;
			dimensionKey: string;
			dimensionValue: string;
			shard: number;
			delta: number;
		}
	>,
	args: {
		metric: AnalyticsMetricName;
		bucketStart: number;
		scope: AnalyticsMetricScope;
		dimensionKey: string;
		dimensionValue: string;
		shard: number;
		delta: number;
	}
) {
	const key = _getIncrementKey(args);
	const existing = increments.get(key);

	if (existing) {
		existing.delta += args.delta;
		return;
	}

	increments.set(key, { ...args });
}

async function _incrementDailyMetric(
	ctx: MutationCtx,
	args: {
		metric: AnalyticsMetricName;
		bucketStart: number;
		scope: AnalyticsMetricScope;
		dimensionKey: string;
		dimensionValue: string;
		shard: number;
		delta: number;
		now: number;
	}
) {
	const existing = await ctx.db
		.query('analyticsDailyMetrics')
		.withIndex('by_metric_scope_dimension_value_bucket_shard', (q) =>
			q
				.eq('metric', args.metric)
				.eq('scopeType', args.scope.scopeType)
				.eq('scopeId', args.scope.scopeId)
				.eq('granularity', 'day')
				.eq('dimensionKey', args.dimensionKey)
				.eq('dimensionValue', args.dimensionValue)
				.eq('bucketStart', args.bucketStart)
				.eq('shard', args.shard)
		)
		.first();

	if (existing) {
		await ctx.db.patch(existing._id, {
			value: existing.value + args.delta,
			updatedAt: args.now
		});
		return;
	}

	await ctx.db.insert('analyticsDailyMetrics', {
		metric: args.metric,
		granularity: 'day',
		bucketStart: args.bucketStart,
		scopeType: args.scope.scopeType,
		scopeId: args.scope.scopeId,
		dimensionKey: args.dimensionKey,
		dimensionValue: args.dimensionValue,
		shard: args.shard,
		value: args.delta,
		updatedAt: args.now
	});
}

async function _aggregateAnalyticsEvent(
	ctx: MutationCtx,
	event: AnalyticsAggregateEventInput,
	mode: AnalyticsRollupMode
) {
	const bucketStart = startOfUtcDay(event.occurredAt);
	const now = Date.now();
	const scopes = _getScopesForEvent(event);

	for (const [metric, config] of Object.entries(analyticsMetricRegistry) as [
		AnalyticsMetricName,
		AnalyticsMetricConfig
	][]) {
		if (!config.eventNames.includes(event.name)) continue;
		if (mode === 'realtime' && _isHighVolumeMetric(config)) continue;
		if (mode === 'highVolume' && !_isHighVolumeMetric(config)) continue;

		await upsertMetricRollupForEvent(ctx, event, metric, config, bucketStart, scopes, now);
	}
}

export function hasHighVolumeAnalyticsMetrics(eventName: AnalyticsAggregateEventInput['name']) {
	return (Object.values(analyticsMetricRegistry) as AnalyticsMetricConfig[]).some((config) => {
		return config.eventNames.includes(eventName) && _isHighVolumeMetric(config);
	});
}

export async function aggregateRealtimeAnalyticsEvent(
	ctx: MutationCtx,
	event: AnalyticsAggregateEventInput
) {
	await _aggregateAnalyticsEvent(ctx, event, 'realtime');
}

export async function aggregateHighVolumeAnalyticsEventBatch(
	ctx: MutationCtx,
	events: AnalyticsAggregateEventInput[]
) {
	const increments = new Map<
		string,
		{
			metric: AnalyticsMetricName;
			bucketStart: number;
			scope: AnalyticsMetricScope;
			dimensionKey: string;
			dimensionValue: string;
			shard: number;
			delta: number;
		}
	>();
	const now = Date.now();

	for (const event of events) {
		const bucketStart = startOfUtcDay(event.occurredAt);
		const scopes = _getScopesForEvent(event);

		for (const [metric, config] of Object.entries(analyticsMetricRegistry) as [
			AnalyticsMetricName,
			AnalyticsMetricConfig
		][]) {
			if (!config.eventNames.includes(event.name)) continue;
			if (!_isHighVolumeMetric(config)) continue;

			const delta = _getMetricDelta(config, event.properties);
			if (delta === null) continue;

			const shardCount = _getShardCount(_getTrafficMode(config));

			for (const scope of scopes) {
				_addBatchIncrement(increments, {
					metric,
					bucketStart,
					scope,
					dimensionKey: TOTAL_DIMENSION,
					dimensionValue: TOTAL_DIMENSION,
					shard: _getMetricShard(event, {
						metric,
						scope,
						dimensionKey: TOTAL_DIMENSION,
						dimensionValue: TOTAL_DIMENSION,
						shardCount
					}),
					delta
				});

				for (const dimensionKey of config.dimensions ?? []) {
					const dimensionValue = event.properties[dimensionKey];

					if (
						dimensionValue === undefined ||
						dimensionValue === null ||
						typeof dimensionValue === 'boolean'
					) {
						continue;
					}

					_addBatchIncrement(increments, {
						metric,
						bucketStart,
						scope,
						dimensionKey,
						dimensionValue: String(dimensionValue),
						shard: _getMetricShard(event, {
							metric,
							scope,
							dimensionKey,
							dimensionValue: String(dimensionValue),
							shardCount
						}),
						delta
					});
				}
			}
		}
	}

	for (const increment of increments.values()) {
		await _incrementDailyMetric(ctx, {
			...increment,
			now
		});
	}
}

/**
 * Write rollup rows for a single event against a single metric.
 *
 * Exported for backfill so new metrics can replay historical events without
 * double-counting already-aggregated metrics.
 *
 * Callers must ensure the metric does not already have rollup data for the
 * events being processed — this function unconditionally increments, so
 * re-running it against already-backfilled events will double-count.
 */
export async function upsertMetricRollupForEvent(
	ctx: MutationCtx,
	event: AnalyticsAggregateEventInput,
	metric: AnalyticsMetricName,
	config: AnalyticsMetricConfig,
	bucketStart?: number,
	scopes?: AnalyticsMetricScope[],
	now?: number
) {
	const _bucketStart = bucketStart ?? startOfUtcDay(event.occurredAt);
	const _now = now ?? Date.now();
	const _scopes = scopes ?? _getScopesForEvent(event);

	const delta = _getMetricDelta(config, event.properties);
	if (delta === null) return;

	const trafficMode = _getTrafficMode(config);
	const shardCount = _getShardCount(trafficMode);

	for (const scope of _scopes) {
		await _incrementDailyMetric(ctx, {
			metric,
			bucketStart: _bucketStart,
			scope,
			dimensionKey: TOTAL_DIMENSION,
			dimensionValue: TOTAL_DIMENSION,
			shard: _getMetricShard(event, {
				metric,
				scope,
				dimensionKey: TOTAL_DIMENSION,
				dimensionValue: TOTAL_DIMENSION,
				shardCount
			}),
			delta,
			now: _now
		});

		for (const dimensionKey of config.dimensions ?? []) {
			const dimensionValue = event.properties[dimensionKey];

			if (
				dimensionValue === undefined ||
				dimensionValue === null ||
				typeof dimensionValue === 'boolean'
			) {
				continue;
			}

			await _incrementDailyMetric(ctx, {
				metric,
				bucketStart: _bucketStart,
				scope,
				dimensionKey,
				dimensionValue: String(dimensionValue),
				shard: _getMetricShard(event, {
					metric,
					scope,
					dimensionKey,
					dimensionValue: String(dimensionValue),
					shardCount
				}),
				delta,
				now: _now
			});
		}
	}
}
