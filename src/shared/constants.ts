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
} as const;

/** Path prefixes under `/sidebar` where the rail is hidden (full-width inset only). */
export const SIDEBAR_FULL_WIDTH_PREFIXES: readonly string[] = [];