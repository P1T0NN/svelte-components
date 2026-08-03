// LIBRARIES
import { goto } from '$app/navigation';
import { authClient } from '@/features/auth/lib/auth-client';
import { localizeHref } from '@/lib/paraglide/runtime';

// CLASSES
import { authClass } from '@/features/auth/classes/authClass.svelte';

// CONFIG
import { UNPROTECTED_PAGE_ENDPOINTS } from '@/config/pageEndpoints';

/**
 * After a revoke that targeted the admin's own account, the better-auth session backing
 * this page may have just been destroyed — a token alone can't tell us whether it was
 * *this* device. So when the target user is the caller we conservatively sign out and
 * bounce to login: worst case the killed session was on another device and they re-log in,
 * best case (and the common one) the redirect is exactly right.
 *
 * Shared by the revoke-one and revoke-all paths, which own their mutations in their own
 * components — this is the one piece of logic both genuinely need.
 */
export async function bounceIfSelf(userId: string): Promise<void> {
	const me = authClass.currentUser?._id;
	if (!me || me !== userId) return;
	await authClient.signOut().catch(() => {});
	goto(localizeHref(UNPROTECTED_PAGE_ENDPOINTS.LOGIN));
}
