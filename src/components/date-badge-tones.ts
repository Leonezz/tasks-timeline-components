/**
 * Colours of the task row's date badges (DateBadge's className), by what the
 * date says. Each uses theme tokens, and its text meets WCAG AA (4.5:1) on its
 * badge in every theme; the DateBadge stories check this.
 */

const SUCCESS = "border-emerald-100 bg-emerald-50/80 text-emerald-700";

export const DATE_BADGE_TONES = {
  /** A due date that has passed */
  overdue: "border-rose-100 bg-rose-50/90 text-rose-700",
  /** A due date today or tomorrow */
  due: "border-amber-100 bg-amber-50/90 text-amber-800",
  /** A later due date, or a finished task's */
  onTrack: SUCCESS,
  /** The completion date */
  completed: SUCCESS,
  /** The start date */
  start:
    "border-transparent bg-slate-50/70 text-slate-500 hover:border-slate-200 hover:bg-white",
  /** The creation date, without a background until hovered */
  created:
    "border-transparent bg-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50",
} as const;
