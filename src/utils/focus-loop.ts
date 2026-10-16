import type { KeyboardEvent } from "react";

/** Whether Tab can move focus to the element: focusable, enabled and shown. */
const isTabbable = (element: HTMLElement): boolean =>
  element.tabIndex >= 0 &&
  !element.hasAttribute("disabled") &&
  !(element instanceof HTMLInputElement && element.type === "hidden") &&
  element.getClientRects().length > 0 &&
  getComputedStyle(element).visibility !== "hidden";

/**
 * Keeps Tab and Shift+Tab inside a dialog rendered in a shadow root, as the
 * Obsidian plugin renders the app. Radix's focus trap reads
 * `document.activeElement`, which is the shadow host there, so it never sees
 * focus on the first or last control and lets Tab leave the dialog. Outside a
 * shadow root Radix's trap works and this does nothing.
 */
export function keepTabInShadowRoot(event: KeyboardEvent<HTMLElement>): void {
  if (event.key !== "Tab" || event.altKey || event.ctrlKey || event.metaKey) {
    return;
  }
  const container = event.currentTarget;
  const root = container.getRootNode();
  if (!(root instanceof ShadowRoot)) {
    return;
  }
  const tabbable = Array.from(
    container.querySelectorAll<HTMLElement>("*"),
  ).filter(isTabbable);
  const first = tabbable[0];
  const last = tabbable[tabbable.length - 1];
  if (!first || !last) {
    // Nothing to move to: keep focus on the dialog
    event.preventDefault();
    return;
  }
  const focused = root.activeElement;
  // The dialog itself has focus when it opens in a shadow root
  if (event.shiftKey && (focused === first || focused === container)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && focused === last) {
    event.preventDefault();
    first.focus();
  }
}
