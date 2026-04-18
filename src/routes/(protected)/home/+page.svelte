<script lang="ts">
	// CLASSES
	import { usersClass } from '@/features/users/classes/users-class.svelte';
</script>

<div>You can see me because you are logged in</div>
<p>You have {usersClass.currentUser?.credits} credits</p>