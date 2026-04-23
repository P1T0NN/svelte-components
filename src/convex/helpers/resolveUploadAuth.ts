// LIBRARIES
import { ConvexError } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';

// HELPERS
import { requireAdmin } from './requireAdmin.js';

// TYPES
import type { MutationCtx } from '../_generated/server';
import type { Id } from '../_generated/dataModel';
import type { ConvexErrorPayload } from '../types/convexTypes.js';

/**
 * Who is allowed to call an upload endpoint.
 *
 * - `'insecure'` — anyone (including anonymous visitors). Use for public demos and
 *   public-form uploads where stamping a real owner isn't possible. Files uploaded this
 *   way will have `ownerId === undefined` and are NOT deletable via the owner path in
 *   {@link createDeleteMutation} — pair with an `adminOnly` delete mutation.
 * - `'userId'` — any authenticated user. The default for private apps.
 * - `'admin'` — only users with `role === 'admin'`.
 */
export type UploadAuthMode = 'insecure' | 'userId' | 'admin';

/**
 * Enforce the chosen auth gate and hand back the caller's user id when available.
 *
 * | mode         | authed user               | anonymous caller                       |
 * | ------------ | ------------------------- | -------------------------------------- |
 * | `'insecure'` | returns their `userId`    | returns `null` (still allowed)         |
 * | `'userId'`   | returns their `userId`    | throws `NOT_AUTHENTICATED`             |
 * | `'admin'`    | returns `userId` if admin | throws `NOT_AUTHENTICATED` / `ADMIN_ACCESS_REQUIRED` |
 *
 * The throws are typed {@link ConvexErrorPayload}s so the client's `safeMutation` wrapper
 * auto-translates them via `translateFromBackend`.
 */
export async function resolveUploadAuth(
	ctx: MutationCtx,
	mode: UploadAuthMode
): Promise<Id<'users'> | null> {
	if (mode === 'admin') {
		return await requireAdmin(ctx);
	}

	const userId = await getAuthUserId(ctx);

	if (mode === 'insecure') {
		return userId;
	}

	// 'userId' mode — authentication is required.
	if (!userId) {
		throw new ConvexError({
			code: 'NOT_AUTHENTICATED',
			message: { key: 'GenericMessages.NOT_AUTHENTICATED' }
		} satisfies ConvexErrorPayload);
	}
	return userId;
}
