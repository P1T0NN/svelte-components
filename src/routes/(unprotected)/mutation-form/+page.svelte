<script lang="ts">
	// LIBRARIES
	import { z } from 'zod';
	import { api } from '@/convex/_generated/api';

	// COMPONENTS
	import Section from '@/shared/components/ui/section/section.svelte';
	import MutationForm from '@/shared/components/ui/mutation-form/convex-mutation-form.svelte';

	// TYPES
	import type { MutationFormSection } from '@/shared/components/ui/mutation-form/types.js';

	const contactFormSchema = z.object({
		name: z.string().trim().min(1, 'Name is required.'),
		email: z.string().trim().min(1, 'Email is required.').email('Enter a valid email.'),
		role: z.enum(['admin', 'editor', 'viewer'], { message: 'Pick a role.' }),
		plan: z.enum(['free', 'pro', 'enterprise'], { message: 'Pick a plan.' }),
		message: z.string().trim().min(10, 'Message must be at least 10 characters.'),
		acceptsTerms: z.boolean().refine((v) => v === true, 'You must accept the terms.')
	});

	type ContactFormValues = z.infer<typeof contactFormSchema>;

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
		<p class="text-sm text-muted-foreground">
			Reusable form driven by a <code class="text-xs text-foreground">fields</code> config — input, textarea,
			and select kinds with shared error / description handling.
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
