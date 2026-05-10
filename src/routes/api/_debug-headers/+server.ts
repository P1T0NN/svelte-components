// SVELTEKIT IMPORTS
import { PUBLIC_CONVEX_SITE_URL } from '$env/static/public';

// TYPES
import type { RequestHandler } from './$types';

/**
 * TEMP DEBUG: proxy to the Convex `_debug/headers` endpoint with the same
 * header-shaping our better-auth proxy does, so we can confirm whether
 * `x-forwarded-for` survives to Convex. Delete once the IP issue is solved.
 */
export const GET: RequestHandler = async ({ getClientAddress }) => {
	const ip = getClientAddress();
	const headers = new Headers();
	headers.set('x-forwarded-for', ip);
	headers.set('x-real-ip', ip);
	const res = await fetch(`${PUBLIC_CONVEX_SITE_URL}/_debug/headers`, { headers });
	const body = await res.text();
	return new Response(`getClientAddress() = ${ip}\n\nConvex saw:\n${body}`, {
		headers: { 'content-type': 'text/plain' }
	});
};
