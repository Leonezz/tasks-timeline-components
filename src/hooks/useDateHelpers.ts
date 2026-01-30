/**
 * React hook for safe date operations
 *
 * Provides timezone-safe date utilities within React components.
 * Memoized to prevent unnecessary recalculations on every render.
 *
 * @module useDateHelpers
 */

import { useMemo } from "react";
import { DateTime } from "luxon";

interface DateHelpers {
  /** Current date in ISO format (YYYY-MM-DD) - updates daily */
  today: string;
  /** Current datetime as full ISO timestamp - updates on mount */
  now: string;
  /** Tomorrow's date in ISO format (YYYY-MM-DD) */
  tomorrow: string;
  /** Yesterday's date in ISO format (YYYY-MM-DD) */
  yesterday: string;
  /** Check if a date string is today */
  isToday: (dateStr: string) => boolean;
  /** Get date N days from now */
  daysFromNow: (days: number) => string;
}

/**
 * Hook providing timezone-safe date utilities
 *
 * **Important:** The `today` value is computed on mount and won't update
 * if the component stays mounted past midnight. For most use cases this is fine.
 * For cases requiring real-time date updates, use `getTodayISO()` directly.
 *
 * @returns {DateHelpers} Object with date helper functions and values
 *
 * @example
 * ```tsx
 * function TaskList() {
 *   const { today, isToday, tomorrow } = useDateHelpers();
 *
 *   const isUrgent = task.dueAt && task.dueAt <= today;
 *   const isDueToday = isToday(task.dueAt);
 *   const defaultDueDate = tomorrow;
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export const useDateHelpers = (): DateHelpers => {
  return useMemo(() => {
    const todayDt = DateTime.now();

    return {
      today: todayDt.toISODate() || "",
      now: todayDt.toISO() || "",
      tomorrow: todayDt.plus({ days: 1 }).toISODate() || "",
      yesterday: todayDt.minus({ days: 1 }).toISODate() || "",

      isToday: (dateStr: string): boolean => {
        const dt = DateTime.fromISO(dateStr);
        if (!dt.isValid) return false;
        return dt.hasSame(todayDt, "day");
      },

      daysFromNow: (days: number): string => {
        return todayDt.plus({ days }).toISODate() || "";
      },
    };
  }, []); // Empty deps - values computed once on mount
};
