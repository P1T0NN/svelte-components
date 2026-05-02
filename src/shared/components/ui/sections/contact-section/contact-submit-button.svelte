<script lang="ts">
	// LIBRARIES
	import { m } from '@/shared/lib/paraglide/messages';
	import { safeParse } from 'valibot';

	// CLASSES
	import { contactSectionClass } from './contactSection.svelte.ts';

	// COMPONENTS
	import { Button } from '@/shared/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import Spinner from '@/shared/components/ui/spinner/spinner.svelte';

	// ACTIONS
	import { sendContactFormEmail } from '@/features/contact/actions/contactActions.remote';

	// SCHEMAS
	import { sendContactFormEmailSchema } from '@/features/contact/schemas/contactSchemas';

	// UTILS
	import { valibotIssuesToFieldErrors } from '@/shared/utils/validationUtils.js';

	let submitting = $state(false);

	async function handleSend() {
		const data = {
			name: contactSectionClass.contactInputs.name,
			email: contactSectionClass.contactInputs.email,
			message: contactSectionClass.contactInputs.message
		};

		const validation = safeParse(sendContactFormEmailSchema, data);

		if (!validation.success) {
			contactSectionClass.fieldErrors = valibotIssuesToFieldErrors(validation.issues);
			toast.error(validation.issues[0]?.message);
			return;
		}

		contactSectionClass.fieldErrors = {};

		submitting = true;

		try {
			const result = await sendContactFormEmail({
				name: validation.output.name,
				email: validation.output.email,
				message: validation.output.message
			});

			if (!result.success) {
				toast.error(result.message);
				return;
			}

			toast.success(result.message);
			contactSectionClass.clearInputs();
		} finally {
			submitting = false;
		}
	}
</script>

<Button
	type="button"
	class="mt-4 w-full shadow-none"
	disabled={submitting}
	onclick={handleSend}
>
	{#if submitting}
		<Spinner />
	{/if}
	{m['ContactSection.ContactSubmitButton.sendMessage']()}
</Button>
