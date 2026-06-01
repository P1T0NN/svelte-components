// SVELTEKIT IMPORTS
import { redirect } from '@sveltejs/kit';

// CONFIG
import { UNPROTECTED_PAGE_ENDPOINTS } from '@/shared/constants.js';

// UTILS
import { localizedPath } from '@/shared/utils/localizedPath';

// TYPES
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.token) {
		throw redirect(302, localizedPath(event, UNPROTECTED_PAGE_ENDPOINTS.LOGIN));
	}

	return {
		pageTitle: 'Analytics'
	};
};
