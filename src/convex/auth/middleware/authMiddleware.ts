// LIBRARIES
import {
	customAction,
	customCtx,
	customMutation
} from 'convex-helpers/server/customFunctions';

// UTILS
import { action, mutation } from '@/convex/_generated/server';
import { getRateLimitedUserId } from '@/convex/helpers/getRateLimitedUserId';

// TYPES
import type { RateLimitName } from '@/convex/rateLimiter';

/**
 * Options passed to {@link authMutation} / {@link authAction}.
 *
 * `rateLimit` picks which bucket from {@link import('@/convex/rateLimiter').rateLimiter}
 * gets charged. The bucket key is the authenticated user id, so each user has
 * their own counter.
 */
type AuthOptions = {
	/**
	 * Bucket name. Defaults to `'mutation'` for mutations and `'action'` for
	 * actions. Use `'delete'` (or any future bucket) to charge a heavier limit.
	 */
	rateLimit?: RateLimitName;
};

/**
 * Wrap a Convex **mutation** with auth + per-user rate limit in one step.
 *
 * - Throws `NOT_AUTHENTICATED` (typed `ConvexErrorPayload`) if the caller is anonymous.
 * - Charges the named rate-limit bucket (`opts.rateLimit ?? 'mutation'`) keyed
 *   by the user id. On overflow throws a `RateLimitError` carrying `retryAfter`.
 * - Injects `ctx.userId: Id<'users'>` into the handler — no need to re-auth inside.
 *
 * @example
 * ```ts
 * import { v } from 'convex/values';
 * import { authMutation } from '@/convex/auth/middleware/authMiddleware';
 *
 * // Defaults: 'mutation' bucket.
 * export const updateName = authMutation()({
 *   args: { name: v.string() },
 *   handler: async (ctx, args) => {
 *     await ctx.db.patch(ctx.userId, { name: args.name });
 *   }
 * });
 *
 * // Heavier bucket for destructive ops.
 * export const massDelete = authMutation({ rateLimit: 'delete' })({
 *   args: { ids: v.array(v.id('items')) },
 *   handler: async (ctx, args) => { ... }
 * });
 * ```
 */
export const authMutation = (opts: AuthOptions = {}) =>
	customMutation(
		mutation,
		customCtx(async (ctx) => ({
			userId: await getRateLimitedUserId(ctx, opts.rateLimit ?? 'mutation')
		}))
	);

/**
 * Wrap a Convex **action** with auth + per-user rate limit.
 *
 * Same contract as {@link authMutation} but for actions (external API calls,
 * long-running work). Default bucket is `'action'`.
 *
 * @example
 * ```ts
 * import { v } from 'convex/values';
 * import { authAction } from '@/convex/auth/middleware/authMiddleware';
 *
 * export const sendEmail = authAction()({
 *   args: { to: v.string(), body: v.string() },
 *   handler: async (ctx, args) => {
 *     // ctx.userId is the signed-in user; rate limit already charged.
 *   }
 * });
 * ```
 */
export const authAction = (opts: AuthOptions = {}) =>
	customAction(
		action,
		customCtx(async (ctx) => ({
			userId: await getRateLimitedUserId(ctx, opts.rateLimit ?? 'action')
		}))
	);
