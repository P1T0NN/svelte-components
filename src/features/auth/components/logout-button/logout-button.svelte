<script lang="ts">
	// LIBRARIES
	import { m } from '@/shared/lib/paraglide/messages';
	import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';

	// COMPONENTS
	import Button from '@/shared/components/ui/button/button.svelte';
	import Spinner from '@/shared/components/ui/spinner/spinner.svelte';

	// LUCIDE ICONS
	import LogOutIcon from '@lucide/svelte/icons/log-out';

	// Call useAuth once
	const auth = useAuth();
	const { signOut } = auth;

	let isLoggingOut = $state(false);

	const handleLogout = async () => {
		isLoggingOut = true;
		await signOut();
		isLoggingOut = false;
	};
</script>

<Button
	variant="outline"
	onclick={handleLogout}
	disabled={isLoggingOut}
>
	{#if isLoggingOut}
		<Spinner />
	{:else}
		<LogOutIcon class="h-5 w-5" />
	{/if}

	<span>{m['LogoutButton.logout']()}</span>
</Button>

