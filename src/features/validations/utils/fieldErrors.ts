// Svelte-side field errors: the dual-runtime mapper localized for display, plus the
// UI-only helper for clearing an error while the user retypes.

// HELPERS
import { zodIssuesToFieldErrorCodes } from '@/shared/features/validations/utils/zodFieldErrors.js';
import { translateValidationMessage } from './translateFromBackend.js';

// TYPES
import type {
	FieldErrors,
	ZodIssueLike
} from '@/shared/features/validations/types/validationsTypes.js';

/**
 * Maps zod `issues` to per-field messages, localized for display — serialized descriptors
 * from the default error map, bare catalog keys, and bespoke human strings all come out
 * as rendered text. First issue per top-level field wins.
 */
export function zodIssuesToFieldErrors<T extends string>(
	issues: readonly ZodIssueLike[],
	includeOnlyKeys?: readonly T[]
): FieldErrors<T> {
	const out: FieldErrors<T> = {};
	for (const [key, message] of Object.entries(
		zodIssuesToFieldErrorCodes(issues, includeOnlyKeys)
	)) {
		out[key as T] = translateValidationMessage(message as string);
	}
	return out;
}

/**
 * Returns an `oninput`/`onchange` handler that clears `key`'s error on any reactive
 * container exposing `fieldErrors` (a `$state` field, or a class with getter/setter).
 * Reassigns an immutable copy so both proxy state and accessor-backed state react.
 *
 * @example
 * ```svelte
 * oninput={clearFieldErrorOn(contactSectionClass, 'name')}
 * ```
 */
export function clearFieldErrorOn<T extends string>(
	context: { fieldErrors: FieldErrors<T> },
	key: T
): () => void {
	return () => {
		if (!(key in context.fieldErrors)) return;
		const next = { ...context.fieldErrors };
		delete next[key];
		context.fieldErrors = next;
	};
}
