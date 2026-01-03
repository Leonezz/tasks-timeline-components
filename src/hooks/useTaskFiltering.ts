import { useMemo } from "react";
import type { Task, FilterState, SortState, Priority } from "../types";

export const useTaskFiltering = (
  tasks: Task[],
  filters: FilterState,
  sort: SortState
) => {
  // Derived Options for Filters
  const { uniqueTags, uniqueCategories } = useMemo(() => {
    const tags = new Set<string>();
    const cats = new Set<string>();
    tasks.forEach((t) => {
      t.tags.forEach((tag) => tags.add(tag.name));
      if (t.category) cats.add(t.category);
    });
    return {
      uniqueTags: Array.from(tags),
      uniqueCategories: Array.from(cats),
    };
  }, [tasks]);

  // Filter and Sort Logic
  const processedTasks = useMemo(() => {
    let result = [...tasks];

    // 1. Standard Filtering
    if (filters.tags.length > 0) {
      result = result.filter((t) =>
        t.tags.some((tag) => filters.tags.includes(tag.name))
      );
    }
    if (filters.categories.length > 0) {
      result = result.filter(
        (t) => t.category && filters.categories.includes(t.category)
      );
    }
    if (filters.priorities.length > 0) {
      result = result.filter((t) => filters.priorities.includes(t.priority));
    }
    if (filters.statuses.length > 0) {
      result = result.filter((t) => filters.statuses.includes(t.status));
    }

    // 2. Script Filtering
    if (filters.enableScript && filters.script.trim()) {
      try {
        const filterFn = new Function("task", filters.script);
        result = result.filter((t) => {
          try {
            return Boolean(filterFn(t));
          } catch (e) {
            console.error(`run custom filter script failed with err: ${e}`);
          }
        });
      } catch (e) {
        console.error(`make or run custom filter script failed with err: ${e}`);
      }
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sort.field === "custom") {
        if (!sort.script.trim()) return 0;
        try {
          const sortFn = new Function("a", "b", sort.script);
          const res = sortFn(a, b);
          return typeof res === "number" ? res : 0;
        } catch (e) {
          console.error(`make or run custom sort script failed with err: ${e}`);
          return 0;
        }
      }

      type SortValue = string | number | boolean | null | undefined;
      let valA: SortValue = a[sort.field as keyof Task] as SortValue;
      let valB: SortValue = b[sort.field as keyof Task] as SortValue;

      if (sort.field === "priority") {
        const pMap: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
        valA = pMap[a.priority];
        valB = pMap[b.priority];
      }

      if (valA === undefined || valA === null) valA = "";
      if (valB === undefined || valB === null) valB = "";

      if (valA < valB) return sort.direction === "asc" ? -1 : 1;
      if (valA > valB) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [tasks, filters, sort]);

  return { processedTasks, uniqueTags, uniqueCategories };
};
