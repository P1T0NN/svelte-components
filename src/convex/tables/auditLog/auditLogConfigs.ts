/**
 * Closed registry of audit action keys.
 *
 * Add new actions here — `as const` keeps the union narrow so typos at call
 * sites become compile errors and downstream filters (admin UI, retention
 * rules) can exhaustively switch over the values.
 *
 * Convention: `domain.entity.verb` (lowercase, dotted). Keep stable — these
 * strings live in the database and any rename is a data migration.
 *
 * When adding an action, consider whether the 90-day default retention fits;
 * override it in {@link AUDIT_RETENTION_DAYS} below if not.
 */
// CONFIG
import { AUDIT_DATA } from '@/shared/config';

export const AUDIT_ACTIONS = {
	// Auth / users
	USER_UPDATE: 'user.update',
	USER_DELETE: 'user.delete',
	USER_ROLE_UPDATE: 'user.role.update',
	USER_BAN: 'user.ban',
	USER_UNBAN: 'user.unban',
	USER_SESSION_REVOKE: 'user.session.revoke',
	USER_SESSIONS_REVOKE_ALL: 'user.sessions.revoke_all',

	// Generic admin
	ADMIN_ACTION: 'admin.action',

	// Files
	FILE_UPLOAD: 'file.upload',
	FILE_DELETE: 'file.delete'
} as const;

/**
 * Per-action retention in days. Anything not listed falls back to
 * `AUDIT_RETENTION_DEFAULT_DAYS`. Set to `Infinity` to keep forever.
 *
 * Tune per project: noisy actions short, security-critical actions long.
 */
export const AUDIT_RETENTION_DEFAULT_DAYS = AUDIT_DATA.RETENTION_DEFAULT_DAYS;

export const AUDIT_RETENTION_DAYS: Partial<Record<AuditAction, number>> = {
	'user.role.update': 365 * 5,
	'user.delete': 365 * 5,
	'user.ban': 365 * 5,
	'user.unban': 365 * 5,
	'user.session.revoke': 365 * 5,
	'user.sessions.revoke_all': 365 * 5
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * `expiresAt` sentinel for keep-forever actions. A real number rather than an absent field
 * on purpose: Convex indexes a missing field as `undefined`, which sorts *before* every
 * number, so an omitted `expiresAt` would land inside `lte(now)` and be swept immediately.
 * Sorting after every real timestamp is what makes "never" mean never.
 */
export const AUDIT_NEVER_EXPIRES = Number.MAX_SAFE_INTEGER;

/**
 * Absolute expiry stamped onto each audit row at write time. This is what turns retention
 * from a per-run table scan into an index range read — see `crons/auditLogCron.ts`.
 *
 * Retention is resolved once, at write. Editing {@link AUDIT_RETENTION_DAYS} afterwards does
 * NOT move rows already written; run `backfillAuditExpiry({ recompute: true })` to re-stamp
 * them. That is the trade this design makes: O(deleted) sweeps in exchange for a backfill
 * whenever the config changes.
 */
export function auditExpiresAt(action: AuditAction, writtenAtMs: number): number {
	const days = AUDIT_RETENTION_DAYS[action] ?? AUDIT_RETENTION_DEFAULT_DAYS;
	return Number.isFinite(days) ? writtenAtMs + days * DAY_MS : AUDIT_NEVER_EXPIRES;
}

/**
 * Hand-written call sites should use {@link AUDIT_ACTIONS} members and get
 * autocomplete; factory-generated keys (e.g. `createDeleteMutation`'s default
 * `${table}.delete`) are accepted as raw strings via the `(string & {})` trick
 * — TS keeps the literal union for autocomplete while still accepting any string.
 */
export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS] | (string & {});
