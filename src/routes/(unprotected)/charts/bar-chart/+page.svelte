<script lang="ts">
    // COMPONENTS
	import Section from '@/shared/components/ui/section/section.svelte';
	import BarChart from '@/shared/components/ui/custom-charts/charts-only/bar-chart.svelte';

	// TYPES
	import type { ChartConfig } from '@/shared/components/ui/chart/chart-utils.js';

	const singleData = [
		{ month: 'January', desktop: 186 },
		{ month: 'February', desktop: 305 },
		{ month: 'March', desktop: 237 },
		{ month: 'April', desktop: 73 },
		{ month: 'May', desktop: 209 },
		{ month: 'June', desktop: 214 }
	];

	const multiData = [
		{ month: 'January', desktop: 186, mobile: 80 },
		{ month: 'February', desktop: 305, mobile: 200 },
		{ month: 'March', desktop: 237, mobile: 120 },
		{ month: 'April', desktop: 73, mobile: 190 },
		{ month: 'May', desktop: 209, mobile: 130 },
		{ month: 'June', desktop: 214, mobile: 140 }
	];

	const mixedData = [
		{ browser: 'chrome', visitors: 275, color: 'var(--color-chrome)' },
		{ browser: 'safari', visitors: 200, color: 'var(--color-safari)' },
		{ browser: 'firefox', visitors: 187, color: 'var(--color-firefox)' },
		{ browser: 'edge', visitors: 173, color: 'var(--color-edge)' },
		{ browser: 'other', visitors: 90, color: 'var(--color-other)' }
	];

	const activeData = [
		{ browser: 'chrome', visitors: 187, color: 'var(--color-chrome)' },
		{ browser: 'safari', visitors: 200, color: 'var(--color-safari)' },
		{ browser: 'firefox', visitors: 275, color: 'var(--color-firefox)' },
		{ browser: 'edge', visitors: 173, color: 'var(--color-edge)' },
		{ browser: 'other', visitors: 90, color: 'var(--color-other)' }
	];

	const negativeData = [
		{ month: 'January', visitors: 186 },
		{ month: 'February', visitors: 205 },
		{ month: 'March', visitors: -207 },
		{ month: 'April', visitors: 173 },
		{ month: 'May', visitors: -209 },
		{ month: 'June', visitors: 214 }
	];

	const singleConfig: ChartConfig = {
		desktop: { label: 'Desktop', color: 'var(--chart-1)' }
	};

	const multiConfig: ChartConfig = {
		desktop: { label: 'Desktop', color: 'var(--chart-1)' },
		mobile: { label: 'Mobile', color: 'var(--chart-2)' }
	};

	const mixedConfig: ChartConfig = {
		visitors: { label: 'Visitors' },
		chrome: { label: 'Chrome', color: 'var(--chart-1)' },
		safari: { label: 'Safari', color: 'var(--chart-2)' },
		firefox: { label: 'Firefox', color: 'var(--chart-3)' },
		edge: { label: 'Edge', color: 'var(--chart-4)' },
		other: { label: 'Other', color: 'var(--chart-5)' }
	};

	const negativeConfig: ChartConfig = {
		visitors: { label: 'Visitors' }
	};
</script>

<Section yPadding="md" containerClass="flex flex-col items-start gap-16">
	<header class="flex flex-col gap-1">
		<h1 class="text-2xl font-semibold tracking-tight">Bar Chart</h1>
		<p class="text-sm text-muted-foreground">
			BarChart variants using <code class="rounded bg-muted px-1 py-0.5 text-xs"
				>universal-bar-chart</code
			>.
		</p>
	</header>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-default">
		<h2 id="demo-default" class="text-lg font-semibold">Default</h2>
		<p class="text-sm text-muted-foreground">Vertical bar chart with rounded corners.</p>
		<BarChart
			data={singleData}
			x="month"
			config={singleConfig}
			title="Bar Chart"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="Showing total visitors for the last 6 months"
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-horizontal">
		<h2 id="demo-horizontal" class="text-lg font-semibold">Horizontal</h2>
		<p class="text-sm text-muted-foreground">Horizontal orientation with bar insets.</p>
		<BarChart
			data={singleData}
			x="month"
			config={singleConfig}
			preset="horizontal"
			title="Bar Chart - Horizontal"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="Showing total visitors for the last 6 months"
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-multiple">
		<h2 id="demo-multiple" class="text-lg font-semibold">Multiple</h2>
		<p class="text-sm text-muted-foreground">Grouped bars with dashed tooltip indicator.</p>
		<BarChart
			data={multiData}
			x="month"
			config={multiConfig}
			preset="multiple"
			title="Bar Chart - Multiple"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="Showing total visitors for the last 6 months"
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-stacked">
		<h2 id="demo-stacked" class="text-lg font-semibold">Stacked + Legend</h2>
		<p class="text-sm text-muted-foreground">Stacked bars with legend and highlight area.</p>
		<BarChart
			data={multiData}
			x="month"
			config={multiConfig}
			preset="stacked"
			title="Bar Chart - Stacked + Legend"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="Showing total visitors for the last 6 months"
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-label">
		<h2 id="demo-label" class="text-lg font-semibold">Label</h2>
		<p class="text-sm text-muted-foreground">Value labels rendered above each bar.</p>
		<BarChart
			data={singleData}
			x="month"
			config={singleConfig}
			preset="label"
			title="Bar Chart - Label"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="Showing total visitors for the last 6 months"
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-custom-label">
		<h2 id="demo-custom-label" class="text-lg font-semibold">Custom Label</h2>
		<p class="text-sm text-muted-foreground">Horizontal bars with custom axis styling.</p>
		<BarChart
			data={multiData}
			x="month"
			config={multiConfig}
			preset="horizontal"
			showLabels
			axis="y"
			title="Bar Chart - Custom Label"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="Showing total visitors for the last 6 months"
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-mixed">
		<h2 id="demo-mixed" class="text-lg font-semibold">Mixed</h2>
		<p class="text-sm text-muted-foreground">Horizontal bars with per-item colors from config.</p>
		<BarChart
			data={mixedData}
			x="browser"
			y="visitors"
			config={mixedConfig}
			preset="horizontal"
			colorKey="color"
			yAxisFormat={(d: unknown) =>
				(mixedConfig as Record<string, { label?: string }>)[String(d)]?.label ?? String(d)}
			title="Bar Chart - Mixed"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="Showing total visitors for the last 6 months"
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-active">
		<h2 id="demo-active" class="text-lg font-semibold">Active</h2>
		<p class="text-sm text-muted-foreground">Custom marks snippet highlighting the 3rd bar.</p>
		<BarChart
			data={activeData}
			x="browser"
			y="visitors"
			config={mixedConfig}
			colorKey="color"
			title="Bar Chart - Active"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="Showing total visitors for the last 6 months"
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-negative">
		<h2 id="demo-negative" class="text-lg font-semibold">Negative</h2>
		<p class="text-sm text-muted-foreground">Bars with negative values and conditional colors.</p>
		<BarChart
			data={negativeData}
			x="month"
			y="visitors"
			config={negativeConfig}
			preset="negative"
			cRange={['var(--chart-1)', 'var(--chart-2)']}
			colorFn={(d: Record<string, unknown>) =>
				Number(d.visitors) > 0 ? 'var(--chart-1)' : 'var(--chart-2)'}
			yBaseline={0}
			axis={false}
			title="Bar Chart - Negative"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="Showing total visitors for the last 6 months"
		/>
	</section>
</Section>
