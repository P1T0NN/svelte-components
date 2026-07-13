<script lang="ts">
	import { cn } from "@/shared/utils/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		orientation = "horizontal",
		decorative = true,
		"data-slot": dataSlot = "separator",
		...restProps
	}: HTMLAttributes<HTMLDivElement> & {
		ref?: HTMLDivElement | null;
		orientation?: "horizontal" | "vertical";
		decorative?: boolean;
	} = $props();
</script>

<div
	bind:this={ref}
	role={decorative ? "none" : "separator"}
	aria-orientation={decorative ? undefined : orientation}
	data-slot={dataSlot}
	data-orientation={orientation}
	class={cn(
		"bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px",
		// this is different in shadcn/ui but self-stretch breaks things for us
		"data-[orientation=vertical]:h-full",
		className
	)}
	{...restProps}
></div>
