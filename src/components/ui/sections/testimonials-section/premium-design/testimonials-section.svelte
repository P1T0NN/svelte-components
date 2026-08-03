<script lang="ts">
	// COMPONENTS
	import Section from '@/components/ui/section/section.svelte';
	import TestimonialsSectionItem from './testimonials-section-item.svelte';

	// DATA
	import { TESTIMONIALS } from '../testimonialsData';
</script>

<Section id="gallery" surface="background" yPadding="lg" ariaLabelledby="gallery-heading">
	<div class="mb-12 text-center">
		<p class="mb-2 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
			Real clients
		</p>

		<h2
			id="gallery-heading"
			class="font-serif text-3xl font-medium text-primary italic sm:text-4xl"
		>
			What clients say
		</h2>
	</div>

	<TestimonialsSectionItem testimonial={TESTIMONIALS[0]} variant="featured" />

	<div class="my-12 flex items-center gap-6">
		<div class="h-px flex-1 bg-border"></div>
		<span class="font-serif text-2xl leading-none text-border italic" aria-hidden="true">·</span>
		<div class="h-px flex-1 bg-border"></div>
	</div>

	<div class="grid grid-cols-1 gap-10 sm:grid-cols-2">
		{#each TESTIMONIALS.slice(1, 3) as testimonial (testimonial.name)}
			<TestimonialsSectionItem {testimonial} />
		{/each}
	</div>
</Section>
