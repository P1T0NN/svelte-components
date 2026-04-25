// LIBRARIES
import { email, literal, minLength, object, pipe, regex, string, trim } from 'valibot';
import { m } from '@/shared/lib/paraglide/messages';

const code8Digit = /^\d{8}$/u;

export const emailVerificationFormSchema = object({
	code: pipe(
		string(),
		trim(),
		minLength(1, m['ValidationMessages.EmailVerificationForm.codeRequired']()),
		regex(code8Digit, m['ValidationMessages.EmailVerificationForm.codeFormat']())
	),
	email: pipe(string(), trim(), email(m['ValidationMessages.EmailVerificationForm.invalidEmail']())),
	flow: literal('email-verification')
});
