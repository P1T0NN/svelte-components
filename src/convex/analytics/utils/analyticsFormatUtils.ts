// TYPES
import type { ChartConfig } from '@/shared/components/ui/chart/chart-utils.js';

/**
 * Sentinel value used for aggregate rows that are not grouped by a real
 * dimension.
 *
 * Example: a daily `featureUsage` total uses:
 * - dimensionKey: "__total"
 * - dimensionValue: "__total"
 *
 * This lets total rows live in the same table and use the same index as grouped
 * rows such as `dimensionKey: "surface"`, `dimensionValue: "paid"`.
 */
export const TOTAL_DIMENSION = '__total';

/**
 * Stable scope id for global analytics rollups.
 *
 * Organization rollups use their organization id. Global rollups still need a
 * concrete `scopeId` so the schema stays non-nullable and the same indexed query
 * shape works for both global and organization analytics.
 */
export const GLOBAL_SCOPE_ID = '__global';

/**
 * Resource analytics scope ids are stored as `{resourceType}:{resourceId}`.
 *
 * This keeps the public query API ergonomic:
 * `{ type: "resource", resourceType: "product", id: productId }`
 *
 * while the rollup table still has one simple indexed `scopeId` string column.
 */
const RESOURCE_SCOPE_SEPARATOR = ':';

export function createAnalyticsResourceScopeId(resourceType: string, resourceId: string) {
	return `${resourceType}${RESOURCE_SCOPE_SEPARATOR}${resourceId}`;
}

export function humanizeAnalyticsKey(value: string) {
	return value
		.replace(/[_-]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function createAnalyticsChartConfig(
	seriesKeys: string[],
	labels?: Record<string, string>
): ChartConfig {
	return Object.fromEntries(
		seriesKeys.map((key) => [
			key,
			{
				label: labels?.[key] ?? humanizeAnalyticsKey(key)
			}
		])
	) satisfies ChartConfig;
}
