<script lang="ts">
    // LIBRARIES
    import { Area, LinearGradient } from 'layerchart';
	import { curveNatural } from 'd3-shape';

	// COMPONENTS
	import Section from '@/shared/components/ui/section/section.svelte';
	import AreaChart from '@/shared/components/ui/custom-charts/charts-only/area-chart.svelte';

	// TYPES
	import type { ChartConfig } from '@/shared/components/ui/chart/chart-utils.js';

	// LUCIDE ICONS
	import TrendingDownIcon from '@lucide/svelte/icons/trending-down';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	
	// ─── Data ───────────────────────────────────────────────────────────────────

	const timeData = [
		{ date: new Date('2024-01-01'), desktop: 186 },
		{ date: new Date('2024-02-01'), desktop: 305 },
		{ date: new Date('2024-03-01'), desktop: 237 },
		{ date: new Date('2024-04-01'), desktop: 73 },
		{ date: new Date('2024-05-01'), desktop: 209 },
		{ date: new Date('2024-06-01'), desktop: 214 }
	];

	const multiData = [
		{ date: new Date('2024-01-01'), desktop: 186, mobile: 80 },
		{ date: new Date('2024-02-01'), desktop: 305, mobile: 200 },
		{ date: new Date('2024-03-01'), desktop: 237, mobile: 120 },
		{ date: new Date('2024-04-01'), desktop: 73, mobile: 190 },
		{ date: new Date('2024-05-01'), desktop: 209, mobile: 130 },
		{ date: new Date('2024-06-01'), desktop: 214, mobile: 140 }
	];

	const tripleData = [
		{ date: new Date('2024-01-01'), desktop: 186, mobile: 80, other: 45 },
		{ date: new Date('2024-02-01'), desktop: 305, mobile: 200, other: 100 },
		{ date: new Date('2024-03-01'), desktop: 237, mobile: 120, other: 150 },
		{ date: new Date('2024-04-01'), desktop: 73, mobile: 190, other: 50 },
		{ date: new Date('2024-05-01'), desktop: 209, mobile: 130, other: 100 },
		{ date: new Date('2024-06-01'), desktop: 214, mobile: 140, other: 160 }
	];

	// ─── Configs ───────────────────────────────────────────────────────────────

	const singleConfig: ChartConfig = {
		desktop: { label: 'Desktop', color: 'var(--chart-1)' }
	};

	const multiConfig: ChartConfig = {
		desktop: { label: 'Desktop', color: 'var(--chart-1)' },
		mobile: { label: 'Mobile', color: 'var(--chart-2)' }
	};

	const tripleConfig: ChartConfig = {
		desktop: { label: 'Desktop', color: 'var(--chart-1)' },
		mobile: { label: 'Mobile', color: 'var(--chart-2)' },
		other: { label: 'Other', color: 'var(--chart-3)' }
	};

	const iconsConfig: ChartConfig = {
		desktop: { label: 'Desktop', color: 'var(--chart-1)', icon: TrendingDownIcon },
		mobile: { label: 'Mobile', color: 'var(--chart-2)', icon: TrendingUpIcon }
	};

	// ─── Helpers ───────────────────────────────────────────────────────────────

	const monthLabelFormatter = (v: unknown) =>
		(v as Date).toLocaleDateString('en-US', { month: 'long' });
</script>

