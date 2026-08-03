// COMPONENTS
import { toast } from 'svelte-sonner';

// UTILS
import { optimizeImages } from '@/features/uploadFile/utils/optimizeImages';
import { isExistingUploadImage } from '@/features/uploadFile/utils/uploadImageUtils';

// TYPES
import type { UploadImage } from '@/features/uploadFile/types/uploadFileTypes';
import type { MutationFormProgress, MutationFormSection } from './types.js';

export type MutationFormUploadOne = (file: File) => Promise<string | null>;

/**
 * Walks `sections`, finds upload-single / upload-multiple fields, and replaces each entry
 * in `args` with an ordered list of refs the server's `resolveUploadedImages` accepts:
 *
 * - fresh `File`s → optimized, uploaded, replaced by the new storage ref;
 * - existing `{ key, url }` images (edit pages seed these from the stored document) →
 *   their `key` passes straight through, NOTHING is re-optimized or re-uploaded.
 *
 * Array order is preserved across the mix, so the cover stays index 0 however the user
 * reordered, removed, or appended. An edit form saved untouched submits exactly the stored
 * keys — a no-op for storage. Returns `false` if the submission should abort (errors are
 * toasted internally).
 */
export async function processUploadFields(params: {
	sections: MutationFormSection[];
	args: Record<string, unknown>;
	progress: MutationFormProgress;
	uploadOne: MutationFormUploadOne;
}): Promise<boolean> {
	const { sections, args, progress, uploadOne } = params;

	for (const section of sections) {
		for (const f of section.fields) {
			if (f.kind !== 'upload-single' && f.kind !== 'upload-multiple') continue;

			const isSingle = f.kind === 'upload-single';
			const raw = args[f.id];
			const selected: UploadImage[] = isSingle
				? raw
					? [raw as UploadImage]
					: []
				: ((raw as UploadImage[] | undefined) ?? []);

			if (!selected.length) {
				args[f.id] = isSingle ? null : [];
				continue;
			}

			try {
				// Optimize ONLY the fresh Files; existing images are already stored.
				const freshFiles = selected.filter((entry): entry is File => entry instanceof File);
				const optimized = freshFiles.length
					? await optimizeImages(freshFiles, undefined, progress.setOptimizeProgress)
					: [];

				// Rebuild the field value in the user's order: existing → key, File → new ref.
				const refs: string[] = [];
				let fileCursor = 0;
				const n = optimized.length;
				for (const entry of selected) {
					if (isExistingUploadImage(entry)) {
						refs.push(entry.key);
						continue;
					}
					const j = fileCursor++;
					progress.beforeUploadFile(j + 1, n);
					const result = await uploadOne(optimized[j]);
					progress.afterUploadFile(j + 1, n);
					if (!result) return false;
					refs.push(result);
				}

				args[f.id] = isSingle ? (refs[0] ?? null) : refs;
			} catch (err) {
				toast.error(err instanceof Error ? err.message : String(err));
				return false;
			}
		}
	}

	return true;
}

export function hasUploadFields(sections: MutationFormSection[]): boolean {
	return sections.some((s) =>
		s.fields.some((f) => f.kind === 'upload-single' || f.kind === 'upload-multiple')
	);
}
