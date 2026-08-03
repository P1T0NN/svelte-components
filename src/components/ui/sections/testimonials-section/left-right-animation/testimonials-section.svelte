<script lang="ts">
	// COMPONENTS
	import Section from '@/components/ui/section/section.svelte';
	import TestimonialsSectionTop from './testimonials-section-top.svelte';
	import TestimonialsSectionBottom from './testimonials-section-bottom.svelte';
</script>

<Section
	id="testimonials"
	surface="background"
	yPadding="lg"
	contain={false}
	ariaLabelledby="testimonials-heading"
>
	<div class="mb-12 flex w-full flex-col items-center justify-center gap-2 px-6">
		<div class="mb-2 flex items-center gap-3">
			<div class="h-px w-8 bg-primary"></div>
			<span class="font-body text-xs tracking-[0.2em] text-primary uppercase"> Social proof </span>
		</div>

		<h3
			id="testimonials-heading"
			class="font-display text-center text-4xl leading-none tracking-wide text-foreground sm:text-5xl md:text-6xl"
		>
			See Why Clients Keep Coming Back
		</h3>
	</div>

	<div class="flex flex-col gap-3">
		<TestimonialsSectionTop />
		<TestimonialsSectionBottom />
	</div>
</Section>
