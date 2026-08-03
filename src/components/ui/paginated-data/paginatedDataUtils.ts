/**
 * Page-number window with elision: `[1, 'gap', 4, 5, 6, 'gap', 10]`.
 *
 * Always includes the first and last page (so a crawler reaches both ends of the list from
 * any page) plus `span` neighbours either side of the current one. `'gap'` marks a skipped
 * run; consecutive runs never produce a gap, so a short list renders as plain `1 2 3`.
 *
 * Only meaningful when a total is known — cursor pagination has no last page, so callers
 * render prev/next only.
 */
export function pageWindow(current: number, total: number, span = 1): (number | 'gap')[] {
	if (!Number.isFinite(total) || total <= 0) return [];
	const clamped = Math.min(Math.max(1, Math.floor(current)), total);

	const pages = new Set<number>([1, total]);
	for (let p = clamped - span; p <= clamped + span; p++) {
		if (p >= 1 && p <= total) pages.add(p);
	}

	const sorted = [...pages].sort((a, b) => a - b);
	const out: (number | 'gap')[] = [];
	for (const [i, p] of sorted.entries()) {
		if (i > 0 && p - sorted[i - 1]! > 1) out.push('gap');
		out.push(p);
	}
	return out;
}

// ponytail: self-check instead of a test framework — `bun run src/components/ui/paginated-data/paginatedDataUtils.ts`
if (import.meta.main) {
	const eq = (actual: unknown, expected: unknown, label: string) => {
		const [a, b] = [JSON.stringify(actual), JSON.stringify(expected)];
		if (a !== b) throw new Error(`${label}: got ${a}, want ${b}`);
	};

	eq(pageWindow(1, 0), [], 'no pages');
	eq(pageWindow(1, 1), [1], 'single page');
	eq(pageWindow(3, 5), [1, 2, 3, 4, 5], 'contiguous — no gaps');
	eq(pageWindow(1, 5), [1, 2, 'gap', 5], 'first page elides the tail');
	eq(pageWindow(10, 10), [1, 'gap', 9, 10], 'last page elides the head');
	eq(pageWindow(5, 10), [1, 'gap', 4, 5, 6, 'gap', 10], 'middle elides both sides');
	eq(pageWindow(99, 5), [1, 'gap', 4, 5], 'out-of-range current clamps to total');
	eq(pageWindow(5, 10, 2), [1, 'gap', 3, 4, 5, 6, 7, 'gap', 10], 'wider span');

	console.log('pageWindow: ok');
}
