// LIBRARIES
import { TableAggregate } from '@convex-dev/aggregate';
import { components } from '../../../_generated/api';

// TYPES
import type { DataModel } from '../../../_generated/dataModel.js';

/**
 * O(log n) total row count for `uploadedFilesR2` (sortKey `null` = count-only).
 * Mirrors {@link uploadedFilesTableAggregate} — same shape, R2-backed table.
 */
export const uploadedFilesR2TableAggregate = new TableAggregate<{
	Key: null;
	DataModel: DataModel;
	TableName: 'uploadedFilesR2';
}>(components.uploadedFilesR2Aggregate, {
	sortKey: () => null
});
