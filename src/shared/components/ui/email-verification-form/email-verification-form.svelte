<script lang="ts">
	// LIBRARIES
	import { m } from '@/shared/lib/paraglide/messages';
	import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
	import { safeParse } from 'valibot';

	// COMPONENTS
	import * as Card from '@/shared/components/ui/card/index.js';
	import {
		FieldGroup,
		Field,
		FieldLabel,
		FieldError
	} from '@/shared/components/ui/field/index.js';
	import { Input } from '@/shared/components/ui/input/index.js';
	import { Button } from '@/shared/components/ui/button/index.js';
	import EmailVerificationResend from './email-verification-resend.svelte';

	// UTILS
	import { emailVerificationFormSchema } from './email-verification-form-schema.js';
	import { cn, type WithElementRef } from '@/shared/utils/utils.js';
	import {
		valibotIssuesToFieldErrors,
	} from '@/shared/utils/validationUtils.js';

	// TYPES
	import type { HTMLFormAttributes } from 'svelte/elements';
	import type { EmailVerificationField, EmailVerificationResendConfig } from './emailVerificationFormTypes.js';
	import type { FieldErrors } from '@/shared/types/types';

	const id = $props.id();
	const { signIn } = useAuth();

	let busy = $state(false);
	let errorMessage = $state<string | null>(null);
	let fieldErrors = $state<FieldErrors<EmailVerificationField>>({});

	let {
		email,
		fullWidthButtons = false,
		variant = 'form',
		ref = $bindable(null),
		class: className,
		onCancel,
		onSuccess,
		resend,
		...restProps
	}: {
		email: string;
		/** W-full on submit + cancel (e.g. card layout) */
		fullWidthButtons?: boolean;
		/** `form` = centered h1 in form (login-with-image); `card` = Card header + form body (login-no-image) */
		variant?: 'form' | 'card';
		onCancel: () => void;
		/** Called after `signIn` succeeds — parent decides toast + navigation. */
		onSuccess?: () => void | Promise<void>;
		/** Re-send OTP — built in `EmailVerificationResend` via `signIn`. */
		resend?: EmailVerificationResendConfig;
	} & Omit<WithElementRef<HTMLFormAttributes>, 'onsubmit' | 'children' | 'onCancel'> = $props();

	async function onVerifySubmit(event: SubmitEvent) {
		event.preventDefault();
		if (busy) return;

		const form = event.currentTarget as HTMLFormElement;
		const formData = new FormData(form);

		const p = safeParse(emailVerificationFormSchema, {
			code: String(formData.get('code') ?? ''),
			email: String(formData.get('email') ?? ''),
			flow: String(formData.get('flow') ?? '')
		});

		if (!p.success) {
			fieldErrors = valibotIssuesToFieldErrors<EmailVerificationField>(p.issues);
			errorMessage = null;
			return;
		}

		fieldErrors = {};
		busy = true;
		errorMessage = null;

		try {
			await signIn('password', formData);
		} catch (error) {
			console.error('Email verification: signIn failed:', error);
			errorMessage = m['EmailVerificationForm.verificationFailed']();
			busy = false;
			return;
		}

		// Parent handles toast + redirect; clear busy if we stay mounted (e.g. no redirect).
		await onSuccess?.();
		busy = false;
	}

	function handleCancel() {
		errorMessage = null;
		fieldErrors = {};
		onCancel();
	}
</script>

{#if variant === 'card'}
	<Card.Header>
		<Card.Title class="text-2xl">
			{m['EmailVerificationForm.title']()}
		</Card.Title>

		<Card.Description>
			{m['EmailVerificationForm.description']({ email })}
		</Card.Description>
	</Card.Header>

	<Card.Content>
		<form class="w-full" onsubmit={onVerifySubmit}>
			<FieldGroup>
				<Field>
					<FieldLabel for="ev-code-{id}">{m['EmailVerificationForm.code']()}</FieldLabel>
					<Input
						id="ev-code-{id}"
						name="code"
						type="text"
						inputmode="numeric"
						autocomplete="one-time-code"
						autofocus
						aria-invalid={fieldErrors.code ? 'true' : undefined}
					/>
					{#if fieldErrors.code}
						<FieldError>{fieldErrors.code}</FieldError>
					{/if}
				</Field>

				<input type="hidden" name="email" value={email} />
				<input type="hidden" name="flow" value="email-verification" />

				{#if errorMessage}
					<FieldError>{errorMessage}</FieldError>
				{/if}

				<Field>
					<Button type="submit" class={fullWidthButtons ? 'w-full' : ''} disabled={busy}>
						{m['EmailVerificationForm.continue']()}
					</Button>
					<Button
						type="button"
						variant="outline"
						class={fullWidthButtons ? 'w-full' : ''}
						disabled={busy}
						onclick={handleCancel}
					>
						{m['EmailVerificationForm.cancel']()}
					</Button>
				</Field>
				{#if resend}
					<EmailVerificationResend disabled={busy} config={resend} />
				{/if}
			</FieldGroup>
		</form>
	</Card.Content>
{:else}
	<form
		class={cn('flex flex-col gap-6', className)}
		bind:this={ref}
		onsubmit={onVerifySubmit}
		{...restProps}
	>
		<FieldGroup>
			<div class="flex flex-col items-center gap-1 text-center">
				<h1 class="text-2xl font-bold">
					{m['EmailVerificationForm.title']()}
				</h1>
				<p class="text-sm text-balance text-muted-foreground">
					{m['EmailVerificationForm.description']({ email })}
				</p>
			</div>

			<Field>
				<FieldLabel for="ev-code-{id}-stacked">{m['EmailVerificationForm.code']()}</FieldLabel>
				<Input
					id="ev-code-{id}-stacked"
					name="code"
					type="text"
					inputmode="numeric"
					autocomplete="one-time-code"
					autofocus
					aria-invalid={fieldErrors.code ? 'true' : undefined}
				/>
				{#if fieldErrors.code}
					<FieldError>{fieldErrors.code}</FieldError>
				{/if}
			</Field>

			<input type="hidden" name="email" value={email} />
			<input type="hidden" name="flow" value="email-verification" />

			{#if errorMessage}
				<FieldError>{errorMessage}</FieldError>
			{/if}

			<Field>
				<Button type="submit" class={fullWidthButtons ? 'w-full' : ''} disabled={busy}>
					{m['EmailVerificationForm.continue']()}
				</Button>
				<Button
					type="button"
					variant="outline"
					class={fullWidthButtons ? 'w-full' : ''}
					disabled={busy}
					onclick={handleCancel}
				>
					{m['EmailVerificationForm.cancel']()}
				</Button>
			</Field>
			{#if resend}
				<EmailVerificationResend disabled={busy} config={resend} />
			{/if}
		</FieldGroup>
	</form>
{/if}
