// UTILS
import { capitalizeFirst } from '@/shared/utils/stringUtils';

// TYPES
import type { ColumnDef } from '@/components/ui/data-table/types.js';
import type { Doc } from '@/convex/auth/component/_generated/dataModel';

/**
 * Column definitions for the `/admin/users` table.
 *
 * A function rather than a bare `const`: `m[...]()` resolves against the active locale when
 * it runs, so building the array per component init keeps headers correct instead of
 * freezing them at module-import time.
 *
 * `sortable` ids must be ones `listUsers` can actually order by; `hideBelow` drops the
 * column below that breakpoint (the mobile card layout renders it instead).
 */
export function getAdminUsersTableColumns(): ColumnDef<Doc<'user'>>[] {
	return [
		{
			id: 'name',
			header: 'User',
			accessor: (r) => capitalizeFirst(r.name || r.email),
			sortable: true
		},
		{
			id: 'email',
			header: 'Email',
			accessor: (r) => r.email,
			hideBelow: 'md'
		},
		{
			id: 'role',
			header: 'Role',
			accessor: (r) => capitalizeFirst(r.role),
			hideBelow: 'md'
		},
		{
			id: 'emailVerified',
			header: 'Verified',
			accessor: (r) => (r.emailVerified ? 'Yes' : 'No'),
			hideBelow: 'lg'
		},
		{
			id: 'banned',
			header: 'Status',
			accessor: (r) => (r.banned ? 'Banned' : 'Active'),
			hideBelow: 'md'
		},
		{
			id: 'createdAt',
			header: 'Created',
			accessor: (r) => new Date(r._creationTime).toLocaleDateString(),
			sortable: true,
			hideBelow: 'lg'
		}
	];
}
