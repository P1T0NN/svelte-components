// LIBRARIES
import { internalMutation } from '../_generated/server';

/**
 * Garbage-collect stale rows from the Better Auth `rateLimit` table.
 *
 * BA's DB rate limiter updates rows in place (resetting `count` when the window
 * expires) but never deletes them. Over time the table grows by every distinct
 * `(ip, route)` pair seen. This mutation deletes rows whose `lastRequest` is
 * older than the cutoff — well beyond any configured BA `window`, so it can't
 * reset an active limiter.
 *
 * Tuning:
 * - `STALE_AFTER_MS`: must be larger than your longest BA `customRules.window`
 *   (currently 60s). 24h is a comfortable margin.
 * - `BATCH_SIZE`: caps work per tick. If the table ever balloons (e.g. spike of
 *   unique IPs), increase the cron frequency rather than the batch size to keep
 *   each mutation under the 16k-write limit.
 */
const STALE_AFTER_MS = 24 * 60 * 60 * 1000; // 24 hours
const BATCH_SIZE = 1000; // 1000 rows per batch

export const purgeStaleRateLimits = internalMutation({
	args: {},
	handler: async (ctx) => {
		const cutoff = Date.now() - STALE_AFTER_MS;
		const stale = await ctx.db
			.query('rateLimit')
			.filter((q) => q.lt(q.field('lastRequest'), cutoff))
			.take(BATCH_SIZE);

		await Promise.all(stale.map((row) => ctx.db.delete(row._id)));

		return { deleted: stale.length };
	}
});
