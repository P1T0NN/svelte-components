// LIBRARIES
import { ConvexError } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';

// TYPES
import type { MutationCtx, QueryCtx } from '@/convex/_generated/server';
import type { ConvexErrorPayload } from '@/convex/types/convexTypes';

/**
 * Assert the caller is an authenticated admin.
 *
 * Throws typed {@link ConvexError}s whose payload shape ({@link ConvexErrorPayload}) carries
 * a `TranslatableMessage` — the client picks it up via `error.data.message` and feeds it
 * straight into `translateFromBackend` for locale-aware toast text.
 *
 * - `NOT_AUTHENTICATED` — no session at all
 * - `ADMIN_ACCESS_REQUIRED` — signed in but not an admin (also covers the "user row
 *   vanished after auth" edge case, which is equivalent to no privileges for UX purposes)
 */
export const requireAdmin = async (ctx: MutationCtx | QueryCtx) => {
	const userId = await getAuthUserId(ctx);

	if (!userId) {
		throw new ConvexError({
			code: 'NOT_AUTHENTICATED',
			message: { key: 'GenericMessages.NOT_AUTHENTICATED' }
		} satisfies ConvexErrorPayload);
	}

	const user = await ctx.db.get(userId);

	if (!user || user.role !== 'admin') {
		throw new ConvexError({
			code: 'ADMIN_ACCESS_REQUIRED',
			message: { key: 'GenericMessages.ADMIN_ACCESS_REQUIRED' }
		} satisfies ConvexErrorPayload);
	}

	return userId;
};
