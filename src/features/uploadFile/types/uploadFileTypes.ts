/**
 * Already-uploaded image, EXACTLY as `resolveUploadedImages` embeds it on domain documents
 * (`{ key, url }`). That identity is the whole edit-page story: an edit form seeds its
 * upload field with the document's stored array — `initialValues: { images: doc.images }` —
 * no mapping, no re-download, no re-upload. On submit, existing entries pass their `key`
 * straight through as the ref (the server resolves stored keys and fresh upload refs the
 * same way) while newly picked `File`s are optimized and uploaded. Order is the array
 * order, so the cover stays `images[0]` across add, edit, reorder and removal.
 */
export type ExistingUploadImage = { key: string; url: string };

/** What an upload field holds: freshly picked `File`s and/or already-uploaded images. */
export type UploadImage = File | ExistingUploadImage;

export type UploadFileRow = {
	file: UploadImage;
	index: number;
	previewUrl: string | null;
};
