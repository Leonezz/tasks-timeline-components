/** The calendar day Tab reaches: its grid's one roving tab stop. */
const CALENDAR_TAB_STOP =
  '[data-slot="calendar"] [role="gridcell"][tabindex="0"]';

/**
 * A Radix popover's `onOpenAutoFocus` for a Calendar inside it: focuses the
 * day Tab reaches (the selected day, else today, else the 1st), as the
 * WAI-ARIA date picker dialog pattern does. Radix would focus the popover's
 * first control, or in a shadow root the popover itself. The Calendar's own
 * `initialFocus` can't do this in a popover: it runs before the popover's
 * focus scope takes over, and a dialog's focus trap, such as the task
 * editor's, sends focus straight back to the date field.
 */
export function focusCalendarOnOpen(event: Event): void {
  const popover = event.currentTarget;
  const day =
    popover instanceof HTMLElement
      ? popover.querySelector<HTMLElement>(CALENDAR_TAB_STOP)
      : null;
  if (!day) {
    // Radix then focuses the popover's first control
    throw new Error("focusCalendarOnOpen: the popover has no Calendar");
  }
  event.preventDefault();
  day.focus({ preventScroll: true });
}
