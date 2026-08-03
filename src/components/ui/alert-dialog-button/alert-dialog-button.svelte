<script lang="ts">
	// COMPONENTS
	import AlertDialog from '@/components/ui/alert-dialog/alert-dialog.svelte';
	import { Button } from '@/components/ui/button/index.js';

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
		triggerChildren: triggerChildrenProp,
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
	{triggerClass}
>
	{#snippet triggerChildren()}
		<!-- Aliased prop: the snippet name shadows `triggerChildren` in its own scope, so
		     rendering the un-aliased prop here was a self-reference that dropped the
		     caller's trigger content. -->
		{@render triggerChildrenProp?.()}
	{/snippet}

	{#snippet children({ dialogId })}
		<header class="alert-dialog__header">
			<h2 class={isDestructive ? 'text-destructive' : ''}>
				{title ?? 'Action cannot be reversed'}
			</h2>
			<p>{description ?? 'Are you sure you want to do this? This action cannot be undone.'}</p>
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
				Cancel
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
					Proceed
				</Button>
			{/if}
		</footer>
	{/snippet}
</AlertDialog>
