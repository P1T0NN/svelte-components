// TYPES
import type { ExistingUploadImage, UploadImage } from '../types/uploadFileTypes';

export function isExistingUploadImage(value: unknown): value is ExistingUploadImage {
	return (
		typeof value === 'object' &&
		value !== null &&
		!(value instanceof File) &&
		typeof (value as ExistingUploadImage).key === 'string' &&
		typeof (value as ExistingUploadImage).url === 'string'
	);
}

/** Display name: the File's name, or the tail of the stored key for existing images. */
export function uploadImageName(image: UploadImage): string {
	if (image instanceof File) return image.name;
	const tail = image.key.split('/').pop();
	return tail || image.key;
}

/**
 * Stable identity for dedup and preview/list keys. Existing images key by their storage
 * key (unique by construction); Files by name+size+mtime.
 */
export function uploadImageKey(image: UploadImage): string {
	return image instanceof File ? `${image.name}-${image.size}-${image.lastModified}` : image.key;
}
