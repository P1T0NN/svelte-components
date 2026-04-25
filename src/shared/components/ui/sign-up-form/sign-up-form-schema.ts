// LIBRARIES
import { email, literal, minLength, object, pipe, string, trim } from 'valibot';
import { m } from '@/shared/lib/paraglide/messages';

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
		minLength(8, m['ValidationMessages.SignUpForm.passwordMinLength']())
	),
	confirmPassword: pipe(
		string(),
		minLength(1, m['ValidationMessages.SignUpForm.confirmPasswordRequired']())
	),
	flow: literal('signUp')
});
