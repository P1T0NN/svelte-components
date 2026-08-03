# TODO — Scale work

> Rule of the game: Convex hard-limits every transaction (16,384 docs read / 8 MiB), so
> "removing a cap" never means deleting the number — it means redesigning the read so no
> unbounded scan happens (aggregate, cursor, indexed access, or self-rescheduling batches).

**All items closed as of 2026-08-03.** New scale findings go above this line.

---

## Resolved

- **Orphan-cleanup crons stall past their scan window → DONE (2026-08-03).** Both crons
  redesigned from snapshot-diff to per-item point lookups: each direction pages its own side
  (`STORAGE_CLEANUP_DATA.BATCH` per transaction) and checks the counterpart with an indexed
  O(1) read (`ctx.db.system.get` / `by_storage_id` / `r2.getMetadata` / `by_key`),
  self-scheduling the next batch until done. The old "may only delete against a COMPLETE
  opposite snapshot" constraint dissolved — orphanhood is decided per item inside one
  transaction, so truncation ambiguity cannot exist and there is no window to outgrow.
  Bonus fix: a `GRACE_MS` window (1h) now protects in-flight uploads (blob exists before its
  row) — a race the old sweep had. Deletion branch verified live with a seeded orphan.
- **Cursor-stack depth (10 pages) → ACCEPTED BY DESIGN (2026-08-03).** Cursors are ~200
  chars and live in the URL — the trail physically cannot grow much past 10. The "fix"
  (server-side cursor cache keyed by short tokens) is strictly worse than the degradation
  it removes: a DB write per page navigation on public surfaces (including crawler hits), a
  TTL table, and shared links that break when tokens expire. Degrades UX depth only, never
  correctness — and any surface where deep page navigation actually matters should be
  offset+aggregate, which has unlimited O(log n) jumps and no stack at all. Documented in
  the design doc (hard limit 3) and on `PAGINATION_DATA.MAX_CURSOR_STACK`.

- **⚠️ THE WALL — filtered tables filter by INDEX → DONE (2026-08-03).** `listUsersPaginated`
  is now fully index-bounded, three paths: (1) text search via `search_name` / `search_email`
  search indexes with facets as `filterFields` — token-prefix semantics, O(matches) at any
  scale; (2) facets via one dedicated `by_<facets…>` index per combination, with
  `banned: false` ("active") served as a union of its three stored representations
  (`undefined` / `null` / `false`) merged by `_creationTime`; (3) unfiltered sorts via the
  `name` / `email_name` / creation indexes. Custom indexes live in the component's
  `schema.ts` extension layer over `generatedSchema.ts`, so `npx auth generate` can never
  wipe them. The schema file documents the copy-this pattern for every future filtered
  table. Semantics change: search is token-prefix ("tapu" finds `tapuskovic@…`), not
  arbitrary substring — the standard typeahead trade. Sorting by name/email under an active
  facet falls back to creation time (design doc hard limit 5). Frontend unchanged.
- **Union+offset has no aggregate path → RESOLVED AS DESIGNED (2026-08-03).** Not unbuilt —
  impossible to build correctly: aggregates cannot dedupe across specs (a row matching two
  specs double-counts, making the total a wrong number), and deduped page jumps across merged
  namespaces have no O(log n) form. Union+offset is bounded-only; unbounded union surfaces
  use cursor mode (O(perPage · k) forever) or denormalize a single key so plain
  offset+aggregate applies. Documented in `fetchOptimized/README § union`.
- **`numItems` unclamped → DONE (2026-08-03).** `resolvePaginationOpts` clamps every request
  to `[1, PAGINATION_DATA.HARD_MAX_PAGE_SIZE]`; `fetchOptimized` and `listUsers` both route
  through it. Per-request only — all rows stay reachable across pages.
- **Aggregate backfill single-transaction → DONE (2026-08-03).**
  `backfillTestRowsAggregate` now processes `AGGREGATE_DATA.BACKFILL_BATCH` rows per
  transaction and self-schedules until done — the canonical any-scale shape to copy.
- **Offset totals at scale → DONE (2026-08-03).** `fetchOptimized` `aggregate` mode; see
  `TODOOffsetMode.md` and `fetchOptimized/README § Aggregate mode`.
