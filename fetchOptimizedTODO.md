# fetchOptimized — LLM prompts

---

## PROMPT (copy this to the LLM working on the universal components library)

You are evolving **`fetchOptimized`**, a reusable Convex pagination factory from a **universal frontend/backend components library** (`svelte-components-convex`). It is consumed by multiple apps via a shared `ConvexDataTable` component.

Your job: extend the primitive so **any paginated list** can be declared through it — including cases the current API cannot handle — while keeping the design **portable across projects**.

### What `fetchOptimized` is today

A factory that returns a Convex `query` with this payload:

```ts
type FetchOptimizedResult<Row> = {
  page: Row[];
  isDone: boolean;
  continueCursor: string;
  totalCount: number | null;
};
```

Options:

- `table` — single Convex table (fixed at factory time)
- `strategy: 'cursor' | 'offset'` — cursor = O(perPage); offset = O(all matching rows)
- `auth: 'user' | 'admin'` — endpoint gate
- optional rate-limit name overload
- `args` — extra validated args
- `where` — **one** index access spec (`withIndex` + eq/range)
- `search` — **one** search index spec (mutually exclusive with `where`)
- `order` — asc/desc (ignored for search)
- `enrich` — post-pagination join hook

### `enrich` contract (critical — do not break)

- Runs **after** pagination / offset slice
- **1:1, same order** — exactly one output row per input row
- **No row dropping or adding** — breaks `isDone` / cursor accounting
- Batch `ctx.db.get` (dedupe ids + `Promise.all`), no N+1
- When present, `page` type becomes `Row[]` instead of `Doc<table>[]`

### Deliberate omissions today

- No `.filter()` fallback on queries (would be O(table))
- No multi-index union in one request
- No custom data source / computed page resolver
- No pre-pagination filter hook
- No multi-step enrich pipeline

### What works today

Single-table, single-index access patterns. Example shape:

```ts
fetchOptimized({
  table: 'someTable',
  auth: 'user',
  strategy: 'cursor',
  where: async (ctx) => ({
    index: 'by_owner_status',
    eq: { ownerId: userId, status: 'pending' }
  }),
  enrich: (ctx, page) => enrichRows(ctx, page)
});
```

### Known failure mode (why we need an extension)

Some real-world lists are **not** one index on one table. Example pattern:

- Rows belong to a user if they own **entity A** OR **entity B**
- Table is indexed by `entityAId + active` and `entityBId + active`, but **not** by owner id
- Correct access = N indexed queries (one per owned A, one per owned B) → merge → dedupe → sort → paginate
- `enrich` cannot fix this (1:1 contract; runs after slice)
- A bespoke `query` + manual pagination adapter is the current workaround

Also common: raw table docs contain **secrets or internal fields** that must be stripped before the client — enrichment / projection is required, sometimes multi-step.

### Client contract (must stay stable unless justified)

A paired `ConvexDataTable` component expects:

```ts
{ page: Row[]; isDone: boolean; continueCursor: string; totalCount: number | null }
```

It sends:

- **cursor mode:** `{ paginationOpts: { numItems, cursor }, ...queryArgs }`
- **offset mode:** `{ page, paginationOpts: { numItems, cursor: null }, ...queryArgs }`

### Goal

One unified primitive for **all** paginated lists. Target: **zero one-off pagination handlers** in consuming apps unless provably impossible.

Must support:

- Single-index access (current behavior — do not regress)
- Multi-index unions (OR across ownership / membership paths)
- Multi-step enrichment / safe projections
- Auth (`user` / `admin` / public / optional-user patterns)
- Cursor + offset strategies
- Search + index modes
- Rate limiting + Convex `args` / `returns` validators

### Hard constraints

**Convex / performance**

- No `.filter()` on large/unbounded queries; use indexes
- No unbounded `.collect()` on growing tables
- Cursor lists must stay **O(perPage)** where data can grow
- Offset only for **bounded** datasets or explicitly documented exceptions
- Never `Date.now()` inside queries
- All public queries: validate `args` and `returns`
- Auth server-side; never trust client-sent ids for access control
- Await all promises

