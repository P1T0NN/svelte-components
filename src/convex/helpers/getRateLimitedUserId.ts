// LIBRARIES
import { ConvexError } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';

// UTILS
import { rateLimiter } from '@/convex/rateLimiter';

// TYPES
import type { ActionCtx, MutationCtx } from '@/convex/_generated/server';
import type { Id } from '@/convex/_generated/dataModel';
import type { RateLimitName } from '@/convex/rateLimiter';
import type { ConvexErrorPayload } from '@/convex/types/convexTypes';

/**
 * Assert auth AND charge the shared rate limiter in one call. Bucket is keyed by
 * the authenticated user id (per-user limit).
 *
 * Throws:
 * - `NOT_AUTHENTICATED` (typed {@link ConvexErrorPayload}) if the caller is anonymous.
 * - `RateLimitError` from {@link rateLimiter} (`throws: true`) if the bucket is empty.
 *
 * Anonymous callers are rejected on purpose: a global anon bucket would be a DoS
 * multiplier (one attacker locks out every legitimate anon caller). Endpoints that
 * intentionally allow anon traffic should call `rateLimiter.limit` directly with
 * an explicit key (IP, anon session id, etc.).
 *
 * @param name  Bucket defined in {@link rateLimiter}. Defaults to `'mutation'`.
 * @param count Token weight to consume. Defaults to 1. Use `ids.length` (or similar) for
 *              bulk endpoints so a request that does N units of work pays N tokens.
 */
export const getRateLimitedUserId = async (
	// Accepts both contexts so this helper is reusable from actions (Resend calls,
	// 3rd-party API hits, schedulers) — `getAuthUserId` and `rateLimiter.limit`
	// both work on `MutationCtx | ActionCtx` (the rate limiter only needs
	// `runMutation`, which actions also expose).
	ctx: MutationCtx | ActionCtx,
	name: RateLimitName = 'mutation',
	count?: number
): Promise<Id<'users'>> => {
	const userId = await getAuthUserId(ctx);

	if (!userId) {
		throw new ConvexError({
			code: 'NOT_AUTHENTICATED',
			message: { key: 'GenericMessages.NOT_AUTHENTICATED' }
		} satisfies ConvexErrorPayload);
	}

	await rateLimiter.limit(ctx, name, { key: userId, count, throws: true });
	return userId;
};
