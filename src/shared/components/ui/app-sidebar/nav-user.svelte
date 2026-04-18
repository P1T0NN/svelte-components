<script lang="ts">
	// CLASSES
	import { usersClass } from '@/features/users/classes/users-class.svelte';

	// LIBRARIES
	import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';

	// COMPONENTS
	import * as Avatar from '@/shared/components/ui/avatar/index.js';
	import * as DropdownMenu from '@/shared/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '@/shared/components/ui/sidebar/index.js';
	import { Spinner } from '@/shared/components/ui/spinner/index.js';

	// LUCIDE ICONS
	import BadgeCheckIcon from '@lucide/svelte/icons/badge-check';
	import BellIcon from '@lucide/svelte/icons/bell';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import CreditCardIcon from '@lucide/svelte/icons/credit-card';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';

	const sidebar = Sidebar.useSidebar();

	const auth = useAuth();

	const user = $derived(usersClass.currentUser);
	const userLoading = $derived(usersClass.userLoading);
	/** Avoid “Account” flash before auth + Convex have settled. */
	const showUserLoading = $derived(auth.isLoading || userLoading || (auth.isAuthenticated && user === undefined));
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger disabled={showUserLoading}>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						{...props}
					>
						{#if showUserLoading}
							<div
								class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent/30"
								aria-hidden="true"
							>
								<Spinner class="size-4 text-sidebar-foreground" />
							</div>
							<div class="grid min-h-10 flex-1 content-center gap-1 text-start text-sm leading-tight">
								<span class="text-muted-foreground truncate">Loading…</span>
								<span class="text-muted-foreground/70 truncate text-xs">&nbsp;</span>
							</div>
						{:else}
							<Avatar.Root class="size-8 rounded-lg">
								<Avatar.Image src={user?.image} alt={user?.name ?? ''} />
								<Avatar.Fallback class="rounded-lg">CN</Avatar.Fallback>
							</Avatar.Root>

							<div class="grid flex-1 text-start text-sm leading-tight">
								<span class="truncate font-medium">{user?.name ?? 'Account'}</span>
								<span class="text-muted-foreground truncate text-xs">{user?.email ?? ''}</span>
							</div>
						{/if}

						<ChevronsUpDownIcon class="ms-auto size-4 shrink-0" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>

			<DropdownMenu.Content
				class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
				side={sidebar.isMobile ? 'bottom' : 'right'}
				align="end"
				sideOffset={4}
			>
				<DropdownMenu.Label class="p-0 font-normal">
					<div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
						<Avatar.Root class="size-8 rounded-lg">
							<Avatar.Image src={user?.image} alt={user?.name ?? ''} />
							<Avatar.Fallback class="rounded-lg">CN</Avatar.Fallback>
						</Avatar.Root>

						<div class="grid flex-1 text-start text-sm leading-tight">
							<span class="truncate font-medium">{user?.name ?? 'Account'}</span>
							<span class="text-muted-foreground truncate text-xs">{user?.email ?? ''}</span>
						</div>
					</div>
				</DropdownMenu.Label>

				<DropdownMenu.Separator />

				<DropdownMenu.Group>
					<DropdownMenu.Item>
						<SparklesIcon />
						Upgrade to Pro
					</DropdownMenu.Item>
				</DropdownMenu.Group>

				<DropdownMenu.Separator />

				<DropdownMenu.Group>
					<DropdownMenu.Item>
						<BadgeCheckIcon />
						Account
					</DropdownMenu.Item>

					<DropdownMenu.Item>
						<CreditCardIcon />
						Billing
					</DropdownMenu.Item>

					<DropdownMenu.Item>
						<BellIcon />
						Notifications
					</DropdownMenu.Item>
				</DropdownMenu.Group>

				<DropdownMenu.Separator />

				<DropdownMenu.Item>
					<LogOutIcon />
					Log out
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
