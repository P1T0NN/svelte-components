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

export default crons;
