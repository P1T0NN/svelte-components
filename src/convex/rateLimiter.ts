// LIBRARIES
import { RateLimiter, MINUTE, type RunMutationCtx, type RunQueryCtx } from '@convex-dev/rate-limiter';
import { components } from './_generated/api';

/**
 * Rate limiter configuration
 *
 * Add new rate limits here. Each key becomes a rate limit you can use with:
 * - rateLimit(ctx, "keyName") for global limits
 * - rateLimit(ctx, "keyName", userId) for per-user limits
 *
 * Rate limit types:
 * - "fixed window": Resets at fixed intervals (e.g., 100 requests per hour)
 * - "token bucket": Allows bursts up to capacity, refills at rate (e.g., 10/min with burst of 3)
 */
export const rateLimiter = new RateLimiter(components.rateLimiter, {
	// General mutations (per user)
	mutation: { kind: 'token bucket', rate: 30, period: MINUTE, capacity: 5 },
	// General queries (per user) - higher limit since queries are read-only
	query: { kind: 'token bucket', rate: 60, period: MINUTE, capacity: 10 },
	// General actions (per user) - lower limit since actions can be expensive
	action: { kind: 'token bucket', rate: 20, period: MINUTE, capacity: 3 }
});

// Type for rate limit names
type RateLimitName = 'mutation' | 'query' | 'action';

/**
 * Simple rate limit check - throws error if limit exceeded
 *
 * Usage in mutations/actions:
 * ```ts
 * await rateLimit(ctx, "mutation", userId);
 * ```
 *
 * For global limits (not per-user):
 * ```ts
 * await rateLimit(ctx, "mutation");
 * ```
 */
export async function rateLimit(
	// @eslint-disable-next-line @typescript-eslint/no-explicit-any
	ctx: RunMutationCtx,
	name: RateLimitName,
	key?: string
) {
	const result = await rateLimiter.limit(ctx, name, {
		key,
		throws: true
	});
	return result;
}

/**
 * Check rate limit without consuming - useful for UI feedback
 *
 * Usage:
 * ```ts
 * const { ok, retryAfter } = await checkRateLimit(ctx, "mutation", userId);
 * if (!ok) {
 *   return { error: `Rate limited. Try again in ${retryAfter}ms` };
 * }
 * ```
 */
export async function checkRateLimit(
	ctx: RunQueryCtx,
	name: RateLimitName,
	key?: string
) {
	return await rateLimiter.check(ctx, name, { key });
}

/**
 * Reset a rate limit
 *
 * Usage:
 * ```ts
 * await resetRateLimit(ctx, "mutation", userId);
 * ```
 */
export async function resetRateLimit(
	ctx: RunMutationCtx,
	name: RateLimitName,
	key?: string
) {
	return await rateLimiter.reset(ctx, name, { key });
}
