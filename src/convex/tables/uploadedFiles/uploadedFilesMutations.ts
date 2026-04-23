// HELPERS
import { createDeleteMutation } from '../../helpers/createDeleteMutation.js';

// AGGREGATES
import { uploadedFilesTableAggregate } from './uploadedFilesAggregate.js';

/**
 * Hybrid bulk delete for `uploadedFiles`. All heavy lifting (batch cap, weighted rate limit,
 * 2-phase atomicity, storage cleanup, aggregate sync, translatable results + errors) lives
 * in {@link createDeleteMutation}.
 *
 * Authorization: owner-only. Supplying `ownerId` makes the factory skip the default
 * `adminOnly` gate — an authed owner can remove their own files; admins can't (yet) touch
 * other users' files via this endpoint. If a cross-user admin delete is ever needed, build
 * it as a separate mutation with `adminOnly: true` (never widen this one).
 */
export const deleteUploadedFile = createDeleteMutation({
	table: 'uploadedFiles',
	ownerId: { field: (doc) => doc.ownerId },
	storageIds: (doc) => [doc.storageId],
	aggregate: uploadedFilesTableAggregate,
	rateLimit: { name: 'delete' }
});
