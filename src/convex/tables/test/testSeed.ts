// LIBRARIES
import { v } from 'convex/values';

// CONFIG
import { internalMutation } from '../../functions.js';

const FIRST = ['Ada', 'Bram', 'Cleo', 'Dara', 'Enzo', 'Faye', 'Gus', 'Hana', 'Ivo', 'Juno'];
const LAST = ['Ferris', 'Nakamura', 'Okonkwo', 'Petrov', 'Quinn', 'Rossi', 'Silva', 'Tan'];
const ROLES = ['admin', 'editor', 'viewer'] as const;
const PLANS = ['free', 'pro', 'enterprise'] as const;
const SOURCES = ['organic', 'referral', 'paid', 'support'] as const;

/**
 * Populates `testRows` with enough deterministic rows for the `/lists` demo to actually
 * demonstrate something — several pages of pagination, and every role/plan facet non-empty.
 *
 *   bunx convex run tables/test/testSeed:seedTestRows '{}'
 *   bunx convex run tables/test/testSeed:seedTestRows '{"count":200}'
 *
 * Tops up to `count` rather than inserting blindly, so running it twice is not a duplicate
 * factory. Values are derived from the row index — no `Math.random`, so the same seed
 * produces the same table and screenshots/tests stay stable.
 */
/** Stamped on every seeded row so `reset` can find its own rows and nothing else. */
const SEED_MARKER = 'Seeded row for the /lists demo.';

export const seedTestRows = internalMutation({
	args: {
		count: v.optional(v.number()),
		/**
		 * Delete previously seeded rows before inserting, so changed generation rules take
		 * effect on existing data. Scoped to rows carrying {@link SEED_MARKER} — rows you
		 * created yourself through the MutationForm demo are never touched.
		 */
		reset: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const target = Math.min(Math.max(1, Math.floor(args.count ?? 60)), 500);

		let deleted = 0;
		if (args.reset) {
			// Bounded by the same cap as the insert loop below.
			const seeded = await ctx.db.query('testRows').take(500);
			for (const row of seeded) {
				if (row.message.startsWith(SEED_MARKER)) {
					await ctx.db.delete(row._id);
					deleted++;
				}
			}
		}

		// Bounded by `target`, so this reads at most a few hundred rows.
		const existing = await ctx.db.query('testRows').take(target);
		const missing = target - existing.length;
		if (missing <= 0) return { inserted: 0, deleted, total: existing.length };

		for (let i = existing.length; i < target; i++) {
			const first = FIRST[i % FIRST.length]!;
			const last = LAST[(i * 3) % LAST.length]!;
			await ctx.db.insert('testRows', {
				name: `${first} ${last}`,
				email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
				role: ROLES[i % ROLES.length]!,
				// Independent of `role`, not a multiple of it: `(i * 2) % 3` walks in lockstep
				// with `i % 3`, which pins every admin to `free` and leaves 6 of the 9 role/plan
				// combinations empty — a filter demo where most pairs return nothing.
				plan: PLANS[Math.floor(i / ROLES.length) % PLANS.length]!,
				source: SOURCES[i % SOURCES.length]!,
				message: SEED_MARKER.repeat((i % 3) + 1),
				acceptsTerms: true
			});
		}

		return { inserted: missing, deleted, total: target };
	}
});
