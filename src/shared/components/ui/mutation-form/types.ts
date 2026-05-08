import type { Snippet } from 'svelte';
import type { FullAutoFill, HTMLInputTypeAttribute } from 'svelte/elements';

export type MutationFormFieldKind =
	| 'input'
	| 'textarea'
	| 'select'
	| 'checkbox'
	| 'radio'
	| 'upload-single'
	| 'upload-multiple';

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
	autocomplete?: FullAutoFill;
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

	/** kind: 'upload-single' | 'upload-multiple' */
	accept?: string;

	/** Grid columns the field occupies inside a section. Defaults to 2 (full width). */
	colSpan?: 1 | 2;
};

export type MutationFormSection = {
	id?: string;
	title?: string;
	description?: string;
	fields: MutationFormFieldDef[];
	/** Section grid column count. Defaults to 2. */
	columns?: 1 | 2;
	/** Render the section without a Card wrapper. */
	plain?: boolean;
	class?: string;
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
