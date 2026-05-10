import { httpRouter } from "convex/server";
import { httpAction } from './_generated/server';
import { authComponent, createAuth } from './auth/auth';

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

// TEMP DEBUG: echo all headers Convex sees, so we can confirm whether our
// SvelteKit proxy's `x-forwarded-for` actually arrives intact. Remove once
// the IP issue is resolved.
http.route({
	path: '/_debug/headers',
	method: 'GET',
	handler: httpAction(async (_ctx, request) => {
		const headers: Record<string, string> = {};
		for (const [k, v] of request.headers.entries()) headers[k] = v;
		return new Response(JSON.stringify(headers, null, 2), {
			headers: { 'content-type': 'application/json' }
		});
	})
});

export default http;
