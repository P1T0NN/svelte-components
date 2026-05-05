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
	AUDIT_LOGS: false,
	/**
	 * Use Cloudflare R2 (`@convex-dev/r2`) for file uploads instead of Convex file storage.
	 * - `true`  → uploads go to R2, reads/deletes target the `uploadedFilesR2` table.
	 * - `false` → uploads go to Convex storage, reads/deletes target `uploadedFiles`.
	 * Both backends stay registered server-side; this only switches which one the UI uses.
	 */
	USE_R2: true
} as const;
