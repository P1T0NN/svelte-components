<script lang="ts">
    // LIBRARIES
    import { Arc, Text } from 'layerchart';
    
    // COMPONENTS
	import Section from '@/shared/components/ui/section/section.svelte';
	import PieChart from '@/shared/components/ui/custom-charts/charts-only/pie-chart.svelte';

	// TYPES
	import type { ChartConfig } from '@/shared/components/ui/chart/chart-utils.js';

	const pieData = [
		{ browser: 'chrome', visitors: 275, color: 'var(--color-chrome)' },
		{ browser: 'safari', visitors: 200, color: 'var(--color-safari)' },
		{ browser: 'firefox', visitors: 187, color: 'var(--color-firefox)' },
		{ browser: 'edge', visitors: 173, color: 'var(--color-edge)' },
		{ browser: 'other', visitors: 90, color: 'var(--color-other)' }
	];

	const donutData = [
		{ browser: 'chrome', visitors: 275, color: 'var(--color-chrome)' },
		{ browser: 'safari', visitors: 200, color: 'var(--color-safari)' },
		{ browser: 'firefox', visitors: 287, color: 'var(--color-firefox)' },
		{ browser: 'edge', visitors: 173, color: 'var(--color-edge)' },
		{ browser: 'other', visitors: 190, color: 'var(--color-other)' }
	];

	const desktopData = [
		{ month: 'january', desktop: 186, color: 'var(--color-january)' },
		{ month: 'february', desktop: 305, color: 'var(--color-february)' },
		{ month: 'march', desktop: 237, color: 'var(--color-march)' },
		{ month: 'april', desktop: 173, color: 'var(--color-april)' },
		{ month: 'may', desktop: 209, color: 'var(--color-may)' }
	];

	const mobileData = [
		{ month: 'january', mobile: 80, color: 'var(--color-january)' },
		{ month: 'february', mobile: 200, color: 'var(--color-february)' },
		{ month: 'march', mobile: 120, color: 'var(--color-march)' },
		{ month: 'april', mobile: 190, color: 'var(--color-april)' },
		{ month: 'may', mobile: 130, color: 'var(--color-may)' }
	];

	const pieConfig: ChartConfig = {
		visitors: { label: 'Visitors' },
		chrome: { label: 'Chrome', color: 'var(--chart-1)' },
		safari: { label: 'Safari', color: 'var(--chart-2)' },
		firefox: { label: 'Firefox', color: 'var(--chart-3)' },
		edge: { label: 'Edge', color: 'var(--chart-4)' },
		other: { label: 'Other', color: 'var(--chart-5)' }
	};

	const stackedConfig: ChartConfig = {
		desktop: { label: 'Desktop' },
		mobile: { label: 'Mobile' },
		january: { label: 'January', color: 'var(--chart-1)' },
		february: { label: 'February', color: 'var(--chart-2)' },
		march: { label: 'March', color: 'var(--chart-3)' },
		april: { label: 'April', color: 'var(--chart-4)' },
		may: { label: 'May', color: 'var(--chart-5)' }
	};
</script>

