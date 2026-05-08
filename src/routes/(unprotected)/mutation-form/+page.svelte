<script lang="ts">
	// LIBRARIES
	import {
		boolean,
		check,
		email,
		minLength,
		object,
		picklist,
		pipe,
		string,
		trim
	} from 'valibot';
	import { api } from '@/convex/_generated/api';

	// COMPONENTS
	import Section from '@/shared/components/ui/section/section.svelte';
	import MutationForm from '@/shared/components/ui/mutation-form/mutation-form.svelte';

	// TYPES
	import type { InferOutput } from 'valibot';
	import type { MutationFormSection } from '@/shared/components/ui/mutation-form/types.js';

	const contactFormSchema = object({
		name: pipe(string(), trim(), minLength(1, 'Name is required.')),
		email: pipe(
			string(),
			trim(),
			minLength(1, 'Email is required.'),
			email('Enter a valid email.')
		),
		role: picklist(['admin', 'editor', 'viewer'], 'Pick a role.'),
		plan: picklist(['free', 'pro', 'enterprise'], 'Pick a plan.'),
		message: pipe(string(), trim(), minLength(10, 'Message must be at least 10 characters.')),
		acceptsTerms: pipe(
			boolean(),
			check((v) => v === true, 'You must accept the terms.')
		)
	});

	type ContactFormValues = InferOutput<typeof contactFormSchema>;

	const sections: MutationFormSection[] = [
		{
			title: 'Contact',
			description: "Who you are and how we'll reach you.",
			fields: [
				{
					id: 'name',
					kind: 'input',
					label: 'Full name',
					placeholder: 'John Doe',
					autocomplete: 'name',
					autofocus: true,
					colSpan: 1
				},
				{
					id: 'email',
					kind: 'input',
					label: 'Email',
					type: 'email',
					placeholder: 'm@example.com',
					autocomplete: 'email',
					description: "We'll only use this to reply.",
					colSpan: 1
				}
			]
		},
		{
			title: 'Access',
			description: 'Pick a role and a plan for this account.',
			fields: [
				{
					id: 'role',
					kind: 'select',
					label: 'Role',
					selectPlaceholder: 'Pick a role',
					options: [
						{ value: 'admin', label: 'Admin' },
						{ value: 'editor', label: 'Editor' },
						{ value: 'viewer', label: 'Viewer' }
					],
					colSpan: 1
				},
				{
					id: 'plan',
					kind: 'radio',
					label: 'Plan',
					radioOrientation: 'horizontal',
					options: [
						{ value: 'free', label: 'Free' },
						{ value: 'pro', label: 'Pro' },
						{ value: 'enterprise', label: 'Enterprise' }
					],
					description: 'You can change this later in settings.',
					colSpan: 1
				}
			]
		},
		{
			title: 'Details',
			fields: [
				{
					id: 'message',
					kind: 'textarea',
					label: 'Message',
					placeholder: 'Tell us a bit about what you need…',
					rows: 5
				},
				{
					id: 'acceptsTerms',
					kind: 'checkbox',
					label: 'I accept the terms and conditions'
				}
			]
		}
	];

	let values = $state<ContactFormValues>({
		name: '',
		email: '',
		role: '' as ContactFormValues['role'],
		plan: '' as ContactFormValues['plan'],
		message: '',
		acceptsTerms: false
	});
</script>

<Section yPadding="md" containerClass="flex w-full max-w-2xl flex-col gap-6">
	<header class="flex flex-col gap-1">
		<h1 class="text-2xl font-semibold tracking-tight">Mutation form</h1>
		<p class="text-muted-foreground text-sm">
			Reusable form driven by a <code class="text-foreground text-xs">fields</code> config —
			input, textarea, and select kinds with shared error / description handling.
		</p>
	</header>

	<MutationForm
		{sections}
		bind:values
		schema={contactFormSchema}
		runFunction={api.tables.test.testMutations.createTestRow}
		submitLabel="Send message"
	/>
</Section>
