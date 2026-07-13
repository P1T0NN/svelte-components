<script lang="ts">
	// COMPONENTS
	import DropdownMenuTrigger from './dropdown-menu-trigger.svelte';
	import { type ButtonSize, type ButtonVariant } from '@/shared/components/ui/button/index.js';

	// UTILS
	import { cn } from '@/shared/utils/utils.js';

	// TYPES
	import type { Snippet } from 'svelte';

	type Side = 'top' | 'right' | 'bottom' | 'left';
	type Align = 'start' | 'center' | 'end';

	type Props = {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		/** Label/content inside the default trigger button. */
		triggerChildren?: Snippet;
		triggerVariant?: ButtonVariant;
		triggerSize?: ButtonSize;
		triggerClass?: string;
		triggerDisabled?: boolean;
		/** Hide trigger for programmatic-only menus. */
		hideTrigger?: boolean;
		side?: Side;
		align?: Align;
		sideOffset?: number;
		contentClass?: string;
		content: Snippet<[{ popoverId: string }]>;
	};

	let {
		open = $bindable(false),
		onOpenChange,
		triggerChildren,
		triggerVariant = 'default',
		triggerSize = 'default',
		triggerClass,
		triggerDisabled = false,
		hideTrigger = false,
		side = 'bottom',
		align = 'start',
		sideOffset = 4,
		contentClass,
		content
	}: Props = $props();

	const id = $props.id();
	const popoverId = `${id}-popover`;
	const triggerId = `${id}-trigger`;
	// Standards-based anchor association (the `anchor` content attribute is Chrome-only
	// and was dropped from the spec — anchor-name/position-anchor work in all engines).
	const anchorName = `--dropdown-${id}`;
	// False only in pre-Popover-API browsers (pre-2023) → the CSS legacy fallback takes over.
	const supportsPopover = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;
	let popover = $state<HTMLElement | null>(null);

	function setOpen(nextOpen: boolean) {
		open = nextOpen;
		onOpenChange?.(nextOpen);
	}

	$effect(() => {
		if (!popover) return;

		// Legacy fallback: no Popover API — drive visibility with an attribute instead.
		if (!supportsPopover) {
			popover.toggleAttribute('data-fallback-open', open);
			return;
		}

		if (open && !popover.matches(':popover-open')) {
			popover.showPopover();
			return;
		}

		if (!open && popover.matches(':popover-open')) {
			popover.hidePopover();
		}
	});
</script>

