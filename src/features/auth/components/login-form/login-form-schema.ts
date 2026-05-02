// LIBRARIES
import { email, literal, minLength, object, pipe, string, trim } from 'valibot';
import { m } from '@/shared/lib/paraglide/messages';

export const loginFormSchema = object({
	email: pipe(
		string(),
		trim(),
		minLength(1, m['ValidationMessages.LoginForm.emailRequired']()),
		email(m['ValidationMessages.LoginForm.invalidEmail']())
	),
	password: pipe(
		string(),
		minLength(1, m['ValidationMessages.LoginForm.passwordRequired']()),
		minLength(8, m['ValidationMessages.LoginForm.passwordMinLength']())
	),
	flow: literal('signIn')
});
