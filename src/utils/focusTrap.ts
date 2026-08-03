// Universal focus trap for modal-ish panels (popover, dialog, custom overlay).
// The one thing CSS can't do: move focus in on open, keep Tab inside, restore it on close.
//
//   const release = trapFocus(panel); // on open
//   release();                         // on close (restores focus to the opener)

const FOCUSABLE =
	'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Trap focus inside `container`. Returns a function that releases the trap and restores focus. */
export function trapFocus(container: HTMLElement): () => void {
	const focusables = () =>
		[...container.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
			(el) => el.offsetParent !== null || el === document.activeElement
		);

	function onKeydown(event: KeyboardEvent) {
		if (event.key !== 'Tab') return;
		const items = focusables();
		if (items.length === 0) {
			event.preventDefault();
			container.focus();
			return;
		}
		const first = items[0];
		const last = items[items.length - 1];
		const active = document.activeElement;
		if (event.shiftKey && (active === first || active === container)) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && active === last) {
			event.preventDefault();
			first.focus();
		}
	}

	const previouslyFocused = document.activeElement as HTMLElement | null;
	(focusables()[0] ?? container).focus();
	container.addEventListener('keydown', onKeydown);

	return () => {
		container.removeEventListener('keydown', onKeydown);
		previouslyFocused?.focus();
	};
}
