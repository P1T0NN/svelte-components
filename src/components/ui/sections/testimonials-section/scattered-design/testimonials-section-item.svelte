<script lang="ts">
	// COMPONENTS
	import * as Avatar from '@/components/ui/avatar';

	// UTILS
	import { cn } from '@/utils/utils.js';

	// TYPES
	import type { typesTestimonial } from '../testimonialTypes';

	// LUCIDE ICONS
	import StarIcon from '@lucide/svelte/icons/star';

	type Variant = 'polaroid' | 'chip' | 'note';

	let {
		testimonial,
		variant = 'polaroid'
	}: {
		testimonial: typesTestimonial;
		variant?: Variant;
	} = $props();

	const fallbackInitial = $derived(
		testimonial.name.trim().charAt(0).toLocaleUpperCase(undefined) || '?'
	);
</script>

<article
	class={cn(
		'group relative h-full transition-transform duration-500 ease-out',
		// Hover lifts the card and straightens it on lg+; mobile stays still since cards aren't rotated there.
		'lg:hover:z-10 lg:hover:-translate-y-1 lg:hover:rotate-0'
	)}
>
	{#if variant === 'polaroid'}
		<!--
			Pinned card: serif quote leads, avatar always sits beside the name in the footer.
			Tape strip at the top sells the pinned-to-the-wall feel.
		-->
		<div
			class="relative flex h-full flex-col rounded-sm border border-border bg-card shadow-[0_18px_40px_-20px_oklch(0_0_0/0.25)]"
		>
			<span
				aria-hidden="true"
				class="absolute -top-2 left-1/2 hidden h-4 w-16 -translate-x-1/2 -rotate-3 bg-foreground/8 lg:block"
			></span>

			<div class="flex flex-1 flex-col gap-4 px-5 pt-6 pb-5">
				{#if testimonial.stars}
					<div class="flex gap-0.5 text-accent" aria-label="{testimonial.stars} out of 5 stars">
						{#each [...Array(testimonial.stars).keys()] as i (i)}
							<StarIcon class="size-3.5 shrink-0 fill-current" aria-hidden="true" />
						{/each}
					</div>
				{/if}

				<p class="font-serif text-[0.95rem] leading-relaxed text-foreground/85 italic">
					"{testimonial.quote}"
				</p>

				<footer class="mt-auto flex items-center gap-3 border-t border-border/60 pt-3">
					<Avatar.Root class="size-10 shrink-0 ring-1 ring-border ring-offset-2 ring-offset-card">
						<Avatar.Image src={testimonial.avatar} alt="" width={64} height={64} />
						<Avatar.Fallback aria-hidden="true">{fallbackInitial}</Avatar.Fallback>
					</Avatar.Root>
					<div class="min-w-0">
						<p class="truncate font-serif text-base text-foreground">{testimonial.name}</p>
						<p class="truncate text-[0.7rem] tracking-[0.18em] text-muted-foreground uppercase">
							{testimonial.role}
						</p>
					</div>
				</footer>
			</div>
		</div>
	{:else if variant === 'chip'}
		<!--
			Quote chip: narrow, text-only. The oversized opening quote glyph anchors it as
			a pure typographic object — no photo competes with the words.
		-->
		<div
			class="relative flex h-full flex-col rounded-2xl border border-border bg-card px-6 py-7 shadow-[0_18px_40px_-22px_oklch(0_0_0/0.2)]"
		>
			<span
				aria-hidden="true"
				class="absolute -top-2 left-4 font-serif text-7xl leading-none text-accent/25 select-none"
				>"</span
			>

			<p class="mt-2 font-serif text-lg leading-snug text-foreground/90">
				{testimonial.quote}
			</p>

			<footer class="mt-6 flex items-center gap-3">
				<Avatar.Root class="size-9 ring-1 ring-border ring-offset-2 ring-offset-card">
					<Avatar.Image src={testimonial.avatar} alt="" width={64} height={64} />
					<Avatar.Fallback class="text-xs" aria-hidden="true">{fallbackInitial}</Avatar.Fallback>
				</Avatar.Root>
				<div class="min-w-0">
					<p class="truncate text-sm font-medium text-foreground">{testimonial.name}</p>
					<p class="truncate text-xs text-muted-foreground">{testimonial.role}</p>
				</div>
			</footer>
		</div>
	{:else}
		<!--
			Handwritten note: a squarer card with the rating leading. Subtle tinted band at
			the top reads as washi tape without using a real image.
		-->
		<div
			class="relative flex h-full flex-col rounded-md border border-border bg-card shadow-[0_14px_32px_-20px_oklch(0_0_0/0.25)]"
		>
			<div class="h-2 w-full rounded-t-md bg-accent/10"></div>
			<span
				aria-hidden="true"
				class="absolute top-0 right-6 hidden h-3 w-10 rotate-12 bg-accent/30 lg:block"
			></span>

			<div class="flex flex-1 flex-col gap-4 p-5">
				{#if testimonial.stars}
					<div class="flex gap-1 text-accent" aria-label="{testimonial.stars} out of 5 stars">
						{#each [...Array(testimonial.stars).keys()] as i (i)}
							<StarIcon class="size-4 shrink-0 fill-current" aria-hidden="true" />
						{/each}
					</div>
				{/if}

				<p class="font-serif text-base leading-relaxed text-foreground/90">
					"{testimonial.quote}"
				</p>

				<footer class="mt-auto flex items-center gap-3 pt-2">
					<Avatar.Root class="size-10 shrink-0">
						<Avatar.Image src={testimonial.avatar} alt="" width={64} height={64} />
						<Avatar.Fallback aria-hidden="true">{fallbackInitial}</Avatar.Fallback>
					</Avatar.Root>
					<div class="min-w-0">
						<p class="truncate text-sm font-semibold text-foreground">{testimonial.name}</p>
						<p class="truncate text-xs text-muted-foreground">{testimonial.role}</p>
					</div>
				</footer>
			</div>
		</div>
	{/if}
</article>
