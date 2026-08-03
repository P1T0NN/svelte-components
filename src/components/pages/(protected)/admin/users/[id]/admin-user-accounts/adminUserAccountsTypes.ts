/**
 * Row shape returned by `listUserAccounts` (better-auth component `account` table, shaped
 * by the query). Sensitive fields — tokens, password hash — are never selected; for
 * credential accounts `hasPassword` is the only thing exposed about the secret.
 *
 * Lives here rather than in a component because both the list and the row need it.
 */
export type AdminUserAccountRow = {
	_id: string;
	accountId: string;
	providerId: string;
	createdAt: number | string;
	updatedAt: number | string;
	hasPassword: boolean;
	scope: string | null;
};
