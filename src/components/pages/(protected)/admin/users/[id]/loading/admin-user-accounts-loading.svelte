<script lang="ts">
	// COMPONENTS
	import { Skeleton } from '@/components/ui/skeleton/index.js';

	/**
	 * Loading placeholder for the linked-accounts list. Mirrors `AdminUserAccountsItem`'s
	 * layout — provider line above a wrapped meta line — so rows resolve in place instead of
	 * the list jumping when the data lands.
	 */
	let { rows = 2 }: { rows?: number } = $props();
</script>

<ul class="flex flex-col gap-2" aria-busy="true" aria-live="polite">
	{#each { length: rows }}
		<li class="flex flex-col gap-2 rounded-md border p-3">
			<!-- provider name (+ credential badge) -->
			<div class="flex flex-wrap items-center gap-2">
				<Skeleton class="h-4 w-24" />
				<Skeleton class="h-4 w-20 rounded" />
			</div>

			<!-- id · created -->
			<div class="flex flex-wrap gap-x-3 gap-y-1">
				<Skeleton class="h-3 w-48" />
				<Skeleton class="h-3 w-32" />
			</div>
		</li>
	{/each}
</ul>
