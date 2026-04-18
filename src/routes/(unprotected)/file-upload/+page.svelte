<script lang="ts">
	// LIBRARIES
	import { useConvexClient } from 'convex-svelte';

	// COMPONENTS
	import { toast } from 'svelte-sonner';
	import Section from '@/shared/components/ui/section/section.svelte';
	import UploadFileSingle from '@/shared/components/ui/upload-file/upload-file-single/upload-file-single.svelte';
	import UploadFileMultiple from '@/shared/components/ui/upload-file/upload-file-multiple/upload-file-multiple.svelte';
	import { Button } from '@/shared/components/ui/button/index.js';
	import UploadFileDropzone from '@/shared/components/ui/upload-file/upload-file-dropzone.svelte';
	import { Progress } from '@/shared/components/ui/progress/index.js';

	// HOOKS
	import { useProgress } from '@/shared/hooks/useProgress.svelte';

	// UTILS
	import { optimizeImages } from '@/shared/utils/optimizeImages';
	import { uploadFileToConvexStorage } from '@/shared/utils/convexHelpers';

	let multipleFiles = $state(true);

	let file = $state<File | null>(null);
	let files = $state<File[]>([]);

	let saving = $state(false);

	const convex = useConvexClient();
	const progress = useProgress();

	const hasSelection = $derived(multipleFiles ? files.length > 0 : file !== null);

	async function save() {
		const selected: File[] = multipleFiles ? [...files] : file ? [file] : [];
		if (!selected.length || saving) return;

		saving = true;
		progress.start();
		try {
			const n = selected.length;

			const optimizedImages = await optimizeImages(selected, undefined, progress.setOptimizeProgress);

			const uploadedFileIds = [];
			for (let j = 0; j < optimizedImages.length; j++) {
				const f = optimizedImages[j];
				const fileNum = j + 1;

				progress.beforeUploadFile(fileNum, n);
				uploadedFileIds.push(await uploadFileToConvexStorage(convex, f));
				progress.afterUploadFile(fileNum, n);
			}

			progress.markDone();

			toast.success(
				multipleFiles
					? `Saved ${uploadedFileIds.length} file(s) to storage`
					: `Saved: ${optimizedImages[0]?.name ?? 'file'}`
			);
		} finally {
			saving = false;
			progress.clear();
		}
	}
</script>

<Section yPadding="md" containerClass="flex flex-col items-start gap-8">
	<header class="flex max-w-2xl flex-col gap-1">
		<h1 class="text-2xl font-semibold tracking-tight">File upload</h1>
		<UploadFileDropzone {multipleFiles} />
	</header>

	<div class="flex w-full max-w-2xl flex-col gap-4">
		<label class="text-muted-foreground flex cursor-pointer items-center gap-2 text-sm">
			<input type="checkbox" bind:checked={multipleFiles} class="accent-primary" />
			Allow multiple files
		</label>

		<div class="flex w-full flex-col gap-6">
			{#if multipleFiles}
				<UploadFileMultiple bind:file bind:files id="upload-main" />
			{:else}
				<UploadFileSingle bind:file bind:files id="upload-main" />
			{/if}

			{#if saving}
				<div class="flex w-full flex-col gap-2">
					<Progress value={progress.percent} class="h-2" />
					<p class="text-muted-foreground text-xs tabular-nums">{progress.label}</p>
				</div>
			{/if}

			<Button type="button" class="w-full" disabled={!hasSelection || saving} onclick={save}>
				{saving ? 'Saving…' : 'Save'}
			</Button>
		</div>
	</div>
</Section>
