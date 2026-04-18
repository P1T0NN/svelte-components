// LIBRARIES
import type { MutationCtx } from './_generated/server';
import type { Id } from './_generated/dataModel';

// CONFIG
import { FEATURES } from './features';

/**
 * Audit log action types
 * Add your custom action types here
 */
export type AuditAction =
	| 'user.update'
	| 'user.delete'
	| 'admin.action'
	| (string & {}); // Allow custom strings while keeping autocomplete

/**
 * Log an audit event
 *
 * Only logs if FEATURES.AUDIT_LOGS is enabled in features.ts
 *
 * Usage in mutations:
 * ```ts
 * await logAudit(ctx, userId, 'user.update', {
 *   targetTable: 'users',
 *   targetId: targetUserId,
 *   metadata: { field: 'credits', oldValue: 100, newValue: 50 }
 * });
 * ```
 */
export async function logAudit(
	ctx: MutationCtx,
	userId: Id<'users'>,
	action: AuditAction,
	options?: {
		targetTable?: string;
		targetId?: string;
		metadata?: Record<string, unknown>;
	}
) {
	if (!FEATURES.AUDIT_LOGS) return;

	await ctx.db.insert('auditLogs', {
		userId,
		action,
		targetTable: options?.targetTable,
		targetId: options?.targetId,
		metadata: options?.metadata,
		timestamp: Date.now()
	});
}
