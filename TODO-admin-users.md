# Admin user management

Tracking the `/admin/users` + `/admin/users/[id]` feature.

## Done

- [x] Enable BetterAuth `admin` plugin (server `auth.ts` + client `auth-client.ts`)
- [x] Regenerate BA component schema (adds `banned`, `banReason`, `banExpires`, `impersonatedBy`)
- [x] Audit action keys: `USER_BAN`, `USER_UNBAN`, `USER_SESSION_REVOKE`, `USER_SESSIONS_REVOKE_ALL`
- [x] Per-action retention overrides in `AUDIT_RETENTION_DAYS` (5y for user.*/role/ban/unban/session-revoke)
- [x] **Hand-written component-side queries** in `src/convex/auth/component/userQueries.ts` (`listUsersPaginated`, `listUserSessions`, `listUserAccounts`) using native Convex idioms via `convex-helpers/server/stream` (components can't use `ctx.db.paginate()` directly). Main-app boundary in `src/convex/tables/users/userQueries.ts` adds admin guard + reshapes to `PaginatedListPayload`.
- [x] **Client-orchestrated admin actions** via `authClient.admin.*` + a best-effort `recordAdminAction` mutation in `src/convex/tables/auditLog/mutations/`. Server wrappers in `src/convex/tables/users/userMutations.ts` are now unused — safe to delete when ready.
- [x] Universal helpers added: `toPaginatedListPayload` (`paginationHelpers.ts`), `capitalize` (`stringUtils.ts`), `formatTs` (`dateUtils.ts`).

## Chunk 2 — `/admin/users` list page

- [x] `+page.svelte` — DataTable wired to `listUsers`
  - [x] Columns: avatar+name (link to detail), email, role, email verified, banned, created
  - [ ] Last sign-in column — not on the BA `user` table; needs a session-join (max `createdAt` per `userId`)
  - [x] Search box (by email/name, field switcher in filters)
  - [x] Filters: role, banned, emailVerified — extracted to `UsersFilters` component
  - [x] Sort by name / created
  - [ ] Sort by last sign-in — blocked on the last-sign-in column above
  - [x] Row actions moved to detail page; list rows just link to `/admin/users/:id`
- [x] DataTable extended with universal `filters?: Snippet` slot for any future caller

## Chunk 3 — `/admin/users/[id]` detail page

- [x] `+page.svelte` — tabbed layout using new `Tabs` primitive (`src/shared/components/ui/tabs/`)
  - [x] **Overview** — avatar, name, email + verified badge, role, status (banned + reason + expiry), createdAt, updatedAt, copyable user ID
  - [x] **Sessions** — list (UA, IP, createdAt, expiresAt), per-row revoke, "Revoke all"; self-revoke bounces to login
  - [x] **Accounts** — linked providers, createdAt, scopes, hasPassword
  - [x] **Activity** — `listAuditLogs({ userId })` rendered via DataTable with sortable "When" column
  - [x] **Danger zone** — `ChangeRoleButton`, `UnbanUserButton`, `BanUserDialog`, `DeleteUserDialog` (all self-contained, via `ActionButton`). `ActionButton`/`AlertDialogButton` extended with `body` snippet + `actionDisabled` for form-bearing confirms.
- [x] Site-header breadcrumb (hides `/admin` via `hidePaths` prop)

## Cross-cutting

- [x] `/admin/users` link in admin sidebar
- [x] Auth error banner (`?error=...&error_description=...` → AlertDialog) mounted in root layout
- [ ] **i18n** — detail page + tab components still hardcoded English (only list page + `UsersFilters` were translated)
- [ ] Decide whether to expose Impersonate later (currently out of scope)
- [ ] E2E smoke: promote → ban → revoke sessions → unban → delete (in a staging project)
- [ ] Delete unused `src/convex/tables/users/userMutations.ts` (replaced by `authClient.admin.*` + `recordAdminAction`)