<Section yPadding="md" containerClass="flex flex-col items-start gap-16">
	<header class="flex flex-col gap-1">
		<h1 class="text-2xl font-semibold tracking-tight">Pie Chart</h1>
		<p class="text-sm text-muted-foreground">
			PieChart variants using <code class="rounded bg-muted px-1 py-0.5 text-xs"
				>universal-pie-chart</code
			>.
		</p>
	</header>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-default">
		<h2 id="demo-default" class="text-lg font-semibold">Default</h2>
		<p class="text-sm text-muted-foreground">Basic pie chart.</p>
		<PieChart
			data={pieData}
			key="browser"
			value="visitors"
			config={pieConfig}
			title="Pie Chart"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="Showing total visitors for the last 6 months"
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-label">
		<h2 id="demo-label" class="text-lg font-semibold">Label</h2>
		<p class="text-sm text-muted-foreground">
			Browser labels placed at the centroid of each slice.
		</p>
		<PieChart
			data={pieData}
			key="browser"
			value="visitors"
			config={pieConfig}
			title="Pie Chart - Label"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="Showing total visitors for the last 6 months"
		>
			{#snippet arc({ props, visibleData, index }: any)}
				{@const browser = visibleData[index].browser}
				<Arc {...props}>
					{#snippet children({ getArcTextProps }: any)}
						<Text
							value={browser}
							{...getArcTextProps('centroid')}
							font-size="12"
							class="fill-background capitalize"
						/>
					{/snippet}
				</Arc>
			{/snippet}
		</PieChart>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-custom-label">
		<h2 id="demo-custom-label" class="text-lg font-semibold">Custom Label</h2>
		<p class="text-sm text-muted-foreground">
			Value labels positioned at the outer edge of each slice.
		</p>
		<PieChart
			data={pieData}
			key="browser"
			value="visitors"
			config={pieConfig}
			title="Pie Chart - Custom Label"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="Showing total visitors for the last 6 months"
		>
			{#snippet arc({ props, visibleData, index }: any)}
				<Arc {...props}>
					{#snippet children({ getArcTextProps }: any)}
						<Text
							value={visibleData[index].visitors}
							{...getArcTextProps('outer', { startOffset: '50%', outerPadding: 10 })}
							class="fill-foreground"
						/>
					{/snippet}
				</Arc>
			{/snippet}
		</PieChart>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-label-list">
		<h2 id="demo-label-list" class="text-lg font-semibold">Label List</h2>
		<p class="text-sm text-muted-foreground">Browser labels with manual centroid positioning.</p>
		<PieChart
			data={pieData}
			key="browser"
			value="visitors"
			config={pieConfig}
			title="Pie Chart - Label List"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="Showing total visitors for the last 6 months"
		>
			{#snippet arc({ props, visibleData, index }: any)}
				{@const browser = visibleData[index].browser}
				<Arc {...props}>
					{#snippet children({ centroid }: any)}
						<Text
							value={browser}
							x={centroid[0]}
							y={centroid[1]}
							textAnchor="middle"
							verticalAnchor="middle"
							font-size="12"
							class="fill-background capitalize"
						/>
					{/snippet}
				</Arc>
			{/snippet}
		</PieChart>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-legend">
		<h2 id="demo-legend" class="text-lg font-semibold">Legend</h2>
		<p class="text-sm text-muted-foreground">Pie chart with an attached legend.</p>
		<PieChart
			data={pieData}
			key="browser"
			value="visitors"
			config={pieConfig}
			preset="legend"
			title="Pie Chart - Legend"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="Showing total visitors for the last 6 months"
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-donut">
		<h2 id="demo-donut" class="text-lg font-semibold">Donut</h2>
		<p class="text-sm text-muted-foreground">Donut chart with an inner radius of 60.</p>
		<PieChart
			data={donutData}
			key="browser"
			value="visitors"
			config={pieConfig}
			preset="donut"
			title="Pie Chart - Donut"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="Showing total visitors for the last 6 months"
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-donut-active">
		<h2 id="demo-donut-active" class="text-lg font-semibold">Donut Active</h2>
		<p class="text-sm text-muted-foreground">Donut chart with an enlarged active first slice.</p>
		<PieChart
			data={donutData}
			key="browser"
			value="visitors"
			config={pieConfig}
			preset="donut-active"
			title="Pie Chart - Donut Active"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="Showing total visitors for the last 6 months"
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-donut-text">
		<h2 id="demo-donut-text" class="text-lg font-semibold">Donut with Text</h2>
		<p class="text-sm text-muted-foreground">
			Donut chart with a total value and label in the center.
		</p>
		<PieChart
			data={donutData}
			key="browser"
			value="visitors"
			config={pieConfig}
			preset="donut-text"
			centerValue={donutData.reduce((a, d: any) => a + d.visitors, 0)}
			centerLabel="Visitors"
			title="Pie Chart - Donut with Text"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="Showing total visitors for the last 6 months"
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-stacked">
		<h2 id="demo-stacked" class="text-lg font-semibold">Stacked</h2>
		<p class="text-sm text-muted-foreground">Multi-series concentric rings.</p>
		<PieChart
			key="month"
			labelKey="month"
			colorKey="color"
			config={stackedConfig}
			preset="stacked"
			series={[
				{
					key: 'desktop',
					value: 'value',
					data: desktopData.map((d: any) => ({
						month: d.month,
						value: d.desktop,
						color: d.color
					})),
					props: { innerRadius: -20 }
				},
				{
					key: 'mobile',
					value: 'value',
					data: mobileData.map((d: any) => ({
						month: d.month,
						value: d.mobile,
						color: d.color
					})),
					props: { outerRadius: -30 }
				}
			]}
			title="Pie Chart - Stacked"
			description="January - June 2024"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="Showing total visitors for the last 6 months"
		>
			{#snippet arc({ props }: any)}
				<Arc {...props} fill={props.data.color} />
			{/snippet}
		</PieChart>
	</section>
</Section>
