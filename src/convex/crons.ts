// LIBRARIES
import { cronJobs } from 'convex/server';
import { internalMutation } from './_generated/server';
import { components, internal } from './_generated/api';

/**
 * Scheduled jobs. Convex requires this file at the convex root, default-exporting
 * the registry. Convex crons can only reference parent-app functions, so any cron
 * that needs to touch a component (e.g. the BA `rateLimit` table) is wrapped in a
 * thin `internalMutation` here that forwards to the component handler.
 */

/** Wrapper around the component-side `purgeStaleRateLimits`. */
export const purgeStaleRateLimits = internalMutation({
	args: {},
	handler: async (ctx) => {
		// `@convex-dev/better-auth` ships a slim ComponentApi type that only declares
		// `adapter`, so TS doesn't see our component-side `crons.*`. The runtime
		// reference is registered correctly — cast through `any` to call it.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const ref = (components.betterAuth as any).crons.purgeStaleRateLimits
			.purgeStaleRateLimits;
		return await ctx.runMutation(ref, {});
	}
});

const crons = cronJobs();

crons.hourly(
	'purge stale rate limits',
	{ minuteUTC: 0 },
	internal.crons.purgeStaleRateLimits
);

/**
 * Storage cleanup. Safety net for the manual-delete cases the upload pipeline
 * can't catch (rows deleted via the Convex dashboard, blobs deleted via the Cloudflare
 * R2 / Convex storage UIs). Daily is plenty for a safety net; tighten if humans
 * actually mess with the stores often. Staggered so the two sweeps don't fight for
 * the same mutation slot.
 */
crons.daily(
	'cleanup R2 and uploadedFilesR2',
	{ hourUTC: 3, minuteUTC: 0 },
	internal.storage.crons.cleanupOrphanDataR2.cleanupOrphanDataR2
);

crons.daily(
	'cleanup convex storage and uploadedFiles',
	{ hourUTC: 3, minuteUTC: 15 },
	internal.storage.crons.cleanupOrphanDataConvexStorage.cleanupOrphanDataConvexStorage
);

/**
 * Audit-log retention. No-op when `FEATURES.AUDIT_LOGS` is off (table will just
 * be empty). Per-action retention is configured in `tables/auditLog/auditLogActions.ts`.
 */
crons.daily(
	'purge stale audit logs',
	{ hourUTC: 4, minuteUTC: 0 },
	internal.tables.auditLog.crons.auditLogCron.purgeStaleAuditLogs,
	{}
);

export default crons;
