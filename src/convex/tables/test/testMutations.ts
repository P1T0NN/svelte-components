// LIBRARIES
import { v } from 'convex/values';

// CONFIG
import { mutation } from '../../_generated/server';

// HELPERS
import { ANALYTICS_EVENT, trackEvent } from '@/convex/analytics';

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
		source: v.union(v.literal('organic'), v.literal('referral'), v.literal('paid'), v.literal('support')),
		message: v.string(),
		acceptsTerms: v.boolean()
	},
	handler: async (ctx, args) => {
		const rowId = await ctx.db.insert('testRows', args);

		await trackEvent(ctx, {
			name: ANALYTICS_EVENT.FEATURE_USED,
			subject: {
				type: 'testRows',
				id: rowId
			},
			properties: {
				feature: 'test_row_created',
				surface: args.source
			},
			source: {
				type: 'server',
				name: 'createTestRow'
			}
		});

		return {
			success: true,
			message: 'GenericMessages.TEST_ROW_CREATED',
			data: { rowId }
		};
	}
});
