/**
 * Convex Helper Functions
 *
 * Why we use safeMutation/safeAction instead of useMutation/useAction:
 *
 * 1. convex-svelte doesn't provide useMutation/useAction hooks - only useQuery exists
 *
 * 2. Mutations and actions are fundamentally different from queries:
 *    - Queries are SUBSCRIPTIONS (real-time, reactive) - they need hooks like useQuery
 *    - Mutations/actions are ONE-OFF CALLS (fire and forget) - they're imperative, not reactive
 *
 * 3. The real-time reactivity comes from useQuery(), which automatically updates
 *    when data changes. When you call a mutation, any useQuery subscriptions
 *    watching that data will automatically receive the updates.
 *
 * Usage pattern:
 *   - useQuery() for reading data (reactive, real-time)
 *   - safeMutation()/safeAction() for writing data (imperative, with error handling)
 */

// LIBRARIES
import { toast } from 'svelte-sonner';
import { isRateLimitError } from '@convex-dev/rate-limiter';
import { m } from '@/shared/lib/paraglide/messages';

// TYPES
import type { FunctionReference, FunctionArgs, FunctionReturnType } from 'convex/server';
import type { ConvexClient } from 'convex/browser';
import type { Id } from '@/convex/_generated/dataModel';

// CONFIG
import { api } from '@/convex/_generated/api';

type StorageUploadJson = { storageId: Id<'_storage'> };

async function postFileToConvexUploadUrl(url: string, file: File): Promise<StorageUploadJson> {
	const res = await fetch(url, {
		method: 'POST',
		...(file.type ? { headers: { 'Content-Type': file.type } } : {}),
		body: file
	});

	if (!res.ok) {
		throw new Error(`Storage upload failed: ${res.status}`);
	}

	const text = (await res.text()).trim();
	if (!text) {
		throw new Error('Empty storage upload response');
	}

	let json: StorageUploadJson;
	try {
		json = JSON.parse(text) as StorageUploadJson;
	} catch {
		throw new Error('Invalid storage upload response');
	}

	if (!json?.storageId) {
		throw new Error('Missing storageId in upload response');
	}

	return json;
}

/**
 * Upload a browser `File` to Convex file storage and insert an `uploadedFiles` row.
 */
export async function uploadFileToConvexStorage(
	client: ConvexClient,
	file: File
): Promise<Id<'uploadedFiles'>> {
	const postUrl = await client.mutation(api.storage.storageMutations.generateUploadUrl, {});

	const { storageId } = await postFileToConvexUploadUrl(postUrl, file);

	return await client.mutation(api.storage.storageMutations.saveUploadedFile, { storageId });
}

/**
 * Execute a Convex mutation with automatic rate limit error handling
 *
 * Shows a toast notification when rate limited instead of throwing.
 *
 * Usage:
 * ```ts
 * const client = useConvexClient();
 * const result = await safeMutation(client, api.myMutation, { arg: 'value' });
 * ```
 */
export async function safeMutation<Mutation extends FunctionReference<'mutation'>>(
	client: ConvexClient,
	mutation: Mutation,
	args: FunctionArgs<Mutation>
): Promise<FunctionReturnType<Mutation> | null> {
	try {
		return await client.mutation(mutation, args);
	} catch (error) {
		if (isRateLimitError(error)) {
			toast.error(m['GenericMessages.TOO_MANY_REQUESTS']());
			return null;
		}
		throw error;
	}
}

/**
 * Execute a Convex action with automatic rate limit error handling
 *
 * Shows a toast notification when rate limited instead of throwing.
 *
 * Usage:
 * ```ts
 * const client = useConvexClient();
 * const result = await safeAction(client, api.myAction, { arg: 'value' });
 * ```
 */
export async function safeAction<Action extends FunctionReference<'action'>>(
	client: ConvexClient,
	action: Action,
	args: FunctionArgs<Action>
): Promise<FunctionReturnType<Action> | null> {
	try {
		return await client.action(action, args);
	} catch (error) {
		if (isRateLimitError(error)) {
			toast.error(m['GenericMessages.TOO_MANY_REQUESTS']());
			return null;
		}
		throw error;
	}
}
