/** First-letter uppercased for display. Returns the input unchanged when empty. */
export function capitalize(s: string): string {
	return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
}
