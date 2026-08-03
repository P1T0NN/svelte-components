// THE source of truth for configuration constants: limits, caps, retention windows and
// feature toggles. Dual-runtime — Convex and Svelte both import from here, so nothing in
// this file may reference paraglide, Svelte, the DOM, or any Convex API.
//
// Rule: if a value decides *how much* or *whether* something happens, it belongs here, not
// as a `const` at the top of the file that happens to use it. One place to tune a project.

// ─── Company / branding ──────────────────────────────────────────────────────

/** Branding strings used by the UI shell, `<SvelteHead>`, and transactional emails. */
export const COMPANY_DATA = {
	NAME: 'Company Name',
	EMAIL: 'company@gmail.com',
	/** From-address for the Resend provider (transactional email). */
	RESEND_EMAIL: 'onboarding@resend.dev',
	DOMAIN: 'company.com',
	LOGO: '/logo/logo.webp',
	DESCRIPTION:
		'We build dependable software and services so your team can focus on what matters most.'
} as const;

// ─── Feature toggles ─────────────────────────────────────────────────────────

export const FEATURES = {
	/**
	 * Enable audit logging. When `false`, `ctx.audit()` / `logAudit()` are no-ops
	 * and nothing is written to the `auditLogs` table.
	 *
	 * The table itself is always declared in the schema so toggling this flag
	 * does not require a schema migration.
	 */
	AUDIT_LOGS: true,

	/**
	 * Use Cloudflare R2 (`@convex-dev/r2`) for file uploads instead of Convex storage.
	 * - `true`  → uploads go to R2, reads/deletes target the `uploadedFilesR2` table.
	 * - `false` → uploads go to Convex storage, reads/deletes target `uploadedFiles`.
	 * Both backends stay registered server-side; this only switches which one the UI uses.
	 */
	USE_R2: true
} as const;

// ─── Pagination ──────────────────────────────────────────────────────────────

export const PAGINATION_DATA = {
	DEFAULT_PAGE_SIZE: 10,
	/** Server-side cap for `paginationOpts.numItems` (e.g. search dropdowns). */
	MAX_PAGE_SIZE: 25,
	/** Default for `DataTable` `optimizationStrategy` (see `DataTableOptimizationStrategy` in data-table `types.ts`). */
	DEFAULT_OPTIMIZATION_STRATEGY: 'cursor' as const,
	/**
	 * Most rows an `offset`-strategy query will read to produce an exact `totalCount`.
	 *
	 * Offset pagination has to materialize the whole matched set to count and slice it, so its
	 * cost is O(matching rows). Unbounded, that walks straight into Convex's hard per-query
	 * limits (16,384 documents / 8 MiB) and the endpoint starts throwing — a feature that
	 * worked yesterday returns a 500 today, with no degradation in between.
	 *
	 * With this cap the query reads at most `OFFSET_SCAN_LIMIT + 1` rows instead. Past the cap
	 * it stops counting and reports `totalCount: null`, which every consumer already understands
	 * as "unknown" (it is what cursor mode returns): page numbers disappear, prev/next keeps
	 * working, nothing throws. Kept well under the platform limit so `enrich` and joins still
	 * have read budget left.
	 *
	 * Wire an `aggregate` (see `convex/aggregates.ts`) to remove the bound entirely.
	 */
	OFFSET_SCAN_LIMIT: 10_000,
	/**
	 * How many cursors the URL carries for backward navigation (`?cs=`). Cursors are ~200
	 * chars each, so the trail is capped rather than unbounded; past this the oldest entry is
	 * dropped and "previous" stops short of the true first page.
	 */
	MAX_CURSOR_STACK: 10,
	/**
	 * Absolute per-request ceiling on `paginationOpts.numItems`, enforced server-side by
	 * `resolvePaginationOpts` in every paginated endpoint. Convex endpoints are a public
	 * API — any caller can hand-craft a request — so without this a single call could demand
	 * a 50,000-row page and read straight into the platform limits. Per-REQUEST only: every
	 * row stays reachable across pages; this just guarantees a page is a page.
	 *
	 * Distinct from `MAX_PAGE_SIZE` (25), the tighter default cap for search-suggestion
	 * endpoints: a table may legitimately want up to this many rows per page.
	 */
	HARD_MAX_PAGE_SIZE: 100
} as const;

