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
		.index('by_owner', ['ownerId']),

	/** Cloudflare R2 file reference + cached download URL. Owner-stamped at upload. */
	uploadedFilesR2: defineTable({
		ownerId: v.string(),
		key: v.string(),
		url: v.string()
	})
		.index('by_key', ['key'])
		.index('by_owner', ['ownerId']),

	/** Throwaway table for exercising the MutationForm component end-to-end. */
	testRows: defineTable({
		name: v.string(),
		email: v.string(),
		role: v.union(v.literal('admin'), v.literal('editor'), v.literal('viewer')),
		message: v.string()
	})
});

export default schema;
