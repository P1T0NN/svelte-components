// Dual-runtime auth schema. Message convention: see `loginSchema.ts` — default error map
// covers the plain cases; bespoke messages are bare catalog keys.

// LIBRARIES
import { z } from 'zod';

// CONFIG
import { AUTH_DATA } from '@/shared/config';

// HELPERS
import { isDeniedPassword } from '../utils/denyPasswordList.js';

export const signUpSchema = z
	.object({
		name: z.string().trim().min(1),
		email: z.string().trim().min(1).pipe(z.email()),
		password: z
			.string()
			.min(1)
			.min(AUTH_DATA.PASSWORD_MIN_LENGTH)
			.refine((input) => !isDeniedPassword(input), 'ValidationMessages.Auth.passwordTooCommon'),
		confirmPassword: z.string().min(1),
		flow: z.literal('signUp')
	})
	// The match rule lives IN the schema, not in a form model — one parse validates the
	// whole contract on either runtime.
	.refine((data) => data.password === data.confirmPassword, {
		path: ['confirmPassword'],
		error: 'ValidationMessages.Auth.passwordsMustMatch'
	});
