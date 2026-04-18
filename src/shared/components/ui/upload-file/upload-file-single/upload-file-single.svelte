<script lang="ts">
	// COMPONENTS
	import UploadFileEmpty from '../upload-file-empty.svelte';
	import UploadFileSingleContent from './upload-file-single-content.svelte';

	// UTILS
	import { cn } from '@/shared/utils/utils.js';

	type Props = {
		class?: string;
		file?: File | null;
		/** Kept empty in single mode; bind for API symmetry with multiple. */
		files?: File[];
		accept?: string;
		disabled?: boolean;
		id?: string;
	};

	let {
		class: className,
		file = $bindable<File | null>(null),
		files = $bindable<File[]>([]),
		accept,
		disabled = false,
		id: inputId
	}: Props = $props();

	const pickerInputId = $derived(inputId ?? 'upload-file-input-single');

	let inputRef: HTMLInputElement | null = $state(null);
	let dragOver = $state(false);

	const isEmpty = $derived(file === null);
	const noSelection = $derived(file === null);

	function fileKey(f: File): string {
		return `${f.name}-${f.size}-${f.lastModified}`;
	}

	function previewKey(f: File, index: number): string {
		return `${fileKey(f)}#${index}`;
	}

	const displayList = $derived(file ? [file] : []);

	let previewUrls = $state<Record<string, string>>({});

	const contentRows = $derived(
		displayList.map((f, index) => ({
			file: f,
			index,
			previewUrl: previewUrls[previewKey(f, index)] ?? null
		}))
	);

	$effect(() => {
		const list = displayList;
		const next: Record<string, string> = {};
		list.forEach((f, index) => {
			if (f.type.startsWith('image/')) {
				next[previewKey(f, index)] = URL.createObjectURL(f);
			}
		});
		const revoke = next;
		previewUrls = next;
		return () => {
			for (const u of Object.values(revoke)) URL.revokeObjectURL(u);
		};
	});

	$effect(() => {
		if (noSelection && inputRef) inputRef.value = '';
	});

	function applyPickedList(list: FileList | null) {
		if (!list?.length) return;
		file = list[0];
		files = [];
		if (inputRef) inputRef.value = '';
	}

	function onInputChange(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		applyPickedList(input.files);
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		if (disabled) return;
		const dropped = e.dataTransfer?.files;
		if (!dropped?.length) return;
		file = dropped[0];
		files = [];
		if (inputRef) inputRef.value = '';
	}

	function onDragOver(e: DragEvent) {
		e.preventDefault();
		if (!disabled && e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
	}
</script>

<div
	class={cn(
		'group/upload-file-single w-full min-w-0 max-w-md',
		disabled && 'pointer-events-none opacity-50',
		className
	)}
	data-disabled={disabled ? 'true' : undefined}
>
	{#if isEmpty}
		<UploadFileEmpty
			{pickerInputId}
			{accept}
			{disabled}
			multipleFiles={false}
			dragOver={dragOver}
			bind:fileInputRef={inputRef}
			onFileInputChange={onInputChange}
			onDragEnter={() => {
				if (!disabled) dragOver = true;
			}}
			onDragLeave={() => {
				dragOver = false;
			}}
			{onDragOver}
			{onDrop}
		/>
	{:else}
		<UploadFileSingleContent
			rows={contentRows}
			{pickerInputId}
			{accept}
			{disabled}
			bind:files
			bind:selectedFile={file}
			bind:fileInputRef={inputRef}
			onFileInputChange={onInputChange}
			{onDragOver}
			{onDrop}
		/>
	{/if}
</div>
