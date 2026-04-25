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
	import GoogleLoginButton from '@/shared/components/ui/google-login-button/google-login-button.svelte';
	import { Input } from '@/shared/components/ui/input/index.js';
	import Link from '../link/link.svelte';
	import EmailVerificationForm from '@/shared/components/ui/email-verification-form/email-verification-form.svelte';
	import {
		FieldGroup,
		Field,
		FieldLabel,
		FieldDescription,
		FieldError
	} from '@/shared/components/ui/field/index.js';

	// UTILS
	import { loginFormSchema } from './login-form-schema.js';
	import { valibotFieldErrors, type FieldErrors } from '@/shared/utils/valibotFieldErrors.js';

	// TYPES
	import type { LoginFormStep, LoginField } from './loginFormTypes.js';

	const id = $props.id();
	const { signIn } = useAuth();

	let step = $state<LoginFormStep>('signIn');
	let busy = $state(false);
	let errorMessage = $state<string | null>(null);
	let fieldErrors = $state<FieldErrors<LoginField>>({});

	async function onSignInSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (busy) return;

		const form = event.currentTarget as HTMLFormElement;
		const formData = new FormData(form);

		const p = safeParse(loginFormSchema, {
			email: String(formData.get('email') ?? ''),
			password: String(formData.get('password') ?? ''),
			flow: String(formData.get('flow') ?? '')
		});

		if (!p.success) {
			fieldErrors = valibotFieldErrors<LoginField>(p.issues);
			errorMessage = null;
			return;
		}

		fieldErrors = {};
		busy = true;
		errorMessage = null;

		try {
			const result = await signIn('password', formData);
			// Already-verified accounts complete sign-in here (no OTP email is sent).
			// Only show the verification step when the lib explicitly defers sign-in.
			if (result.signingIn) {
				await onVerifySuccess();
				return;
			}
			step = { email: p.output.email };
		} catch (error) {
			console.error('Login: sign in failed:', error);
			errorMessage = m['LoginForm.LoginFormNoImage.signInFailed']();
		} finally {
			busy = false;
		}
	}

	function onCancel() {
		step = 'signIn';
		errorMessage = null;
		fieldErrors = {};
	}

	async function onVerifySuccess() {
		toast.success(m['LoginForm.LoginFormNoImage.signedInToast']());
		await goto(resolve(PROTECTED_PAGE_ENDPOINTS.HOME));
	}
</script>

<Card.Root class="mx-auto w-full max-w-sm">
	{#if step === 'signIn'}
		<Card.Header>
			<Card.Title class="text-2xl">{m['LoginForm.LoginFormNoImage.title']()}</Card.Title>
			<Card.Description>{m['LoginForm.LoginFormNoImage.description']()}</Card.Description>
		</Card.Header>

		<Card.Content>
			<form onsubmit={onSignInSubmit}>
				<FieldGroup>
					<Field>
						<FieldLabel for="email-{id}">{m['LoginForm.LoginFormNoImage.email']()}</FieldLabel>
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
						{/if}
					</Field>

					<Field>
						<div class="flex items-center">
							<FieldLabel for="password-{id}">
								{m['LoginForm.LoginFormNoImage.password']()}
							</FieldLabel>

							<Link
								href={UNPROTECTED_PAGE_ENDPOINTS.FORGOT_PASSWORD}
								class="ms-auto inline-block text-sm underline"
							>
								{m['LoginForm.LoginFormNoImage.forgotPassword']()}
							</Link>
						</div>

						<Input
							id="password-{id}"
							name="password"
							type="password"
							autocomplete="current-password"
							aria-invalid={fieldErrors.password ? 'true' : undefined}
						/>
						{#if fieldErrors.password}
							<FieldError>{fieldErrors.password}</FieldError>
						{/if}
					</Field>

					<input type="hidden" name="flow" value="signIn" />

					{#if errorMessage}
						<FieldError>{errorMessage}</FieldError>
					{/if}

					<Field>
						<Button type="submit" class="w-full" disabled={busy}>
							{m['LoginForm.LoginFormNoImage.submit']()}
						</Button>
						<GoogleLoginButton class="w-full" />

						<FieldDescription class="text-center">
							{m['LoginForm.LoginFormNoImage.dontHaveAccount']()}
							<Link href={UNPROTECTED_PAGE_ENDPOINTS.SIGNUP}>
								{m['LoginForm.LoginFormNoImage.signUp']()}
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
