// Route paths, one place. Frontend-only on purpose — Convex never links to app pages, so
// these live outside `shared/` (which is reserved for what BOTH runtimes import).
//
// `:param` segments are filled at the call site with `.replace(':id', value)`.

export const ADMIN_PAGE_ENDPOINTS = {
	DASHBOARD: '/admin/dashboard',
	USERS: '/admin/users',
	USER: '/admin/users/:id'
} as const;

export const PROTECTED_PAGE_ENDPOINTS = {
	HOME: '/home'
} as const;

export const UNPROTECTED_PAGE_ENDPOINTS = {
	ROOT: '/',
	LOGIN: '/login',
	TERMS_OF_SERVICE: '/terms',
	SIDEBAR: '/sidebar',
	CALENDAR: '/calendar',
	UPLOAD_FILE: '/file-upload',
	CUSTOM_COMPONENTS: '/custom-components',
	LISTS: '/lists',
	UPLOADED_FILES: '/uploaded-files/:id',
	SIGNUP: '/signup',
	FORGOT_PASSWORD: '/forgot-password',
	CONTACT: '/contact'
} as const;
