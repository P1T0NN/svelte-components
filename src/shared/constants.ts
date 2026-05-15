export const COMPANY_DATA = {
	NAME: 'Company Name',
	EMAIL: 'company@gmail.com',
    DOMAIN: 'company.com',
	LOGO: '/logo/logo.webp',
	DESCRIPTION: 'We build dependable software and services so your team can focus on what matters most.'
} as const;

export const ADMIN_PAGE_ENDPOINTS = {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    USER: "/admin/users/:id"
}

export const PROTECTED_PAGE_ENDPOINTS = {
    HOME: "/home",
} as const;

export const UNPROTECTED_PAGE_ENDPOINTS = {
    ROOT: "/",
    LOGIN: "/login",
    TERMS_OF_SERVICE: "/terms",
    SIDEBAR: "/sidebar",
    CALENDAR: "/calendar",
    UPLOAD_FILE: "/file-upload",
    TABLE: "/table",
    UPLOADED_FILES: "/uploaded-files/:id",
    SIGNUP: "/signup",
    FORGOT_PASSWORD: "/forgot-password",
    CONTACT: "/contact",
} as const;

/**
 * Replace `:param` segments in a route pattern (e.g. `/uploaded-files/:id`).
 * Values are passed through `encodeURIComponent`.
 */
export function fillRoutePattern(
	pattern: string,
	params: Record<string, string>
): string {
	let path = pattern;
	for (const [key, value] of Object.entries(params)) {
		path = path.replace(`:${key}`, encodeURIComponent(value));
	}
	return path;
}