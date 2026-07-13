<script lang="ts">
	// CLASSES
	import { authClass } from '@/features/auth/classes/authClass.svelte';

	// LIBRARIES
	import { useAuth } from '@mmailaender/convex-better-auth-svelte/svelte';

	// COMPONENTS
	import * as Avatar from '@/shared/components/ui/avatar/index.js';
	import DropdownMenu from '@/shared/components/ui/dropdown-menu/dropdown-menu.svelte';
	import { sidebarMenuButtonVariants } from '@/shared/components/ui/sidebar/sidebar-menu-button.svelte';
	import * as Sidebar from '@/shared/components/ui/sidebar/index.js';
	import { Spinner } from '@/shared/components/ui/spinner/index.js';

	// UTILS
	import { cn } from '@/shared/utils/utils.js';

	// LUCIDE ICONS
	import BadgeCheckIcon from '@lucide/svelte/icons/badge-check';
	import BellIcon from '@lucide/svelte/icons/bell';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';

	const sidebar = Sidebar.useSidebar();
	const auth = useAuth();
	const user = $derived(authClass.currentUser);

	const userLoading = $derived(authClass.userLoading);

	const showUserLoading = $derived(
		auth.isLoading || userLoading || (auth.isAuthenticated && user === undefined)
	);

	const triggerClass = cn(
		sidebarMenuButtonVariants({ size: 'lg' }),

		'data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
	);
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu
			triggerVariant="ghost"
			triggerDisabled={showUserLoading}
			{triggerClass}
			side={sidebar.isMobile ? 'bottom' : 'right'}
			align="end"
			sideOffset={4}
			contentClass="min-w-56 rounded-lg"
		>
			{#snippet triggerChildren()}
				{#if showUserLoading}
					<div
						class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent/30"
						aria-hidden="true"
					>
						<Spinner class="size-4 text-sidebar-foreground" />
					</div>
				{:else}
					<Avatar.Root class="size-8 rounded-lg">
						<Avatar.Image src={user?.image} alt={user?.name ?? ''} />

						<Avatar.Fallback class="rounded-lg">CN</Avatar.Fallback>
					</Avatar.Root>

					<div class="grid flex-1 text-start text-sm leading-tight">
						<span class="truncate font-medium">{user?.name ?? 'Account'}</span>

						<span class="truncate text-xs text-muted-foreground">{user?.email ?? ''}</span>
					</div>
				{/if}

				<ChevronsUpDownIcon class="ms-auto size-4 shrink-0" />
			{/snippet}

			{#snippet content({ popoverId })}
				<div class="dropdown-menu__label">
					<div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
						<Avatar.Root class="size-8 rounded-lg">
							<Avatar.Image src={user?.image} alt={user?.name ?? ''} />

							<Avatar.Fallback class="rounded-lg">CN</Avatar.Fallback>
						</Avatar.Root>

						<div class="grid flex-1 text-start text-sm leading-tight">
							<span class="truncate font-medium">{user?.name ?? 'Account'}</span>

							<span class="truncate text-xs text-muted-foreground">{user?.email ?? ''}</span>
						</div>
					</div>
				</div>

				<hr class="dropdown-menu__separator" />

				<div role="group">
					<button
						type="button"
						role="menuitem"
						popovertarget={popoverId}
						popovertargetaction="hide"
						class="dropdown-menu__item"
					>
						<SparklesIcon />

						Upgrade to Pro
					</button>
				</div>

				<hr class="dropdown-menu__separator" />

				<div role="group">
					<button
						type="button"
						role="menuitem"
						popovertarget={popoverId}
						popovertargetaction="hide"
						class="dropdown-menu__item"
					>
						<BadgeCheckIcon />

						Account
					</button>

					<button
						type="button"
						role="menuitem"
						popovertarget={popoverId}
						popovertargetaction="hide"
						class="dropdown-menu__item"
					>
						<CreditCardIcon />

						Billing
					</button>

					<button
						type="button"
						role="menuitem"
						popovertarget={popoverId}
						popovertargetaction="hide"
						class="dropdown-menu__item"
					>
						<BellIcon />

						Notifications
					</button>
				</div>

				<hr class="dropdown-menu__separator" />

				<button
					type="button"
					role="menuitem"
					popovertarget={popoverId}
					popovertargetaction="hide"
					class="dropdown-menu__item"
				>
					<LogOutIcon />

					Log out
				</button>
			{/snippet}
		</DropdownMenu>
	</Sidebar.MenuItem>
</Sidebar.Menu>
