import { DateTime } from "luxon";
import type { Task, YearGroup, DayGroup, TaskStatus, DateGroupBy } from "../types";

const safeDate = (dateStr: string): DateTime => {
  if (!dateStr) return DateTime.invalid("No date");
  const dt = DateTime.fromISO(dateStr);
  return dt.isValid ? dt : DateTime.invalid("Invalid ISO");
};

export const deriveTaskStatus = (task: Task): TaskStatus => {
  // 1. If explicitly Done or Cancelled, preserve status
  if (task.status === "done" || task.status === "cancelled") {
    return task.status;
  }

  const now = DateTime.now();
  const today = now.toISODate() || "";
  const tomorrow = now.plus({ days: 1 }).toISODate();

  // 2. Overdue: Due date is strictly in the past
  if (task.dueAt && task.dueAt < today) {
    return "overdue";
  }

  // 3. Due: Due date is Today or Tomorrow
  if (task.dueAt && (task.dueAt === today || task.dueAt === tomorrow)) {
    return "due";
  }

  // 4. Scheduled vs Doing checks on Start Date
  if (task.startAt) {
    const startDt = DateTime.fromISO(task.startAt);
    if (startDt.isValid) {
      // If start time is in the future relative to now
      if (startDt > now) {
        return "scheduled";
      }
      // If start time is past or now, it is doing (unless captured by due/overdue above)
      return "doing";
    }
  }

  // 6. Fallbacks: If manual status was set to a state that is no longer valid based on dates, reset to todo
  // e.g. was 'doing' but user cleared start date
  if (["due", "overdue", "scheduled", "doing"].includes(task.status)) {
    return "todo";
  }

  return task.status;
};

export const groupTasksByYearAndDate = (
  tasks: Task[],
  strategies: DateGroupBy[] = ["dueAt"]
): YearGroup[] => {
  const groups: Record<number, Record<string, Task[]>> = {};
  const allPossibleDateFields: DateGroupBy[] = [
    "dueAt",
    "startAt",
    "createdAt",
    "completedAt",
  ];

  tasks.forEach((task) => {
    const datesToUse: string[] = [];

    // Try active strategies
    strategies.forEach((strategy) => {
      const val = task[strategy];
      if (val && safeDate(val).isValid) datesToUse.push(val);
    });

    // Fallback
    if (datesToUse.length === 0) {
      for (const field of allPossibleDateFields) {
        const val = task[field];
        if (val && safeDate(val).isValid) {
          datesToUse.push(val);
          break;
        }
      }
    }

    datesToUse.forEach((dateKey) => {
      const dt = safeDate(dateKey);
      const year = dt.year;
      const dayStr = dt.toISODate();
      if (!dayStr) return;

      if (!groups[year]) groups[year] = {};
      if (!groups[year][dayStr]) groups[year][dayStr] = [];

      if (!groups[year][dayStr].includes(task)) {
        groups[year][dayStr].push(task);
      }
    });
  });

  const sortedYears = Object.keys(groups)
    .map(Number)
    .sort((a, b) => b - a);

  return sortedYears.map((year) => {
    const yearTasks = groups[year];
    const sortedDays = Object.keys(yearTasks).sort((a, b) =>
      b.localeCompare(a)
    );

    const dayGroups: DayGroup[] = sortedDays.map((date) => ({
      date,
      tasks: yearTasks[date],
    }));

    const allTasksInYear = Object.values(yearTasks).flat();
    const completed = allTasksInYear.filter(
      (t) => t.status === "done" || t.status === "cancelled"
    ).length;

    return {
      year,
      dayGroups,
      totalTasks: allTasksInYear.length,
      completedTasks: completed,
    };
  });
};
