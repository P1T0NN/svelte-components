// LIBRARIES
import { deLocalizeUrl } from '@/lib/paraglide/runtime';

// HELPERS
import { applyDefaultValidationMessages } from '@/shared/features/validations/config/validationsConfig';

// TYPES
import type { Reroute, Transport } from '@sveltejs/kit';

// Universal hooks run once per runtime (SSR and browser), before any schema `.parse` —
// the one place to swap zod's default error strings for our human, code-based ones.
applyDefaultValidationMessages();

/** Map locale-prefixed URLs to SvelteKit route paths. Must live in hooks.ts (not hooks.server.ts). */
export const reroute: Reroute = ({ url }) => deLocalizeUrl(url).pathname;

export const transport = {} satisfies Transport;
