// LIBRARIES
import { getAuthUserId } from '@convex-dev/auth/server';

// UTILS
import { rateLimit } from '@/convex/rateLimiter';

// TYPES
import type { MutationCtx } from '@/convex/_generated/server';
import type { RateLimitName } from '@/convex/rateLimiter';

/**
 * Resolve the authenticated user id AND charge the shared rate limiter in one call.
 *
 * - Signed-in caller → keyed by their user id (per-user bucket).
 * - Anonymous caller → keyed globally (stricter, shared across all anon clients).
 *
 * Throws if the limit is exceeded (the underlying `rateLimit(..., throws: true)`).
 *
 * @param name  Bucket defined in {@link rateLimiter}. Defaults to `'mutation'`.
 * @param count Token weight to consume. Defaults to 1. Use `ids.length` (or similar) for
 *              bulk endpoints so a request that does N units of work pays N tokens.
 */
export const getRateLimitedUserId = async (
	ctx: MutationCtx,
	name: RateLimitName = 'mutation',
	count?: number
) => {
	const userId = await getAuthUserId(ctx);

	if (!userId) {
		await rateLimit(ctx, name, undefined, count);
		return null;
	}

	await rateLimit(ctx, name, userId, count);
	return userId;
};