// ─── Aggregates ──────────────────────────────────────────────────────────────

export const AGGREGATE_DATA = {
	/**
	 * Rows processed per backfill transaction in `convex/aggregates.ts`. Each batch
	 * self-schedules the next, so backfills work at any table size — this only tunes
	 * transaction size, never a ceiling.
	 */
	BACKFILL_BATCH: 500
} as const;

// ─── Uploads ─────────────────────────────────────────────────────────────────

/**
 * Upload limits. The SERVER is the trust boundary — both storage backends
 * (`convex/storage/convexStorage` and `convex/storage/r2`) enforce these, and they must
 * agree so swapping `FEATURES.USE_R2` never changes what a user can upload. The client
 * picker reads the same values to reject files before spending an upload round-trip.
 */
export const UPLOAD_DATA = {
	MAX_BYTES: 10 * 1024 * 1024, // 10 MB
	/** Allow-list of accepted MIME types. Add/remove per project needs. */
	ALLOWED_CONTENT_TYPES: [
		'image/jpeg',
		'image/png',
		'image/webp',
		'image/gif',
		'application/pdf'
	] as readonly string[],
	/** Target size the client-side image optimizer compresses down to, in MB. */
	CLIENT_OPTIMIZE_TARGET_MB: 1
} as const;

/**
 * Orphan-cleanup crons. Each sweep pages one side and checks the counterpart per item with
 * an indexed point lookup, self-scheduling the next batch until done — works at any table
 * size; these tune transaction size and safety, never a ceiling.
 */
export const STORAGE_CLEANUP_DATA = {
	/** Rows/objects examined per cleanup transaction; a full batch self-schedules the next. */
	BATCH: 500,
	/**
	 * Never delete a blob/object younger than this. Uploads write the blob FIRST and its
	 * registry row a moment later — without a grace window the sweep could destroy an
	 * in-flight upload that legitimately has no row yet.
	 */
	GRACE_MS: 60 * 60 * 1000 // 1 hour
} as const;

// ─── Audit log ───────────────────────────────────────────────────────────────

export const AUDIT_DATA = {
	/** Retention for actions with no explicit override in `AUDIT_RETENTION_DAYS`. */
	RETENTION_DEFAULT_DAYS: 90,
	/** Rows deleted per purge transaction. A full batch self-schedules the next one. */
	MAX_DELETES_PER_RUN: 5_000,
	/** Rows examined per `backfillAuditExpiry` transaction. */
	BACKFILL_BATCH: 500
} as const;

// ─── Mutations ───────────────────────────────────────────────────────────────

export const MUTATION_DATA = {
	/** Default cap on `ids.length` per `createDeleteMutation` request; overridable per call site. */
	DEFAULT_MAX_BATCH_SIZE: 200
} as const;

// ─── Search ──────────────────────────────────────────────────────────────────

export const SEARCH_DATA = {
	/** Shorter queries return an empty page before touching the index or the rate limiter. */
	MIN_QUERY_LENGTH: 2,
	/** Cap for the SvelteKit remote search bridge (`createSearchInputRemote`). */
	REMOTE_MAX_RESULTS: 25,
	/** Debounce for the search input before a query is issued, in ms. */
	INPUT_DEBOUNCE_MS: 300
} as const;

// ─── Auth ────────────────────────────────────────────────────────────────────

export const AUTH_DATA = {
	/** Digits in the emailed OTP. Drives both the input's `maxlength` and the schema regex. */
	OTP_LENGTH: 8,
	/** Minimum password length enforced by the auth schemas. */
	PASSWORD_MIN_LENGTH: 8
} as const;

/**
 * Routes instrumented by `initBotId` on the client and verified by
 * `checkBotId` on the server via `safeCommand`.
 *
 * SvelteKit remote functions POST to `/_app/remote/<hash>/call`. With locale
 * prefixes (Paraglide), the path becomes `/<locale>/_app/remote/<hash>/call`.
 */
export const BOTID_PROTECTED_ROUTES = [
	{ path: '/_app/remote/*', method: 'POST' as const },
	{ path: '/*/_app/remote/*', method: 'POST' as const }
];
