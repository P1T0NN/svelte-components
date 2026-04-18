<script lang="ts">
	// LIBRARIES
	import { m } from '@/shared/lib/paraglide/messages';

	// CONFIG
	import { UNPROTECTED_PAGE_ENDPOINTS } from '@/shared/constants';

	// COMPONENTS
	import {
		FieldGroup,
		Field,
		FieldDescription,
	} from '@/shared/components/ui/field/index.js';
	import GoogleLoginButton from '@/shared/components/ui/google-login-button/google-login-button.svelte';
	import Link from '@/shared/components/ui/link/link.svelte';
	import { cn } from '@/shared/utils/utils.js';

	let { class: className = '' } = $props();
</script>

<div class={cn('flex flex-col gap-6', className)}>
	<FieldGroup>
		<div class="flex flex-col items-center gap-2 text-center">
			<h1 class="text-3xl font-bold text-balance text-foreground">{m['LoginPage.welcomeBack']()}</h1>
			<p class="text-sm text-balance text-muted-foreground">
				{m['LoginPage.signInToYourAccountToContinue']()}
			</p>
		</div>
        
		<Field>
			<GoogleLoginButton class="w-full" />
		</Field>

		<FieldDescription class="text-center text-xs text-muted-foreground">
			{m['LoginPage.byContinuingYouAgreeToOur']()}
			<Link
				href={UNPROTECTED_PAGE_ENDPOINTS.TERMS_OF_SERVICE}
				class="text-primary transition-colors hover:text-accent underline underline-offset-4"
			>
				{m['LoginPage.termsOfService']()}
			</Link>

			{m['LoginPage.and']()}
			
			<Link
				href={UNPROTECTED_PAGE_ENDPOINTS.TERMS_OF_SERVICE}
				class="text-primary transition-colors hover:text-accent underline underline-offset-4"
			>
				{m['LoginPage.privacyPolicy']()}
			</Link>
		</FieldDescription>
	</FieldGroup>
</div>
