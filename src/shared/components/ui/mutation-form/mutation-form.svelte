<script lang="ts" generics="T extends Record<string, unknown>">
	// LIBRARIES
	import { useConvexClient } from 'convex-svelte';
	import { toast } from 'svelte-sonner';
	import { safeParse, type GenericSchema } from 'valibot';
	import { m } from '@/shared/lib/paraglide/messages.js';

	// COMPONENTS
	import { Button } from '@/shared/components/ui/button/index.js';
	import {
		FieldGroup,
		Field,
		FieldSet,
		FieldLegend,
		FieldLabel,
		FieldDescription,
		FieldError
	} from '@/shared/components/ui/field/index.js';
	import InputField from './input-field.svelte';
	import TextareaField from './textarea-field.svelte';
	import SelectField from './select-field.svelte';
	import CheckboxField from './checkbox-field.svelte';
	import RadioGroupField from './radio-group-field.svelte';

	// UTILS
	import { safeMutation } from '@/shared/utils/convexHelpers';
	import { translateFromBackend } from '@/shared/utils/translateFromBackend';
	import { valibotIssuesToFieldErrors } from '@/shared/utils/validationUtils.js';

	// TYPES
	import type { Snippet } from 'svelte';
	import type { FunctionReference } from 'convex/server';
	import type {
		MutationFormCustomFields,
		MutationFormFieldDef,
		MutationFormFieldErrors
	} from './types.js';

	let {
		fields,
		values = $bindable(),
		initialValues,
		runFunction,
		schema,
		beforeSubmit,
		onSuccess,
		submitLabel = 'Submit',
		resetOnSuccess = true,
		customFields,
		header,
		footer,
		actions,
		class: className
	}: {
		fields: MutationFormFieldDef[];
		values: T;
		/** Snapshot used to reset the form after a successful run. Defaults to the initial `values`. */
		initialValues?: T;
		/**
		 * Convex mutation reference (e.g. `api.clients.addClient`). Called with the current `values`
		 * via `safeMutation`, which already toasts typed/rate-limit errors. Expected return shape:
		 * `{ success, message }` — toasted on success/info, success also clears the form.
		 */
		runFunction: FunctionReference<'mutation'>;
		/**
		 * Valibot schema validated on submit via `safeParse`. Issues are mapped to `fieldErrors`
		 * by top-level path key (`valibotIssuesToFieldErrors`). A failing parse short-circuits submit.
		 */
		schema: GenericSchema<T>;
		/**
		 * Runs after validation, before the mutation. Use for side effects that must succeed first
		 * (e.g. file uploads). Return an object to merge extra args into the mutation payload, or
		 * `false` to abort silently. Throw to abort — the error is toasted. `busy` stays true throughout.
		 */
		beforeSubmit?: (values: T) => Promise<Partial<T> | void | false> | Partial<T> | void | false;
		onSuccess?: (values: T) => void;
		submitLabel?: string;
		resetOnSuccess?: boolean;
		customFields?: MutationFormCustomFields<T>;
		header?: Snippet;
		footer?: Snippet;
		actions?: Snippet<[{ busy: boolean }]>;
		class?: string;
	} = $props();

	const convex = useConvexClient();
	const id = $props.id();

	/** Captured once at mount; resets after a successful submit restore these values. */
	// svelte-ignore state_referenced_locally
	const resetSnapshot: T = $state.snapshot(initialValues ?? values) as T;

	let fieldErrors = $state<MutationFormFieldErrors<T>>({});
	let busy = $state(false);

	function getValue(key: string): unknown {
		return (values as Record<string, unknown>)[key];
	}

	function setValue(key: string, next: unknown) {
		(values as Record<string, unknown>)[key] = next;
		if (key in fieldErrors) {
			const next = { ...fieldErrors };
			delete next[key as keyof T & string];
			fieldErrors = next;
		}
	}

	async function onsubmit(event: SubmitEvent) {
		event.preventDefault();

		const validation = safeParse(schema, $state.snapshot(values));
		if (!validation.success) {
			fieldErrors = valibotIssuesToFieldErrors<keyof T & string>(validation.issues);
			toast.error(m["GenericMessages.YOU_NEED_TO_CORRECT_FORM_ERRORS"]());
			return;
		}
		fieldErrors = {};

		busy = true;

		try {
			let extraArgs: Partial<T> | void | false = undefined;
			if (beforeSubmit) {
				try {
					extraArgs = await beforeSubmit($state.snapshot(values) as T);
				} catch (err) {
					toast.error(err instanceof Error ? err.message : String(err));
					return;
				}
				if (extraArgs === false) return;
			}

			const args = { ...($state.snapshot(values) as T), ...(extraArgs ?? {}) };

			// Field config drives args; the concrete mutation defines the exact arg shape.
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const result = await safeMutation(convex, runFunction, args as any);
			if (!result) return; // typed error / rate limit — already toasted by safeMutation

			if (!result.success) {
				toast.error(translateFromBackend(result.message));
				return;
			}

			toast.success(translateFromBackend(result.message));
			onSuccess?.($state.snapshot(values) as T);
			if (resetOnSuccess) values = structuredClone(resetSnapshot);
		} finally {
			busy = false;
		}
	}
