// LIBRARIES
import { getRateLimitedUserId } from '@/convex/helpers/getRateLimitedUserId';

// TYPES
import type { MutationCtx } from '@/convex/_generated/server';

export const getRateLimitedUser = async (ctx: MutationCtx) => {
	const userId = await getRateLimitedUserId(ctx);

	if (!userId) {
		return null;
	}

	return await ctx.db.get(userId);
};