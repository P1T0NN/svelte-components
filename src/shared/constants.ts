export const COMPANY_DATA = {
	NAME: 'Company Name',
	LOGO: '/logo/logo.webp',
	DESCRIPTION: 'We build dependable software and services so your team can focus on what matters most.'
} as const;

export const PROTECTED_PAGE_ENDPOINTS = {
    HOME: "/home",
}

export const UNPROTECTED_PAGE_ENDPOINTS = {
    ROOT: "/",
    LOGIN: "/login",
    TERMS_OF_SERVICE: "/terms",
    SIDEBAR: "/sidebar",
    CALENDAR: "/calendar",
    UPLOAD_FILE: "/file-upload",
    TABLE: "/table",
    UPLOADED_FILES: "/uploaded-files/:id",
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