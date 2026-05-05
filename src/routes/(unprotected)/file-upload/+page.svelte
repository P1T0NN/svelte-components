<script lang="ts">
	// COMPONENTS
	import Section from '@/shared/components/ui/section/section.svelte';
	import UploadFileSingle from '@/features/uploadFile/components/upload-file-single/upload-file-single.svelte';
	import UploadFileMultiple from '@/features/uploadFile/components/upload-file-multiple/upload-file-multiple.svelte';
	import UploadFileDropzone from '@/features/uploadFile/components/upload-file-dropzone.svelte';
	import SaveUploadedFile from '@/features/uploadFile/components/save-uploaded-file.svelte';

	let multipleFiles = $state(true);

	let file = $state<File | null>(null);
	let files = $state<File[]>([]);
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

			<SaveUploadedFile {file} {files} {multipleFiles} />
		</div>
	</div>
</Section>
