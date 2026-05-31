<script lang="ts">
	import Section from '@/shared/components/ui/section/section.svelte';
	import RadialChart from '@/shared/components/ui/custom-charts/charts-only/radial-chart.svelte';
	import type { ChartConfig } from '@/shared/components/ui/chart/chart-utils.js';

	const chartData = [
		{ browser: 'other', visitors: 90, color: 'var(--color-other)' },
		{ browser: 'edge', visitors: 173, color: 'var(--color-edge)' },
		{ browser: 'firefox', visitors: 187, color: 'var(--color-firefox)' },
		{ browser: 'safari', visitors: 200, color: 'var(--color-safari)' },
		{ browser: 'chrome', visitors: 275, color: 'var(--color-chrome)' }
	];

	const shapeData = [{ browser: 'safari', visitors: 1260, color: 'var(--color-safari)' }];

	const textData = [{ browser: 'safari', visitors: 200, color: 'var(--color-safari)' }];

	const chartConfig: ChartConfig = {
		visitors: { label: 'Visitors' },
		chrome: { label: 'Chrome', color: 'var(--chart-1)' },
		safari: { label: 'Safari', color: 'var(--chart-2)' },
		firefox: { label: 'Firefox', color: 'var(--chart-3)' },
		edge: { label: 'Edge', color: 'var(--chart-4)' },
		other: { label: 'Other', color: 'var(--chart-5)' }
	};

	const safariConfig: ChartConfig = {
		visitors: { label: 'Visitors' },
		safari: { label: 'Safari', color: 'var(--chart-2)' }
	};

	const stackedConfig: ChartConfig = {
		desktop: { label: 'Desktop', color: 'var(--chart-1)' },
		mobile: { label: 'Mobile', color: 'var(--chart-2)' }
	};

	const stackedData = [
		{ platform: 'mobile', visitors: 570, color: stackedConfig.mobile.color },
		{ platform: 'desktop', visitors: 1260, color: stackedConfig.desktop.color }
	];

	const totalVisitors = 1260 + 570;
</script>

<Section yPadding="md" containerClass="flex flex-col items-start gap-16">
	<header class="flex flex-col gap-1">
		<h1 class="text-2xl font-semibold tracking-tight">Radial Chart</h1>
		<p class="text-sm text-muted-foreground">
			RadialChart variants using <code class="rounded bg-muted px-1 py-0.5 text-xs"
				>universal-radial-chart</code
			>.
		</p>
	</header>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-default">
		<h2 id="demo-default" class="text-lg font-semibold">Default</h2>
		<p class="text-sm text-muted-foreground">Basic ArcChart with radial bars.</p>
		<RadialChart
			data={chartData}
			label="browser"
			value="visitors"
			config={chartConfig}
			title="Radial Chart"
			description="Showing total visitors for the last 6 months"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-label">
		<h2 id="demo-label" class="text-lg font-semibold">Label</h2>
		<p class="text-sm text-muted-foreground">Arc labels rendered with text on each arc.</p>
		<RadialChart
			data={chartData}
			label="browser"
			value="visitors"
			config={chartConfig}
			preset="label"
			title="Radial Chart - Label"
			description="Showing total visitors for the last 6 months"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-text">
		<h2 id="demo-text" class="text-lg font-semibold">Text</h2>
		<p class="text-sm text-muted-foreground">Single value arc with center text display.</p>
		<RadialChart
			data={textData}
			label="browser"
			value="visitors"
			config={safariConfig}
			preset="text"
			maxValue={300}
			centerValue={200}
			centerLabel="Visitors"
			title="Radial Chart - Text"
			description="Showing total visitors for the last 6 months"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-shape">
		<h2 id="demo-shape" class="text-lg font-semibold">Shape</h2>
		<p class="text-sm text-muted-foreground">
			Single value with custom track radii and center text.
		</p>
		<RadialChart
			data={shapeData}
			label="browser"
			value="visitors"
			config={safariConfig}
			preset="shape"
			maxValue={shapeData[0].visitors * 4}
			centerValue={1260}
			centerLabel="Visitors"
			title="Radial Chart - Shape"
			description="Showing total visitors for the last 6 months"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-stacked">
		<h2 id="demo-stacked" class="text-lg font-semibold">Stacked</h2>
		<p class="text-sm text-muted-foreground">PieChart with two series and center text.</p>
		<RadialChart
			data={stackedData}
			label="platform"
			value="visitors"
			config={stackedConfig}
			preset="stacked"
			centerValue={totalVisitors}
			centerLabel="Visitors"
			title="Radial Chart - Stacked"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="Showing total visitors for the last 6 months"
		/>
	</section>
</Section>
