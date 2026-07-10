// CONFIG
import { FEATURES } from '../projectSettings';

// TYPES
import type { MutationCtx } from '../_generated/server';
import type { Id } from '../_generated/dataModel';

export type ResolvedImage = { key: string; url: string };

/**
 * Resolves the ordered upload refs a MutationForm submits (R2 keys or
 * `uploadedFiles` row ids, per FEATURES.USE_R2) into `{ key, url }` pairs by
 * reading the cached `url` off the matching upload row. Embed the result on the
 * domain document — order is preserved, so `images[0]` stays the cover image and
 * reads never touch storage.
 *
 * Refs whose upload row has vanished (deleted between upload and submit) are
 * silently dropped rather than failing the whole write.
 */
export async function resolveUploadedImages(
	ctx: MutationCtx,
	refs: string[]
): Promise<ResolvedImage[]> {
	const resolved = await Promise.all(
		refs.map(async (ref) => {
			const row = FEATURES.USE_R2
				? await ctx.db
						.query('uploadedFilesR2')
						.withIndex('by_key', (q) => q.eq('key', ref))
						.unique()
				: await ctx.db.get(ref as Id<'uploadedFiles'>);
			return row ? { key: ref, url: row.url } : null;
		})
	);
	return resolved.filter((r) => r !== null);
}
