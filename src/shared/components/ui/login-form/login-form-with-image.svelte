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
	import {
		FieldGroup,
		Field,
		FieldLabel,
		FieldDescription,
		FieldSeparator,
		FieldError
	} from '@/shared/components/ui/field/index.js';
	import { Input } from '@/shared/components/ui/input/index.js';
	import { Button } from '@/shared/components/ui/button/index.js';
	import GoogleLoginButton from '@/shared/components/ui/google-login-button/google-login-button.svelte';
	import Link from '../link/link.svelte';
	import EmailVerificationForm from '@/shared/components/ui/email-verification-form/email-verification-form.svelte';
	import { loginFormSchema } from './login-form-schema.js';

	// UTILS
	import { cn } from '@/shared/utils/utils.js';
	import { valibotFieldErrors, type FieldErrors } from '@/shared/utils/valibotFieldErrors.js';

	// TYPES
	import type {
		LoginFormStep,
		LoginFormWithImageProps,
		LoginField
	} from './loginFormTypes.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: LoginFormWithImageProps = $props();

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
			errorMessage = m['LoginForm.LoginFormWithImage.signInFailed']();
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
		toast.success(m['LoginForm.LoginFormWithImage.signedInToast']());
		await goto(resolve(PROTECTED_PAGE_ENDPOINTS.HOME));
	}
</script>

{#if step === 'signIn'}
	<form
		class={cn('flex flex-col gap-6', className)}
		bind:this={ref}
		onsubmit={onSignInSubmit}
		{...restProps}
	>
		<FieldGroup>
			<div class="flex flex-col items-center gap-1 text-center">
				<h1 class="text-2xl font-bold">{m['LoginForm.LoginFormWithImage.title']()}</h1>
				<p class="text-sm text-balance text-muted-foreground">
					{m['LoginForm.LoginFormWithImage.description']()}
				</p>
			</div>

			<Field>
				<FieldLabel for="email-{id}">{m['LoginForm.LoginFormWithImage.email']()}</FieldLabel>
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
						{m['LoginForm.LoginFormWithImage.password']()}
					</FieldLabel>
					<Link
						href={UNPROTECTED_PAGE_ENDPOINTS.FORGOT_PASSWORD}
						class="ms-auto text-sm underline-offset-4 hover:underline"
					>
						{m['LoginForm.LoginFormWithImage.forgotPassword']()}
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
				<Button type="submit" disabled={busy}>
					{m['LoginForm.LoginFormWithImage.submit']()}
				</Button>
			</Field>

			<FieldSeparator>{m['LoginForm.LoginFormWithImage.orContinueWith']()}</FieldSeparator>

			<Field>
				<GoogleLoginButton />

				<FieldDescription class="text-center">
					{m['LoginForm.LoginFormWithImage.dontHaveAccount']()}

					<Link href={UNPROTECTED_PAGE_ENDPOINTS.SIGNUP} class="underline underline-offset-4">
						{m['LoginForm.LoginFormWithImage.signUp']()}
					</Link>
				</FieldDescription>
			</Field>
		</FieldGroup>
	</form>
{:else}
	<EmailVerificationForm
		email={step.email}
		onCancel={onCancel}
		onSuccess={onVerifySuccess}
		class={cn('flex flex-col gap-6', className)}
		bind:ref
		{...restProps}
	/>
{/if}
