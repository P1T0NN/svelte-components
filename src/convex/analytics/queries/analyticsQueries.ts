// LIBRARIES
import { ConvexError, v } from 'convex/values';

// CONFIG
import { query } from '@/convex/_generated/server';
import { analyticsMetricNameValidator, analyticsMetricRegistry } from '../analyticsConfigs';
import { analyticsSettings } from '../analyticsSettings';

// HELPERS
import { requireAnalyticsReadAccess } from '../helpers/analyticsAccess';

// UTILS
import { DAY_MS, listDailyBuckets, startOfUtcDay } from '../utils/analyticsDateUtils';
import {
	createAnalyticsChartConfig,
	createAnalyticsResourceScopeId,
	GLOBAL_SCOPE_ID,
	TOTAL_DIMENSION
} from '../utils/analyticsFormatUtils';

// TYPES
import type { Doc } from '@/convex/_generated/dataModel';
import type { QueryCtx } from '@/convex/_generated/server';
import type {
	AnalyticsMetricConfig,
	AnalyticsMetricName,
	AnalyticsScope,
	AnalyticsScopeInput
} from '../types/analyticsTypes';

function _resolveScope(scope: AnalyticsScopeInput | undefined): AnalyticsScope {
	if (!scope || scope.type === 'global') {
		return { type: 'global', id: GLOBAL_SCOPE_ID };
	}

	if (scope.type === 'organization' && !scope.id) {
		throw new ConvexError({
			code: 'BAD_REQUEST',
			message: 'Organization analytics scope requires an id.'
		});
	}

	if (scope.type === 'resource') {
		if (!scope.resourceType || !scope.id) {
			throw new ConvexError({
				code: 'BAD_REQUEST',
				message: 'Resource analytics scope requires a resourceType and id.'
			});
		}

		return {
			type: 'resource',
			resourceType: scope.resourceType,
			resourceId: scope.id,
			id: createAnalyticsResourceScopeId(scope.resourceType, scope.id)
		};
	}

	return { type: scope.type, id: scope.id };
}

const analyticsScopeValidator = v.union(
	v.object({
		type: v.literal('global'),
		id: v.optional(v.string())
	}),
	v.object({
		type: v.literal('organization'),
		id: v.string()
	}),
	v.object({
		type: v.literal('resource'),
		resourceType: v.string(),
		id: v.string()
	})
);

function _getMetricConfig(metric: AnalyticsMetricName) {
	const config = analyticsMetricRegistry[metric];

	if (!config) {
		throw new ConvexError({
			code: 'BAD_REQUEST',
			message: `Unknown analytics metric "${metric}".`
		});
	}

	return config;
}

function _assertDateRange(args: { from: number; to: number }) {
	const from = startOfUtcDay(args.from);
	const to = startOfUtcDay(args.to);

	if (from > to) {
		throw new ConvexError({
			code: 'BAD_REQUEST',
			message: '`from` must be before or equal to `to`.'
		});
	}

	const rangeDays = Math.floor((to - from) / DAY_MS) + 1;

	if (rangeDays > analyticsSettings.maxQueryRangeDays) {
		throw new ConvexError({
			code: 'BAD_REQUEST',
			message:
				`Analytics queries are limited to ${analyticsSettings.maxQueryRangeDays} days. ` +
				'Narrow the date range or add a dedicated export/backfill query.'
		});
	}
}

function _assertAllowedDimension(
	metric: AnalyticsMetricName,
	config: AnalyticsMetricConfig,
	groupBy: string
) {
	if (!config.dimensions?.includes(groupBy)) {
		throw new ConvexError({
			code: 'BAD_REQUEST',
			message: `Metric "${metric}" cannot be grouped by "${groupBy}".`
		});
	}
}

async function _collectDailyMetricRows(
	ctx: QueryCtx,
	args: {
		metric: AnalyticsMetricName;
		scope: AnalyticsScope;
		dimensionKey: string;
		from: number;
		to: number;
	}
): Promise<Doc<'analyticsDailyMetrics'>[]> {
	const rows = await ctx.db
		.query('analyticsDailyMetrics')
		.withIndex('by_metric_scope_dimension_bucket', (q) =>
			q
				.eq('metric', args.metric)
				.eq('scopeType', args.scope.type)
				.eq('scopeId', args.scope.id)
				.eq('granularity', 'day')
				.eq('dimensionKey', args.dimensionKey)
				.gte('bucketStart', startOfUtcDay(args.from))
				.lte('bucketStart', startOfUtcDay(args.to))
		)
		.take(analyticsSettings.maxRollupRowsPerQuery + 1);

	if (rows.length > analyticsSettings.maxRollupRowsPerQuery) {
		throw new ConvexError({
			code: 'QUERY_TOO_LARGE',
			message:
				`Analytics query matched more than ${analyticsSettings.maxRollupRowsPerQuery} rollup rows. ` +
				'Narrow the date range, scope, or configured dimensions.'
		});
	}

	return rows;
}

function _createSeriesConfig(
	metric: AnalyticsMetricName,
	config: AnalyticsMetricConfig,
	seriesKeys: string[]
) {
	if (seriesKeys.length === 1 && seriesKeys[0] === metric) {
		return createAnalyticsChartConfig(seriesKeys, { [metric]: config.label });
	}

	return createAnalyticsChartConfig(seriesKeys);
}

