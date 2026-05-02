import type { Snippet } from 'svelte';
import type { FunctionReference } from 'convex/server';

/**
 * DataTable pagination orchestration; extend the union when adding cursor/aggregate modes.
 * Default constant: `PAGINATION_DATA.DEFAULT_OPTIMIZATION_STRATEGY` in `@/shared/config`.
 */
export type DataTableOptimizationStrategy = 'unoptimized';

/** Shape returned by list queries that paginate with `page` + `paginationOpts` (see `paginatedQueryArgs`). */
export type PaginatedListPayload<T = unknown> = {
	page: T[];
	isDone: boolean;
	continueCursor: string;
	totalCount: number;
};

/**
 * Convex query ref for {@link PaginatedListPayload}; `Args` should accept optional `page` and `paginationOpts`.
 * Use at call sites: `query={api.someModule.listThings}`.
 */
export type PaginatedListQuery<T extends Record<string, unknown>> = FunctionReference<
	'query',
	'public',
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	PaginatedListPayload<T>
>;

/** Minimum breakpoint at which the column becomes visible in the table layout. */
export type ColumnHideBelow = 'sm' | 'md' | 'lg';

/**
 * Subset of column metadata used by loading skeletons (no row / `T`, so any `ColumnDef<T>` fits).
 */
export type DataTableSkeletonColumn = {
	id: string;
	header: string;
	hideBelow?: ColumnHideBelow;
	cellClass?: string;
};

export type ColumnDef<T> = {
	id: string;
	header: string;
	accessor: (row: T) => unknown;
	headerClass?: string;
	cellClass?: string;
	/**
	 * Column is hidden below this breakpoint in the table (`hidden ${bp}:table-cell`).
	 * In the mobile card layout, columns with `md` or `lg` are omitted (card only shows below `md`).
	 * Columns with `sm` stay in the card so small phones still see primary fields.
	 */
	hideBelow?: ColumnHideBelow;
	/**
	 * When set (and no `customCells` entry for this column), the cell renders as a localized
	 * `Link` using the accessor value as the visible label.
	 */
	linkHref?: (row: T) => string;
	/**
	 * Render a small copy-to-clipboard button next to the cell value. Useful for long
	 * truncated values (URLs, IDs) where selecting the visible text isn't enough.
	 * Copies `String(accessor(row))`.
	 */
	hasCopy?: boolean;
};

export type DataTableCellSnippetProps<T> = {
	row: T;
	column: ColumnDef<T>;
	value: unknown;
};

export type DataTableCustomCells<T> = Partial<
	Record<string, Snippet<[DataTableCellSnippetProps<T>]>>
>;

/** Tri-state header checkbox based on how many rows on the current page are selected. */
export type DataTableSelectionHeaderState = 'none' | 'some' | 'all';