<span class="dropdown-menu-wrapper">
	{#if !hideTrigger}
		<DropdownMenuTrigger
			{triggerId}
			{popoverId}
			{open}
			variant={triggerVariant}
			size={triggerSize}
			class={triggerClass}
			disabled={triggerDisabled}
			style={`anchor-name: ${anchorName};`}
			onclick={() => {
				if (!supportsPopover) setOpen(!open);
			}}
		>
			{@render triggerChildren?.()}
		</DropdownMenuTrigger>
	{/if}

	<div
		bind:this={popover}
		popover="auto"
		id={popoverId}
		role="menu"
		data-side={side}
		data-align={align}
		style={`--dropdown-side-offset: ${sideOffset}px; position-anchor: ${anchorName};`}
		class={cn(
			'dropdown-menu min-w-32 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10',
			contentClass
		)}
		ontoggle={(event) => setOpen(event.newState === 'open')}
	>
		{@render content({ popoverId })}
	</div>
</span>

<style>
	/* Layout-neutral in modern browsers; becomes the positioning context in the legacy fallback. */
	.dropdown-menu-wrapper {
		display: contents;
	}

	:global(.dropdown-menu__item) {
		display: flex;
		width: 100%;
		align-items: center;
		gap: 0.375rem;
		border: 0;
		border-radius: 0.375rem;
		background: transparent;
		padding: 0.25rem 0.375rem;
		font-size: 0.875rem;
		cursor: default;
		outline: none;
		text-align: left;
	}

	:global(.dropdown-menu__item:hover),
	:global(.dropdown-menu__item:focus-visible) {
		background: var(--accent);
		color: var(--accent-foreground);
	}

	:global(.dropdown-menu__item svg:not([class*='size-'])) {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
		pointer-events: none;
	}

	:global(.dropdown-menu__separator) {
		border: 0;
		border-top: 1px solid var(--border);
		margin: 0.25rem -0.25rem;
	}

	:global(.dropdown-menu__label) {
		color: var(--muted-foreground);
		padding: 0.25rem 0.375rem;
		font-size: 0.75rem;
		font-weight: 500;
	}

	/*
	 * Tier 1 — anchor positioning (Chrome 125+, Firefox 132+, Safari 18.2+): menu sits
	 * next to its trigger. Browsers WITH the Popover API but WITHOUT anchor positioning
	 * skip this whole block and keep the UA default — a centered popover — which stays
	 * fully usable (top layer, light dismiss, Esc). That's Tier 2, and it needs no CSS.
	 */
	@supports (position-area: bottom) {
		.dropdown-menu:global([popover]) {
			margin: 0;
		}

		.dropdown-menu[data-side='bottom'][data-align='start'] {
			position-area: bottom left;
			margin-top: var(--dropdown-side-offset, 4px);
		}

		.dropdown-menu[data-side='bottom'][data-align='end'] {
			position-area: bottom right;
			margin-top: var(--dropdown-side-offset, 4px);
		}

		.dropdown-menu[data-side='bottom'][data-align='center'] {
			position-area: bottom;
			margin-top: var(--dropdown-side-offset, 4px);
		}

		.dropdown-menu[data-side='top'][data-align='start'] {
			position-area: top left;
			margin-bottom: var(--dropdown-side-offset, 4px);
		}

		.dropdown-menu[data-side='top'][data-align='end'] {
			position-area: top right;
			margin-bottom: var(--dropdown-side-offset, 4px);
		}

		.dropdown-menu[data-side='top'][data-align='center'] {
			position-area: top;
			margin-bottom: var(--dropdown-side-offset, 4px);
		}

		.dropdown-menu[data-side='right'][data-align='start'] {
			position-area: right top;
			margin-left: var(--dropdown-side-offset, 4px);
		}

		.dropdown-menu[data-side='right'][data-align='end'] {
			position-area: right bottom;
			margin-left: var(--dropdown-side-offset, 4px);
		}

		.dropdown-menu[data-side='right'][data-align='center'] {
			position-area: right;
			margin-left: var(--dropdown-side-offset, 4px);
		}

		.dropdown-menu[data-side='left'][data-align='start'] {
			position-area: left top;
			margin-right: var(--dropdown-side-offset, 4px);
		}

		.dropdown-menu[data-side='left'][data-align='end'] {
			position-area: left bottom;
			margin-right: var(--dropdown-side-offset, 4px);
		}

		.dropdown-menu[data-side='left'][data-align='center'] {
			position-area: left;
			margin-right: var(--dropdown-side-offset, 4px);
		}
	}

	/*
	 * Tier 3 — no Popover API at all (pre-2023 browsers). Without this, an unknown
	 * `popover` attribute would leave the menu permanently visible in the page flow.
	 * Instead: classic absolute dropdown under the trigger, toggled by the same effect
	 * that syncs `open` (no light dismiss, but fully functional).
	 */
	@supports not selector(:popover-open) {
		.dropdown-menu-wrapper {
			display: inline-block;
			position: relative;
		}

		.dropdown-menu:global([popover]) {
			display: none;
			position: absolute;
			top: calc(100% + var(--dropdown-side-offset, 4px));
			left: 0;
			margin: 0;
			z-index: 50;
		}

		.dropdown-menu:global([popover][data-fallback-open]) {
			display: block;
		}
	}
</style>
