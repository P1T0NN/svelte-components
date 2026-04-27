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

// UTILS
import { signUpFormSchema } from './sign-up-form-schema.js';
import { valibotFieldErrors, type FieldErrors } from '@/shared/utils/valibotFieldErrors.js';
import {
	hasTranslatableMessage,
	translateFromBackend
} from '@/shared/utils/translateFromBackend.js';

// TYPES
import type { SignUpFormStep, SignUpField } from './signUpFormTypes.js';

export type SignUpFormCopy = {
	signUpFailed: () => string;
	accountCreatedToast: () => string;
};

export function createSignUpForm(copy: SignUpFormCopy) {
	const { signIn } = useAuth();

	let step = $state<SignUpFormStep>('signUp');
	let busy = $state(false);
	let errorMessage = $state<string | null>(null);
	let fieldErrors = $state<FieldErrors<SignUpField>>({});
	let nameDraft = $state('');
	let emailDraft = $state('');
	let verifyContext = $state<{ name: string; email: string; password: string } | null>(null);

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

		formData.delete('confirmPassword');

		fieldErrors = {};
		busy = true;
		errorMessage = null;

		try {
			const result = await signIn('password', formData);
			if (result.signingIn) {
				await onVerifySuccess();
				return;
			}
			nameDraft = p.output.name;
			emailDraft = p.output.email;
			verifyContext = {
				name: p.output.name,
				email: p.output.email,
				password: p.output.password
			};
			step = { email: p.output.email };
		} catch (error) {
			console.error('Sign up failed:', error);

			// Rate limit (no-op until/unless an OTP-specific limiter is added; cheap to keep).
			if (isRateLimitError(error)) {
				errorMessage = m['GenericMessages.TOO_MANY_REQUESTS']();
				return;
			}

			// Typed backend error (currently: PASSWORD_TOO_SHORT / TOO_LONG / TOO_COMMON from
			// `validatePasswordRequirements`). Surface under the password field so users see
			// where to fix it, not as a top-level form error.
			if (error instanceof ConvexError && hasTranslatableMessage(error.data)) {
				fieldErrors = { password: translateFromBackend(error.data.message) };
				errorMessage = null;
				return;
			}

			errorMessage = copy.signUpFailed();
		} finally {
			busy = false;
		}
	}

	function onCancel() {
		step = 'signUp';
		verifyContext = null;
		errorMessage = null;
		fieldErrors = {};
	}

	async function onVerifySuccess() {
		toast.success(copy.accountCreatedToast());
		await goto(resolve(PROTECTED_PAGE_ENDPOINTS.HOME));
	}

	return {
		get step() {
			return step;
		},
		get busy() {
			return busy;
		},
		get errorMessage() {
			return errorMessage;
		},
		get fieldErrors() {
			return fieldErrors;
		},
		get nameDraft() {
			return nameDraft;
		},
		set nameDraft(v: string) {
			nameDraft = v;
		},
		get emailDraft() {
			return emailDraft;
		},
		set emailDraft(v: string) {
			emailDraft = v;
		},
		get verifyContext() {
			return verifyContext;
		},
		onSignUpSubmit,
		onCancel,
		onVerifySuccess
	};
}
