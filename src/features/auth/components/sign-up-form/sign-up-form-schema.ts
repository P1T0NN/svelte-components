// LIBRARIES
import { check, email, literal, minLength, object, pipe, string, trim } from 'valibot';
import { m } from '@/shared/lib/paraglide/messages';
import { isDeniedPassword } from '@/features/auth/utils/denyPasswordList.js';

export const signUpFormSchema = object({
	name: pipe(string(), trim(), minLength(1, m['ValidationMessages.SignUpForm.nameRequired']())),
	email: pipe(
		string(),
		trim(),
		minLength(1, m['ValidationMessages.SignUpForm.emailRequired']()),
		email(m['ValidationMessages.SignUpForm.invalidEmail']())
	),
	password: pipe(
		string(),
		minLength(1, m['ValidationMessages.SignUpForm.passwordRequired']()),
		minLength(8, m['ValidationMessages.SignUpForm.passwordMinLength']()),
		check(
			(input) => !isDeniedPassword(input),
			m['ValidationMessages.SignUpForm.passwordTooCommon']()
		)
	),
	confirmPassword: pipe(
		string(),
		minLength(1, m['ValidationMessages.SignUpForm.confirmPasswordRequired']())
	),
	flow: literal('signUp')
});
