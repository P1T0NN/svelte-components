<script lang="ts">
	// COMPONENTS
	import { Skeleton } from '@/components/ui/skeleton/index.js';

	/**
	 * Loading placeholder for the sessions list. Mirrors `AdminUserSessionsItem`'s real
	 * layout — same border, padding and two-column split — so rows resolve in place instead
	 * of the list jumping when the data lands.
	 */
	let { rows = 3 }: { rows?: number } = $props();
</script>

<ul class="flex flex-col gap-2" aria-busy="true" aria-live="polite">
	{#each { length: rows }}
		<li
			class="flex flex-col items-start justify-between gap-2 rounded-md border p-3 md:flex-row md:items-center"
		>
			<div class="flex min-w-0 flex-1 flex-col gap-2">
				<!-- device / user-agent line -->
				<Skeleton class="h-4 w-2/3 max-w-72" />

				<!-- ip · created · expires -->
				<div class="flex flex-wrap gap-x-3 gap-y-1">
					<Skeleton class="h-3 w-24" />
					<Skeleton class="h-3 w-32" />
					<Skeleton class="h-3 w-32" />
				</div>
			</div>

			<!-- revoke button -->
			<Skeleton class="h-8 w-20 shrink-0" />
		</li>
	{/each}
</ul>
