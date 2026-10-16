/**
 * Where focus goes back to when a dialog without a trigger element closes:
 * the element that had focus when it opened or, if that has gone by then,
 * the control of the popup it was in. A task row's "Edit details" sits in
 * the row's status menu, which closes as the editor opens.
 */
export interface FocusReturn {
  opener: HTMLElement;
  popupTrigger: HTMLElement | null;
}

/** The element with focus, looking inside (open) shadow roots. */
function deepActiveElement(doc: Document): Element | null {
  let active = doc.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}

/** The control whose `aria-controls` names a popup holding `element`. */
function popupTriggerOf(element: HTMLElement): HTMLElement | null {
  // A document or shadow root: popups portal within the app's root
  const root = element.getRootNode() as Document | ShadowRoot;
  for (let node = element.parentElement; node; node = node.parentElement) {
    if (node.id) {
      const trigger = root.querySelector<HTMLElement>(
        `[aria-controls="${CSS.escape(node.id)}"]`,
      );
      if (trigger) {
        return trigger;
      }
    }
  }
  return null;
}

/**
 * Records where focus should return. Call it before the opening render
 * commits, while a closing popup's button still has focus. Null when nothing
 * has focus, and on the server.
 */
export function captureFocusReturn(): FocusReturn | null {
  if (typeof document === "undefined") {
    return null;
  }
  const opener = deepActiveElement(document);
  if (!(opener instanceof HTMLElement) || opener === document.body) {
    return null;
  }
  return { opener, popupTrigger: popupTriggerOf(opener) };
}

/** Focuses the opener, or its popup's control if the opener has gone. */
export function restoreFocus(target: FocusReturn | null): void {
  const element = [target?.opener, target?.popupTrigger].find(
    (candidate) => candidate?.isConnected,
  );
  element?.focus();
}
