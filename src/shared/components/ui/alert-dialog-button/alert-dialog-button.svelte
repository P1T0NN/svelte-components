<script lang="ts">
	// LIBRARIES
	import { m } from '@/shared/lib/paraglide/messages';

	// COMPONENTS
	import AlertDialog from '@/shared/components/ui/alert-dialog/alert-dialog.svelte';
	import { Button } from '@/shared/components/ui/button/index.js';

	// LUCIDE ICONS
	import { Loader } from '@lucide/svelte';

	interface Props {
		function: () => Promise<void> | void;
		isPending?: boolean;
		actionDisabled?: boolean;
		triggerClass?: string;
		actionClass?: string;
		isDestructive?: boolean;
		hideProceed?: boolean;
		triggerChildren?: import('svelte').Snippet;
		body?: import('svelte').Snippet;
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		title?: string;
		description?: string;
	}

	let {
		function: actionFunction,
		isPending = false,
		actionDisabled = false,
		triggerClass = 'w-full',
		actionClass = '',
		isDestructive = false,
		hideProceed = false,
		triggerChildren,
		body,
		open = $bindable(false),
		onOpenChange,
		title,
		description
	}: Props = $props();

	async function handleAction() {
		await actionFunction();
		open = false;
		onOpenChange?.(false);
	}
</script>

<AlertDialog
	bind:open
	{onOpenChange}
	class={isDestructive ? 'ring-destructive/30' : ''}
	triggerClass={triggerClass}
>
	{#snippet triggerChildren()}
		{@render triggerChildren?.()}
	{/snippet}

	{#snippet children({ dialogId })}
		<header class="alert-dialog__header">
			<h2 class={isDestructive ? 'text-destructive' : ''}>
				{title ?? m['AlertDialogButton.title']()}
			</h2>
			<p>{description ?? m['AlertDialogButton.description']()}</p>
		</header>

		{#if body}
			<div class="py-2">
				{@render body()}
			</div>
		{/if}

		<footer class="alert-dialog__footer">
			<Button
				type="button"
				variant="outline"
				command="close"
				commandfor={dialogId}
				disabled={isPending}
			>
				{m['AlertDialogButton.cancel']()}
			</Button>

			{#if !hideProceed}
				<Button
					type="button"
					onclick={handleAction}
					class={actionClass}
					variant={isDestructive ? 'destructive' : 'default'}
					disabled={isPending || actionDisabled}
				>
					{#if isPending}
						<Loader class="h-3 w-3 animate-spin" />
					{/if}
					{m['AlertDialogButton.proceed']()}
				</Button>
			{/if}
		</footer>
	{/snippet}
</AlertDialog>
