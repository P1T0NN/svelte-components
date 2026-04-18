// SVELTEKIT IMPORTS
import { redirect } from '@sveltejs/kit';

// CONFIG
import { UNPROTECTED_PAGE_ENDPOINTS, PROTECTED_PAGE_ENDPOINTS } from '@/shared/constants.js';

// UTILS
import { localizedPath } from '@/shared/utils/localizedPath';

// TYPES
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const { locals } = event;
	if (!locals.user) {
		throw redirect(302, localizedPath(event, UNPROTECTED_PAGE_ENDPOINTS.LOGIN));
	}

	if (locals.user.role !== 'admin') {
		throw redirect(302, localizedPath(event, PROTECTED_PAGE_ENDPOINTS.HOME));
	}

	return {
		user: locals.user
	};
};

