// LIBRARIES
import { defineSchema, defineTable } from 'convex/server';
import { authTables } from '@convex-dev/auth/server';
import { v } from 'convex/values';

const schema = defineSchema({
	...authTables,
	users: defineTable({
		// Auth fields from @convex-dev/auth
		email: v.optional(v.string()),
		emailVerificationTime: v.optional(v.number()),
		image: v.optional(v.string()),
		isAnonymous: v.optional(v.boolean()),
		name: v.optional(v.string()),
		phone: v.optional(v.string()),
		phoneVerificationTime: v.optional(v.number()),

		// Custom fields
		role: v.union(v.literal('admin'), v.literal('user')),
		credits: v.number()
	}).index('email', ['email']),

	// Audit logs table (enable via FEATURES.AUDIT_LOGS in features.ts)
	auditLogs: defineTable({
		userId: v.id('users'),
		action: v.string(),
		targetTable: v.optional(v.string()),
		targetId: v.optional(v.string()),
		metadata: v.optional(v.any()),
		timestamp: v.number()
	})
		.index('by_user', ['userId'])
		.index('by_action', ['action'])
		.index('by_timestamp', ['timestamp']),

	/** Convex file storage reference + resolved download URL. */
	uploadedFiles: defineTable({
		storageId: v.id('_storage'),
		url: v.string()
	}).index('by_storage_id', ['storageId'])
});

export default schema;
