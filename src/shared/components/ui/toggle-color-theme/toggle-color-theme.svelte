<script lang="ts">
	// LIBRARIES
	import { m } from '@/shared/lib/paraglide/messages';
	import { resetMode, setMode, toggleMode } from 'mode-watcher';

	// COMPONENTS
	import * as DropdownMenu from '@/shared/components/ui/dropdown-menu/index.js';
	import { Button, buttonVariants } from '@/shared/components/ui/button/index.js';

	// UTILS
	import { cn } from '@/shared/utils/utils.js';

	// LUCIDE ICONS
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';

	type Props = {
		variant?: 'button' | 'dropdown';
	};

	let { variant = 'button' }: Props = $props();

	const triggerClass = cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'relative');
</script>

{#if variant === 'dropdown'}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class={triggerClass}>
			<SunIcon
				class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all! dark:scale-0 dark:-rotate-90"
			/>
			<MoonIcon
				class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all! dark:scale-100 dark:rotate-0"
			/>
			<span class="sr-only">{m['ToggleColorTheme.toggleTheme']()}</span>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end">
			<DropdownMenu.Item onclick={() => setMode('light')}>
				{m['ToggleColorTheme.light']()}
			</DropdownMenu.Item>
			<DropdownMenu.Item onclick={() => setMode('dark')}>
				{m['ToggleColorTheme.dark']()}
			</DropdownMenu.Item>
			<DropdownMenu.Item onclick={() => resetMode()}>
				{m['ToggleColorTheme.system']()}
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{:else}
	<Button onclick={toggleMode} variant="outline" size="icon" class="relative">
		<SunIcon
			class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all! dark:scale-0 dark:-rotate-90"
		/>
		<MoonIcon
			class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all! dark:scale-100 dark:rotate-0"
		/>
		<span class="sr-only">{m['ToggleColorTheme.toggleTheme']()}</span>
	</Button>
{/if}
