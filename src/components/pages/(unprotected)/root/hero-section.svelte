<script lang="ts">
	import Section from '@/components/ui/section/section.svelte';
</script>

<Section
	yPadding="none"
	containerClass="flex min-h-dvh flex-col items-center justify-center gap-4 text-center sm:gap-6"
>
	<h1 class="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
		Welcome to SvelteKit
	</h1>
	<p class="max-w-prose text-base text-muted-foreground sm:text-lg">
		Visit
		<a
			class="font-medium text-primary underline-offset-4 hover:underline"
			href="https://svelte.dev/docs/kit"
			rel="noopener noreferrer"
			target="_blank"
		>
			svelte.dev/docs/kit
		</a>
		to read the documentation
	</p>
</Section>
