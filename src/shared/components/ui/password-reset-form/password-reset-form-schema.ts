// LIBRARIES
import { check, email, literal, minLength, object, pipe, regex, string, trim } from 'valibot';
import { m } from '@/shared/lib/paraglide/messages';
import { isDeniedPassword } from '@/shared/utils/denyPasswordList.js';

const code8Digit = /^\d{8}$/u;

export const passwordResetRequestFormSchema = object({
	email: pipe(
		string(),
		trim(),
		minLength(1, m['ValidationMessages.PasswordResetRequestForm.emailRequired']()),
		email(m['ValidationMessages.PasswordResetRequestForm.invalidEmail']())
	),
	flow: literal('reset')
});

export const passwordResetVerifyFormSchema = object({
	code: pipe(
		string(),
		trim(),
		minLength(1, m['ValidationMessages.PasswordResetVerifyForm.codeRequired']()),
		regex(code8Digit, m['ValidationMessages.PasswordResetVerifyForm.codeFormat']())
	),
	newPassword: pipe(
		string(),
		minLength(1, m['ValidationMessages.PasswordResetVerifyForm.newPasswordRequired']()),
		minLength(8, m['ValidationMessages.PasswordResetVerifyForm.newPasswordMinLength']()),
		check(
			(input) => !isDeniedPassword(input),
			m['ValidationMessages.PasswordResetVerifyForm.passwordTooCommon']()
		)
	),
	email: pipe(string(), trim(), email(m['ValidationMessages.PasswordResetVerifyForm.invalidEmail']())),
	flow: literal('reset-verification')
});
