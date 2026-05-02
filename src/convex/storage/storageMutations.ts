// LIBRARIES
import { ConvexError, v } from 'convex/values';
import { mutation } from '../_generated/server';

// HELPERS
import { resolveUploadAuth } from './helpers/resolveUploadAuth.js';

// AGGREGATES
import { uploadedFilesTableAggregate } from './aggregate/uploadedFilesAggregate.js';

// TYPES
import type { ConvexErrorPayload } from '../types/convexTypes.js';
import type { UploadAuthMode } from './helpers/resolveUploadAuth.js';

/** Change this one line when copying this file into a new project. */
const TABLE = 'uploadedFiles' as const;

/**
 * Who can call the upload endpoints in this file.
 *
 * - `'userId'` (default) — signed-in users only; `ownerId` is stamped on the row.
 * - `'admin'`            — only admins.
 * - `'insecure'`         — anyone, including anonymous visitors. Rows get no `ownerId`
 *                          and can only be deleted by admins.
 *
 * Flip this single constant to change behaviour for both `generateUploadUrl` and
 * `saveUploadedFile` at once — keeping the URL-gen and the row-save in lockstep is what
 * makes the two-step upload flow sensible. Per-endpoint divergence is almost always a bug.
 */
const UPLOAD_AUTH_MODE: UploadAuthMode = 'userId';

/** Short-lived POST URL; response JSON includes `storageId`. Auth enforced per {@link UPLOAD_AUTH_MODE}. */
export const generateUploadUrl = mutation({
	args: {},
	handler: async (ctx) => {
		await resolveUploadAuth(ctx, UPLOAD_AUTH_MODE);
		return await ctx.storage.generateUploadUrl();
	}
});

/**
 * Persist a file row after upload.
 *
 * When the mode resolves a non-null `userId`, we stamp it as `ownerId` so the row can
 * later be deleted through the owner path in {@link createDeleteMutation}. In `'insecure'`
 * mode with an anonymous caller, `ownerId` is left unset.
 */
export const saveUploadedFile = mutation({
	args: {
		storageId: v.id('_storage')
	},
	handler: async (ctx, args) => {
		const userId = await resolveUploadAuth(ctx, UPLOAD_AUTH_MODE);

		const url = await ctx.storage.getUrl(args.storageId);
		if (!url) {
			throw new ConvexError({
				code: 'STORAGE_URL_UNAVAILABLE',
				message: { key: 'GenericMessages.STORAGE_URL_UNAVAILABLE' }
			} satisfies ConvexErrorPayload);
		}

		const id = await ctx.db.insert(TABLE, {
			...(userId ? { ownerId: userId } : {}),
			storageId: args.storageId,
			url
		});
		const doc = await ctx.db.get(id);
		if (!doc) {
			// Exotic race — log server-side so we notice, surface a translatable message.
			console.error('[saveUploadedFile] inserted row missing on immediate re-read', {
				id,
				storageId: args.storageId
			});
			throw new ConvexError({
				code: 'UPLOAD_SAVE_FAILED',
				message: { key: 'GenericMessages.UPLOAD_SAVE_FAILED' }
			} satisfies ConvexErrorPayload);
		}

		await uploadedFilesTableAggregate.insert(ctx, doc);
		return id;
	}
});
