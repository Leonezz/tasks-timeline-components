import type { KeyboardEvent } from "react";

/** Radix wraps each popover (a date picker's calendar) it portals in this. */
const POPOVER = "[data-radix-popper-content-wrapper]";

/** Whether Tab can move focus to the element: focusable, enabled and shown. */
const isTabbable = (element: HTMLElement): boolean =>
  element.tabIndex >= 0 &&
  !element.hasAttribute("disabled") &&
  !(element instanceof HTMLInputElement && element.type === "hidden") &&
  element.getClientRects().length > 0 &&
  getComputedStyle(element).visibility !== "hidden";

/**
 * Where Tab loops: the popover holding the focused element when the dialog
 * opened one, which Radix portals outside the dialog, or else the dialog.
 */
function loopScope(dialog: HTMLElement, focused: Element | null): HTMLElement {
  const popover = focused?.closest<HTMLElement>(POPOVER);
  return popover && !popover.contains(dialog) ? popover : dialog;
}

/**
 * Keeps Tab and Shift+Tab inside a dialog rendered in a shadow root, as the
 * Obsidian plugin renders the app, and inside a popover open over it. Radix's
 * focus loops read `document.activeElement`, which is the shadow host there,
 * so they never see focus on the first or last control and let Tab leave for
 * the host page. Outside a shadow root Radix's loops work and this does
 * nothing.
 */
export function keepTabInShadowRoot(event: KeyboardEvent<HTMLElement>): void {
  if (
    event.defaultPrevented ||
    event.key !== "Tab" ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey
  ) {
    return;
  }
  const dialog = event.currentTarget;
  const root = dialog.getRootNode();
  if (!(root instanceof ShadowRoot)) {
    return;
  }
  const focused = root.activeElement;
  const scope = loopScope(dialog, focused);
  const tabbable = Array.from(scope.querySelectorAll<HTMLElement>("*")).filter(
    isTabbable,
  );
  const first = tabbable[0];
  const last = tabbable[tabbable.length - 1];
  if (!first || !last) {
    // Nothing to move to: keep focus where it is
    event.preventDefault();
    return;
  }
  // Radix focuses the dialog or popover itself when it opens in a shadow
  // root; Shift+Tab from there, as from the first control, wraps to the last
  if (event.shiftKey && focused?.contains(first)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && focused === last) {
    event.preventDefault();
    first.focus();
  }
}
