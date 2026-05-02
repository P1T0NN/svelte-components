<script lang="ts">
	// SVELTEKIT IMPORTS
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	// LIBRARIES
	import { m } from '@/shared/lib/paraglide/messages';
	import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
	import { safeParse } from 'valibot';
	import { toast } from 'svelte-sonner';
	import { ConvexError } from 'convex/values';
	import { isRateLimitError } from '@convex-dev/rate-limiter';

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
	import {
		hasTranslatableMessage,
		translateFromBackend
	} from '@/shared/utils/translateFromBackend.js';

	// TYPES
	import type { PasswordResetFormStep, PasswordResetField } from './passwordResetFormTypes.js';
	import type { FieldErrors } from '@/shared/types/types';

	/** Matches `convexGenerateVerificationToken` and `passwordResetVerifyFormSchema`. */
	const OTP_MAX_LENGTH = 8;

	const id = $props.id();
	const { signIn } = useAuth();

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
			await signIn('password', formData);
		} catch (error) {
			// Anti-enumeration: never reveal whether this email is registered. The UI
			// always advances to the reset step; outcomes are only visible in logs.
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
			await signIn('password', formData);
		} catch (error) {
			console.error('Password reset: verification failed:', error);

			// Rate limit (no-op until/unless an OTP-specific limiter is added; cheap to keep).
			if (isRateLimitError(error)) {
				errorMessage = m['GenericMessages.TOO_MANY_REQUESTS']();
				busy = false;
				return;
			}

			// Typed backend error (currently: PASSWORD_TOO_SHORT / TOO_LONG / TOO_COMMON from
			// `validatePasswordRequirements`). Surface under the password field so users see
			// where to fix it, not as a top-level form error.
			if (error instanceof ConvexError && hasTranslatableMessage(error.data)) {
				fieldErrors = { newPassword: translateFromBackend(error.data.message) };
				errorMessage = null;
				busy = false;
				return;
			}

			// Wrong / expired code, or anything else.
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
						config={{ flow: 'reset', email: step.email }}
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
