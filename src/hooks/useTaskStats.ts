import { useMemo } from "react";
import type { Task } from "../types";

export const useTaskStats = (tasks: Task[]) => {
  return useMemo(() => {
    return tasks.reduce(
      (acc, t) => {
        if (t.status === "done") {
          // We aren't displaying Done count in top bar anymore, but keeping logic
        } else if (t.status === "cancelled") {
          // Ignored in active counts
        } else {
          // Active buckets
          if (t.status === "todo") acc.todo++;
          if (t.status === "unplanned") acc.unplanned++;

          if (t.status === "scheduled") acc.scheduled++;
          if (t.status === "doing") acc.doing++;

          // "Due & Overdue" bucket
          if (t.status === "overdue" || t.status === "due") {
            acc.urgent++;
          }
        }
        return acc;
      },
      { todo: 0, unplanned: 0, urgent: 0, scheduled: 0, doing: 0 }
    );
  }, [tasks]);
};
