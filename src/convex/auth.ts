// LIBRARIES
import { convexAuth } from '@convex-dev/auth/server';
import Google from '@auth/core/providers/google';

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [Google],
	callbacks: {
		async createOrUpdateUser(ctx, args) {
			if (args.existingUserId) {
				// Existing user, just return the ID
				return args.existingUserId;
			}
			// New user, create with default role
			return ctx.db.insert('users', {
				...args.profile,
				role: 'user',
				credits: 100
			});
		}
	}
});
