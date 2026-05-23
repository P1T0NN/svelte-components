// LIBRARIES
import { initBotId } from 'botid/client/core';

// CONFIG
import { BOTID_PROTECTED_ROUTES } from '@/shared/config.js';

/**
 * Vercel BotID — instruments outgoing fetches to listed paths so server-side
 * `checkBotId()` can verify them. See {@link BOTID_PROTECTED_ROUTES}.
 */
export function init() {
	initBotId({
		protect: BOTID_PROTECTED_ROUTES
	});
}
