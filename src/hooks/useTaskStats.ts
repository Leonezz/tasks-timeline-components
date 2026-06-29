import { useMemo } from "react";
import type { Task } from "../types";
import { deriveTaskRenderState } from "../utils/task";

export const useTaskStats = (tasks: Task[]) =>
  useMemo(
    () =>
      tasks.reduce(
        (acc, t) => {
          const renderState = deriveTaskRenderState(t);
          if (renderState.workflowStatus === "done") {
            // We aren't displaying Done count in top bar anymore, but keeping logic
          } else if (renderState.workflowStatus === "cancelled") {
            // Ignored in active counts
          } else if (renderState.isUrgent) {
            acc.urgent++;
          } else if (renderState.workflowStatus === "doing") {
            acc.doing++;
          } else if (renderState.planningStatus === "scheduled") {
            acc.scheduled++;
          } else if (renderState.planningStatus === "unplanned") {
            acc.unplanned++;
          } else {
            acc.todo++;
          }
          return acc;
        },
        { todo: 0, unplanned: 0, urgent: 0, scheduled: 0, doing: 0 },
      ),
    [tasks],
  );
