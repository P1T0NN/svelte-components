// LIBRARIES
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// TABLES
import { auditLogTable } from './tables/auditLog/schemas/auditLogSchema';

const schema = defineSchema({
	// Users (with `role` and other custom fields) live in the better-auth component;
	// access via `authComponent.getAuthUser(ctx)`. Foreign-key columns below store the
	// better-auth user id as a plain string.

	// Audit logs — toggle population via FEATURES.AUDIT_LOGS in projectSettings.ts.
	// The table itself is always declared so flipping the flag needs no migration.
	auditLogs: auditLogTable,

	/** Convex file storage reference + resolved download URL. Owner-stamped at upload. */
	uploadedFiles: defineTable({
		ownerId: v.string(),
		storageId: v.id('_storage'),
		url: v.string()
	})
		.index('by_storage_id', ['storageId'])
		.index('by_owner', ['ownerId']),

	/** Cloudflare R2 file reference + cached download URL. Owner-stamped at upload. */
	uploadedFilesR2: defineTable({
		ownerId: v.string(),
		key: v.string(),
		url: v.string()
	})
		.index('by_key', ['key'])
		.index('by_owner', ['ownerId']),

	/** Throwaway table for exercising the MutationForm + DataTable components end-to-end. */
	testRows: defineTable({
		name: v.string(),
		email: v.string(),
		role: v.union(v.literal('admin'), v.literal('editor'), v.literal('viewer')),
		plan: v.union(v.literal('free'), v.literal('pro'), v.literal('enterprise')),
		message: v.string(),
		acceptsTerms: v.boolean()
	})
		// Full-text search on `name`. `filterFields` lets the search builder narrow by
		// `role` / `plan` later (eq-while-searching) without needing a second index.
		.searchIndex('search_name', {
			searchField: 'name',
			filterFields: ['role', 'plan']
		})
		// Indexed sort by `name` (used when the user clicks the Name column header in
		// non-search mode). Convex pairs each named index with `_creationTime` implicitly
		// for tiebreakers; that's fine here.
		.index('by_name', ['name'])
});

export default schema;
