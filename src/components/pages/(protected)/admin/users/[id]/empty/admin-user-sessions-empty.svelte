<script lang="ts">
	// LUCIDE ICONS
	import MonitorOffIcon from '@lucide/svelte/icons/monitor-off';

	/**
	 * Empty state for the sessions list. Follows the house pattern from
	 * `data-table-empty.svelte` (icon medallion + title + description, `role="status"`),
	 * sized down because it sits inside a tab panel rather than replacing a page.
	 */
</script>

<div
	class="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed px-6 py-10 text-center"
	role="status"
>
	<span
		class="inline-flex size-11 items-center justify-center rounded-full bg-muted/50 text-muted-foreground ring-1 ring-border"
		aria-hidden="true"
	>
		<MonitorOffIcon class="size-5 opacity-80" />
	</span>

	<div class="max-w-sm space-y-1">
		<p class="text-sm font-medium text-foreground">No active sessions.</p>
		<p class="text-sm leading-relaxed text-muted-foreground">
			This user isn't signed in on any device right now.
		</p>
	</div>
</div>