function _getTopSeriesKeys(rows: Doc<'analyticsDailyMetrics'>[]) {
	const totals = new Map<string, number>();

	for (const row of rows) {
		totals.set(row.dimensionValue, (totals.get(row.dimensionValue) ?? 0) + row.value);
	}

	return [...totals.entries()]
		.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
		.slice(0, analyticsSettings.maxBreakdownItems)
		.map(([key]) => key);
}

export const timeSeries = query({
	args: {
		metric: analyticsMetricNameValidator,
		from: v.number(),
		to: v.number(),
		groupBy: v.optional(v.string()),
		scope: v.optional(analyticsScopeValidator),
		fill: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		_assertDateRange(args);

		const metricConfig = _getMetricConfig(args.metric);
		const scope = _resolveScope(args.scope);
		await requireAnalyticsReadAccess(ctx, {
			config: metricConfig
		});

		const shouldFill = args.fill ?? true;
		const dimensionKey = args.groupBy ?? TOTAL_DIMENSION;

		if (args.groupBy) {
			_assertAllowedDimension(args.metric, metricConfig, args.groupBy);
		}

		const rows = await _collectDailyMetricRows(ctx, {
			metric: args.metric,
			scope,
			dimensionKey,
			from: args.from,
			to: args.to
		});

		const buckets = shouldFill
			? listDailyBuckets(args.from, args.to)
			: [...new Set(rows.map((row) => row.bucketStart))].sort((a, b) => a - b);
		const allSeriesKeys = args.groupBy
			? [...new Set(rows.map((row) => row.dimensionValue))]
			: [args.metric];
		const seriesKeys = args.groupBy ? _getTopSeriesKeys(rows) : allSeriesKeys;
		const seriesKeySet = new Set(seriesKeys);

		const data = buckets.map((bucketStart) => {
			const point: Record<string, number> = { date: bucketStart };

			for (const key of seriesKeys) {
				point[key] = 0;
			}

			return point;
		});
		const pointByBucket = new Map(data.map((point) => [point.date, point]));

		for (const row of rows) {
			const point = pointByBucket.get(row.bucketStart);
			if (!point) continue;

			const seriesKey = args.groupBy ? row.dimensionValue : args.metric;
			if (!seriesKeySet.has(seriesKey)) continue;

			point[seriesKey] = (point[seriesKey] ?? 0) + row.value;
		}

		return {
			data,
			x: 'date',
			config: _createSeriesConfig(args.metric, metricConfig, seriesKeys),
			meta: {
				metric: args.metric,
				label: metricConfig.label,
				unit: metricConfig.unit,
				scope,
				groupBy: args.groupBy,
				seriesKeys,
				omittedSeriesCount: Math.max(0, allSeriesKeys.length - seriesKeys.length),
				xValueType: 'timestamp',
				range: {
					from: startOfUtcDay(args.from),
					to: startOfUtcDay(args.to)
				}
			}
		};
	}
});

export const summary = query({
	args: {
		metric: analyticsMetricNameValidator,
		from: v.number(),
		to: v.number(),
		scope: v.optional(analyticsScopeValidator)
	},
	handler: async (ctx, args) => {
		_assertDateRange(args);

		const metricConfig = _getMetricConfig(args.metric);
		const scope = _resolveScope(args.scope);
		await requireAnalyticsReadAccess(ctx, {
			config: metricConfig
		});

		const rows = await _collectDailyMetricRows(ctx, {
			metric: args.metric,
			scope,
			dimensionKey: TOTAL_DIMENSION,
			from: args.from,
			to: args.to
		});

		return {
			metric: args.metric,
			label: metricConfig.label,
			unit: metricConfig.unit,
			scope,
			value: rows.reduce((total, row) => total + row.value, 0),
			range: {
				from: startOfUtcDay(args.from),
				to: startOfUtcDay(args.to)
			}
		};
	}
});

export const breakdown = query({
	args: {
		metric: analyticsMetricNameValidator,
		from: v.number(),
		to: v.number(),
		groupBy: v.string(),
		scope: v.optional(analyticsScopeValidator)
	},
	handler: async (ctx, args) => {
		_assertDateRange(args);

		const metricConfig = _getMetricConfig(args.metric);
		const scope = _resolveScope(args.scope);
		await requireAnalyticsReadAccess(ctx, {
			config: metricConfig
		});

		_assertAllowedDimension(args.metric, metricConfig, args.groupBy);

		const rows = await _collectDailyMetricRows(ctx, {
			metric: args.metric,
			scope,
			dimensionKey: args.groupBy,
			from: args.from,
			to: args.to
		});
		const totals = new Map<string, number>();

		for (const row of rows) {
			totals.set(row.dimensionValue, (totals.get(row.dimensionValue) ?? 0) + row.value);
		}

		const data = [...totals.entries()]
			.sort((a, b) => b[1] - a[1])
			.slice(0, analyticsSettings.maxBreakdownItems)
			.map(([key, value]) => ({
				key,
				value
			}));

		return {
			data,
			config: createAnalyticsChartConfig(data.map((item) => item.key)),
			meta: {
				metric: args.metric,
				label: metricConfig.label,
				unit: metricConfig.unit,
				scope,
				groupBy: args.groupBy,
				omittedSeriesCount: Math.max(0, totals.size - data.length),
				range: {
					from: startOfUtcDay(args.from),
					to: startOfUtcDay(args.to)
				}
			}
		};
	}
});
