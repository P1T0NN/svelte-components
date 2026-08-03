// Colour-theme state. Replaces `mode-watcher`, whose `<ModeWatcher />` renders an inline
// `<script>` with no nonce — under this project's CSP (`csp.mode: 'auto'` in
// svelte.config.js, which puts a nonce on script-src) the browser blocks it on every page.
// A nonce can't be threaded into a third-party component: SvelteKit mints its own per
// response and exposes it only as `%sveltekit.nonce%` in `app.html`. So the first-paint
// script lives there, and this module owns everything after hydration.
//
// Same public API as the library it replaces (`mode.current`, `setMode`, `resetMode`,
// `toggleMode`) and the same storage key, so existing users keep their saved preference.

// LIBRARIES
import { browser } from '$app/environment';

/** Unchanged from `mode-watcher` so a saved preference survives the swap. */
export const THEME_STORAGE_KEY = 'mode-watcher-mode';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/** What the user chose. `'system'` defers to the OS and is the default. */
export type ThemePreference = 'light' | 'dark' | 'system';
/** What is actually rendered, after `'system'` is resolved. */
export type ResolvedTheme = 'light' | 'dark';

function readPreference(): ThemePreference {
	if (!browser) return 'system';
	try {
		const stored = localStorage.getItem(THEME_STORAGE_KEY);
		return stored === 'light' || stored === 'dark' ? stored : 'system';
	} catch {
		// Private mode / blocked storage. Fall back to the OS rather than failing to boot.
		return 'system';
	}
}

let preference = $state<ThemePreference>(readPreference());
let systemDark = $state(browser ? window.matchMedia(DARK_QUERY).matches : false);

/**
 * Reactive theme. `current` is the resolved `'light' | 'dark'`; `preference` is the raw
 * choice including `'system'`, for a UI that wants to show which option is active.
 */
export const mode = {
	get current(): ResolvedTheme {
		return preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;
	},
	get preference(): ThemePreference {
		return preference;
	}
};

/**
 * Writes the resolved theme to the document. Mirrors what the `app.html` script does before
 * first paint, so the two never disagree — `colorScheme` included, which is what makes
 * native form controls and scrollbars follow the theme.
 */
function apply(resolved: ResolvedTheme): void {
	if (!browser) return;
	document.documentElement.classList.toggle('dark', resolved === 'dark');
	document.documentElement.style.colorScheme = resolved;
}

export function setMode(next: ThemePreference): void {
	preference = next;
	if (!browser) return;
	try {
		if (next === 'system') localStorage.removeItem(THEME_STORAGE_KEY);
		else localStorage.setItem(THEME_STORAGE_KEY, next);
	} catch {
		// Preference won't persist across reloads; the current page still switches.
	}
	apply(mode.current);
}

/** Back to following the OS. */
export function resetMode(): void {
	setMode('system');
}

/** Flip to the opposite of what is on screen right now, pinning it explicitly. */
export function toggleMode(): void {
	setMode(mode.current === 'dark' ? 'light' : 'dark');
}

if (browser) {
	// The OS theme can change while the tab is open. Only follow it while the user is on
	// `'system'` — an explicit choice must not be overridden.
	window.matchMedia(DARK_QUERY).addEventListener('change', (event) => {
		systemDark = event.matches;
		if (preference === 'system') apply(mode.current);
	});
}