</script>

<form {onsubmit} class={className}>
	<FieldGroup>
		{@render header?.()}

		{#each fields as field (field.id)}
			{@const inputId = `${field.id}-${id}`}
			{@const err = fieldErrors[field.id as keyof T & string]}
			{@const custom = customFields?.[field.id]}

			{#if field.kind === 'checkbox' && !custom}
				<Field orientation="horizontal" class={field.fieldClass}>
					<CheckboxField
						{field}
						{inputId}
						value={getValue(field.id)}
						setValue={(v) => setValue(field.id, v)}
						invalid={!!err}
					/>
					<FieldLabel for={inputId}>{field.label}</FieldLabel>

					{#if err}
						<FieldError>{err}</FieldError>
					{:else if field.description}
						<FieldDescription>{field.description}</FieldDescription>
					{/if}
				</Field>
			{:else if field.kind === 'radio' && !custom}
				<FieldSet class={field.fieldClass}>
					<FieldLegend variant="label">{field.label}</FieldLegend>
					<RadioGroupField
						{field}
						{inputId}
						value={getValue(field.id)}
						setValue={(v) => setValue(field.id, v)}
						invalid={!!err}
					/>
					{#if err}
						<FieldError>{err}</FieldError>
					{:else if field.description}
						<FieldDescription>{field.description}</FieldDescription>
					{/if}
				</FieldSet>
			{:else}
				<Field class={field.fieldClass}>
					<FieldLabel for={inputId}>{field.label}</FieldLabel>

					{#if custom}
						{@render custom({
							field,
							value: getValue(field.id) as T[keyof T],
							setValue: (next) => setValue(field.id, next),
							error: err,
							inputId
						})}
					{:else if field.kind === 'textarea'}
						<TextareaField
							{field}
							{inputId}
							value={getValue(field.id)}
							setValue={(v) => setValue(field.id, v)}
							invalid={!!err}
						/>
					{:else if field.kind === 'select'}
						<SelectField
							{field}
							{inputId}
							value={getValue(field.id)}
							setValue={(v) => setValue(field.id, v)}
							invalid={!!err}
						/>
					{:else}
						<InputField
							{field}
							{inputId}
							value={getValue(field.id)}
							setValue={(v) => setValue(field.id, v)}
							invalid={!!err}
						/>
					{/if}

					{#if err}
						<FieldError>{err}</FieldError>
					{:else if field.description}
						<FieldDescription>{field.description}</FieldDescription>
					{/if}
				</Field>
			{/if}
		{/each}

		{@render footer?.()}

		{#if actions}
			{@render actions({ busy })}
		{:else}
			<Field>
				<Button type="submit" class="w-full" disabled={busy}>{submitLabel}</Button>
			</Field>
		{/if}
	</FieldGroup>
</form>
