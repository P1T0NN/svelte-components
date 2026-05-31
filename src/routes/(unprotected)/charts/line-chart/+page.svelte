<script lang="ts">
	import Section from '@/shared/components/ui/section/section.svelte';
	import LineChart from '@/shared/components/ui/custom-charts/charts-only/line-chart.svelte';
	import GitCommitVerticalIcon from '@lucide/svelte/icons/git-commit-vertical';
	import { Points } from 'layerchart';
	import type { ChartConfig } from '@/shared/components/ui/chart/chart-utils.js';

	// ─── Time‑based data (single series) ────────────────────────────────────────

	const timeData = [
		{ date: new Date('2024-01-01'), desktop: 186 },
		{ date: new Date('2024-02-01'), desktop: 305 },
		{ date: new Date('2024-03-01'), desktop: 237 },
		{ date: new Date('2024-04-01'), desktop: 73 },
		{ date: new Date('2024-05-01'), desktop: 209 },
		{ date: new Date('2024-06-01'), desktop: 214 }
	];

	// ─── Time‑based data (multi series) ────────────────────────────────────────

	const multiData = [
		{ date: new Date('2024-01-01'), desktop: 186, mobile: 80 },
		{ date: new Date('2024-02-01'), desktop: 305, mobile: 200 },
		{ date: new Date('2024-03-01'), desktop: 237, mobile: 120 },
		{ date: new Date('2024-04-01'), desktop: 73, mobile: 190 },
		{ date: new Date('2024-05-01'), desktop: 209, mobile: 130 },
		{ date: new Date('2024-06-01'), desktop: 214, mobile: 140 }
	];

	// ─── Band‑scale data (browser colours) ─────────────────────────────────────

	const dotsData = [
		{ browser: 'chrome', visitors: 275, color: 'var(--color-chrome)' },
		{ browser: 'safari', visitors: 200, color: 'var(--color-safari)' },
		{ browser: 'firefox', visitors: 187, color: 'var(--color-firefox)' },
		{ browser: 'edge', visitors: 173, color: 'var(--color-edge)' },
		{ browser: 'other', visitors: 90, color: 'var(--color-other)' }
	];

	// ─── Configs ───────────────────────────────────────────────────────────────

	const singleConfig: ChartConfig = {
		desktop: { label: 'Desktop', color: 'var(--chart-1)' }
	};

	const multiConfig: ChartConfig = {
		desktop: { label: 'Desktop', color: 'var(--chart-1)' },
		mobile: { label: 'Mobile', color: 'var(--chart-2)' }
	};

	const dotsConfig: ChartConfig = {
		visitors: { label: 'Visitors', color: 'var(--chart-2)' },
		chrome: { label: 'Chrome', color: 'var(--chart-1)' },
		safari: { label: 'Safari', color: 'var(--chart-2)' },
		firefox: { label: 'Firefox', color: 'var(--chart-3)' },
		edge: { label: 'Edge', color: 'var(--chart-4)' },
		other: { label: 'Other', color: 'var(--chart-5)' }
	};

	// ─── Helpers ───────────────────────────────────────────────────────────────

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const dotsColorFn = (v: any) => v.color;

	const monthLabelFormatter = (v: unknown) =>
		(v as Date).toLocaleDateString('en-US', { month: 'long' });
</script>

