<script lang="ts" generics="T extends Record<string, unknown>">
	// LIBRARIES
	import { useConvexClient } from 'convex-svelte';
	import { toast } from 'svelte-sonner';
	import { safeParse, type GenericSchema } from 'valibot';
	import { m } from '@/shared/lib/paraglide/messages.js';

	// COMPONENTS
	import { Button } from '@/shared/components/ui/button/index.js';
	import {
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent
	} from '@/shared/components/ui/card/index.js';
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
	import { cn } from '@/shared/utils/utils.js';
	import { safeMutation } from '@/shared/utils/convexHelpers';
	import { translateFromBackend } from '@/shared/utils/translateFromBackend';
	import { valibotIssuesToFieldErrors } from '@/shared/utils/validationUtils.js';

	// TYPES
	import type { Snippet } from 'svelte';
	import type { FunctionReference } from 'convex/server';
	import type {
		MutationFormCustomFields,
		MutationFormFieldDef,
		MutationFormFieldErrors,
		MutationFormSection
	} from './types.js';

	let {
		fields,
		sections,
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
		extraFields,
		actions,
		class: className
	}: {
		/** Flat field list. Renders as a single plain section. Mutually exclusive with `sections`. */
		fields?: MutationFormFieldDef[];
		/** Grouped sections, each rendered as a Card with a 2-col grid by default. */
		sections?: MutationFormSection[];
		values: T;
		initialValues?: T;
		runFunction: FunctionReference<'mutation'>;
		schema: GenericSchema<T>;
		beforeSubmit?: (values: T) => Promise<Partial<T> | void | false> | Partial<T> | void | false;
		onSuccess?: (values: T) => void;
		submitLabel?: string;
		resetOnSuccess?: boolean;
		customFields?: MutationFormCustomFields<T>;
		header?: Snippet;
		extraFields?: Snippet;
		actions?: Snippet<[{ busy: boolean }]>;
		class?: string;
	} = $props();

	const convex = useConvexClient();
	const id = $props.id();

	// svelte-ignore state_referenced_locally
	const resetSnapshot: T = $state.snapshot(initialValues ?? values) as T;

	let fieldErrors = $state<MutationFormFieldErrors<T>>({});
	let busy = $state(false);

	const resolvedSections = $derived<MutationFormSection[]>(
		sections ?? (fields ? [{ fields, plain: true }] : [])
	);

	function getValue(key: string): unknown {
		return (values as Record<string, unknown>)[key];
	}

	function setValue(key: string, next: unknown) {
		(values as Record<string, unknown>)[key] = next;
		if (key in fieldErrors) {
			const copy = { ...fieldErrors };
			delete copy[key as keyof T & string];
			fieldErrors = copy;
		}
	}

	function spanClass(field: MutationFormFieldDef, columns: 1 | 2) {
		if (columns === 1) return '';
		return (field.colSpan ?? 2) === 1 ? 'sm:col-span-1' : 'sm:col-span-2';
	}

	async function onsubmit(event: SubmitEvent) {
		event.preventDefault();

		const validation = safeParse(schema, $state.snapshot(values));
		if (!validation.success) {
			fieldErrors = valibotIssuesToFieldErrors<keyof T & string>(validation.issues);
			toast.error(m['GenericMessages.YOU_NEED_TO_CORRECT_FORM_ERRORS']());
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

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const result = await safeMutation(convex, runFunction, args as any);
			if (!result) return;

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

{#snippet renderField(field: MutationFormFieldDef)}
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
{/snippet}

{#snippet renderGrid(section: MutationFormSection)}
	{@const columns = section.columns ?? 2}
	<div
		class={cn(
			'grid gap-4',
			columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
		)}
	>
		{#each section.fields as field (field.id)}
			<div class={spanClass(field, columns)}>
				{@render renderField(field)}
			</div>
		{/each}
	</div>
{/snippet}

<form {onsubmit} class={cn('flex flex-col gap-6', className)}>
	{@render header?.()}

	{#each resolvedSections as section, i (section.id ?? i)}
		{#if section.plain}
			<FieldGroup class={section.class}>
				{#if section.title}
					<FieldSet>
						<FieldLegend>{section.title}</FieldLegend>
						{#if section.description}
							<FieldDescription>{section.description}</FieldDescription>
						{/if}
					</FieldSet>
				{/if}
				{@render renderGrid(section)}
			</FieldGroup>
		{:else}
			<Card class={section.class}>
				{#if section.title || section.description}
					<CardHeader>
						{#if section.title}
							<CardTitle>{section.title}</CardTitle>
						{/if}
						{#if section.description}
							<CardDescription>{section.description}</CardDescription>
						{/if}
					</CardHeader>
				{/if}
				<CardContent>
					{@render renderGrid(section)}
				</CardContent>
			</Card>
		{/if}
	{/each}

	{@render extraFields?.()}

	{#if actions}
		{@render actions({ busy })}
	{:else}
		<Button type="submit" class="w-full" disabled={busy}>{submitLabel}</Button>
	{/if}
</form>
