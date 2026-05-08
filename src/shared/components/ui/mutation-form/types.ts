import type { Snippet } from 'svelte';
import type { HTMLInputTypeAttribute } from 'svelte/elements';

export type MutationFormFieldKind = 'input' | 'textarea' | 'select' | 'checkbox' | 'radio';

export type MutationFormSelectOption = {
	value: string;
	label: string;
	disabled?: boolean;
};

export type MutationFormFieldDef = {
	/** Key used in the values record, name attribute, and id suffix. */
	id: string;
	label: string;
	kind: MutationFormFieldKind;

	/** Common */
	placeholder?: string;
	description?: string;
	autocomplete?: string;
	autofocus?: boolean;
	disabled?: boolean;
	required?: boolean;
	fieldClass?: string;

	/** kind: 'input' */
	type?: HTMLInputTypeAttribute;

	/** kind: 'textarea' */
	rows?: number;

	/** kind: 'select' | 'radio' */
	options?: MutationFormSelectOption[];
	/** Trigger label when the bound value is empty. */
	selectPlaceholder?: string;

	/** kind: 'radio' */
	radioOrientation?: 'vertical' | 'horizontal';
};

export type MutationFormFieldSnippetProps<T extends Record<string, unknown>> = {
	field: MutationFormFieldDef;
	value: T[keyof T];
	setValue: (next: unknown) => void;
	error: string | undefined;
	inputId: string;
};

export type MutationFormCustomFields<T extends Record<string, unknown>> = Partial<
	Record<string, Snippet<[MutationFormFieldSnippetProps<T>]>>
>;

export type MutationFormFieldErrors<T extends Record<string, unknown>> = Partial<
	Record<keyof T & string, string | undefined>
>;
