<script lang="ts">
	// SVELTEKIT IMPORTS
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	// LIBRARIES
	import { m } from '@/shared/lib/paraglide/messages';
	import { safeParse } from 'valibot';
	import { toast } from 'svelte-sonner';
	import { authClient } from '@/features/auth/lib/auth-client';

	// CONFIG
	import { PROTECTED_PAGE_ENDPOINTS } from '@/shared/constants';

	// COMPONENTS
	import { Button } from '@/shared/components/ui/button/index.js';
	import * as Card from '@/shared/components/ui/card/index.js';
	import * as InputOTP from '@/features/auth/components/input-otp/index.js';
	import { Input } from '@/shared/components/ui/input/index.js';
	import PasswordInput from '@/features/auth/components/password-input/password-input.svelte';
	import {
		FieldGroup,
		Field,
		FieldLabel,
		FieldDescription,
		FieldError
	} from '@/shared/components/ui/field/index.js';
	import EmailVerificationResend from '@/features/auth/components/email-verification-form/email-verification-resend.svelte';

	// UTILS
	import {
		passwordResetRequestFormSchema,
		passwordResetVerifyFormSchema
	} from './password-reset-form-schema.js';
	import {
		valibotIssuesToFieldErrors,
	} from '@/shared/utils/validationUtils.js';

	// TYPES
	import type { PasswordResetFormStep, PasswordResetField } from './passwordResetFormTypes.js';
	import type { FieldErrors } from '@/shared/types/types';

	/** Matches `convexGenerateVerificationToken` and `passwordResetVerifyFormSchema`. */
	const OTP_MAX_LENGTH = 8;

	const id = $props.id();

	let step = $state<PasswordResetFormStep>('forgot');
	let busy = $state(false);
	let errorMessage = $state<string | null>(null);
	let fieldErrors = $state<FieldErrors<PasswordResetField>>({});
	/** Email on the request step; same binding when returning from the verify step. */
	let emailDraft = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');

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
			fieldErrors = valibotIssuesToFieldErrors<PasswordResetField>(p.issues);
			errorMessage = null;
			return;
		}

		fieldErrors = {};
		busy = true;
		errorMessage = null;

		const normalizedEmail = p.output.email;
		try {
			// Anti-enumeration: ignore the result. The UI always advances to the reset
			// step regardless of whether this email is registered.
			await authClient.emailOtp.requestPasswordReset({ email: normalizedEmail });
		} catch (error) {
			console.error('Password reset: send code (outcome hidden from user):', error);
		} finally {
			emailDraft = normalizedEmail;
			step = { email: normalizedEmail };
			busy = false;
		}
	}

	async function onResetSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (busy) return;
		if (step === 'forgot') return;

		const form = event.currentTarget as HTMLFormElement;
		const formData = new FormData(form);
		const submittedNewPassword = String(formData.get('newPassword') ?? '');

		const p = safeParse(passwordResetVerifyFormSchema, {
			code: String(formData.get('code') ?? '').trim(),
			newPassword: submittedNewPassword,
			email: step.email,
			flow: String(formData.get('flow') ?? '')
		});

		if (!p.success) {
			fieldErrors = valibotIssuesToFieldErrors<PasswordResetField>(p.issues);
			errorMessage = null;
			return;
		}

		if (submittedNewPassword !== confirmPassword) {
			fieldErrors = {
				confirmPassword: m['ValidationMessages.PasswordResetVerifyForm.passwordsMustMatch']()
			};
			errorMessage = null;
			return;
		}

		fieldErrors = {};
		busy = true;
		errorMessage = null;

		try {
			const { error } = await authClient.emailOtp.resetPassword({
				email: p.output.email,
				otp: p.output.code,
				password: p.output.newPassword,
			});
			if (error) {
				console.error('Password reset: verification failed:', error);
				if (/password/i.test(error.message ?? '')) {
					fieldErrors = { newPassword: error.message ?? m['EmailVerificationForm.verificationFailed']() };
				} else {
					errorMessage = error.message ?? m['EmailVerificationForm.verificationFailed']();
				}
				busy = false;
				return;
			}
		} catch (error) {
			console.error('Password reset: verification failed:', error);
			errorMessage = m['EmailVerificationForm.verificationFailed']();
			busy = false;
			return;
		}

		toast.success(m['PasswordResetForm.passwordResetToast']());
		await goto(resolve(PROTECTED_PAGE_ENDPOINTS.HOME));
		busy = false;
	}

	function backToForgot() {
		step = 'forgot';
		newPassword = '';
		confirmPassword = '';
		errorMessage = null;
		fieldErrors = {};
	}
</script>

{#if step === 'forgot'}
	<Card.Root class="mx-auto w-full max-w-sm">
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
							autofocus
							bind:value={emailDraft}
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
	</Card.Root>
{:else}
	<Card.Root class="mx-auto w-full max-w-sm">
		<Card.Header>
			<Card.Title class="text-2xl">{m['PasswordResetForm.titleReset']()}</Card.Title>
			<Card.Description class="text-balance">
				{m['PasswordResetForm.descriptionReset']({ email: step.email })}
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<form onsubmit={onResetSubmit}>
				<FieldGroup>
					<Field>
						<FieldLabel for="pr-code-{id}">{m['PasswordResetForm.code']()}</FieldLabel>
						<InputOTP.Root
							id="pr-otp-{id}"
							inputId="pr-code-{id}"
							maxlength={OTP_MAX_LENGTH}
							name="code"
							required
							autofocus
							disabled={busy}
							aria-invalid={fieldErrors.code ? 'true' : undefined}
						>
							{#snippet children({ cells })}
								<InputOTP.Group
									class="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border"
								>
									{#each cells as cell, i (i)}
										<InputOTP.Slot {cell} />
									{/each}
								</InputOTP.Group>
							{/snippet}
						</InputOTP.Root>
						<FieldDescription>{m['EmailVerificationForm.codeHint']()}</FieldDescription>
						{#if fieldErrors.code}
							<FieldError>{fieldErrors.code}</FieldError>
						{/if}
					</Field>

					<Field>
						<FieldLabel for="pr-new-pw-{id}">
							{m['PasswordResetForm.newPassword']()}
						</FieldLabel>
						<PasswordInput
							id="pr-new-pw-{id}"
							name="newPassword"
							autocomplete="new-password"
							bind:value={newPassword}
							aria-invalid={fieldErrors.newPassword ? 'true' : undefined}
						/>
						{#if fieldErrors.newPassword}
							<FieldError>{fieldErrors.newPassword}</FieldError>
						{/if}
					</Field>

					<Field>
						<FieldLabel for="pr-confirm-pw-{id}">
							{m['PasswordResetForm.confirmNewPassword']()}
						</FieldLabel>
						<PasswordInput
							id="pr-confirm-pw-{id}"
							autocomplete="new-password"
							bind:value={confirmPassword}
							aria-invalid={fieldErrors.confirmPassword ? 'true' : undefined}
						/>
						{#if fieldErrors.confirmPassword}
							<FieldError>{fieldErrors.confirmPassword}</FieldError>
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
							onclick={backToForgot}
						>
							{m['PasswordResetForm.cancel']()}
						</Button>
					</Field>

					<EmailVerificationResend
						disabled={busy}
						config={{ email: step.email, type: 'forget-password' }}
						onSendingChange={(inFlight) => {
							if (inFlight) {
								busy = true;
								errorMessage = null;
							} else {
								busy = false;
							}
						}}
					/>
				</FieldGroup>
			</form>
		</Card.Content>
	</Card.Root>
{/if}