<Section yPadding="md" containerClass="flex flex-col items-start gap-16">
	<header class="flex flex-col gap-1">
		<h1 class="text-2xl font-semibold tracking-tight">Line Chart</h1>
		<p class="text-sm text-muted-foreground">
			LineChart variants using <code class="rounded bg-muted px-1 py-0.5 text-xs"
				>universal-line-chart</code
			>.
		</p>
	</header>

	<!-- 1. Default -->
	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-default">
		<h2 id="demo-default" class="text-lg font-semibold">Default</h2>
		<p class="text-sm text-muted-foreground">Natural curve with time scale and single series.</p>
		<LineChart
			data={timeData}
			x="date"
			config={singleConfig}
			title="Line Chart"
			description="Showing total visitors for the last 6 months"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		/>
	</section>

	<!-- 2. Linear -->
	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-linear">
		<h2 id="demo-linear" class="text-lg font-semibold">Linear</h2>
		<p class="text-sm text-muted-foreground">Straight-line segments between data points.</p>
		<LineChart
			data={timeData}
			x="date"
			config={singleConfig}
			preset="linear"
			title="Line Chart - Linear"
			description="Showing total visitors for the last 6 months"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		/>
	</section>

	<!-- 3. Step -->
	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-step">
		<h2 id="demo-step" class="text-lg font-semibold">Step</h2>
		<p class="text-sm text-muted-foreground">Step‑curve interpolation between data points.</p>
		<LineChart
			data={timeData}
			x="date"
			config={singleConfig}
			preset="step"
			title="Line Chart - Step"
			description="Showing total visitors for the last 6 months"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		/>
	</section>

	<!-- 4. Multiple -->
	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-multiple">
		<h2 id="demo-multiple" class="text-lg font-semibold">Multiple</h2>
		<p class="text-sm text-muted-foreground">Two series (desktop + mobile) with natural curves.</p>
		<LineChart
			data={multiData}
			x="date"
			config={multiConfig}
			title="Line Chart - Multiple"
			description="Showing total visitors for the last 6 months"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		/>
	</section>

	<!-- 5. Dots -->
	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-dots">
		<h2 id="demo-dots" class="text-lg font-semibold">Dots</h2>
		<p class="text-sm text-muted-foreground">Natural curve with visible data points.</p>
		<LineChart
			data={timeData}
			x="date"
			config={singleConfig}
			preset="dots"
			title="Line Chart - Dots"
			description="Showing total visitors for the last 6 months"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		/>
	</section>

	<!-- 6. Dots Custom -->
	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-dots-custom">
		<h2 id="demo-dots-custom" class="text-lg font-semibold">Dots Custom</h2>
		<p class="text-sm text-muted-foreground">Custom point markers replacing the default dots.</p>
		<LineChart
			data={timeData}
			x="date"
			config={singleConfig}
			title="Line Chart - Dots Custom"
			description="Showing total visitors for the last 6 months"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		>
			<!-- eslint-disable @typescript-eslint/no-explicit-any -->
			{#snippet customPoints({ context }: any)}
				{#each context.series.visibleSeries as s (s.key)}
					<Points seriesKey={s.key} {...s.props}>
						<!-- eslint-disable @typescript-eslint/no-explicit-any -->
						{#snippet children({ points }: any)}
							{#each points as p, i (i)}
								{@const r = 24}
								<GitCommitVerticalIcon
									x={p.x - r / 2}
									y={p.y - r / 2}
									width={r}
									height={r}
									fill="var(--background)"
									color="var(--color-desktop)"
								/>
							{/each}
						{/snippet}
					</Points>
				{/each}
			{/snippet}
		</LineChart>
	</section>

	<!-- 7. Dots Colors -->
	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-dots-colors">
		<h2 id="demo-dots-colors" class="text-lg font-semibold">Dots Colors</h2>
		<p class="text-sm text-muted-foreground">Band scale with per‑item colour from the data.</p>
		<LineChart
			data={dotsData}
			x="browser"
			y="visitors"
			config={dotsConfig}
			xScaleType="band"
			axis={false}
			yPadding={[0, 25]}
			colorFn={dotsColorFn}
			title="Line Chart - Dots Colors"
			description="Showing total visitors for the last 6 months"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		/>
	</section>

	<!-- 8. Label -->
	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-label">
		<h2 id="demo-label" class="text-lg font-semibold">Label</h2>
		<p class="text-sm text-muted-foreground">
			Labels enabled with a custom tooltip and line indicator.
		</p>
		<LineChart
			data={timeData}
			x="date"
			config={singleConfig}
			preset="dots"
			labels={{ offset: 12 }}
			tooltipIndicator="line"
			tooltipLabelFormatter={monthLabelFormatter}
			title="Line Chart - Label"
			description="Showing total visitors for the last 6 months"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		/>
	</section>

	<!-- 9. Custom Label -->
	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-custom-label">
		<h2 id="demo-custom-label" class="text-lg font-semibold">Custom Label</h2>
		<p class="text-sm text-muted-foreground">Band scale, no axis, single series.</p>
		<LineChart
			data={dotsData}
			x="browser"
			y="visitors"
			config={dotsConfig}
			xScaleType="band"
			axis={false}
			title="Line Chart - Custom Label"
			description="Showing total visitors for the last 6 months"
			footerTrend="Trending up by 5.2% this month"
			footerDateRange="January - June 2024"
		/>
	</section>
</Section>
