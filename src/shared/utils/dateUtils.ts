/**
 * Check if a date is in the past
 */
export function isPast(date: Date): boolean {
	return date < new Date();
}

/**
 * Format a timestamp (epoch number or ISO string) as a locale-formatted
 * date/time. Returns an em-dash for unparseable input so callers can render
 * the result directly without re-checking validity.
 */
export function formatTs(ts: number | string): string {
	const d = new Date(ts);
	return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}
