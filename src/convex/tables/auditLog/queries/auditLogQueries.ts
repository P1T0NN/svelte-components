// LIBRARIES
import { v } from 'convex/values';
import { paginationOptsValidator } from 'convex/server';

// UTILS
import { query } from '@/convex/_generated/server';
import { requireAdmin } from '@/convex/auth/middleware/authMiddleware';

/**
 * Paginated list for the admin audit-log viewer. Admin-only — audit data is
 * sensitive by definition. Newest entries first via `.order('desc')` over the
 * implicit `_creationTime` ordering on whichever index we pick.
 *
 * Filters are mutually exclusive — pick at most one of `userId` / `action` /
 * `resource`. Convex doesn't compose multiple `withIndex` filters in one read,
 * and combining them in-memory after pagination would break ordering.
 */
export const listAuditLogs = query({
	args: {
		paginationOpts: paginationOptsValidator,
		userId: v.optional(v.string()),
		action: v.optional(v.string()),
		resource: v.optional(v.object({ table: v.string(), id: v.string() }))
	},
	handler: async (ctx, args) => {
		await requireAdmin(ctx);

		const base = ctx.db.query('auditLogs');

		const filtered = args.userId
			? base.withIndex('by_user', (q) => q.eq('userId', args.userId))
			: args.action
				? base.withIndex('by_action', (q) => q.eq('action', args.action!))
				: args.resource
					? base.withIndex('by_resource', (q) =>
							q
								.eq('resource.table', args.resource!.table)
								.eq('resource.id', args.resource!.id)
						)
					: base;

		return await filtered.order('desc').paginate(args.paginationOpts);
	}
});
