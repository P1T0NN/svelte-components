// LIBRARIES
import { createAuthClient } from 'better-auth/svelte';
import { convexClient } from '@convex-dev/better-auth/client/plugins';
import { emailOTPClient } from 'better-auth/client/plugins';

// All admin actions (delete/ban/unban/role-change/session-revoke) go through
// Convex mutations in `src/convex/tables/users/userMutations.ts`, so the BA
// `adminClient()` plugin isn't installed here. Re-add it only if you need
// to call `authClient.admin.*` directly (e.g. a UI that can't take a Convex
// round-trip for the admin step) and pair it with `recordAdminAction` for
// the audit trail.

export const authClient = createAuthClient({
	plugins: [convexClient(), emailOTPClient()]
});
