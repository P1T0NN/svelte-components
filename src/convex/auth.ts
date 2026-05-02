// LIBRARIES
import { convexAuth } from '@convex-dev/auth/server';
import Google from '@auth/core/providers/google';
import { Password } from '@convex-dev/auth/providers/Password';
import { ConvexError } from 'convex/values';

// CONFIG
import { ResendOTPPasswordReset } from './auth/emails/resendOTPPasswordReset';
import { ResendOTP } from './auth/emails/resendOTP';

// UTILS
import { isDeniedPassword } from '../features/auth/utils/denyPasswordList.js';

// TYPES
import type { MutationCtx } from '@/convex/_generated/server';
import type { ConvexErrorPayload } from '@/convex/types/convexTypes';

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [
		Google,
		Password({
			reset: ResendOTPPasswordReset,
			verify: ResendOTP,
			validatePasswordRequirements(password) {
				if (password.length < 8) {
					throw new ConvexError({
						code: 'PASSWORD_TOO_SHORT',
						message: { key: 'GenericMessages.PASSWORD_TOO_SHORT', params: { min: 8 } }
					} satisfies ConvexErrorPayload);
				}
				if (password.length > 128) {
					throw new ConvexError({
						code: 'PASSWORD_TOO_LONG',
						message: { key: 'GenericMessages.PASSWORD_TOO_LONG' }
					} satisfies ConvexErrorPayload);
				}
				if (isDeniedPassword(password)) {
					throw new ConvexError({
						code: 'PASSWORD_TOO_COMMON',
						message: { key: 'GenericMessages.PASSWORD_TOO_COMMON' }
					} satisfies ConvexErrorPayload);
				}
			}
		})
	],
	callbacks: {
		async createOrUpdateUser(ctx: MutationCtx, args) {
			// Do not patch/merge on return visits — profile fields are set only on first
			// `insert`. Subsequent sign-ins only resolve the same user id.
			if (args.existingUserId) {
				return args.existingUserId;
			}

			// Account linking by email only when ownership is proven for this event:
			// - `oauth`: only add OAuth providers you trust to return verified emails (e.g. Google).
			// - `verification`: OTP / email verification just succeeded.
			// Do not link for other types (e.g. raw `credentials`) so a future provider
			// cannot claim someone else's inbox without verification.
			const email = args.profile.email;
			const canLinkByEmail = args.type === 'oauth' || args.type === 'verification';
			if (canLinkByEmail && typeof email === 'string' && email.length > 0) {
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
