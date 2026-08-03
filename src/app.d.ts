// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			token: string | undefined;
		}
		interface PageData {
			/** Shown in app shells (e.g. `SiteHeader`) when set by a route `load`. */
			pageTitle?: string;
		}
		// interface PageState {}
		// interface Platform {}
	}

	interface ImportMeta {
		/** Bun: true when this module is the process entrypoint. Guards co-located self-checks. */
		readonly main?: boolean;
	}
}

export {};
