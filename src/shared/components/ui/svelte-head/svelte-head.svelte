<script lang="ts">
	// SVELTEKIT IMPORTS
	import { page } from '$app/state';

	// CONFIG
	import { COMPANY_DATA } from '@/shared/constants.js';

	const pathname = $derived(page.url.pathname);

	const titleFromPath = $derived.by(() => {
		const segments = pathname.split('/').filter(Boolean);
		if (segments.length === 0) return 'Home';
		return segments[segments.length - 1]
			.replace(/[-_]+/g, ' ')
			.replace(/\b\w/g, (c) => c.toUpperCase());
	});

	const fullTitle = $derived(`${titleFromPath} | ${COMPANY_DATA.NAME}`);
	const description = $derived(
		`${titleFromPath} page on ${COMPANY_DATA.NAME}. ${COMPANY_DATA.DESCRIPTION}`
	);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
</svelte:head>
