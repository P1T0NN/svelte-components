// App-level mutation builders, wrapped so every `ctx.db` write runs the triggers
// registered in `aggregates.ts` (aggregate counters stay exact automatically).
//
// CONVENTION: import `mutation` / `internalMutation` from THIS file, never from
// `_generated/server`. The raw builders bypass the triggers, and one bypassed write is
// enough to drift every counter registered for that table. Queries/actions have no db
// writes — keep importing those from `_generated/server`.

// LIBRARIES
import { customCtx, customMutation } from 'convex-helpers/server/customFunctions';

// CONFIG
import {
	mutation as rawMutation,
	internalMutation as rawInternalMutation
} from './_generated/server';

// HELPERS
import { triggers } from './aggregates.js';

export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
export const internalMutation = customMutation(rawInternalMutation, customCtx(triggers.wrapDB));
