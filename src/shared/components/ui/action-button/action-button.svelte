<script lang="ts">
	// COMPONENTS
	import AlertDialogButton from '@/shared/components/ui/alert-dialog-button/alert-dialog-button.svelte';
	import {
		buttonVariants,
		type ButtonSize,
		type ButtonVariant
	} from '@/shared/components/ui/button/index.js';

	// UTILS
	import { cn } from '@/shared/utils/utils.js';

	type Props = {
		/** Confirmed-action handler. Invoked after the user clicks the dialog's confirm button. */
		function: () => Promise<void> | void;
		/** Trigger content (icon, label, count, etc.). */
		children: import('svelte').Snippet;
		/** Button variant applied to both the trigger and the confirm action. */
		variant?: ButtonVariant;
		/** Trigger button size. */
		size?: ButtonSize;
		class?: string;
		/** Shows a spinner on the confirm action and disables it while the action is running. */
		isPending?: boolean;
		/** Dialog copy overrides; fall back to AlertDialogButton defaults. */
		title?: string;
		description?: string;
	};

	let {
		function: actionFunction,
		children,
		variant = 'default',
		size = 'sm',
		class: className,
		isPending = false,
		title,
		description
	}: Props = $props();

	const triggerClass = $derived(cn(buttonVariants({ variant, size }), className));
	const actionClass = $derived(buttonVariants({ variant }));
</script>

<AlertDialogButton
	function={actionFunction}
	{isPending}
	{title}
	{description}
	{triggerClass}
	{actionClass}
>
	{#snippet triggerChildren()}
		{@render children()}
	{/snippet}
</AlertDialogButton>
