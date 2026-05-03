// SVELTEKIT IMPORTS
import { command } from '$app/server';
import { error } from '@sveltejs/kit';

// LIBRARIES
import { checkBotId } from 'botid/server';
import { m } from '@/shared/lib/paraglide/messages';

// TYPES
import type { GenericSchema, InferOutput } from 'valibot';

/**
 * Drop-in replacement for SvelteKit's `command(schema, handler)` that runs
 * Vercel BotID's `checkBotId()` before the handler.
 *
 * Bots get a `403 Forbidden` thrown via `error(...)`; legitimate calls flow
 * through unchanged. On non-Vercel environments (local dev, custom hosts)
 * `checkBotId()` is a no-op so this has no effect.
 *
 * Use everywhere you'd use `command(...)` from `$app/server` — keeps bot
 * protection consistent without sprinkling `checkBotId()` calls in every
 * remote function.
 *
 * @example
 * ```ts
 * export const sendContactFormEmail = safeCommand(schema, async (data) => {
 *   // BotID already enforced — go straight to business logic.
 *   ...
 * });
 * ```
 */
export const safeCommand = <S extends GenericSchema, R>(
	schema: S,
	handler: (data: InferOutput<S>) => Promise<R>
) =>
	command(schema, async (data: InferOutput<S>) => {
		const verification = await checkBotId();
		if (verification.isBot) {
			throw error(403, m['GenericMessages.FORBIDDEN']());
		}

		return handler(data);
	});
