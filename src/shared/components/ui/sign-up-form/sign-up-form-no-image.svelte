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
	import { PROTECTED_PAGE_ENDPOINTS, UNPROTECTED_PAGE_ENDPOINTS } from '@/shared/constants';

	// COMPONENTS
	import { Button } from '@/shared/components/ui/button/index.js';
	import * as Card from '@/shared/components/ui/card/index.js';
	import EmailVerificationForm from '@/shared/components/ui/email-verification-form/email-verification-form.svelte';
	import {
		FieldGroup,
		Field,
		FieldLabel,
		FieldDescription,
		FieldError
	} from '@/shared/components/ui/field/index.js';
	import GoogleLoginButton from '@/shared/components/ui/google-login-button/google-login-button.svelte';
	import { Input } from '@/shared/components/ui/input/index.js';
	import Link from '../link/link.svelte';

	// UTILS
	import { signUpFormSchema } from './sign-up-form-schema.js';
	import { valibotFieldErrors, type FieldErrors } from '@/shared/utils/valibotFieldErrors.js';

	// TYPES
	import type { ComponentProps } from 'svelte';
	import type { SignUpFormStep, SignUpField } from './signUpFormTypes.js';

	let { ...restProps }: ComponentProps<typeof Card.Root> = $props();

	const id = $props.id();
	const { signIn } = useAuth();

	let step = $state<SignUpFormStep>('signUp');
	let busy = $state(false);
	let errorMessage = $state<string | null>(null);
	let fieldErrors = $state<FieldErrors<SignUpField>>({});

	async function onSignUpSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (busy) return;

		const form = event.currentTarget as HTMLFormElement;
		const formData = new FormData(form);

		const p = safeParse(signUpFormSchema, {
			name: String(formData.get('name') ?? ''),
			email: String(formData.get('email') ?? ''),
			password: String(formData.get('password') ?? ''),
			confirmPassword: String(formData.get('confirmPassword') ?? ''),
			flow: String(formData.get('flow') ?? '')
		});

		if (!p.success) {
			fieldErrors = valibotFieldErrors<SignUpField>(p.issues);
			errorMessage = null;
			return;
		}

		if (p.output.password !== p.output.confirmPassword) {
			fieldErrors = { confirmPassword: m['ValidationMessages.SignUpForm.passwordsMustMatch']() };
			errorMessage = null;
			return;
		}

		// Convex Auth's Password provider only reads `name`, `email`, `password`, `flow`.
		formData.delete('confirmPassword');

		fieldErrors = {};
		busy = true;
		errorMessage = null;

		try {
			const result = await signIn('password', formData);
			// If the lib signed the user in directly (no OTP step required), skip the
			// verification screen and go straight to success.
			if (result.signingIn) {
				await onVerifySuccess();
				return;
			}
			step = { email: p.output.email };
		} catch (error) {
			console.error('Sign up failed:', error);
			errorMessage = m['SignUpForm.SignUpFormNoImage.signUpFailed']();
		} finally {
			busy = false;
		}
	}

	function onCancel() {
		step = 'signUp';
		errorMessage = null;
		fieldErrors = {};
	}

	async function onVerifySuccess() {
		toast.success(m['SignUpForm.SignUpFormNoImage.accountCreatedToast']());
		await goto(resolve(PROTECTED_PAGE_ENDPOINTS.HOME));
	}
</script>

<Card.Root {...restProps}>
	{#if step === 'signUp'}
		<Card.Header>
			<Card.Title>{m['SignUpForm.SignUpFormNoImage.title']()}</Card.Title>
			<Card.Description>{m['SignUpForm.SignUpFormNoImage.description']()}</Card.Description>
		</Card.Header>

		<Card.Content>
			<form onsubmit={onSignUpSubmit}>
				<FieldGroup>
					<Field>
						<FieldLabel for="name-{id}">
							{m['SignUpForm.SignUpFormNoImage.fullName']()}
						</FieldLabel>
						<Input
							id="name-{id}"
							name="name"
							type="text"
							autocomplete="name"
							placeholder="John Doe"
							aria-invalid={fieldErrors.name ? 'true' : undefined}
						/>
						{#if fieldErrors.name}
							<FieldError>{fieldErrors.name}</FieldError>
						{/if}
					</Field>

					<Field>
						<FieldLabel for="email-{id}">
							{m['SignUpForm.SignUpFormNoImage.email']()}
						</FieldLabel>
						<Input
							id="email-{id}"
							name="email"
							type="email"
							autocomplete="email"
							placeholder="m@example.com"
							aria-invalid={fieldErrors.email ? 'true' : undefined}
						/>
						{#if fieldErrors.email}
							<FieldError>{fieldErrors.email}</FieldError>
						{:else}
							<FieldDescription>
								{m['SignUpForm.SignUpFormNoImage.emailHelp']()}
							</FieldDescription>
						{/if}
					</Field>

					<Field>
						<FieldLabel for="password-{id}">
							{m['SignUpForm.SignUpFormNoImage.password']()}
						</FieldLabel>
						<Input
							id="password-{id}"
							name="password"
							type="password"
							autocomplete="new-password"
							aria-invalid={fieldErrors.password ? 'true' : undefined}
						/>
						{#if fieldErrors.password}
							<FieldError>{fieldErrors.password}</FieldError>
						{:else}
							<FieldDescription>
								{m['SignUpForm.SignUpFormNoImage.passwordHelp']()}
							</FieldDescription>
						{/if}
					</Field>

					<Field>
						<FieldLabel for="confirm-password-{id}">
							{m['SignUpForm.SignUpFormNoImage.confirmPassword']()}
						</FieldLabel>
						<Input
							id="confirm-password-{id}"
							name="confirmPassword"
							type="password"
							autocomplete="new-password"
							aria-invalid={fieldErrors.confirmPassword ? 'true' : undefined}
						/>
						{#if fieldErrors.confirmPassword}
							<FieldError>{fieldErrors.confirmPassword}</FieldError>
						{:else}
							<FieldDescription>
								{m['SignUpForm.SignUpFormNoImage.confirmPasswordHelp']()}
							</FieldDescription>
						{/if}
					</Field>

					<input type="hidden" name="flow" value="signUp" />

					{#if errorMessage}
						<FieldError>{errorMessage}</FieldError>
					{/if}

					<Field>
						<Button type="submit" class="w-full" disabled={busy}>
							{m['SignUpForm.SignUpFormNoImage.submit']()}
						</Button>
						<GoogleLoginButton class="w-full" />

						<FieldDescription class="text-center">
							{m['SignUpForm.SignUpFormNoImage.alreadyHaveAccount']()}
							<Link href={UNPROTECTED_PAGE_ENDPOINTS.LOGIN}>
								{m['SignUpForm.SignUpFormNoImage.signIn']()}
							</Link>
						</FieldDescription>
					</Field>
				</FieldGroup>
			</form>
		</Card.Content>
	{:else}
		<EmailVerificationForm
			variant="card"
			email={step.email}
			fullWidthButtons
			onCancel={onCancel}
			onSuccess={onVerifySuccess}
		/>
	{/if}
</Card.Root>
