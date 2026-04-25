import type { BaseIssue } from 'valibot';

/**
 * Reduces Valibot `safeParse` issues to a `{ field: message }` map keyed by the
 * top-level field name, taking the first issue per field. Designed for simple
 * client-side form validation where each input shows at most one message.
 */
export type FieldErrors<T extends string = string> = Partial<Record<T, string>>;

export function valibotFieldErrors<T extends string = string>(
	issues: readonly BaseIssue<unknown>[]
): FieldErrors<T> {
	const out: FieldErrors<T> = {};
	for (const issue of issues) {
		const key = issue.path?.[0]?.key;
		if (typeof key === 'string' && !(key in out)) {
			(out as Record<string, string>)[key] = issue.message;
		}
	}
	return out;
}
