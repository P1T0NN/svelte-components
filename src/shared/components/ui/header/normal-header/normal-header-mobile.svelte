<script lang="ts">
	// SVELTEKIT
	import { page } from '$app/state';

	// LIBRARIES
	import { deLocalizeUrl } from '@/shared/lib/paraglide/runtime';
	import { useAuth } from '@mmailaender/convex-better-auth-svelte/svelte';

	// CONFIG
	import { COMPANY_DATA } from '@/shared/constants.js';

	// CLASSES
	import {
		isNavItemActive,
		navItems,
		navLinkActiveClass,
		navLinkClass
	} from './normal-header.svelte.ts';

	// COMPONENTS
	import { buttonVariants } from '@/shared/components/ui/button/button.svelte';
	import Button from '@/shared/components/ui/button/button.svelte';
	import Link from '@/shared/components/ui/link/link.svelte';
	import Logo from '@/shared/components/ui/logo/logo.svelte';
	import LanguageSelector from '@/shared/components/ui/language-selector/language-selector.svelte';
	import LogoutButton from '@/features/auth/components/logout-button/logout-button.svelte';
	import { NativeDrawer } from '@/shared/components/ui/native-drawer';
	import { Separator } from '@/shared/components/ui/separator';
	import LoginButton from '@/features/auth/components/login-button/login-button.svelte';

	// UTILS
	import { cn } from '@/shared/utils/utils.js';

	// LUCIDE ICONS
	import MenuIcon from '@lucide/svelte/icons/menu';
	import XIcon from '@lucide/svelte/icons/x';

	let { hasLogo = true }: { hasLogo?: boolean } = $props();

	const auth = useAuth();
	const isAuthenticated = $derived(auth.isAuthenticated);

	const pathnameLogical = $derived(new URL(deLocalizeUrl(page.url.href)).pathname);
</script>

<!--
	Fully declarative: the hamburger opens the drawer via native `popovertarget` (zero JS).
	`close` (from the panel) closes it on navigation — a nav <a> can't use `popovertarget`,
	and clicking a link inside a popover doesn't dismiss it, so this is the one place a
	handler is needed. It calls the native `hidePopover()` under the hood.
-->
<NativeDrawer
	direction="right"
	title="Menu"
	class="flex h-full max-h-dvh w-full max-w-80 flex-col gap-4 overflow-x-hidden overflow-y-auto border-border bg-background p-4 sm:max-w-80"
>
	{#snippet trigger({ props })}
		<button
			{...props}
			class={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'lg:hidden touch-manipulation')}
			aria-label="Toggle navigation menu"
		>
			<!-- CSS swaps these based on the drawer's open state (see native-sheet.svelte). -->
			<MenuIcon data-sheet-icon="closed" class="size-5" />
			<XIcon data-sheet-icon="open" class="size-5" />
		</button>
	{/snippet}

	{#snippet children({ popoverId, close })}
		<div class="flex min-w-0 items-center justify-between gap-2">
			<div class="min-w-0">
				{#if hasLogo}
					<Logo size="sm" onclick={close} />
				{:else}
					<span class="truncate text-sm font-semibold">{COMPANY_DATA.NAME}</span>
				{/if}
			</div>

			<Button
				type="button"
				variant="ghost"
				size="icon"
				class="shrink-0 touch-manipulation"
				aria-label="Close menu"
				popovertarget={popoverId}
				popovertargetaction="hide"
			>
				<XIcon class="size-5" />
			</Button>
		</div>

		<nav aria-label="Mobile main">
			<ul class="flex flex-col gap-1">
				{#each navItems as item (item.href)}
					{@const active = isNavItemActive(pathnameLogical, item.href)}
					<li>
						<Link
							href={item.href}
							class={cn(navLinkClass, 'block w-full', active && navLinkActiveClass)}
							aria-current={active ? 'page' : undefined}
							onclick={close}
						>
							{item.label}
						</Link>
					</li>
				{/each}
			</ul>
		</nav>

		<div class="mt-auto flex flex-col gap-3">
			<div class="self-start">
				<LanguageSelector variant="default" />
			</div>

			<Separator />

			<div class="sm:hidden">
				{#if isAuthenticated}
					<LogoutButton />
				{:else}
					<LoginButton />
				{/if}
			</div>
		</div>
	{/snippet}
</NativeDrawer>
