<script lang="ts">
	import Section from '@/shared/components/ui/section/section.svelte';
	import TooltipChart from '@/shared/components/ui/custom-charts/charts-only/tooltip-chart.svelte';
	import type { ChartConfig } from '@/shared/components/ui/chart/chart-utils.js';
	import FootprintsIcon from '@lucide/svelte/icons/footprints';
	import WavesIcon from '@lucide/svelte/icons/waves';

	const chartData = [
		{ date: '2024-07-15', running: 450, swimming: 300 },
		{ date: '2024-07-16', running: 380, swimming: 420 },
		{ date: '2024-07-17', running: 520, swimming: 120 },
		{ date: '2024-07-18', running: 140, swimming: 550 },
		{ date: '2024-07-19', running: 600, swimming: 350 },
		{ date: '2024-07-20', running: 480, swimming: 400 }
	];

	const config: ChartConfig = {
		running: { label: 'Running', color: 'var(--chart-1)' },
		swimming: { label: 'Swimming', color: 'var(--chart-2)' }
	};

	const configWithIcons: ChartConfig = {
		running: { label: 'Running', color: 'var(--chart-1)', icon: FootprintsIcon },
		swimming: { label: 'Swimming', color: 'var(--chart-2)', icon: WavesIcon }
	};

	const configWithCustomLabel: ChartConfig = {
		activities: { label: 'Activities' },
		running: { label: 'Running', color: 'var(--chart-1)' },
		swimming: { label: 'Swimming', color: 'var(--chart-2)' }
	};

	const series = [
		{
			key: 'running',
			label: 'Running',
			color: config.running.color!,
			props: { rounded: 'bottom' }
		},
		{ key: 'swimming', label: 'Swimming', color: config.swimming.color! }
	];
</script>

<Section yPadding="md" containerClass="flex flex-col items-start gap-16">
	<header class="flex flex-col gap-1">
		<h1 class="text-2xl font-semibold tracking-tight">Tooltip Chart</h1>
		<p class="text-sm text-muted-foreground">
			BarChart tooltip variants using <code class="rounded bg-muted px-1 py-0.5 text-xs"
				>universal-tooltip-chart</code
			>.
		</p>
	</header>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-default">
		<h2 id="demo-default" class="text-lg font-semibold">Default</h2>
		<p class="text-sm text-muted-foreground">Default tooltip with dot indicator and label.</p>
		<TooltipChart
			data={chartData}
			{config}
			{series}
			x="date"
			title="Tooltip - Default"
			description="Default tooltip with ChartTooltip."
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-line">
		<h2 id="demo-line" class="text-lg font-semibold">Line Indicator</h2>
		<p class="text-sm text-muted-foreground">Tooltip with line indicator instead of dot.</p>
		<TooltipChart
			data={chartData}
			{config}
			{series}
			x="date"
			tooltipPreset="line-indicator"
			title="Tooltip - Line Indicator"
			description="Tooltip with line indicator."
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-no-indicator">
		<h2 id="demo-no-indicator" class="text-lg font-semibold">No Indicator</h2>
		<p class="text-sm text-muted-foreground">Tooltip with no color indicator.</p>
		<TooltipChart
			data={chartData}
			{config}
			{series}
			x="date"
			tooltipPreset="no-indicator"
			title="Tooltip - No Indicator"
			description="Tooltip with no indicator."
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-custom-label">
		<h2 id="demo-custom-label" class="text-lg font-semibold">Custom Label</h2>
		<p class="text-sm text-muted-foreground">Tooltip label sourced from a config key.</p>
		<TooltipChart
			data={chartData}
			config={configWithCustomLabel}
			{series}
			x="date"
			tooltipPreset="line-indicator"
			tooltipLabelKey="activities"
			title="Tooltip - Custom Label"
			description="Tooltip with custom label from chartConfig."
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-label-formatter">
		<h2 id="demo-label-formatter" class="text-lg font-semibold">Label Formatter</h2>
		<p class="text-sm text-muted-foreground">Custom function formats the tooltip label.</p>
		<TooltipChart
			data={chartData}
			{config}
			{series}
			x="date"
			tooltipLabelFormatter={(d: unknown) =>
				new Date(d as string).toLocaleDateString('en-US', {
					day: 'numeric',
					month: 'long',
					year: 'numeric'
				})}
			title="Tooltip - Label Formatter"
			description="Tooltip with label formatter."
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-no-label">
		<h2 id="demo-no-label" class="text-lg font-semibold">No Label</h2>
		<p class="text-sm text-muted-foreground">Tooltip with label and indicator hidden.</p>
		<TooltipChart
			data={chartData}
			{config}
			{series}
			x="date"
			tooltipPreset="no-label"
			title="Tooltip - No Label"
			description="Tooltip with no label."
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-formatter">
		<h2 id="demo-formatter" class="text-lg font-semibold">Formatter</h2>
		<p class="text-sm text-muted-foreground">Custom formatter snippet with kcal suffix.</p>
		<TooltipChart
			data={chartData}
			{config}
			{series}
			x="date"
			tooltipHideLabel
			title="Tooltip - Formatter"
			description="Tooltip with custom formatter."
		>
			{#snippet formatter({ name, value }: { name: string; value: unknown })}
				<div class="flex min-w-[130px] items-center text-xs text-muted-foreground">
					{(config as Record<string, { label?: string }>)[name]?.label || name}
					<div
						class="ms-auto flex items-baseline gap-0.5 font-mono font-medium text-foreground tabular-nums"
					>
						{value}
						<span class="font-normal text-muted-foreground"> kcal </span>
					</div>
				</div>
			{/snippet}
		</TooltipChart>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-icons">
		<h2 id="demo-icons" class="text-lg font-semibold">Icons</h2>
		<p class="text-sm text-muted-foreground">Tooltip with icons from chartConfig.</p>
		<TooltipChart
			data={chartData}
			config={configWithIcons}
			{series}
			x="date"
			tooltipPreset="icons"
			title="Tooltip - Icons"
			description="Tooltip with icons."
		/>
	</section>

	<section class="flex w-full flex-col gap-4" aria-labelledby="demo-advanced">
		<h2 id="demo-advanced" class="text-lg font-semibold">Advanced</h2>
		<p class="text-sm text-muted-foreground">Tooltip with value suffix and total row.</p>
		<TooltipChart
			data={chartData}
			{config}
			{series}
			x="date"
			tooltipPreset="advanced"
			tooltipValueSuffix="kcal"
			tooltipShowTotal
			title="Tooltip - Advanced"
			description="Tooltip with custom formatter and total."
		/>
	</section>
</Section>
