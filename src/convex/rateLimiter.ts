// LIBRARIES
import { RateLimiter, MINUTE } from '@convex-dev/rate-limiter';
import { components } from './_generated/api';

/**
 * Named rate-limit buckets for this app.
 *
 * Use directly via `rateLimiter.limit(ctx, name, { key, count, throws: true })`.
 * For the common "auth user + limit" case, prefer
 * {@link import('./helpers/getRateLimitedUserId').getRateLimitedUserId}.
 *
 * ## Bucket math (token bucket)
 * - `rate` = sustained refill (tokens per `period`).
 * - `capacity` = max burst before throttling kicks in.
 *
 * Two patterns matter:
 * - **UX-friendly (`capacity ≥ rate per period`):** the advertised rate is
 *   fully reachable; legitimate fast usage never feels a hidden burst cap.
 *   Use for endpoints called often by real users (form autosaves, click
 *   bursts, batch ops).
 * - **Abuse-prevention (`capacity < rate per period`):** tight burst cap,
 *   slow refill. Use for rare-but-sensitive ops where one client should
 *   never be able to spam.
 *
 * ## Naming
 * Bucket names describe **intent**, not Convex function kind. Anything new
 * should be intent-named (e.g. `mediaUpload`, `searchExpensive`).
 */
export const rateLimiter = new RateLimiter(components.rateLimiter, {
	// Default per-user mutation bucket. 2/s sustained with bursts up to 60 (covers
	// fast typing in autosaved forms, click bursts, batch ops).
	mutation: { kind: 'token bucket', rate: 120, period: MINUTE, capacity: 60 },

	// Actions are heavier (external API calls, longer-running). 1/s sustained
	// with bursts up to 20.
	action: { kind: 'token bucket', rate: 60, period: MINUTE, capacity: 20 },

	// Destructive ops, charged `count` tokens per request so a 50-row delete pays
	// 50 tokens. Capacity 100 = "one big batch then refill"; 200/min sustained
	// keeps cleanup scripts and admin sweeps unblocked.
	delete: { kind: 'token bucket', rate: 200, period: MINUTE, capacity: 100 },

	// File uploads — tighter than `mutation` because each call mints a storage URL
	// and a row insert. 30/min sustained, bursts up to 10.
	upload: { kind: 'token bucket', rate: 30, period: MINUTE, capacity: 10 },

	// Query-side bucket for full-text search and other expensive read endpoints.
	// Used via `rateLimiter.check(ctx, 'search', { key })` from `fetchOptimized` —
	// `check` is advisory in queries (doesn't consume), but throws a typed error
	// for honest clients hitting bursts, and surfaces in monitoring. 60/min
	// sustained with bursts up to 30 — typical usage is "user types in box,
	// debounced", which under 300 ms debounce caps at ~60/min naturally.
	search: { kind: 'token bucket', rate: 60, period: MINUTE, capacity: 30 }
});

/** Names of all configured rate-limit buckets. */
export type RateLimitName = 'mutation' | 'action' | 'delete' | 'upload' | 'search';
