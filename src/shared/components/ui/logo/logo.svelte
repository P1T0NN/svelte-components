<script lang="ts">
	import { COMPANY_DATA, PROTECTED_PAGE_ENDPOINTS } from '@/shared/constants.js';
	import Link from '@/shared/components/ui/link/link.svelte';
	import { cn } from '@/shared/utils/utils.js';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	type Props = {
		class?: string;
		/** Passed through to `<img>` (e.g. brightness on dark heroes). */
		imgClass?: string;
		href?: string;
		alt?: string;
		/** Visual size in the header / drawer. */
		size?: 'sm' | 'md';
	} & Omit<HTMLAnchorAttributes, 'href' | 'class' | 'children'>;

	let {
		class: className,
		imgClass,
		href = PROTECTED_PAGE_ENDPOINTS.HOME,
		alt = `${COMPANY_DATA.NAME} logo`,
		size = 'md',
		...restProps
	}: Props = $props();

	const sizeStyles = $derived(
		size === 'sm'
			? 'h-7 max-h-7 w-auto max-w-[min(9rem,40vw)]'
			: 'h-8 max-h-9 w-auto max-w-[min(10rem,45vw)]'
	);
</script>

<Link
	href={href}
	class={cn('inline-flex min-w-0 shrink-0 items-center outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 rounded-sm', className)}
	{...restProps}
>
	<img
		src={COMPANY_DATA.LOGO}
		{alt}
		class={cn('object-contain object-left', sizeStyles, imgClass)}
		width="160"
		height="36"
		loading="eager"
		decoding="async"
		draggable="false"
	/>
</Link>
