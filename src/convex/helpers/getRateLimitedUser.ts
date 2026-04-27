// LIBRARIES
import { getRateLimitedUserId } from '@/convex/helpers/getRateLimitedUserId';

// TYPES
import type { MutationCtx } from '@/convex/_generated/server';

/**
 * Assert auth, charge the rate limiter, and load the user document.
 *
 * Throws via {@link getRateLimitedUserId} if the caller is anonymous or rate-limited.
 * Returns `null` only in the (rare) race where the user row was deleted between auth
 * resolving and the lookup.
 */
export const getRateLimitedUser = async (ctx: MutationCtx) => {
	const userId = await getRateLimitedUserId(ctx);
	return await ctx.db.get(userId);
};
