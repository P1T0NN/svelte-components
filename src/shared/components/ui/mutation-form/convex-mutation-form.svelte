<script lang="ts" generics="T extends Record<string, unknown>">
	// LIBRARIES
	import { useConvexClient } from 'convex-svelte';
	import { toast } from 'svelte-sonner';
	import type { GenericSchema } from 'valibot';

	// CONFIG
	import { FEATURES } from '@/convex/projectSettings';

	// COMPONENTS
	import MutationForm from './mutation-form.svelte';

	// UTILS
	import {
		safeMutation,
		uploadFileToConvexStorage,
		uploadFileToR2
	} from '@/shared/utils/convexHelpers';
	import { translateFromBackend } from '@/shared/utils/translateFromBackend';
	import { processUploadFields } from './utils.js';

	// TYPES
	import type { Snippet } from 'svelte';
	import type { FunctionReference } from 'convex/server';
	import type {
		MutationFormCustomFields,
		MutationFormFieldDef,
		MutationFormPrepareSubmit,
		MutationFormSection,
		MutationFormSubmitHandler
	} from './types.js';

	type BackendMessage = Parameters<typeof translateFromBackend>[0];
	type MutationEnvelope = { success: boolean; message: BackendMessage };
	type ConvexFormMutation = FunctionReference<
		'mutation',
		'public',
		Record<string, unknown>,
		unknown
	>;

	let {
		fields,
		sections,
		values = $bindable(),
		initialValues,
		runFunction,
		schema,
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
		runFunction: ConvexFormMutation;
		schema: GenericSchema<T>;
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

	function hasMutationEnvelope(value: unknown): value is MutationEnvelope {
		return (
			typeof value === 'object' &&
			value !== null &&
			'success' in value &&
			'message' in value &&
			typeof (value as { success: unknown }).success === 'boolean'
		);
	}

	const prepareUploads: MutationFormPrepareSubmit<T> = async ({ sections, args, progress }) => {
		return await processUploadFields({
			sections,
			args,
			progress,
			uploadOne: (file) =>
				FEATURES.USE_R2
					? uploadFileToR2(convex, file)
					: uploadFileToConvexStorage(convex, file)
		});
	};

	const submitMutation: MutationFormSubmitHandler<T> = async (args) => {
		const result = await safeMutation(convex, runFunction, args);
		if (!result) return false;
		if (!hasMutationEnvelope(result)) return true;

		if (!result.success) {
			toast.error(translateFromBackend(result.message));
			return false;
		}

		toast.success(translateFromBackend(result.message));
		return true;
	};
</script>

<MutationForm
	{fields}
	{sections}
	bind:values
	{initialValues}
	onSubmit={submitMutation}
	prepareSubmit={prepareUploads}
	{schema}
	{onSuccess}
	{submitLabel}
	{resetOnSuccess}
	{customFields}
	{header}
	{extraFields}
	{actions}
	class={className}
/>
