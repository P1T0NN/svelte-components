// Dual-runtime zod → field-error mapping. Messages here are still CODES (or bespoke
// per-schema strings) — nothing in this file translates. The Svelte half
// (`@/features/validations/utils/fieldErrors.ts`) localizes on the way out and owns the
// UI-side helpers (clearing errors on input, etc.).

// TYPES
import type { FieldErrors, ZodIssueLike } from '../types/validationsTypes.js';

/**
 * Maps zod `issues` to `{ field: message }` — top path segment, first issue per field
 * wins (so an empty field reads "required", not the later `min(8)` on the same value).
 * Messages pass through UNtranslated. `includeOnlyKeys` drops unrelated fields when a
 * merged schema validates more than one form section.
 */
export function zodIssuesToFieldErrorCodes<T extends string>(
	issues: readonly ZodIssueLike[],
	includeOnlyKeys?: readonly T[]
): FieldErrors<T> {
	const wanted = includeOnlyKeys && new Set<string>(includeOnlyKeys);
	const out: Partial<Record<string, string>> = {};
	for (const { path, message } of issues) {
		const key = path[0];
		if (typeof key !== 'string' || (wanted && !wanted.has(key))) continue;
		out[key] ??= message;
	}
	return out as FieldErrors<T>;
}
