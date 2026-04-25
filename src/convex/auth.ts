// LIBRARIES
import { convexAuth } from '@convex-dev/auth/server';
import Google from '@auth/core/providers/google';
import { Password } from "@convex-dev/auth/providers/Password";
import { ResendOTPPasswordReset } from './emails/resendOTPPasswordReset';
import { ResendOTP } from './emails/resendOTP';

// TYPES
import type { MutationCtx } from './_generated/server';

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [
		Google,
		Password({
			reset: ResendOTPPasswordReset,
			verify: ResendOTP,
		})
	],
	callbacks: {
		async createOrUpdateUser(ctx: MutationCtx, args) {
			// Do not patch/merge on return visits — profile fields are set only on first
			// `insert`. Subsequent sign-ins only resolve the same user id.
			if (args.existingUserId) {
				return args.existingUserId;
			}

			// Account linking: same (verified) email → same `users` row, no updates.
			const email = args.profile.email;
			if (typeof email === 'string' && email.length > 0) {
				const linked = await ctx.db
					.query('users')
					.withIndex('email', (q) => q.eq('email', email))
					.unique();
				if (linked) return linked._id;
			}

			return ctx.db.insert('users', {
				...args.profile,
				role: 'user',
				credits: 100
			});
		}
	}
});
