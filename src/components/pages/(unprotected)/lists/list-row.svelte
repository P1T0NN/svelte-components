<script lang="ts">
	// TYPES
	import type { Doc } from '@/convex/_generated/dataModel';

	let { rows }: { rows: Doc<'testRows'>[] } = $props();
</script>

<ul class="flex flex-col gap-2">
	{#each rows as row (row._id)}
		<li class="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
			<div class="flex min-w-0 flex-col">
				<span class="truncate text-sm font-medium">{row.name}</span>
				<span class="truncate text-xs text-muted-foreground">{row.email}</span>
			</div>
			<span class="shrink-0 text-xs text-muted-foreground">{row.role} · {row.plan}</span>
		</li>
	{/each}
</ul>
