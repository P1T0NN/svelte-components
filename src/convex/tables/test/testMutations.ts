// LIBRARIES
import { v } from 'convex/values';

// CONFIG
import { mutation } from '../../_generated/server';

/**
 * Throwaway insert used to exercise the `<MutationForm>` component end-to-end.
 * Returns the standard `{ success, message }` envelope so the form's success/info
 * toast and reset-on-success branch both fire.
 */
export const createTestRow = mutation({
	args: {
		name: v.string(),
		email: v.string(),
		role: v.union(v.literal('admin'), v.literal('editor'), v.literal('viewer')),
		plan: v.union(v.literal('free'), v.literal('pro'), v.literal('enterprise')),
		message: v.string(),
		acceptsTerms: v.boolean()
	},
	handler: async (ctx, args) => {
		await ctx.db.insert('testRows', args);

		return {
			success: true,
			message: 'GenericMessages.TEST_ROW_CREATED'
		};
	}
});