**Security**

- Table docs ≠ client contracts
- Support audience-specific row types (admin vs owner vs guest projections)
- Never leak denormalized secrets in owner/guest projections

**Portability**

- No app-specific table or domain names in the primitive API
- Prefer extending one factory over forking into `fetchOptimized2`
- Document modes in the helper file header (“when to use which mode”)
- Design so changes can ship in the universal library, not per-app patches

### Phase 1 — Architecture (answer this first, before coding)

Compare these approaches with tradeoffs (performance at 10 / 1k / 100k rows, Convex reactivity, migration cost, DX, security, portability):

**A. Extend `fetchOptimized`**

New hooks / modes, e.g.:

- `source: 'index' | 'union' | 'computed'`
- `resolvePage(ctx, args)` — custom bounded data source
- `filter` (pre-slice, index-bounded only?)
- `project` vs `enrich` (split responsibilities?)
- `enrich` pipeline: `[enrichA, enrichB]`

**B. New sibling primitive**

e.g. `fetchPaginated` / `fetchList`:

- index mode → current internals
- computed/union mode → bounded collect + slice + project
- shared auth / rate-limit / validators / return shape
- keep `fetchOptimized` as thin alias for index mode?

**C. Schema-first (consumer responsibility)**

Document that consumers should denormalize list keys (owner ids, participant ids) + indexes so index mode always works. Primitive stays unchanged.

**D. Materialized index / join table (consumer responsibility)**

Document pattern: mutations maintain a query-friendly table; primitive queries that table.

**Pick ONE recommended approach for the library and defend it.**

### Phase 2 — Implementation plan

1. Final API (types, options, contracts, error cases)
2. Backward compatibility story for existing `fetchOptimized` call sites
3. How union/computed mode interacts with cursor vs offset
4. How enrichment / projection pipelines work without breaking pagination accounting
5. Migration guide for consumers currently using manual `toPaginatedListPayload`
6. Verification checklist

### Phase 3 — Implement (when approved)

1. Implement in the library’s convex helpers
2. Update inline documentation and examples
3. Add at least one **union/computed** example alongside existing index example
4. Ensure TypeScript inference for custom `Row` types still works

### Non-goals

- Do not hack `enrich` to drop rows
- Do not use client-side filtering for auth or pagination
- Do not app-lock the API to one consumer’s domain
- Do not remove the index-only fast path

### Success criteria

1. A consumer can declare a multi-source union list through the primitive (config, not boilerplate)
2. Index-only lists behave exactly as today
3. Cursor lists stay cheap; offset used only with documented bounds
4. `ConvexDataTable` works unchanged (or document a minimal breaking change)
5. Clear docs: index vs union vs computed vs search modes

### Output format

Start with **Phase 1** only:

1. Problem restatement (2–3 sentences)
2. Options A–D comparison table
3. Recommended approach + rationale
4. Proposed API sketch (TypeScript types)
5. Migration plan outline for library + consumers
6. Open questions

Do not write code until architecture is approved — unless explicitly told to proceed to Phase 3.

---

### AFTER FETCH OPTIMIZED HAS BEEN CHANGED, PUT THIS

*(Second prompt — paste to an LLM with access to **misa-i-ogi-frontend** after the universal library update is merged or copied in.)*

You are migrating **misa-i-ogi-frontend** to the updated universal `fetchOptimized` (from `svelte-components-convex`). The primitive now supports the union/computed cases that previously required bespoke handlers.

**Repo:** misa-i-ogi-frontend · Bun · Svelte 5 · Convex · read `AGENTS.md`

**Verify:** `bunx convex codegen` and `bun run check`

### Files to read

