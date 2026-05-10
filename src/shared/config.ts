export const PAGINATION_DATA = {
	DEFAULT_PAGE_SIZE: 1,
	/** Default for `DataTable` `optimizationStrategy` (see `DataTableOptimizationStrategy` in data-table `types.ts`). */
	DEFAULT_OPTIMIZATION_STRATEGY: 'cursor' as const
} as const;

export const COOKIE_NAMES = {
    SESSION_TOKEN: 'session_token',
    DEVICE_FINGERPRINT: 'device_fingerprint',
} as const;

export const RATE_LIMIT = {
    STANDARD: {
        REQUESTS_PER_WINDOW: 100,
        WINDOW_MINUTES: 1,
    },
    STRICT: {
        REQUESTS_PER_WINDOW: 20,
        WINDOW_MINUTES: 1,
    },
    AUTH: {
        REQUESTS_PER_WINDOW: 20,
        WINDOW_MINUTES: 15,
    },
} as const;