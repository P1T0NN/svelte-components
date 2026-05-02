<script lang="ts">
	// SVELTEKIT IMPORTS
	import { SvelteSet } from 'svelte/reactivity';

	// COMPONENTS
	import UploadFileEmpty from '../upload-file-empty.svelte';
	import UploadFileMultipleList from './upload-file-multiple-list.svelte';

	// UTILS
	import { cn } from '@/shared/utils/utils.js';

	type Props = {
		class?: string;
		/** Cleared in multi mode; kept bindable for parity with single. */
		file?: File | null;
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

	const pickerInputId = $derived(inputId ?? 'upload-file-input-multiple');

	let inputRef: HTMLInputElement | null = $state(null);
	let dragOver = $state(false);

	const noSelection = $derived(files.length === 0);

	function fileKey(f: File): string {
		return `${f.name}-${f.size}-${f.lastModified}`;
	}

	function mergeUnique(existing: File[], incoming: File[]): File[] {
		const seen = new SvelteSet(existing.map(fileKey));
		const next = [...existing];

		for (const f of incoming) {
			const k = fileKey(f);
			if (seen.has(k)) continue;
			seen.add(k);
			next.push(f);
		}
		return next;
	}

	function previewKey(f: File, index: number): string {
		return `${fileKey(f)}#${index}`;
	}

	const displayList = $derived(files);

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
		files = mergeUnique(files, Array.from(list));
		file = null;
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
		files = mergeUnique(files, Array.from(dropped));
		file = null;
		if (inputRef) inputRef.value = '';
	}

	function onDragOver(e: DragEvent) {
		e.preventDefault();
		if (!disabled && e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
	}
</script>

<div
	class={cn(
		'group/upload-file-multiple w-full min-w-0 max-w-2xl',
		disabled && 'pointer-events-none opacity-50',
		className
	)}
	data-disabled={disabled ? 'true' : undefined}
>
	<div class="flex flex-col gap-4">
		<UploadFileEmpty
			{pickerInputId}
			{accept}
			{disabled}
			multipleFiles={true}
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
		
		{#if files.length > 0}
			<UploadFileMultipleList
				rows={contentRows}
				bind:files
				bind:selectedFile={file}
				{onDragOver}
				{onDrop}
			/>
		{/if}
	</div>
</div>
