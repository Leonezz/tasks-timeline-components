import { DateTime } from "luxon";
import type { DateGroupBy, DayGroup, Task, YearGroup } from "../types";
import {
  groupTasksByYearAndDate,
  isTaskFinished,
  summarizeDayGroups,
} from "./task";

export interface TimelinePartitionOptions {
  groupingStrategy: DateGroupBy[];
  showCompleted: boolean;
  /** Today's local date (YYYY-MM-DD). */
  today: string;
}

export interface TimelinePartition {
  /** Today's tasks, shown under "Current Focus" (also in focus mode). */
  todayGroup: DayGroup;
  /** The other dated tasks; each year's totals cover only its own days. */
  yearGroups: YearGroup[];
  /** Tasks without any valid date ("Backlog / Undated"). */
  backlogTasks: Task[];
}

const DATE_FIELDS: readonly DateGroupBy[] = [
  "dueAt",
  "startAt",
  "createdAt",
  "completedAt",
];

const hasAnyValidDate = (task: Task): boolean =>
  DATE_FIELDS.some((field) => {
    const value = task[field];
    return Boolean(value) && DateTime.fromISO(value as string).isValid;
  });

/**
 * Splits tasks the way the timeline shows them: Today, the remaining days by
 * year, and the backlog. A task is backlog only when none of its date fields
 * holds a valid date.
 */
export const partitionTimeline = (
  tasks: readonly Task[],
  { groupingStrategy, showCompleted, today }: TimelinePartitionOptions,
): TimelinePartition => {
  const datedTasks: Task[] = [],
    backlogTasks: Task[] = [];
  for (const task of tasks) {
    if (!showCompleted && isTaskFinished(task)) {
      continue;
    }
    (hasAnyValidDate(task) ? datedTasks : backlogTasks).push(task);
  }
  const allGroups = groupTasksByYearAndDate(datedTasks, groupingStrategy);

  let todayGroup: DayGroup = { date: today, tasks: [] };
  const yearGroups: YearGroup[] = [];

  for (const yearGroup of allGroups) {
    const todayInYear = yearGroup.dayGroups.find((d) => d.date === today);
    if (!todayInYear) {
      yearGroups.push(yearGroup);
      continue;
    }
    todayGroup = todayInYear;
    const remainingDays = yearGroup.dayGroups.filter((d) => d.date !== today);
    if (remainingDays.length > 0) {
      yearGroups.push({
        ...yearGroup,
        dayGroups: remainingDays,
        ...summarizeDayGroups(remainingDays),
      });
    }
  }

  return { todayGroup, yearGroups, backlogTasks };
};

/** Days holding at least one unfinished task. */
export const countActiveDays = (dayGroups: readonly DayGroup[]): number =>
  dayGroups.filter((group) => group.tasks.some((task) => !isTaskFinished(task)))
    .length;
