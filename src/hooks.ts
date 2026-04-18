import type { Reroute } from '@sveltejs/kit';
import { deLocalizeUrl } from '@/shared/lib/paraglide/runtime';

/**
 * Map public URLs to SvelteKit route paths (strip /en, /de, …).
 * @see https://inlang.com/m/gerre34r/library-inlang-paraglideJs/sveltekit
 */
export const reroute: Reroute = ({ url }) => {
	const { pathname } = url;
	// Never touch API or dev tooling paths — no locale prefix
	if (pathname.startsWith('/api') || pathname.startsWith('/@') || pathname.startsWith('/_')) {
		return pathname;
	}
	return deLocalizeUrl(url).pathname;
};