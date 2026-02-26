import type { CapabilityContext, ToolSpec } from "../types";
import { getTodayISO } from "../../utils/date-helpers";

export function createGetTaskStatsTool(ctx: CapabilityContext): ToolSpec {
  return {
    name: "get_task_stats",
    description:
      "Get aggregate statistics about all tasks including counts by status, priority, category, completion metrics, and recurring task count.",
    schema: {
      type: "object",
      properties: {},
    },

    async execute() {
      const tasks = await ctx.getTasks();

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

      const today = getTodayISO();

      for (const task of tasks) {
        // Count by status
        stats.byStatus[task.status] = (stats.byStatus[task.status] ?? 0) + 1;

        // Count by priority
        stats.byPriority[task.priority] =
          (stats.byPriority[task.priority] ?? 0) + 1;

        // Count by category (only if category exists)
        if (task.category) {
          stats.byCategory[task.category] =
            (stats.byCategory[task.category] ?? 0) + 1;
        }

        // Count overdue tasks
        if (task.status === "overdue") {
          stats.overdue += 1;
        }

        // Count completed today
        if (task.completedAt && task.completedAt.startsWith(today)) {
          stats.completedToday += 1;
        }

        // Count recurring tasks
        if (task.isRecurring) {
          stats.recurring += 1;
        }
      }

      // Calculate completion rate
      if (tasks.length > 0) {
        const doneCount = stats.byStatus.done ?? 0;
        const rate = doneCount / tasks.length;
        stats.completionRate = Math.round(rate * 100) / 100;
      }

      ctx.showToast?.({
        variant: "info",
        title: "Task Statistics",
        description: `${stats.total} total tasks`,
        detail: [
          {
            type: "stats",
            data: {
              total: stats.total,
              byStatus: stats.byStatus,
              byPriority: stats.byPriority,
            },
          },
        ],
        timeout: 8000,
      });

      return {
        name: "get_task_stats",
        result: stats,
      };
    },
  };
}
