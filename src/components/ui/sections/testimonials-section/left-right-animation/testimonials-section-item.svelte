<script lang="ts">
	let {
		quote,
		name,
		role,
		avatarSrc,
		xUrl = ''
	}: {
		quote: string;
		name: string;
		role: string;
		avatarSrc: string;
		xUrl?: string;
	} = $props();
</script>

<div
	class="flex h-[220px] w-[280px] shrink-0 grow-0 flex-col justify-between rounded-sm border-[1.2px] border-border sm:w-[320px] md:w-[440px]"
>
	<p class="px-5 py-5 text-sm font-extralight tracking-tight text-foreground md:text-base">
		{quote}
	</p>

	<div class="flex h-[30%] w-full gap-1 overflow-hidden border-t-[1.2px] border-border md:h-[28%]">
		<div class="flex w-3/4 items-center gap-3 px-4 py-3">
			<img class="h-10 w-10 rounded-full" src={avatarSrc} alt={name} />
			<div class="flex flex-1 flex-col items-start justify-start gap-0">
				<h5 class="text-sm font-medium text-foreground md:text-base">{name}</h5>
				<p class="mt-[-4px] text-xs text-muted-foreground md:text-sm">
					{role}
				</p>
			</div>
		</div>

		<div class="w-px bg-border"></div>

		<div class="mx-auto flex max-w-full items-center justify-center">
			{#if xUrl}
				<a
					href={xUrl}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="View {name} on X"
					class="text-xs text-foreground hover:underline md:text-sm"
				>
					View
				</a>
			{:else}
				<span class="text-xs text-muted-foreground md:text-sm" aria-hidden="true">X</span>
			{/if}
		</div>
	</div>
</div>
