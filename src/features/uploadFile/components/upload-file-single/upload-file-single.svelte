<script lang="ts">
	// COMPONENTS
	import UploadFileEmpty from '../upload-file-empty.svelte';
	import UploadFileSingleContent from './upload-file-single-content.svelte';

	// UTILS
	import { cn } from '@/utils/utils.js';
	import { useFileUpload } from '../../utils/useFileUpload.svelte';

	// TYPES
	import type { UploadImage } from '../../types/uploadFileTypes';

	type Props = {
		class?: string;
		/** A picked `File`, or a stored `{ key, url }` image on edit pages. */
		file?: UploadImage | null;
		/** Kept empty in single mode; bind for API symmetry with multiple. */
		files?: UploadImage[];
		accept?: string;
		disabled?: boolean;
		id?: string;
	};

	let {
		class: className,
		file = $bindable<UploadImage | null>(null),
		files = $bindable<UploadImage[]>([]),
		accept,
		disabled = false,
		id: inputId
	}: Props = $props();

	const pickerInputId = $derived(inputId ?? 'upload-file-input-single');

	const upload = useFileUpload({
		mode: 'single',
		getFile: () => file,
		setFile: (v) => {
			file = v;
		},
		getFiles: () => files,
		setFiles: (v) => {
			files = v;
		},
		getDisabled: () => disabled
	});
</script>

<div
	class={cn(
		'group/upload-file-single w-full max-w-md min-w-0',
		disabled && 'pointer-events-none opacity-50',
		className
	)}
	data-disabled={disabled ? 'true' : undefined}
>
	{#if upload.isEmpty}
		<UploadFileEmpty
			{pickerInputId}
			{accept}
			{disabled}
			multipleFiles={false}
			dragOver={upload.dragOver}
			bind:fileInputRef={upload.inputRef}
			onFileInputChange={upload.handleInputChange}
			onDragEnter={() => {
				if (!disabled) upload.dragOver = true;
			}}
			onDragLeave={() => {
				upload.dragOver = false;
			}}
			onDragOver={upload.handleDragOver}
			onDrop={upload.handleDrop}
		/>
	{:else}
		<UploadFileSingleContent
			rows={upload.contentRows}
			{pickerInputId}
			{accept}
			{disabled}
			bind:files
			bind:selectedFile={file}
			bind:fileInputRef={upload.inputRef}
			onFileInputChange={upload.handleInputChange}
			onDragOver={upload.handleDragOver}
			onDrop={upload.handleDrop}
		/>
	{/if}
</div>