<Section yPadding="md" containerClass="flex flex-col items-start gap-16">
	<header class="flex flex-col gap-1">
		<h1 class="text-2xl font-semibold tracking-tight">Area Chart</h1>
		<p class="text-sm text-muted-foreground">
			AreaChart variants using <code class="rounded bg-muted px-1 py-0.5 text-xs"
				>universal-area-chart</code
			>.
		</p>
	</header>

	<!-- 1. Default -->
	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-default">
		<h2 id="demo-default" class="text-lg font-semibold">Default</h2>
		<p class="text-sm text-muted-foreground">Natural curve, single series, with line indicator.</p>
		<AreaChart
			data={timeData}
			x="date"
			config={singleConfig}
			tooltipLabelFormatter={monthLabelFormatter}
			title="Area Chart"
			description="Showing total visitors for the last 6 months"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		/>
	</section>

	<!-- 2. Linear -->
	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-linear">
		<h2 id="demo-linear" class="text-lg font-semibold">Linear</h2>
		<p class="text-sm text-muted-foreground">Straight-line segments between data points.</p>
		<AreaChart
			data={timeData}
			x="date"
			config={singleConfig}
			preset="linear"
			title="Area Chart - Linear"
			description="Showing total visitors for the last 6 months"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		/>
	</section>

	<!-- 3. Step -->
	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-step">
		<h2 id="demo-step" class="text-lg font-semibold">Step</h2>
		<p class="text-sm text-muted-foreground">Step-curve interpolation between data points.</p>
		<AreaChart
			data={timeData}
			x="date"
			config={singleConfig}
			preset="step"
			title="Area Chart - Step"
			description="Showing total visitors for the last 6 months"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		/>
	</section>

	<!-- 4. Legend -->
	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-legend">
		<h2 id="demo-legend" class="text-lg font-semibold">Legend</h2>
		<p class="text-sm text-muted-foreground">Two series with legend enabled.</p>
		<AreaChart
			data={multiData}
			x="date"
			config={multiConfig}
			preset="legend"
			yPadding={[0, 25]}
			title="Area Chart - Legend"
			description="Showing total visitors for the last 6 months"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		/>
	</section>

	<!-- 5. Stacked -->
	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-stacked">
		<h2 id="demo-stacked" class="text-lg font-semibold">Stacked</h2>
		<p class="text-sm text-muted-foreground">Two series with stack layout and dot indicator.</p>
		<AreaChart
			data={multiData}
			x="date"
			config={multiConfig}
			preset="stacked"
			yPadding={[0, 25]}
			title="Area Chart - Stacked"
			description="Showing total visitors for the last 6 months"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		/>
	</section>

	<!-- 6. Stacked Expanded -->
	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-stacked-expanded">
		<h2 id="demo-stacked-expanded" class="text-lg font-semibold">Stacked Expanded</h2>
		<p class="text-sm text-muted-foreground">Three series with stackExpand layout.</p>
		<AreaChart
			data={tripleData}
			x="date"
			config={tripleConfig}
			preset="stacked-expanded"
			title="Area Chart - Stacked Expanded"
			description="Showing total visitors for the last 6 months"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		/>
	</section>

	<!-- 7. Icons -->
	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-icons">
		<h2 id="demo-icons" class="text-lg font-semibold">Icons</h2>
		<p class="text-sm text-muted-foreground">Legend with config-driven icon components.</p>
		<AreaChart
			data={multiData}
			x="date"
			config={iconsConfig}
			preset="legend"
			title="Area Chart - Icons"
			description="Showing total visitors for the last 6 months"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		/>
	</section>

	<!-- 8. Gradient -->
	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-gradient">
		<h2 id="demo-gradient" class="text-lg font-semibold">Gradient</h2>
		<p class="text-sm text-muted-foreground">
			Custom marks snippet with vertical linear gradients.
		</p>
		<AreaChart
			data={multiData}
			x="date"
			config={multiConfig}
			preset="stacked"
			yPadding={[0, 25]}
			title="Area Chart - Gradient"
			description="Showing total visitors for the last 6 months"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		>
			<!-- eslint-disable @typescript-eslint/no-explicit-any -->
			{#snippet customMarks({ context }: any)}
				{#each context.series.visibleSeries as s (s.key)}
					<LinearGradient
						stops={[s.color ?? '', 'color-mix(in lch, ' + s.color + ' 10%, transparent)']}
						vertical
					>
						<!-- eslint-disable @typescript-eslint/no-explicit-any -->
						{#snippet children({ gradient }: any)}
							<Area
								seriesKey={s.key}
								curve={curveNatural}
								fillOpacity={0.4}
								line={{ class: 'stroke-1' }}
								motion="tween"
								{...s.props}
								fill={gradient}
							/>
						{/snippet}
					</LinearGradient>
				{/each}
			{/snippet}
		</AreaChart>
	</section>

	<!-- 9. Axes -->
	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-axes">
		<h2 id="demo-axes" class="text-lg font-semibold">Axes</h2>
		<p class="text-sm text-muted-foreground">Custom yDomain and yAxis tick values.</p>
		<AreaChart
			data={multiData}
			x="date"
			config={multiConfig}
			preset="stacked"
			yDomain={[0, 600]}
			areaChartProps={{ yAxis: { ticks: [0, 300, 600] } }}
			title="Area Chart - Axes"
			description="Showing total visitors for the last 6 months"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		/>
	</section>
</Section>
