/**
 * Feature flags for the Convex backend
 *
 * Toggle features on/off globally for the project.
 * These flags are evaluated at runtime in Convex functions.
 */
export const FEATURES = {
	/**
	 * Enable audit logging for tracking user actions
	 * When enabled, mutations can call logAudit() to record actions
	 */
	AUDIT_LOGS: false
} as const;
