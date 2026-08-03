<script lang="ts">
	// LIBRARIES
	import { localizeHref } from '@/lib/paraglide/runtime';

	// CONFIG
	import { UNPROTECTED_PAGE_ENDPOINTS } from '@/config/pageEndpoints';

	// COMPONENTS
	import Button from '@/components/ui/button/button.svelte';
</script>

<Button variant="outline" href={localizeHref(UNPROTECTED_PAGE_ENDPOINTS.LOGIN)}>Login</Button>
