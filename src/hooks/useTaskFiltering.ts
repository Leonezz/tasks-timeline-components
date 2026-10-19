import { useMemo } from "react";
import type {
  FilterRule,
  FilterState,
  Priority,
  SortState,
  Task,
  TaskStatus,
} from "../types";
import { filterByDashboardCard, type DashboardCard } from "../utils/dashboard";
import { logger } from "../utils/logger";
import { compileSafeExpression } from "../utils/safe-expression";
import { taskMatchesStatus } from "../utils/task";

/** Extract unique tags and categories from a task list. */
export function deriveFilterOptions(tasks: Task[]) {
  const tags = new Set<string>(),
    cats = new Set<string>();
  tasks.forEach((t) => {
    t.tags.forEach((tag) => tags.add(tag.name));
    if (t.category) {
      cats.add(t.category);
    }
  });
  return {
    uniqueTags: Array.from(tags),
    uniqueCategories: Array.from(cats),
  };
}

/**
 * Applies every filter except the status rule: tags, categories, priorities
 * and the script filter. The stat cards count over this set, so they follow
 * the other filters while staying independent of the status selection.
 */
export function filterTasksExceptStatus(
  tasks: Task[],
  filters: FilterState,
): Task[] {
  let result = [...tasks];

  // Tags: include/exclude
  if (filters.tags.include.length > 0) {
    result = result.filter((t) =>
      t.tags.some((tag) => filters.tags.include.includes(tag.name)),
    );
  }
  if (filters.tags.exclude.length > 0) {
    result = result.filter(
      (t) => !t.tags.some((tag) => filters.tags.exclude.includes(tag.name)),
    );
  }

  // Categories: include/exclude
  if (filters.categories.include.length > 0) {
    result = result.filter(
      (t) => t.category && filters.categories.include.includes(t.category),
    );
  }
  if (filters.categories.exclude.length > 0) {
    result = result.filter(
      (t) => !t.category || !filters.categories.exclude.includes(t.category),
    );
  }

  // Priorities: include/exclude
  if (filters.priorities.include.length > 0) {
    result = result.filter((t) =>
      filters.priorities.include.includes(t.priority),
    );
  }
  if (filters.priorities.exclude.length > 0) {
    result = result.filter(
      (t) => !filters.priorities.exclude.includes(t.priority),
    );
  }

  // Script Filtering
  if (filters.enableScript && filters.script.trim()) {
    try {
      const expression = compileSafeExpression(filters.script);
      result = result.filter((t) => {
        try {
          return Boolean(expression({ task: t }));
        } catch (e) {
          logger.error(
            "TaskFiltering",
            "Custom filter script execution failed",
            e,
          );
          return false;
        }
      });
    } catch (e) {
      logger.error("TaskFiltering", "Custom filter script parsing failed", e);
    }
  }

  return result;
}

/** Applies only a status include/exclude rule. */
export function filterByStatusRule(
  tasks: Task[],
  rule: FilterRule<TaskStatus>,
): Task[] {
  let result = tasks;
  if (rule.include.length > 0) {
    result = result.filter((t) =>
      rule.include.some((status) => taskMatchesStatus(t, status)),
    );
  }
  if (rule.exclude.length > 0) {
    result = result.filter(
      (t) => !rule.exclude.some((status) => taskMatchesStatus(t, status)),
    );
  }
  return result;
}

/** Apply include/exclude filters and optional script filter to a task list. */
export function filterTasks(tasks: Task[], filters: FilterState): Task[] {
  return filterByStatusRule(
    filterTasksExceptStatus(tasks, filters),
    filters.statuses,
  );
}

const NO_STATUS_RULE: FilterRule<TaskStatus> = { include: [], exclude: [] };

/** Whether a filter state narrows by status. */
export const hasStatusRule = (filters: FilterState): boolean =>
  filters.statuses.include.length > 0 || filters.statuses.exclude.length > 0;

/** Sort a task list by the given sort state. */
export function sortTasks(tasks: Task[], sort: SortState): Task[] {
  const result = [...tasks];
  let customSortExpression:
    | ((
        scope: Record<string, unknown>,
      ) => string | number | boolean | null | undefined)
    | null = null;

  if (sort.field === "custom" && sort.script.trim()) {
    try {
      customSortExpression = compileSafeExpression(sort.script);
    } catch (e) {
      logger.error("TaskFiltering", "Custom sort script parsing failed", e);
    }
  }

  result.sort((a, b) => {
    if (sort.field === "custom") {
      if (!customSortExpression) {
        return 0;
      }
      try {
        const res = customSortExpression({ a, b });
        return typeof res === "number" ? res : 0;
      } catch (e) {
        logger.error("TaskFiltering", "Custom sort script failed", e);
        return 0;
      }
    }

    type SortValue = string | number | boolean | null | undefined;
    let valA: SortValue = a[sort.field as keyof Task] as SortValue,
      valB: SortValue = b[sort.field as keyof Task] as SortValue;

    if (sort.field === "priority") {
      const pMap: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
      valA = pMap[a.priority];
      valB = pMap[b.priority];
    }

    if (valA === undefined || valA === null) {
      valA = "";
    }
    if (valB === undefined || valB === null) {
      valB = "";
    }

    if (valA < valB) {
      return sort.direction === "asc" ? -1 : 1;
    }
    if (valA > valB) {
      return sort.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  return result;
}

/**
 * Filters and sorts tasks. `baseTasks` has every filter applied except the
 * status dimension; the visible list then narrows it by the selected stat
 * card or, when no card is selected, by the status rule.
 */
export const useTaskFiltering = (
  tasks: Task[],
  filters: FilterState,
  sort: SortState,
  dashboardCard: DashboardCard | null = null,
) => {
  const { uniqueTags, uniqueCategories } = useMemo(
    () => deriveFilterOptions(tasks),
    [tasks],
  );
  // Only the non-status filters: a status or card change reuses this list
  const { tags, categories, priorities, enableScript, script } = filters;
  const baseTasks = useMemo(
    () =>
      filterTasksExceptStatus(tasks, {
        tags,
        categories,
        priorities,
        statuses: NO_STATUS_RULE,
        enableScript,
        script,
      }),
    [tasks, tags, categories, priorities, enableScript, script],
  );
  const { statuses } = filters;
  const processedTasks = useMemo(() => {
    const narrowed = dashboardCard
      ? filterByDashboardCard(baseTasks, dashboardCard)
      : filterByStatusRule(baseTasks, statuses);
    return sortTasks(narrowed, sort);
  }, [baseTasks, dashboardCard, statuses, sort]);

  return { processedTasks, baseTasks, uniqueTags, uniqueCategories };
};
