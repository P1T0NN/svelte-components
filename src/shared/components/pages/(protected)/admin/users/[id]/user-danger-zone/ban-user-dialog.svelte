<script lang="ts">
	// LIBRARIES
	import { api } from '@/convex/_generated/api';
	import { useConvexClient } from 'convex-svelte';
	import { m } from '@/shared/lib/paraglide/messages';

	// COMPONENTS
	import ActionButton from '@/shared/components/ui/action-button/action-button.svelte';
	import { Input } from '@/shared/components/ui/input/index.js';
	import { NativeSelect } from '@/shared/components/ui/select/index.js';

	// UTILS
	import { safeMutation } from '@/shared/utils/convexHelpers';
	import { toastResult } from '@/shared/utils/toastResult';

	/**
	 * Self-contained "Ban…" affordance: renders its own destructive trigger
	 * button, opens a confirm dialog with a reason input + expiry select via
	 * `ActionButton`'s `body` slot, and calls the `banUser` Convex mutation on
	 * confirm. Parent just drops `<BanUserDialog userId={…} userEmail={…} />`
	 * into the danger zone — no `bind:open` plumbing.
	 *
	 * The mutation owns the auth update + audit row atomically; this dialog is
	 * auth-provider-agnostic.
	 */
	let { userId, userEmail }: { userId: string; userEmail: string } = $props();

	const convex = useConvexClient();

	let reason = $state('');
	/** Seconds-from-now until ban lifts. Empty string = permanent. */
	let expiresIn = $state<string>('');
	let isPending = $state(false);

	async function confirm() {
		isPending = true;
		try {
			const expiresInSec = expiresIn === '' ? undefined : Number(expiresIn);
			const result = await safeMutation(
				convex,
				api.tables.users.userMutations.banUser,
				{
					userId,
					...(reason && { banReason: reason }),
					...(expiresInSec !== undefined && { banExpiresIn: expiresInSec })
				}
			);
			if (!toastResult(result)) return;

			reason = '';
			expiresIn = '';
		} finally {
			isPending = false;
		}
	}
</script>

{#snippet banForm()}
	<div class="flex flex-col gap-3">
		<label class="flex flex-col gap-1 text-sm">
			<span>{m['AdminUserPage.BanUserDialog.reason']()}</span>
			<Input
				bind:value={reason}
				placeholder={m['AdminUserPage.BanUserDialog.reasonPlaceholder']()}
				disabled={isPending}
			/>
		</label>

		<label class="flex flex-col gap-1 text-sm">
			<span>{m['AdminUserPage.BanUserDialog.expires']()}</span>
			<NativeSelect
				bind:value={expiresIn}
				disabled={isPending}
				options={[
					{ value: '', label: m['AdminUserPage.BanUserDialog.permanent']() },
					{ value: '86400', label: m['AdminUserPage.BanUserDialog.oneDay']() },
					{ value: '604800', label: m['AdminUserPage.BanUserDialog.sevenDays']() },
					{ value: '2592000', label: m['AdminUserPage.BanUserDialog.thirtyDays']() }
				]}
			/>
		</label>
	</div>
{/snippet}

<ActionButton
	function={confirm}
	variant="destructive"
	{isPending}
	title={m['AdminUserPage.BanUserDialog.title']({ email: userEmail })}
	description={m['AdminUserPage.BanUserDialog.description']()}
	body={banForm}
>
	{m['AdminUserPage.BanUserDialog.ban']()}
</ActionButton>
