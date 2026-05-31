<script lang="ts">
	import Section from '@/shared/components/ui/section/section.svelte';
	import RadarChart from '@/shared/components/ui/custom-charts/charts-only/radar-chart.svelte';
	import { Axis, Text, Grid } from 'layerchart';
	import type { ChartConfig } from '@/shared/components/ui/chart/chart-utils.js';

	const singleData = [
		{ month: 'January', desktop: 186 },
		{ month: 'February', desktop: 305 },
		{ month: 'March', desktop: 237 },
		{ month: 'April', desktop: 273 },
		{ month: 'May', desktop: 209 },
		{ month: 'June', desktop: 214 }
	];

	const singleData2 = [
		{ month: 'January', desktop: 186 },
		{ month: 'February', desktop: 285 },
		{ month: 'March', desktop: 237 },
		{ month: 'April', desktop: 203 },
		{ month: 'May', desktop: 209 },
		{ month: 'June', desktop: 264 }
	];

	const singleData3 = [
		{ month: 'January', desktop: 186 },
		{ month: 'February', desktop: 305 },
		{ month: 'March', desktop: 237 },
		{ month: 'April', desktop: 203 },
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

	const singleConfig: ChartConfig = {
		desktop: { label: 'Desktop', color: 'var(--chart-1)' }
	};

	const multiConfig: ChartConfig = {
		desktop: { label: 'Desktop', color: 'var(--chart-1)' },
		mobile: { label: 'Mobile', color: 'var(--chart-2)' }
	};
</script>

<Section yPadding="md" containerClass="flex flex-col items-start gap-16">
	<header class="flex flex-col gap-1">
		<h1 class="text-2xl font-semibold tracking-tight">Radar Chart</h1>
		<p class="text-sm text-muted-foreground">
			RadarChart variants using <code class="rounded bg-muted px-1 py-0.5 text-xs">radar-chart</code
			>.
		</p>
	</header>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-default">
		<h2 id="demo-default" class="text-lg font-semibold">Default</h2>
		<p class="text-sm text-muted-foreground">Radar chart with filled area and linear grid.</p>
		<RadarChart
			data={singleData}
			x="month"
			config={singleConfig}
			title="Radar Chart"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-dots">
		<h2 id="demo-dots" class="text-lg font-semibold">Dots</h2>
		<p class="text-sm text-muted-foreground">Radar chart with visible data points.</p>
		<RadarChart
			data={singleData}
			x="month"
			config={singleConfig}
			preset="dots"
			title="Radar Chart - Dots"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-lines-only">
		<h2 id="demo-lines-only" class="text-lg font-semibold">Lines Only</h2>
		<p class="text-sm text-muted-foreground">
			Multi-series radar with stroke-only lines and no fill.
		</p>
		<RadarChart
			data={multiData}
			x="month"
			config={multiConfig}
			preset="lines-only"
			title="Radar Chart - Lines Only"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-grid-circle">
		<h2 id="demo-grid-circle" class="text-lg font-semibold">Grid Circle</h2>
		<p class="text-sm text-muted-foreground">Circular grid with data points.</p>
		<RadarChart
			data={singleData}
			x="month"
			config={singleConfig}
			preset="grid-circle"
			title="Radar Chart - Grid Circle"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-grid-circle-no-lines">
		<h2 id="demo-grid-circle-no-lines" class="text-lg font-semibold">Grid Circle No Lines</h2>
		<p class="text-sm text-muted-foreground">Circular grid without radial lines.</p>
		<RadarChart
			data={singleData3}
			x="month"
			config={singleConfig}
			preset="grid-circle-no-lines"
			title="Radar Chart - Grid Circle No Lines"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-grid-circle-filled">
		<h2 id="demo-grid-circle-filled" class="text-lg font-semibold">Grid Circle Filled</h2>
		<p class="text-sm text-muted-foreground">
			Circular grid with filled grid cells and extra y-padding.
		</p>
		<RadarChart
			data={singleData2}
			x="month"
			config={singleConfig}
			preset="grid-circle-filled"
			yPadding={[0, 8]}
			title="Radar Chart - Grid Circle Filled"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-grid-filled">
		<h2 id="demo-grid-filled" class="text-lg font-semibold">Grid Filled</h2>
		<p class="text-sm text-muted-foreground">
			Linear grid with filled grid cells and extra y-padding.
		</p>
		<RadarChart
			data={singleData2}
			x="month"
			config={singleConfig}
			preset="grid-filled"
			yPadding={[0, 8]}
			title="Radar Chart - Grid Filled"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-grid-none">
		<h2 id="demo-grid-none" class="text-lg font-semibold">Grid None</h2>
		<p class="text-sm text-muted-foreground">
			No grid lines, showing only the data area and points.
		</p>
		<RadarChart
			data={singleData}
			x="month"
			config={singleConfig}
			preset="grid-none"
			title="Radar Chart - Grid None"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-custom-label">
		<h2 id="demo-custom-label" class="text-lg font-semibold">Custom Label</h2>
		<p class="text-sm text-muted-foreground">
			Custom axis labels showing combined desktop/mobile values per month.
		</p>
		<RadarChart
			data={multiData}
			x="month"
			config={multiConfig}
			title="Radar Chart - Custom Label"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		>
			{#snippet axis()}
				<Axis placement="angle" tickLength={0}>
					<!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
					{#snippet tickLabel({ props, index }: any)}
						{@const y = props.y
							? typeof props.y === 'number'
								? props.y
								: typeof props.y === 'string'
									? parseInt(props.y)
									: 0
							: 0}
						{@const d = multiData[index]}
						{@const label = d ? `${d.desktop} / ${d.mobile}` : ''}
						<Text {...props} {y} value={label} class="fill-foreground" />
						<Text {...props} y={y + 14} />
					{/snippet}
				</Axis>
				<Axis placement="radius" format={() => ''} />
			{/snippet}
		</RadarChart>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-grid-custom">
		<h2 id="demo-grid-custom" class="text-lg font-semibold">Grid Custom</h2>
		<p class="text-sm text-muted-foreground">
			Custom grid with a single y-tick at the maximum value.
		</p>
		<RadarChart
			data={singleData}
			x="month"
			config={singleConfig}
			title="Radar Chart - Grid Custom"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		>
			{#snippet customGrid()}
				<!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
				<Grid y radialY="linear" yTicks={[Math.max(...singleData.map((m: any) => m.desktop))]} />
			{/snippet}
		</RadarChart>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-multiple">
		<h2 id="demo-multiple" class="text-lg font-semibold">Multiple</h2>
		<p class="text-sm text-muted-foreground">
			Multi-series radar chart comparing desktop and mobile.
		</p>
		<RadarChart
			data={multiData}
			x="month"
			config={multiConfig}
			title="Radar Chart - Multiple"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-legend">
		<h2 id="demo-legend" class="text-lg font-semibold">Legend</h2>
		<p class="text-sm text-muted-foreground">
			Multi-series radar chart with a legend positioned below.
		</p>
		<RadarChart
			data={multiData}
			x="month"
			config={multiConfig}
			title="Radar Chart - Legend"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
			legend={{ classes: { root: '-bottom-5' } }}
			padding={8}
			tickLength={-8}
		/>
	</section>
</Section>
