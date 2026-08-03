// Aggregate counters (`@convex-dev/aggregate`) + the central trigger registry that keeps
// them in sync with table writes. This is what makes `strategy: 'offset'` exact at any
// scale: `fetchOptimized`'s `aggregate` mode reads counts and jumps to offsets in
// O(log n) instead of scanning the matched set. See fetchOptimized/README § Aggregate.
//
// ## Adding an aggregate for a new offset surface
//   1. `convex.config.ts` — `app.use(aggregate, { name: 'aggregate<Table>' })` (one
//      component instance per aggregate) and run codegen.
//   2. Define a `TableAggregate` below. `sortKey` MUST be the field the surface sorts by
//      (the aggregate replaces the index for the page slice). Filterable surfaces use
//      `namespace` for exact-match facets and key `bounds` for ranges.
//   3. `triggers.register('<table>', <aggregate>.trigger())` — after this, every write
//      through the wrapped `mutation`/`internalMutation` in `functions.ts` stays in sync
//      automatically. NEVER write a triggered table through the raw builders from
//      `_generated/server`: a bypassed write silently drifts the counter, and a drifted
//      count is a wrong answer rendered with confidence.
//   4. Backfill existing rows once (pattern below), then wire the query's `aggregate`
//      builder.

// LIBRARIES
import { v } from 'convex/values';
import { TableAggregate } from '@convex-dev/aggregate';
import { Triggers } from 'convex-helpers/server/triggers';

// CONFIG
import { components, internal } from './_generated/api';
import { internalMutation } from './_generated/server';
import { AGGREGATE_DATA } from '@/shared/config';

// TYPES
import type { DataModel } from './_generated/dataModel';

// ─── Aggregates ──────────────────────────────────────────────────────────────

/**
 * Backs the unfiltered `?page=N` browse of `fetchTestRowsCatalog`: exact `totalCount` +
 * O(log n) jump to any page, forever. Keyed by `_creationTime` because that is the
 * surface's sort order. Faceted requests (role/plan) fall back to the capped scan path —
 * add a namespaced aggregate if a filtered set ever outgrows the cap.
 */
export const aggregateTestRowsByCreation = new TableAggregate<{
	Key: number;
	DataModel: DataModel;
	TableName: 'testRows';
}>(components.aggregateTestRows, {
	sortKey: (doc) => doc._creationTime
});

// ─── Trigger registry ────────────────────────────────────────────────────────

/** Wrapped into `mutation`/`internalMutation` in `functions.ts` — the single sync point. */
export const triggers = new Triggers<DataModel>();
triggers.register('testRows', aggregateTestRowsByCreation.trigger());

// ─── Backfill ────────────────────────────────────────────────────────────────

/**
 * One-time backfill after adding the aggregate to a table that already has rows —
 * triggers only cover writes made after registration. Idempotent (`insertIfDoesNotExist`),
 * safe to re-run after suspected drift.
 *
 * Works at ANY table size: processes `AGGREGATE_DATA.BACKFILL_BATCH` rows per transaction
 * and self-schedules the next batch until done, so it never approaches Convex's
 * per-transaction read limit. This is the canonical shape to copy for new aggregates.
 *
 *   bunx convex run aggregates:backfillTestRowsAggregate '{}'
 */
export const backfillTestRowsAggregate = internalMutation({
	args: { cursor: v.optional(v.string()) },
	handler: async (ctx, args) => {
		const { page, isDone, continueCursor } = await ctx.db
			.query('testRows')
			.paginate({ numItems: AGGREGATE_DATA.BACKFILL_BATCH, cursor: args.cursor ?? null });

		for (const doc of page) {
			await aggregateTestRowsByCreation.insertIfDoesNotExist(ctx, doc);
		}

		if (!isDone) {
			await ctx.scheduler.runAfter(0, internal.aggregates.backfillTestRowsAggregate, {
				cursor: continueCursor
			});
		}

		return { backfilled: page.length, isDone };
	}
});
