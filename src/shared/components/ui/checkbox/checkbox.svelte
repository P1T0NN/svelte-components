<script lang="ts">
	import { cn } from "@/shared/utils/utils.js";
	import type { HTMLInputAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		checked = $bindable(false),
		indeterminate = $bindable(false),
		class: className,
		onCheckedChange,
		...restProps
	}: Omit<HTMLInputAttributes, "type" | "checked"> & {
		ref?: HTMLInputElement | null;
		checked?: boolean;
		indeterminate?: boolean;
		onCheckedChange?: (checked: boolean) => void;
	} = $props();

	// `indeterminate` is a DOM property with no matching HTML attribute — the one thing that
	// genuinely needs a line of JS. Everything else (checked, focus, styling) is native.
	$effect(() => {
		if (ref) ref.indeterminate = indeterminate;
	});
</script>

<input
	bind:this={ref}
	type="checkbox"
	bind:checked
	data-slot="checkbox"
	class={cn("native-checkbox", className)}
	onchange={(e) => onCheckedChange?.(e.currentTarget.checked)}
	{...restProps}
/>

<style>
	.native-checkbox {
		appearance: none;
		-webkit-appearance: none;
		flex-shrink: 0;
		width: 1rem;
		height: 1rem;
		border: 1px solid var(--input, var(--border));
		border-radius: 4px;
		background-color: var(--background);
		background-position: center;
		background-repeat: no-repeat;
		background-size: 0.75rem;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			border-color 0.15s ease;
	}

	.native-checkbox:focus-visible {
		outline: none;
		border-color: var(--ring);
		box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 40%, transparent);
	}

	.native-checkbox:checked {
		background-color: var(--primary);
		border-color: var(--primary);
		background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><path d='M20 6 9 17l-5-5'/></svg>");
	}

	.native-checkbox:indeterminate {
		background-color: var(--primary);
		border-color: var(--primary);
		background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><path d='M5 12h14'/></svg>");
	}

	.native-checkbox:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.native-checkbox[aria-invalid='true'] {
		border-color: var(--destructive);
	}
</style>
