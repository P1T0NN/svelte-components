// SVELTEKIT IMPORTS
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';

// LIBRARIES
import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
import { safeParse } from 'valibot';
import { toast } from 'svelte-sonner';

// CONFIG
import { PROTECTED_PAGE_ENDPOINTS } from '@/shared/constants';

// UTILS
import { loginFormSchema } from './login-form-schema.js';
import { valibotIssuesToFieldErrors } from '@/shared/utils/validationUtils.js';

// TYPES
import type { LoginFormStep, LoginField } from './loginFormTypes.js';
import type { FieldErrors } from '@/shared/types/types';

export type LoginFormCopy = {
	signInFailed: () => string;
	signedInToast: () => string;
};

export function createLoginForm(copy: LoginFormCopy) {
	const { signIn } = useAuth();

	let step = $state<LoginFormStep>('signIn');
	let busy = $state(false);
	let errorMessage = $state<string | null>(null);
	let fieldErrors = $state<FieldErrors<LoginField>>({});
	let emailDraft = $state('');
	let verifyContext = $state<{ email: string; password: string } | null>(null);

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
			fieldErrors = valibotIssuesToFieldErrors<LoginField>(p.issues);
			errorMessage = null;
			return;
		}

		fieldErrors = {};
		busy = true;
		errorMessage = null;

		try {
			const result = await signIn('password', formData);
			if (result.signingIn) {
				await onVerifySuccess();
				return;
			}
			emailDraft = p.output.email;
			verifyContext = { email: p.output.email, password: p.output.password };
			step = { email: p.output.email };
		} catch (error) {
			console.error('Login: sign in failed:', error);
			errorMessage = copy.signInFailed();
		} finally {
			busy = false;
		}
	}

	function onCancel() {
		step = 'signIn';
		verifyContext = null;
		errorMessage = null;
		fieldErrors = {};
	}

	async function onVerifySuccess() {
		toast.success(copy.signedInToast());
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
		get emailDraft() {
			return emailDraft;
		},
		set emailDraft(v: string) {
			emailDraft = v;
		},
		get verifyContext() {
			return verifyContext;
		},
		onSignInSubmit,
		onCancel,
		onVerifySuccess
	};
}
