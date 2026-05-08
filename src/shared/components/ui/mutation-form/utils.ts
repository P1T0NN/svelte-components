// CONFIG
import { FEATURES } from '@/convex/features';

// COMPONENTS
import { toast } from 'svelte-sonner';

// UTILS
import { uploadFileToR2, uploadFileToConvexStorage } from '@/shared/utils/convexHelpers';
import { optimizeImages } from '@/features/uploadFile/utils/optimizeImages';
import { useProgress } from '@/features/uploadFile/utils/useProgress.svelte';

// TYPES
import type { MutationFormSection } from './types.js';
import type { ConvexClient } from 'convex/browser';

type ProgressApi = ReturnType<typeof useProgress>;

/**
 * Walks `sections`, finds upload-single / upload-multiple fields, optimizes and uploads
 * their Files, and replaces each entry in `args` with the resulting storage id(s).
 * Returns `false` if the submission should abort (errors are toasted internally).
 */
export async function processUploadFields(params: {
	convex: ConvexClient;
	sections: MutationFormSection[];
	args: Record<string, unknown>;
	progress: ProgressApi;
}): Promise<boolean> {
	const { convex, sections, args, progress } = params;
	const uploadOne = FEATURES.USE_R2 ? uploadFileToR2 : uploadFileToConvexStorage;

	for (const section of sections) {
		for (const f of section.fields) {
			if (f.kind !== 'upload-single' && f.kind !== 'upload-multiple') continue;

			const isSingle = f.kind === 'upload-single';
			const raw = args[f.id];
			const selected: File[] = isSingle
				? raw
					? [raw as File]
					: []
				: ((raw as File[] | undefined) ?? []);

			if (!selected.length) {
				args[f.id] = isSingle ? null : [];
				continue;
			}

			try {
				const optimized = await optimizeImages(selected, undefined, progress.setOptimizeProgress);

				const uploaded: string[] = [];
				const n = optimized.length;
				for (let j = 0; j < n; j++) {
					progress.beforeUploadFile(j + 1, n);
					const result = await uploadOne(convex, optimized[j]);
					progress.afterUploadFile(j + 1, n);
					if (!result) return false;
					uploaded.push(result);
				}

				args[f.id] = isSingle ? (uploaded[0] ?? null) : uploaded;
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
