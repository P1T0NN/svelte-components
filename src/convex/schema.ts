// LIBRARIES
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const schema = defineSchema({
	// Users (with `role` and other custom fields) live in the better-auth component;
	// access via `authComponent.getAuthUser(ctx)`. Foreign-key columns below store the
	// better-auth user id as a plain string.

	// Audit logs table (enable via FEATURES.AUDIT_LOGS in features.ts)
	auditLogs: defineTable({
		userId: v.string(),
		action: v.string(),
		targetTable: v.optional(v.string()),
		targetId: v.optional(v.string()),
		metadata: v.optional(v.any()),
		timestamp: v.number()
	})
		.index('by_user', ['userId'])
		.index('by_action', ['action'])
		.index('by_timestamp', ['timestamp']),

	/** Convex file storage reference + resolved download URL. Owner-stamped at upload. */
	uploadedFiles: defineTable({
		ownerId: v.string(),
		storageId: v.id('_storage'),
		url: v.string()
	})
		.index('by_storage_id', ['storageId'])
		.index('by_owner', ['ownerId'])
});

export default schema;
