// UTILS
import { capitalizeFirst } from '@/shared/utils/stringUtils';

// TYPES
import type { ColumnDef } from '@/components/ui/data-table/types.js';
import type { Doc } from '@/convex/_generated/dataModel';

/** `user.role.update` → `User role update`. */
function formatAction(action: string): string {
	return capitalizeFirst(action.replaceAll('.', ' ').replaceAll('_', ' '));
}

/**
 * Column definitions for the audit-log table on a user's Activity tab.
 *
 * A function rather than a bare `const`: `m[...]()` resolves against the active locale when
 * it runs, so building the array per component init keeps headers correct instead of
 * freezing them at module-import time.
 *
 * `status` is also rendered by a custom cell in the table component — the accessor here is
 * what search/sort and the mobile card layout fall back to.
 */
export function getAdminUserActivityColumns(): ColumnDef<Doc<'auditLogs'>>[] {
	return [
		{
			id: 'action',
			header: 'Action',
			accessor: (r) => formatAction(r.action)
		},
		{
			id: 'status',
			header: 'Status',
			accessor: (r) => (r.status === 'failure' ? 'Failed' : 'Success'),
			hideBelow: 'md'
		},
		{
			id: 'resource',
			header: 'Resource',
			accessor: (r) => (r.resource ? `${r.resource.table}#${r.resource.id}` : '—'),
			hideBelow: 'lg',
			cellClass: 'max-w-[16rem]'
		},
		{
			id: 'ip',
			header: 'IP',
			accessor: (r) => r.ip ?? '—',
			hideBelow: 'lg'
		},
		{
			id: 'createdAt',
			header: 'When',
			accessor: (r) => new Date(r._creationTime).toLocaleString(),
			sortable: true
		}
	];
}
