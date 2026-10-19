import { useMemo } from "react";
import type { DateGroupBy, Task } from "../types";
import {
  countDashboardCards,
  type DashboardCardCounts,
} from "../utils/dashboard";
import { getTodayISO } from "../utils/date-helpers";
import { partitionTimeline } from "../utils/timeline";

interface DashboardCardScope {
  /** In focus mode only Today is listed, so only Today is counted. */
  isFocusMode: boolean;
  groupingStrategy: DateGroupBy[];
}

/**
 * Stat card numbers over `baseTasks` (every filter applied except the status
 * dimension), limited to what the list can show: Today in focus mode, all
 * of it otherwise. Selecting a card lists exactly its number of tasks.
 */
export const useDashboardCards = (
  baseTasks: Task[],
  { isFocusMode, groupingStrategy }: DashboardCardScope,
): DashboardCardCounts =>
  useMemo(() => {
    if (!isFocusMode) {
      return countDashboardCards(baseTasks);
    }
    const { todayGroup } = partitionTimeline(baseTasks, {
      groupingStrategy,
      // Finished tasks belong to no card, so hiding them changes nothing
      showCompleted: true,
      today: getTodayISO(),
    });
    return countDashboardCards(todayGroup.tasks);
  }, [baseTasks, isFocusMode, groupingStrategy]);
