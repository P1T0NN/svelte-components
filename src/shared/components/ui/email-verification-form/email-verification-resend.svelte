<script lang="ts">
	// LIBRARIES
	import { m } from '@/shared/lib/paraglide/messages';
	import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';

	// COMPONENTS
	import { Button } from '@/shared/components/ui/button/index.js';
	import { FieldDescription } from '@/shared/components/ui/field/index.js';

	// TYPES
	import type { EmailVerificationResendConfig } from './emailVerificationFormTypes.js';

	let {
		disabled = false,
		config,
		/** Optional: lock parent form while a resend request is in flight (e.g. password reset). */
		onSendingChange
	}: {
		disabled?: boolean;
		config: EmailVerificationResendConfig;
		onSendingChange?: (inFlight: boolean) => void;
	} = $props();

	const { signIn } = useAuth();

	const COOLDOWN_SECONDS = 30;

	let resending = $state(false);
	let cooldownRemaining = $state(0);
	let cooldownIntervalId: ReturnType<typeof setInterval> | null = null;

	const blocked = $derived(disabled || resending || cooldownRemaining > 0);

	function clearCooldownInterval() {
		if (cooldownIntervalId !== null) {
			clearInterval(cooldownIntervalId);
			cooldownIntervalId = null;
		}
	}

	function startCooldown() {
		clearCooldownInterval();
		cooldownRemaining = COOLDOWN_SECONDS;
		cooldownIntervalId = setInterval(() => {
			cooldownRemaining -= 1;
			if (cooldownRemaining <= 0) {
				cooldownRemaining = 0;
				clearCooldownInterval();
			}
		}, 1000);
	}

	$effect(() => () => clearCooldownInterval());

	async function handleResend() {
		if (blocked) return;

		resending = true;
		onSendingChange?.(true);

		const formData = new FormData();

		formData.set('email', config.email);
		formData.set('flow', config.flow);

		if (config.flow === 'signIn' || config.flow === 'signUp') {
			formData.set('password', config.password);
		}

		if (config.flow === 'signUp') {
			formData.set('name', config.name);
		}

		try {
			const result = await signIn('password', formData);
			if (result.signingIn && (config.flow === 'signIn' || config.flow === 'signUp')) {
				await config.onSignedIn?.();
			}
		} catch (error) {
			console.error('Email verification: resend failed:', error);
		} finally {
			resending = false;
			onSendingChange?.(false);
			startCooldown();
		}
	}
</script>

<FieldDescription class="text-center">
	<span class="inline-flex flex-wrap items-center justify-center gap-x-1">
		<span>{m['EmailVerificationForm.resendPrompt']()}</span>

		<Button
			type="button"
			variant="link"
			class="h-auto p-0 text-sm"
			disabled={blocked}
			onclick={handleResend}
		>
			{cooldownRemaining > 0
				? m['EmailVerificationForm.resendIn']({ seconds: cooldownRemaining })
				: m['EmailVerificationForm.resend']()}
		</Button>
	</span>
</FieldDescription>
