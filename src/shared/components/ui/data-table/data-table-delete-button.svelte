<script lang="ts">
	// LIBRARIES
	import { m } from '@/shared/lib/paraglide/messages';

	// COMPONENTS
	import AlertDialogButton from '@/shared/components/ui/alert-dialog-button/alert-dialog-button.svelte';
	import { buttonVariants } from '@/shared/components/ui/button/index.js';

	// UTILS
	import { cn } from '@/shared/utils/utils.js';

	// LUCIDE ICONS
	import Trash2Icon from '@lucide/svelte/icons/trash-2';

	type Props = {
		/** Confirmed-delete handler. Required; the component has no built-in default. */
		deleteFunction: () => Promise<void> | void;
		/** Shown inline with the label ("Delete (3)") to reinforce scope before destructive action. */
		count?: number;
		class?: string;
		/** Spinner + disables the confirm action while deletion is in flight. */
		isPending?: boolean;
		/** Optional dialog copy overrides; falls back to AlertDialogButton defaults. */
		title?: string;
		description?: string;
	};

	let {
		deleteFunction,
		count,
		class: className,
		isPending = false,
		title,
		description
	}: Props = $props();

	const showCount = $derived(typeof count === 'number' && count > 0);

	const triggerClass = $derived(
		cn(buttonVariants({ variant: 'destructive', size: 'sm' }), className)
	);
</script>

<AlertDialogButton
	function={deleteFunction}
	{isPending}
	{title}
	{description}
	{triggerClass}
	actionClass={buttonVariants({ variant: 'destructive' })}
>
	{#snippet triggerChildren()}
		<Trash2Icon />
		<span>{m['DataTable.delete']()}</span>
		{#if showCount}
			<span class="tabular-nums opacity-80">({count})</span>
		{/if}
	{/snippet}
</AlertDialogButton>
