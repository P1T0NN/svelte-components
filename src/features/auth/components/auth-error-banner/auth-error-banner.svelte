<script lang="ts">
	// SVELTEKIT IMPORTS
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	// COMPONENTS
	import AlertDialog from '@/shared/components/ui/alert-dialog/alert-dialog.svelte';
	import { Button } from '@/shared/components/ui/button/index.js';

	// LUCIDE ICONS
	import ShieldAlertIcon from '@lucide/svelte/icons/shield-alert';

	const TITLES: Record<string, string> = {
		banned: 'Account banned',
		access_denied: 'Access denied',
		unauthorized: 'Sign-in required'
	};

	const error = $derived(page.url.searchParams.get('error'));
	const description = $derived(page.url.searchParams.get('error_description'));
	const open = $derived(error !== null);
	const title = $derived(error ? (TITLES[error] ?? 'Sign-in error') : '');

	function dismiss() {
		const url = new URL(page.url);
		url.searchParams.delete('error');
		url.searchParams.delete('error_description');
		goto(url.pathname + url.search + url.hash, { replaceState: true, noScroll: true });
	}
</script>

<AlertDialog {open} hideTrigger>
	{#snippet children({ dialogId })}
		<header class="alert-dialog__header">
			<div class="flex items-center gap-3">
				<div
					class="bg-destructive/10 text-destructive flex size-10 shrink-0 items-center justify-center rounded-full"
				>
					<ShieldAlertIcon class="size-5" />
				</div>
				<h2>{title}</h2>
			</div>
			{#if description}
				<p class="pt-2">{description}</p>
			{/if}
		</header>

		<footer class="alert-dialog__footer">
			<Button type="button" command="close" commandfor={dialogId} onclick={dismiss}>Got it</Button>
		</footer>
	{/snippet}
</AlertDialog>
