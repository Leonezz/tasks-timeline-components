import type { CapabilityContext, ResourceSpec } from "../types";
import { getTodayISO } from "../../utils/date-helpers";

export function createStatsResource(ctx: CapabilityContext): ResourceSpec {
  return {
    name: "stats",
    uri: "tasks://stats",
    description:
      "Aggregate statistics about all tasks including counts by status, priority, category, completion metrics, and recurring task count.",
    mimeType: "application/json",

    async read() {
      const tasks = await ctx.getTasks();
      const today = getTodayISO();

      const stats = {
        total: tasks.length,
        byStatus: {} as Record<string, number>,
        byPriority: {} as Record<string, number>,
        byCategory: {} as Record<string, number>,
        overdue: 0,
        completedToday: 0,
        completionRate: 0,
        recurring: 0,
        generatedAt: new Date().toISOString(),
      };

      for (const task of tasks) {
        stats.byStatus[task.status] = (stats.byStatus[task.status] ?? 0) + 1;

        stats.byPriority[task.priority] =
          (stats.byPriority[task.priority] ?? 0) + 1;

        if (task.category) {
          stats.byCategory[task.category] =
            (stats.byCategory[task.category] ?? 0) + 1;
        }

        if (task.status === "overdue") {
          stats.overdue += 1;
        }

        if (task.completedAt && task.completedAt.startsWith(today)) {
          stats.completedToday += 1;
        }

        if (task.isRecurring) {
          stats.recurring += 1;
        }
      }

      if (tasks.length > 0) {
        const doneCount = stats.byStatus.done ?? 0;
        const rate = doneCount / tasks.length;
        stats.completionRate = Math.round(rate * 100) / 100;
      }

      return {
        contents: [
          {
            uri: "tasks://stats",
            text: JSON.stringify(stats),
            mimeType: "application/json",
          },
        ],
      };
    },
  };
}
