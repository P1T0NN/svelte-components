<script lang="ts">
	// SVELTEKIT IMPORTS
	import { goto } from '$app/navigation';

	// LIBRARIES
	import { authClient } from '@/features/auth/lib/auth-client';
	import { localizeHref } from '@/lib/paraglide/runtime';

	// CONFIG
	import { UNPROTECTED_PAGE_ENDPOINTS } from '@/config/pageEndpoints';

	// COMPONENTS
	import Button from '@/components/ui/button/button.svelte';
	import Spinner from '@/components/ui/spinner/spinner.svelte';
	import { toast } from 'svelte-sonner';

	// LUCIDE ICONS
	import LogOutIcon from '@lucide/svelte/icons/log-out';

	let isLoggingOut = $state(false);

	const handleLogout = async () => {
		isLoggingOut = true;

		const result = await authClient.signOut();

		if (result.error) {
			console.error('Sign out error:', result.error);
			toast.error(result.error.message as string);
		} else {
			toast.success('Logged out successfully.');
			goto(localizeHref(UNPROTECTED_PAGE_ENDPOINTS.LOGIN));
		}

		isLoggingOut = false;
	};
</script>

<Button variant="outline" onclick={handleLogout} disabled={isLoggingOut}>
	{#if isLoggingOut}
		<Spinner />
	{:else}
		<LogOutIcon class="h-5 w-5" />
	{/if}

	<span>Logout</span>
</Button>
