<script lang="ts">
	// LUCIDE ICONS
	import LinkOffIcon from '@lucide/svelte/icons/unlink';

	/**
	 * Empty state for the linked-accounts list. Same house pattern as
	 * `admin-user-sessions-empty.svelte` (icon medallion + title + description,
	 * `role="status"`), sized for a tab panel rather than a full page.
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
		<LinkOffIcon class="size-5 opacity-80" />
	</span>

	<div class="max-w-sm space-y-1">
		<p class="text-sm font-medium text-foreground">No linked accounts.</p>
		<p class="text-sm leading-relaxed text-muted-foreground">
			This user has no sign-in provider connected yet.
		</p>
	</div>
</div>
