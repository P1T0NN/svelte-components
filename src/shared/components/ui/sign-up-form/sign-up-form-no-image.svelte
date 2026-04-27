<script lang="ts">
	// LIBRARIES
	import { m } from '@/shared/lib/paraglide/messages';

	// CONFIG
	import { UNPROTECTED_PAGE_ENDPOINTS } from '@/shared/constants';

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
	import PasswordInput from '@/shared/components/ui/password-input/password-input.svelte';
	import Link from '../link/link.svelte';

	// TYPES
	import type { ComponentProps } from 'svelte';

	import { createSignUpForm } from './sign-up-form-model.svelte.js';

	let { ...restProps }: ComponentProps<typeof Card.Root> = $props();

	const id = $props.id();

	const form = createSignUpForm({
		signUpFailed: () => m['SignUpForm.SignUpFormNoImage.signUpFailed'](),
		accountCreatedToast: () => m['SignUpForm.SignUpFormNoImage.accountCreatedToast']()
	});
</script>

<Card.Root {...restProps}>
	{#if form.step === 'signUp'}
		<Card.Header>
			<Card.Title>{m['SignUpForm.SignUpFormNoImage.title']()}</Card.Title>
			<Card.Description>{m['SignUpForm.SignUpFormNoImage.description']()}</Card.Description>
		</Card.Header>

		<Card.Content>
			<form onsubmit={form.onSignUpSubmit}>
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
							autofocus
							bind:value={form.nameDraft}
							aria-invalid={form.fieldErrors.name ? 'true' : undefined}
						/>
						{#if form.fieldErrors.name}
							<FieldError>{form.fieldErrors.name}</FieldError>
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
							bind:value={form.emailDraft}
							aria-invalid={form.fieldErrors.email ? 'true' : undefined}
						/>
						{#if form.fieldErrors.email}
							<FieldError>{form.fieldErrors.email}</FieldError>
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
						<PasswordInput
							id="password-{id}"
							name="password"
							autocomplete="new-password"
							aria-invalid={form.fieldErrors.password ? 'true' : undefined}
						/>
						{#if form.fieldErrors.password}
							<FieldError>{form.fieldErrors.password}</FieldError>
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
						<PasswordInput
							id="confirm-password-{id}"
							name="confirmPassword"
							autocomplete="new-password"
							aria-invalid={form.fieldErrors.confirmPassword ? 'true' : undefined}
						/>
						{#if form.fieldErrors.confirmPassword}
							<FieldError>{form.fieldErrors.confirmPassword}</FieldError>
						{:else}
							<FieldDescription>
								{m['SignUpForm.SignUpFormNoImage.confirmPasswordHelp']()}
							</FieldDescription>
						{/if}
					</Field>

					<input type="hidden" name="flow" value="signUp" />

					{#if form.errorMessage}
						<FieldError>{form.errorMessage}</FieldError>
					{/if}

					<Field>
						<Button type="submit" class="w-full" disabled={form.busy}>
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
			email={form.step.email}
			fullWidthButtons
			onCancel={form.onCancel}
			onSuccess={form.onVerifySuccess}
			resend={form.verifyContext
				? {
						flow: 'signUp',
						name: form.verifyContext.name,
						email: form.verifyContext.email,
						password: form.verifyContext.password,
						onSignedIn: form.onVerifySuccess
					}
				: undefined}
		/>
	{/if}
</Card.Root>
