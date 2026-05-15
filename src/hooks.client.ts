// LIBRARIES
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
