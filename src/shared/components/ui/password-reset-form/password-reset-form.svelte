<script lang="ts">
	// SVELTEKIT IMPORTS
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	// LIBRARIES
	import { m } from '@/shared/lib/paraglide/messages';
	import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
	import { safeParse } from 'valibot';
	import { toast } from 'svelte-sonner';

	// CONFIG
	import { PROTECTED_PAGE_ENDPOINTS } from '@/shared/constants';

	// COMPONENTS
	import { Button } from '@/shared/components/ui/button/index.js';
	import * as Card from '@/shared/components/ui/card/index.js';
	import { Input } from '@/shared/components/ui/input/index.js';
	import { FieldGroup, Field, FieldLabel, FieldError } from '@/shared/components/ui/field/index.js';

	// UTILS
	import { passwordResetRequestFormSchema, passwordResetVerifyFormSchema } from './password-reset-form-schema.js';
	import { valibotFieldErrors, type FieldErrors } from '@/shared/utils/valibotFieldErrors.js';

	// TYPES
	import type { PasswordResetFormStep, PasswordResetField } from './passwordResetFormTypes.js';

	const id = $props.id();
	const { signIn } = useAuth();

	let step = $state<PasswordResetFormStep>('forgot');
	let busy = $state(false);
	let errorMessage = $state<string | null>(null);
	let fieldErrors = $state<FieldErrors<PasswordResetField>>({});
	/** Keeps the email field in sync for `FormData`; set from the server result after a successful send. */
	let forgottenEmail = $state('');

	async function onForgotSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (busy) return;

		const form = event.currentTarget as HTMLFormElement;
		const formData = new FormData(form);

		const p = safeParse(passwordResetRequestFormSchema, {
			email: String(formData.get('email') ?? ''),
			flow: String(formData.get('flow') ?? '')
		});

		if (!p.success) {
			fieldErrors = valibotFieldErrors<PasswordResetField>(p.issues);
			errorMessage = null;
			return;
		}

		fieldErrors = {};
		busy = true;
		errorMessage = null;

		try {
			await signIn('password', formData);
			forgottenEmail = p.output.email;
			step = { email: p.output.email };
		} catch (error) {
			console.error('Password reset: send code failed:', error);
		} finally {
			busy = false;
		}
	}

	async function onVerifySubmit(event: SubmitEvent) {
		event.preventDefault();
		
		if (busy) return;
		if (step === 'forgot') return;

		const form = event.currentTarget as HTMLFormElement;
		const formData = new FormData(form);

		const p = safeParse(passwordResetVerifyFormSchema, {
			code: String(formData.get('code') ?? ''),
			newPassword: String(formData.get('newPassword') ?? ''),
			email: String(formData.get('email') ?? ''),
			flow: String(formData.get('flow') ?? '')
		});

		if (!p.success) {
			fieldErrors = valibotFieldErrors<PasswordResetField>(p.issues);
			errorMessage = null;
			return;
		}

		fieldErrors = {};
		busy = true;
		errorMessage = null;

		try {
			await signIn('password', formData);
		} catch (error) {
			console.error('Password reset: verification failed:', error);
			busy = false;
			return;
		}

		// signIn succeeded — toast + redirect. Keep `busy` true while navigating
		// so the button cannot be re-clicked with a now-spent OTP.
		toast.success(m['PasswordResetForm.passwordResetToast']());
		await goto(resolve(PROTECTED_PAGE_ENDPOINTS.HOME));
		busy = false;
	}
</script>

<Card.Root class="mx-auto w-full max-w-sm">
	{#if step === 'forgot'}
		<Card.Header>
			<Card.Title class="text-2xl">{m['PasswordResetForm.titleRequest']()}</Card.Title>
			<Card.Description>{m['PasswordResetForm.descriptionRequest']()}</Card.Description>
		</Card.Header>
		<Card.Content>
			<form onsubmit={onForgotSubmit}>
				<FieldGroup>
					<Field>
						<FieldLabel for="pr-email-{id}">{m['PasswordResetForm.email']()}</FieldLabel>
						<Input
							id="pr-email-{id}"
							name="email"
							type="email"
							autocomplete="email"
							placeholder="m@example.com"
							bind:value={forgottenEmail}
							aria-invalid={fieldErrors.email ? 'true' : undefined}
						/>
						{#if fieldErrors.email}
							<FieldError>{fieldErrors.email}</FieldError>
						{/if}
					</Field>

					<input type="hidden" name="flow" value="reset" />
					{#if errorMessage}
						<FieldError>{errorMessage}</FieldError>
					{/if}

					<Field>
						<Button type="submit" class="w-full" disabled={busy}>
							{m['PasswordResetForm.sendCode']()}
						</Button>
					</Field>
				</FieldGroup>
			</form>
		</Card.Content>
	{:else}
		<Card.Header>
			<Card.Title class="text-2xl">{m['PasswordResetForm.titleVerify']()}</Card.Title>
			<Card.Description>
				{m['PasswordResetForm.descriptionVerify']({ email: step.email })}
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<form onsubmit={onVerifySubmit}>
				<FieldGroup>
					<Field>
						<FieldLabel for="pr-code-{id}">{m['PasswordResetForm.code']()}</FieldLabel>
						<Input
							id="pr-code-{id}"
							name="code"
							type="text"
							inputmode="numeric"
							autocomplete="one-time-code"
							aria-invalid={fieldErrors.code ? 'true' : undefined}
						/>
						{#if fieldErrors.code}
							<FieldError>{fieldErrors.code}</FieldError>
						{/if}
					</Field>

					<Field>
						<FieldLabel for="pr-new-pw-{id}">{m['PasswordResetForm.newPassword']()}</FieldLabel>
						<Input
							id="pr-new-pw-{id}"
							name="newPassword"
							type="password"
							autocomplete="new-password"
							aria-invalid={fieldErrors.newPassword ? 'true' : undefined}
						/>
						{#if fieldErrors.newPassword}
							<FieldError>{fieldErrors.newPassword}</FieldError>
						{/if}
					</Field>

					<input type="hidden" name="email" value={step.email} />
					<input type="hidden" name="flow" value="reset-verification" />

					{#if errorMessage}
						<FieldError>{errorMessage}</FieldError>
					{/if}

					<Field>
						<Button type="submit" class="w-full" disabled={busy}>
							{m['PasswordResetForm.continue']()}
						</Button>

						<Button
							type="button"
							variant="outline"
							class="w-full"
							disabled={busy}
							onclick={() => {
								step = 'forgot';
								errorMessage = null;
								fieldErrors = {};
							}}
						>
							{m['PasswordResetForm.cancel']()}
						</Button>
					</Field>
				</FieldGroup>
			</form>
		</Card.Content>
	{/if}
</Card.Root>
