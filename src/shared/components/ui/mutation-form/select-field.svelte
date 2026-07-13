<script lang="ts">
	import { NativeSelect } from '@/shared/components/ui/select/index.js';
	import type { MutationFormFieldDef } from './types.js';

	let {
		field,
		inputId,
		value,
		setValue,
		invalid
	}: {
		field: MutationFormFieldDef;
		inputId: string;
		value: unknown;
		setValue: (next: unknown) => void;
		invalid: boolean;
	} = $props();

	const current = $derived(value as string | undefined);
</script>

<NativeSelect
	id={inputId}
	class="w-full"
	value={current ?? ''}
	onChange={(v) => setValue(v)}
	disabled={field.disabled}
	ariaInvalid={invalid}
	placeholder={field.selectPlaceholder ?? field.placeholder ?? 'Select...'}
	options={(field.options ?? []).map((o) => ({
		value: o.value,
		label: o.label,
		disabled: o.disabled
	}))}
/>
