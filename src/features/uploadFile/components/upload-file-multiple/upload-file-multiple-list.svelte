<script lang="ts">
	// COMPONENTS
	import UploadFileItemMultiple from './upload-file-item-multiple.svelte';

	// UTILS
	import { cn } from '@/utils/utils.js';

	// TYPES
	import type { UploadFileRow, UploadImage } from '@/features/uploadFile/types/uploadFileTypes';
	import { uploadImageKey } from '@/features/uploadFile/utils/uploadImageUtils';

	type Props = {
		rows: UploadFileRow[];
		files?: UploadImage[];
		selectedFile?: UploadImage | null;
		onDragOver?: (e: DragEvent) => void;
		onDrop?: (e: DragEvent) => void;
		hasCoverImage?: boolean;
		class?: string;
	};

	let {
		rows,
		files = $bindable<UploadImage[]>([]),
		selectedFile = $bindable<UploadImage | null>(null),
		onDragOver,
		onDrop,
		hasCoverImage = false,
		class: className
	}: Props = $props();
</script>

<!-- Input lives on `UploadFileEmpty`; this region only lists previews + accepts drops. -->
<div
	class={cn('grid grid-cols-2 gap-3 sm:grid-cols-3', className)}
	role="region"
	aria-label="Uploaded files. Drop more files here to add."
	aria-live="polite"
	ondragover={onDragOver}
	ondrop={onDrop}
>
	{#each rows as row (`${uploadImageKey(row.file)}#${row.index}`)}
		<UploadFileItemMultiple
			file={row.file}
			index={row.index}
			bind:files
			bind:selectedFile
			previewUrl={row.previewUrl}
			{hasCoverImage}
		/>
	{/each}
</div>
