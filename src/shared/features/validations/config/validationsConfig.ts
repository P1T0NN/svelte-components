// Wires the validations feature into zod. Dual-runtime, but each runtime must opt in.

// LIBRARIES
import { z } from 'zod';

// UTILS
import { mapDefaultValidationErrors } from '../utils/mapDefaultValidationErrors.js';

/**
 * Install the map as zod's global default. Call once per runtime at startup — the Svelte
 * side does it in `src/hooks.ts` (universal, so SSR and browser both get it). Convex
 * validates with `convex/values`, not zod, so it doesn't need this today; if a Convex
 * module ever `.parse`s user input with zod, call this there too.
 */
export function applyDefaultValidationMessages(): void {
	z.config({ customError: mapDefaultValidationErrors });
}
