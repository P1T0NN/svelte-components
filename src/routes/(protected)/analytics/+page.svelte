<script lang="ts">
	// LIBRARIES
	import { useAnalytics } from '@/features/analytics/hooks/useAnalytics.svelte';

	// COMPONENTS
	import Section from '@/shared/components/ui/section/section.svelte';
	import * as Card from '@/shared/components/ui/card/index.js';
	import AreaChart from '@/shared/components/ui/custom-charts/charts-only/area-chart.svelte';
	import BarChart from '@/shared/components/ui/custom-charts/charts-only/bar-chart.svelte';
	import LineChart from '@/shared/components/ui/custom-charts/charts-only/line-chart.svelte';
	import PieChart from '@/shared/components/ui/custom-charts/charts-only/pie-chart.svelte';
	import RadarChart from '@/shared/components/ui/custom-charts/charts-only/radar-chart.svelte';
	import RadialChart from '@/shared/components/ui/custom-charts/charts-only/radial-chart.svelte';
	import TooltipChart from '@/shared/components/ui/custom-charts/charts-only/tooltip-chart.svelte';

	// TYPES
	import type { ChartConfig } from '@/shared/components/ui/chart/chart-utils.js';
	import type {
		AnalyticsBreakdownResult,
		AnalyticsTimeSeriesResult,
		ChartDatum
	} from '@/shared/components/ui/custom-charts/types/chartTypes';

	const DAY_MS = 86_400_000;
	const RANGE_DAYS = 30;
	const rangeTo = Date.now();
	const rangeFrom = rangeTo - (RANGE_DAYS - 1) * DAY_MS;
	const metric = 'featureUsage';
	const sourceDimension = 'surface';
	const fallbackSourceKeys = ['organic', 'referral', 'paid', 'support'];

	const sourceLabels: Record<string, string> = {
		organic: 'Organic',
		referral: 'Referral',
		paid: 'Paid',
		support: 'Support',
		test_row_created: 'Test row created',
		noData: 'No data'
	};

	const timeSeriesQuery = useAnalytics.timeSeries(() => ({
		metric,
		from: rangeFrom,
		to: rangeTo,
		groupBy: sourceDimension
	}));

	const sourceBreakdownQuery = useAnalytics.breakdown(() => ({
		metric,
		from: rangeFrom,
		to: rangeTo,
		groupBy: sourceDimension
	}));

	const summaryQuery = useAnalytics.summary(() => ({
		metric,
		from: rangeFrom,
		to: rangeTo
	}));

	const timeSeriesResult = $derived(timeSeriesQuery.data);
	const sourceBreakdownResult = $derived(sourceBreakdownQuery.data);
	const summaryResult = $derived(summaryQuery.data);

	const hasQueryError = $derived(
		Boolean(timeSeriesQuery.error || sourceBreakdownQuery.error || summaryQuery.error)
	);
	const isLoading = $derived(
		timeSeriesQuery.isLoading || sourceBreakdownQuery.isLoading || summaryQuery.isLoading
	);

	function _formatDate(value: unknown, options: Intl.DateTimeFormatOptions) {
		const date = value instanceof Date ? value : new Date(Number(value));
		return date.toLocaleDateString('en-US', options);
	}

	function _getChartColor(index: number) {
		return `var(--chart-${(index % 5) + 1})`;
	}

	function _getLabel(key: string) {
		return (
			sourceLabels[key] ??
			key
				.replace(/[_-]+/g, ' ')
				.replace(/\b\w/g, (char) => char.toUpperCase())
		);
	}

	function _getSourceKeys(
		timeSeries?: AnalyticsTimeSeriesResult,
		breakdown?: AnalyticsBreakdownResult
	) {
		if (timeSeries?.meta.seriesKeys.length) return timeSeries.meta.seriesKeys;
		if (breakdown?.data.length) return breakdown.data.map((item) => item.key);
		return fallbackSourceKeys;
	}

	function _createSourceConfig(keys: string[], baseConfig?: ChartConfig): ChartConfig {
		return Object.fromEntries(
			keys.map((key, index) => [
				key,
				{
					label: baseConfig?.[key]?.label ?? _getLabel(key),
					color: baseConfig?.[key]?.color ?? _getChartColor(index)
				}
			])
		) satisfies ChartConfig;
	}

	function _createValueConfig(keys: string[], sourceConfig: ChartConfig): ChartConfig {
		return {
			value: {
				label: 'Events'
			},
			...sourceConfig
		};
	}

	function _normalizeTimeSeries(result: AnalyticsTimeSeriesResult | undefined, seriesKeys: string[]) {
		return (result?.data ?? []).map((row) => {
			const point: ChartDatum = {
				date: new Date(Number(row.date))
			};

			for (const key of seriesKeys) {
				point[key] = Number(row[key] ?? 0);
			}

			return point;
		});
	}

	function _normalizeBreakdown(result: AnalyticsBreakdownResult | undefined, seriesKeys: string[]) {
		if (result?.data.length) {
			return result.data.map((item, index) => ({
				source: item.key,
				value: item.value,
				color: item.color ?? _getChartColor(index)
			}));
		}

		return seriesKeys.map((key, index) => ({
			source: key,
			value: 0,
			color: _getChartColor(index)
		}));
	}

	function _createEmptyPieData() {
		return [{ source: 'noData', value: 1, color: 'var(--muted)' }];
	}

	const sourceKeys = $derived(_getSourceKeys(timeSeriesResult, sourceBreakdownResult));
	const sourceConfig = $derived(_createSourceConfig(sourceKeys, timeSeriesResult?.config));
	const valueConfig = $derived(_createValueConfig(sourceKeys, sourceConfig));
	const timeSeriesData = $derived(_normalizeTimeSeries(timeSeriesResult, sourceKeys));
	const sourceBreakdownData = $derived(_normalizeBreakdown(sourceBreakdownResult, sourceKeys));
	const sourceTotal = $derived(summaryResult?.value ?? 0);
	const hasAnalyticsData = $derived(sourceTotal > 0);
	const pieData = $derived(hasAnalyticsData ? sourceBreakdownData : _createEmptyPieData());
	const pieConfig = $derived(
		hasAnalyticsData
			? valueConfig
			: ({
					value: { label: 'Events' },
					noData: { label: 'No data', color: 'var(--muted)' }
				} satisfies ChartConfig)
	);
	const radarData = $derived(
		sourceBreakdownData.map((item) => ({
			source: _getLabel(String(item.source)),
			featureUsage: item.value
		}))
	);
	const radarConfig: ChartConfig = {
		featureUsage: { label: 'Feature usage', color: 'var(--chart-1)' }
	};
	const tooltipSeries = $derived(
		sourceKeys.map((key) => ({
			key,
			label: sourceConfig[key]?.label ?? _getLabel(key),
			color: sourceConfig[key]?.color ?? _getChartColor(0)
		}))
	);
	const dateRangeLabel = $derived(
		`${_formatDate(rangeFrom, { month: 'short', day: 'numeric' })} - ${_formatDate(rangeTo, {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		})}`
	);
