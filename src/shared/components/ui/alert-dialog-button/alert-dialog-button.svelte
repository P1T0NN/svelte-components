<script lang="ts">
    // LIBRARIES
    import { m } from '@/shared/lib/paraglide/messages';

    // COMPONENTS
    import {
        AlertDialog,
        AlertDialogAction,
        AlertDialogCancel,
        AlertDialogContent,
        AlertDialogDescription,
        AlertDialogFooter,
        AlertDialogHeader,
        AlertDialogTitle,
        AlertDialogTrigger
    } from '@/shared/components/ui/alert-dialog';

    // LUCIDE ICONS
    import { Loader } from '@lucide/svelte';

    interface Props {
        // Function to call when action is confirmed
        function: () => Promise<void> | void;

        // State props
        isPending?: boolean;

        // Style props
        triggerClass?: string;
        actionClass?: string;

        // Children
        triggerChildren?: import("svelte").Snippet;

        // Open state control
        open?: boolean;
        onOpenChange?: (open: boolean) => void;

        // Custom text
        title?: string;
        description?: string;
    }

    let {
        function: actionFunction,
        isPending = false,
        triggerClass = "w-full",
        actionClass = "",
        triggerChildren,
        open = $bindable(false),
        onOpenChange,
        title,
        description
    }: Props = $props();

    async function handleAction() {
        await actionFunction();
    }
</script>

<AlertDialog {open} {onOpenChange}>
    <AlertDialogTrigger class={triggerClass}>
        {@render triggerChildren?.()}
    </AlertDialogTrigger>

    <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>{title ?? m["AlertDialogButton.title"]()}</AlertDialogTitle>
            <AlertDialogDescription>
                {description ?? m["AlertDialogButton.description"]()}
            </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
            <AlertDialogCancel
                type="button"
                onclick={() => onOpenChange ? onOpenChange(false) : open = false}
                disabled={isPending}
            >
                {m["AlertDialogButton.cancel"]()}
            </AlertDialogCancel>

            <AlertDialogAction
                type="button"
                onclick={handleAction}
                class={actionClass}
                disabled={isPending}
            >
                {#if isPending}
                    <Loader class="h-3 w-3 animate-spin" />
                {/if}
                {m["AlertDialogButton.proceed"]()}
            </AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
</AlertDialog>