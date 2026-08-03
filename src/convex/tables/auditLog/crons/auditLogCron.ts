// LIBRARIES
import { v } from 'convex/values';

// UTILS
import { internalMutation } from '@/convex/functions';
import { internal } from '@/convex/_generated/api';
import { auditExpiresAt } from '../auditLogConfigs';

// CONFIG
import { AUDIT_DATA } from '@/shared/config';

const { MAX_DELETES_PER_RUN, BACKFILL_BATCH } = AUDIT_DATA;

/**
 * Retention sweep. Deletes every audit row whose stamped `expiresAt` has passed.
 *
 * Cost is O(rows deleted) — the index range contains only expired rows, so a run on a
 * table with nothing to delete reads nothing. There is no scan proportional to table size,
 * therefore no read-limit cliff, no per-run cap that can starve, and no possibility of the
 * sweep quietly stopping as the table grows. Retention itself lives on the row, stamped at
 * write time by `auditExpiresAt`.
 *
 * A full batch means there is a backlog (e.g. after downtime, or right after a backfill),
 * so the run self-schedules to drain it rather than waiting a day per 5k rows. This
 * terminates: every batch deletes the rows it read.
 *
 * Rows written before `expiresAt` existed have no stamp. Convex indexes a missing field as
 * `undefined`, which sorts before every number, so the lower bound below excludes them —
 * they are skipped, never mistaken for expired. Run {@link backfillAuditExpiry} once to
 * bring them in.
 *
 * Wire this up from the root `crons.ts`:
 *   crons.daily('purge stale audit logs', { hourUTC: 4, minuteUTC: 0 },
 *     internal.tables.auditLog.crons.auditLogCron.purgeStaleAuditLogs, {});
 */
export const purgeStaleAuditLogs = internalMutation({
	args: {},
	handler: async (ctx) => {
		const now = Date.now();

		const expired = await ctx.db
			.query('auditLogs')
			.withIndex('by_expires_at', (q) => q.gte('expiresAt', 0).lte('expiresAt', now))
			.take(MAX_DELETES_PER_RUN);

		for (const row of expired) {
			await ctx.db.delete(row._id);
		}

		const hasBacklog = expired.length === MAX_DELETES_PER_RUN;
		if (hasBacklog) {
			await ctx.scheduler.runAfter(
				0,
				internal.tables.auditLog.crons.auditLogCron.purgeStaleAuditLogs,
				{}
			);
		}

		return { deleted: expired.length, hasBacklog };
	}
});

/**
 * Stamps `expiresAt` onto audit rows that predate the field, and re-stamps every row when
 * `recompute` is set — which is what you run after editing `AUDIT_RETENTION_DAYS`, since
 * retention is resolved at write time and existing rows keep the old value otherwise.
 *
 * Chains itself one bounded page at a time, so it works at any table size:
 *
 *   bunx convex run tables/auditLog/crons/auditLogCron:backfillAuditExpiry '{}'
 *   bunx convex run tables/auditLog/crons/auditLogCron:backfillAuditExpiry '{"recompute":true}'
 *
 * Uses `_creationTime` (not `Date.now()`) as the base, so a backfilled row expires on the
 * same schedule it would have had if the field had existed when it was written.
 */
export const backfillAuditExpiry = internalMutation({
	args: {
		cursor: v.optional(v.union(v.string(), v.null())),
		/** Re-stamp rows that already have an `expiresAt`. Use after a retention config change. */
		recompute: v.optional(v.boolean()),
		batchSize: v.optional(v.number())
	},
	handler: async (ctx, args) => {
		const numItems = args.batchSize ?? BACKFILL_BATCH;
		const result = await ctx.db
			.query('auditLogs')
			.paginate({ numItems, cursor: args.cursor ?? null });

		let patched = 0;
		for (const row of result.page) {
			if (!args.recompute && row.expiresAt !== undefined) continue;
			const next = auditExpiresAt(row.action, row._creationTime);
			if (row.expiresAt !== next) {
				await ctx.db.patch(row._id, { expiresAt: next });
				patched++;
			}
		}

		if (!result.isDone) {
			await ctx.scheduler.runAfter(
				0,
				internal.tables.auditLog.crons.auditLogCron.backfillAuditExpiry,
				{ cursor: result.continueCursor, recompute: args.recompute, batchSize: numItems }
			);
		}

		return { patched, isDone: result.isDone, continueCursor: result.continueCursor };
	}
});
