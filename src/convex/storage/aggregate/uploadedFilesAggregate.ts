// LIBRARIES
import { TableAggregate } from '@convex-dev/aggregate';
import { components } from '../../_generated/api';

// TYPES
import type { DataModel } from '../../_generated/dataModel.js';

/**
 * O(log n) total row count for `uploadedFiles` (sortKey `null` = count-only).
 * Call `insert` / `delete` / `replace` from mutations whenever the table changes.
 *
 * **Existing rows** created before this aggregate was added are not counted until you
 * backfill (e.g. paginate `uploadedFiles` and `insertIfDoesNotExist` per doc).
 */
export const uploadedFilesTableAggregate = new TableAggregate<{
	Key: null;
	DataModel: DataModel;
	TableName: 'uploadedFiles';
}>(components.uploadedFilesAggregate, {
	sortKey: () => null
});
