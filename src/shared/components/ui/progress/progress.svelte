<script lang="ts">
	import { cn } from "@/shared/utils/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		max = 100,
		value = 0,
		...restProps
	}: HTMLAttributes<HTMLDivElement> & {
		ref?: HTMLDivElement | null;
		value?: number;
		max?: number;
	} = $props();
</script>

<div
	bind:this={ref}
	role="progressbar"
	aria-valuemin={0}
	aria-valuemax={max}
	aria-valuenow={value}
	data-slot="progress"
	class={cn("bg-muted h-1 rounded-full relative flex w-full items-center overflow-x-hidden", className)}
	{...restProps}
>
	<div
		data-slot="progress-indicator"
		class="bg-primary size-full flex-1 transition-all"
		style="transform: translateX(-{100 - (100 * (value ?? 0)) / (max ?? 1)}%)"
	></div>
</div>
