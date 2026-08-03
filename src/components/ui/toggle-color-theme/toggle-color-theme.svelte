<script lang="ts">
	// LIBRARIES
	import { resetMode, setMode, toggleMode } from '@/utils/theme.svelte.js';

	// COMPONENTS
	import DropdownMenu from '@/components/ui/dropdown-menu/dropdown-menu.svelte';
	import { Button } from '@/components/ui/button/index.js';

	// LUCIDE ICONS
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';

	type Props = {
		variant?: 'button' | 'dropdown';
	};

	let { variant = 'button' }: Props = $props();
</script>

{#if variant === 'dropdown'}
	<DropdownMenu align="end" triggerVariant="outline" triggerSize="icon" triggerClass="relative">
		{#snippet triggerChildren()}
			<SunIcon
				class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all! dark:scale-0 dark:-rotate-90"
			/>
			<MoonIcon
				class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all! dark:scale-100 dark:rotate-0"
			/>
			<span class="sr-only">Toggle theme</span>
		{/snippet}

		{#snippet content({ popoverId })}
			<button
				type="button"
				role="menuitem"
				popovertarget={popoverId}
				popovertargetaction="hide"
				class="dropdown-menu__item"
				onclick={() => setMode('light')}
			>
				Light
			</button>
			<button
				type="button"
				role="menuitem"
				popovertarget={popoverId}
				popovertargetaction="hide"
				class="dropdown-menu__item"
				onclick={() => setMode('dark')}
			>
				Dark
			</button>
			<button
				type="button"
				role="menuitem"
				popovertarget={popoverId}
				popovertargetaction="hide"
				class="dropdown-menu__item"
				onclick={() => resetMode()}
			>
				System
			</button>
		{/snippet}
	</DropdownMenu>
{:else}
	<Button onclick={toggleMode} variant="outline" size="icon" class="relative">
		<SunIcon
			class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all! dark:scale-0 dark:-rotate-90"
		/>
		<MoonIcon
			class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all! dark:scale-100 dark:rotate-0"
		/>
		<span class="sr-only">Toggle theme</span>
	</Button>
{/if}
