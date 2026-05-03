<script lang="ts">
	// CLASSES
	import { authClass } from '@/features/auth/classes/authClass.svelte';
</script>

<div>You can see me because you are logged in</div>
<p>Hello {authClass.currentUser?.name ?? ''}</p>
