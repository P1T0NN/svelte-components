<script lang="ts">
	// LIBRARIES
	import { setLocale, getLocale } from '@/shared/lib/paraglide/runtime';

	// COMPONENTS
	import { NativeSelect } from '@/shared/components/ui/select';

	// SVGS
	import UnitedKingdomFlag from '@/shared/svgs/united-kingdom-flag.svelte';
	import GermanyFlag from '@/shared/svgs/germany-flag.svelte';

	// UTILS
	import { cn } from '@/shared/utils/utils';

	interface Props {
		variant?: 'default' | 'header';
	}

	let { variant = 'default' }: Props = $props();

	let selectedLanguage = $state(getLocale() === 'de' ? 'de' : 'en');

	const languages = [
		{ name: 'English', locale: 'en' as const },
		{ name: 'Deutsch', locale: 'de' as const }
	];

	function handleLanguageChange(languageCode: string) {
		selectedLanguage = languageCode;
		setLocale(languageCode === 'de' ? 'de' : 'en');
	}
</script>

<NativeSelect
	value={selectedLanguage}
	onChange={handleLanguageChange}
	ariaLabel="Select language"
	class={cn(
		'w-auto',
		variant === 'header' &&
			'border-hero-overlay-foreground/20 bg-hero-overlay-foreground/10 hover:bg-hero-overlay-foreground/20 text-hero-overlay-foreground'
	)}
	options={languages.map((language) => ({ value: language.locale, label: language.name }))}
>
	{#snippet option(opt)}
		{#if opt.value === 'en'}
			<UnitedKingdomFlag />
		{:else}
			<GermanyFlag />
		{/if}
		<span class="font-dm-sans text-sm font-medium">{opt.label}</span>
	{/snippet}
</NativeSelect>
