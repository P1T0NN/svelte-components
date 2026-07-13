<script lang="ts">
	// COMPONENTS
	import {
		buttonVariants,
		type ButtonSize,
		type ButtonVariant
	} from '@/shared/components/ui/button/index.js';

	// UTILS
	import { cn } from '@/shared/utils/utils.js';

	// TYPES
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Props = HTMLButtonAttributes & {
		triggerId: string;
		popoverId: string;
		open: boolean;
		variant?: ButtonVariant;
		size?: ButtonSize;
		class?: string;
		children?: Snippet;
	};

	let {
		triggerId,
		popoverId,
		open,
		variant = 'default',
		size = 'default',
		class: className,
		disabled,
		children,
		type = 'button',
		...restProps
	}: Props = $props();
</script>

<button
	{type}
	id={triggerId}
	popovertarget={popoverId}
	aria-haspopup="menu"
	aria-expanded={open}
	data-state={open ? 'open' : 'closed'}
	class={cn(buttonVariants({ variant, size }), className)}
	{disabled}
	{...restProps}
>
	{@render children?.()}
</button>
