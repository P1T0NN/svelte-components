<script lang="ts">
	import Section from '@/shared/components/ui/section/section.svelte';
	import AreaChartInteractive from '@/shared/components/ui/custom-charts/area-chart-interactive.svelte';
	import BarChartInteractive from '@/shared/components/ui/custom-charts/bar-chart-interactive.svelte';
	import LineChartInteractive from '@/shared/components/ui/custom-charts/line-chart-interactive.svelte';
</script>

<Section yPadding="md" containerClass="flex w-full flex-col gap-8">
    <AreaChartInteractive />

    <BarChartInteractive />

    <LineChartInteractive />
</Section>