| Path | Role |
| --- | --- |
| `src/convex/helpers/fetchOptimized.ts` | Updated primitive (sync from library) |
| `src/convex/helpers/paginationHelpers.ts` | `toPaginatedListPayload` — should become unnecessary for new code |
| `src/convex/schema.ts` | `partnerships`, `partnershipRequests` indexes |
| `src/shared/components/ui/data-table/convex-data-table.svelte` | Client consumer |

### Primary migration target

**`src/convex/tables/partnerships/queries/fetchActivePartnershipsSafe.ts`**

Currently a bespoke `query` + `toPaginatedListPayload`. Must use the new primitive.

**Why it was bespoke:** active custom partnerships for the signed-in owner are a **union**:

1. Active rows on accommodations they own → `partnerships.by_accommodation_active`
2. Active rows on hospitalities they own → `partnerships.by_hospitality_active`

Helper: `src/convex/tables/partnerships/helpers/getActiveCustomPartnershipDocsForUser.ts`

- Load accommodations (`accommodations.by_owner`)
- Load hospitalities (`hospitalities.by_owner`)
- Query partnerships per owned entity, merge, dedupe, exclude `createType === 'platform'`, sort
- Project via `enrichActivePartnershipSafeRows` → `typesPartnershipMyItem`

**Schema gap:** `partnerships` has no owner index. `partnershipRequests` *does* denormalize `accommodationOwnerId` / `hospitalityOwnerId`.

**Security:** raw `Doc<'partnerships'>` leaks `accommodationScanToken` (QR secret). Owner/guest clients must get `typesPartnershipMyItem` or `typesPartnershipAccommodationSafe` only.

**UI:** `src/shared/components/pages/(protected)/partnerships/partnerships-tabs/partnerships-active-tab.svelte` uses this query with `optimizationStrategy="offset"` and `showPagination={false}`.

### Other `fetchOptimized` call sites (should keep working — regression check)

- `src/convex/tables/partnershipRequests/queries/fetchPartnershipsRequestsSent.ts`
- `src/convex/tables/partnershipRequests/queries/fetchPartnershipsRequestsReceived.ts`
- `src/convex/tables/partnerships/queries/fetchAllPartnershipsAdmin.ts` ← admin; raw docs incl. scan token **intentional**
- `src/convex/tables/partnerships/queries/fetchStayPlatformPartnerships.ts`
- `src/convex/tables/hospitalities/queries/fetchActivePlatformHospitalities.ts`
- `src/convex/tables/accommodations/queries/fetchMyAccommodations.ts`
- `src/convex/tables/hospitalities/queries/fetchMyHospitalities.ts`
- `src/convex/tables/accommodations/queries/fetchAllAccommodations.ts`
- `src/convex/tables/hospitalities/queries/fetchAllHospitalities.ts`
- `src/convex/storage/r2/uploadedFilesR2.ts`

### Also search for

- `toPaginatedListPayload` — migrate or delete usages
- `getActiveCustomPartnershipDocsForUser` — may fold into primitive config or stay as helper
- `ConvexDataTable` `query=` props under `src/shared/components/pages/(protected)/partnerships/`

### Optional schema improvement (only if primitive still needs it)

If the library recommends schema-first instead of union mode, add to `partnerships`:

- denormalized `accommodationOwnerId` / `hospitalityOwnerId` (or `participantOwnerId`)
- index e.g. `by_participant_owner_active`
- backfill migration + update `insertPartnership` and related mutations

### Tasks

1. Replace `fetchActivePartnershipsSafe.ts` with new primitive (keep export name stable)
2. Remove bespoke pagination boilerplate if helper is redundant
3. Confirm all call sites still typecheck and behave correctly
4. Do **not** break admin raw-doc query
5. Do **not** return raw `Doc<'partnerships'>` to owner/guest routes
6. Run `bunx convex codegen` and `bun run check`

### Success criteria (this app)

1. `fetchActivePartnershipsSafe` uses the unified primitive
2. No remaining `toPaginatedListPayload` in query handlers unless documented exception
3. Partnerships UI tabs unchanged from user perspective
4. All checks pass