</script>

<svelte:head>
	<title>Analytics</title>
</svelte:head>

<Section yPadding="md" containerClass="flex flex-col gap-8">
	<header class="flex max-w-3xl flex-col gap-2">
		<h1 class="text-2xl font-semibold tracking-tight">Analytics</h1>
		<p class="text-sm text-muted-foreground">
			Test row analytics from the feature usage metric, grouped by source.
		</p>
	</header>

	{#if hasQueryError}
		<div class="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
			Analytics could not be loaded. You may not have access to this analytics view.
		</div>
	{:else if isLoading}
		<div class="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
			Loading analytics...
		</div>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Description>Total events</Card.Description>
					<Card.Title class="text-3xl tabular-nums">{sourceTotal.toLocaleString()}</Card.Title>
				</Card.Header>
			</Card.Root>
			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Description>Sources</Card.Description>
					<Card.Title class="text-3xl tabular-nums">{sourceKeys.length}</Card.Title>
				</Card.Header>
			</Card.Root>
			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Description>Metric</Card.Description>
					<Card.Title class="text-xl">Feature usage</Card.Title>
				</Card.Header>
			</Card.Root>
			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Description>Range</Card.Description>
					<Card.Title class="text-xl">{dateRangeLabel}</Card.Title>
				</Card.Header>
			</Card.Root>
		</div>

		{#if !hasAnalyticsData}
			<div class="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
				No tracked test row events yet. Create a test row from the mutation form to populate
				these charts.
			</div>
		{/if}

		<div class="grid gap-6 xl:grid-cols-2">
			<AreaChart
				data={timeSeriesData}
				x="date"
				config={sourceConfig}
				preset="legend"
				yPadding={[0, 1]}
				title="Area Chart"
				description="Daily test row events by source"
				containerClass="aspect-auto h-72 w-full"
				footerDateRange={dateRangeLabel}
				xAxisFormat={(value) => _formatDate(value, { month: 'short', day: 'numeric' })}
				tooltipLabelFormatter={(value) =>
					_formatDate(value, { month: 'long', day: 'numeric', year: 'numeric' })}
			/>

			<LineChart
				data={timeSeriesData}
				x="date"
				config={sourceConfig}
				preset="dots"
				yPadding={[0, 1]}
				title="Line Chart"
				description="Trend of test row analytics events"
				containerClass="aspect-auto h-72 w-full"
				footerDateRange={dateRangeLabel}
				xAxisFormat={(value) => _formatDate(value, { month: 'short', day: 'numeric' })}
				tooltipLabelFormatter={(value) =>
					_formatDate(value, { month: 'long', day: 'numeric', year: 'numeric' })}
			/>

			<BarChart
				data={sourceBreakdownData}
				x="source"
				y="value"
				config={valueConfig}
				preset="horizontal"
				colorKey="color"
				title="Bar Chart"
				description="Total events by test row source"
				containerClass="aspect-auto h-72 w-full"
				footerDateRange={dateRangeLabel}
				yAxisFormat={(value) => _getLabel(String(value))}
			/>

			<TooltipChart
				data={timeSeriesData}
				x="date"
				config={sourceConfig}
				series={tooltipSeries}
				tooltipPreset="advanced"
				tooltipShowTotal
				title="Tooltip Chart"
				description="Stacked bars with total tooltip"
				xAxisFormat={(value) => _formatDate(value, { month: 'short', day: 'numeric' })}
				tooltipLabelFormatter={(value) =>
					_formatDate(value, { month: 'long', day: 'numeric', year: 'numeric' })}
			/>

			<PieChart
				data={pieData}
				key="source"
				value="value"
				config={pieConfig}
				preset="donut-text"
				centerValue={sourceTotal}
				centerLabel="Events"
				title="Pie Chart"
				description="Share of events by source"
				footerDateRange={dateRangeLabel}
			/>

			<RadialChart
				data={pieData}
				label="source"
				value="value"
				config={pieConfig}
				preset="label"
				maxValue={Math.max(1, ...pieData.map((item) => Number(item.value) || 0))}
				title="Radial Chart"
				description="Radial event totals by source"
				footerDateRange={dateRangeLabel}
			/>

			<RadarChart
				data={radarData}
				x="source"
				config={radarConfig}
				preset="dots"
				title="Radar Chart"
				description="Source distribution as a radar chart"
				footerDateRange={dateRangeLabel}
			/>
		</div>
	{/if}
</Section>
