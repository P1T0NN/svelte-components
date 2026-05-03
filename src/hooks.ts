import type { Reroute } from '@sveltejs/kit';
import { deLocalizeUrl } from '@/shared/lib/paraglide/runtime';
import { initBotId } from 'botid/client/core';

/**
 * Vercel BotID — instruments outgoing fetches to listed paths so server-side
 * `checkBotId()` can verify them. SvelteKit remote functions submit to
 * `/_app/remote/<id>` (POST), so we match that prefix with a regex to cover
 * every current/future remote command.
 */
export function init() {
	initBotId({
		protect: [{ path: '/_app/remote/*', method: 'POST' }]
	});
}

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

