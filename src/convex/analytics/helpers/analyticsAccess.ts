// LIBRARIES
import { ConvexError } from 'convex/values';

// CONFIG
import { authComponent } from '@/convex/auth/auth';
import { requireAdmin } from '@/convex/auth/middleware/authMiddleware';

// TYPES
import type { QueryCtx } from '@/convex/_generated/server';
import type { ConvexErrorPayload } from '@/convex/types/convexTypes';
import type { AnalyticsMetricConfig } from '../types/analyticsTypes';

function _throwNotAuthenticated(): never {
	throw new ConvexError({
		code: 'NOT_AUTHENTICATED',
		message: { key: 'GenericMessages.NOT_AUTHENTICATED' }
	} satisfies ConvexErrorPayload);
}

/**
 * Minimal analytics read gate.
 *
 * All analytics queries require a signed-in user. Metrics marked with
 * `adminOnly: true` in `analyticsConfigs.ts` additionally require the Better Auth
 * `admin` role.
 *
 * More specific dashboard access, such as "this seller can see this product's
 * revenue", should be enforced before rendering/calling the analytics query,
 * usually from the route's `+page.server.ts` or the app-specific parent query.
 */
export async function requireAnalyticsReadAccess(
	ctx: QueryCtx,
	args: {
		config: AnalyticsMetricConfig;
	}
) {
	if (args.config.adminOnly) {
		const userId = await requireAdmin(ctx);
		return { userId, adminOnly: true };
	}

	const user = await authComponent.getAuthUser(ctx);
	if (!user) _throwNotAuthenticated();

	return {
		userId: user._id,
		adminOnly: false
	};
}
