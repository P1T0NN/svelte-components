// LIBRARIES
import { mutation } from '../_generated/server';
import { v } from 'convex/values';

import { uploadedFilesTableAggregate } from '../tables/uploadedFiles/uploadedFilesAggregate.js';

/** Short-lived POST URL; response JSON includes `storageId`. */
export const generateUploadUrl = mutation({
	args: {},
	handler: async (ctx) => {
		return await ctx.storage.generateUploadUrl();
	}
});

/**
 * Persist a file row after upload: resolves the public URL from `storageId`.
 */
export const saveUploadedFile = mutation({
	args: {
		storageId: v.id('_storage')
	},
	handler: async (ctx, args) => {
		const url = await ctx.storage.getUrl(args.storageId);

		if (!url) {
			throw new Error('Could not resolve URL for storage id');
		}

		const id = await ctx.db.insert('uploadedFiles', {
			storageId: args.storageId,
			url
		});
		const doc = await ctx.db.get(id);
		if (!doc) {
			throw new Error('Inserted uploadedFiles row missing');
		}
		await uploadedFilesTableAggregate.insert(ctx, doc);
		return id;
	}
});
