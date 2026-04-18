/**
 * Image → WebP using Sharp. **Server only** (SvelteKit `*.server.ts`, Convex actions, etc.).
 */

// LIBRARIES
import sharp from 'sharp';

export type OptimizeImagesOptions = {
	/** WebP quality `1…100`. Default `85`. */
	quality?: number;
	maxWidth?: number;
	maxHeight?: number;
};

export type OptimizedWebpResult = {
	buffer: Buffer;
	fileName: string;
	mimeType: 'image/webp';
};

const DEFAULT_QUALITY = 85;

function stripExtension(name: string): string {
	const i = name.lastIndexOf('.');
	return i > 0 ? name.slice(0, i) : name;
}

export async function optimizeImageBufferToWebp(
	input: Buffer,
	originalFileName: string,
	options?: OptimizeImagesOptions
): Promise<OptimizedWebpResult> {
	const quality = options?.quality ?? DEFAULT_QUALITY;
	const maxWidth = options?.maxWidth;
	const maxHeight = options?.maxHeight;

	let pipeline = sharp(input).rotate();

	if (maxWidth != null || maxHeight != null) {
		pipeline = pipeline.resize(maxWidth, maxHeight, {
			fit: 'inside',
			withoutEnlargement: true
		});
	}

	const buffer = await pipeline.webp({ quality }).toBuffer();
	const base = stripExtension(originalFileName);

	return {
		buffer,
		fileName: `${base}.webp`,
		mimeType: 'image/webp'
	};
}

export async function optimizeImageFileToWebp(
	file: File,
	options?: OptimizeImagesOptions
): Promise<OptimizedWebpResult> {
	const input = Buffer.from(await file.arrayBuffer());
	return optimizeImageBufferToWebp(input, file.name, options);
}

export async function optimizeImageFilesToWebp(
	files: File[],
	options?: OptimizeImagesOptions
): Promise<OptimizedWebpResult[]> {
	return Promise.all(files.map((f) => optimizeImageFileToWebp(f, options)));
}
