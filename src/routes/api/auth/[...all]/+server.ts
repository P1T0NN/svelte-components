// SVELTEKIT IMPORTS
import { PUBLIC_CONVEX_SITE_URL } from '$env/static/public';

// TYPES
import type { RequestHandler } from './$types';

/**
 * Better-auth proxy from SvelteKit → Convex.
 *
 * Replaces `@mmailaender/convex-better-auth-svelte`'s `createSvelteKitHandler`
 * because that helper hard-strips every header except a small allow-list
 * (`accept`, `authorization`, `cookie`, `user-agent`, etc.) — crucially
 * dropping `x-forwarded-for`. The result: better-auth sees Vercel's edge as
 * the caller and writes Vercel's IP into `session.ipAddress` instead of the
 * real user's. We rebuild the same forward but stamp `x-forwarded-for` /
 * `x-real-ip` from `event.getClientAddress()` (SvelteKit's helper, which on
 * Vercel reads the trusted incoming `x-forwarded-for` itself).
 *
 * Keep this in sync with the upstream `FORWARDED_AUTH_HEADER_NAMES` allow-list
 * if you ever bump the package — diff `node_modules/.../sveltekit/index.js`.
 */
const FORWARDED_AUTH_HEADER_NAMES = new Set([
	'accept',
	'authorization',
	'better-auth-cookie',
	'content-type',
	'cookie',
	'origin',
	'referer',
	'user-agent'
]);

const proxy: RequestHandler = async ({ request, getClientAddress }) => {
	const requestUrl = new URL(request.url);
	const nextUrl = `${PUBLIC_CONVEX_SITE_URL}${requestUrl.pathname}${requestUrl.search}`;
	const newRequest = new Request(nextUrl, request);

	const forwarded = new Headers();
	for (const [name, value] of request.headers.entries()) {
		if (FORWARDED_AUTH_HEADER_NAMES.has(name.toLowerCase())) forwarded.set(name, value);
	}
	forwarded.set('host', new URL(nextUrl).host);
	forwarded.set('x-forwarded-host', requestUrl.host);
	forwarded.set('x-forwarded-proto', requestUrl.protocol.replace(/:$/, ''));
	forwarded.set('x-better-auth-forwarded-host', requestUrl.host);
	forwarded.set('x-better-auth-forwarded-proto', requestUrl.protocol.replace(/:$/, ''));
	forwarded.set('accept-encoding', 'identity');

	// The whole point of this file: hand better-auth the real client IP.
	// SvelteKit's getClientAddress() reads the trusted `x-forwarded-for` set by
	// Vercel's edge from the actual TCP socket — not anything client-controlled.
	const clientIp = getClientAddress();
	forwarded.set('x-forwarded-for', clientIp);
	forwarded.set('x-real-ip', clientIp);

	for (const name of [...newRequest.headers.keys()]) newRequest.headers.delete(name);
	for (const [name, value] of forwarded.entries()) newRequest.headers.set(name, value);

	return fetch(newRequest, { method: request.method, redirect: 'manual' });
};

export const GET = proxy;
export const POST = proxy;
