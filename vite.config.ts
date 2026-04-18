import { paraglideVitePlugin } from '@inlang/paraglide-js'
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	// layerchart → @dagrejs/dagre ships ESM-only; if left external, Node SSR loads
	// dagre.esm.js as CJS and throws "Unexpected token 'export'".
	ssr: {
		noExternal: ['layerchart', '@dagrejs/dagre']
	},
    plugins: [
        paraglideVitePlugin({ 
			project: './project.inlang', 
			outdir: './src/shared/lib/paraglide',
            strategy: ['url', 'baseLocale'],
            disableAsyncLocalStorage: true,
			// Every locale is prefixed (including base): /en/..., /de/... — no unprefixed URLs
			urlPatterns: [
				{
					pattern: ':protocol://:domain(.*)::port?/:path(.*)?',
					localized: [
						['en', ':protocol://:domain(.*)::port?/en/:path(.*)?'],
						['de', ':protocol://:domain(.*)::port?/de/:path(.*)?']
					]
				}
			]
		}),
        tailwindcss(), 
        sveltekit()
    ] 
});
