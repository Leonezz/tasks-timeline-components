import type { Priority, Task, DetailBlock } from "../../types";
import type { CapabilityContext, ToolSpec } from "../types";
import { getTodayISO } from "../../utils/date-helpers";

interface TaskSummary {
  id: string;
  title: string;
  priority: Priority;
  status: string;
  category?: string;
  tags: string[];
  isRecurring?: boolean;
}

interface TodayPlan {
  date: string;
  todayTasks: TaskSummary[];
  todayCount: number;
  overdueTasks: TaskSummary[];
  overdueCount: number;
}

const PRIORITY_ORDER: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function sortByPriority(a: TaskSummary, b: TaskSummary): number {
  return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
}

export function createGetTodayPlanTool(ctx: CapabilityContext): ToolSpec {
  return {
    name: "get_today_plan",
    description:
      "Get today's task plan with tasks due today (sorted by priority) and overdue tasks (sorted by priority).",
    schema: {
      type: "object",
      properties: {},
    },

    async execute() {
      const tasks = await ctx.getTasks();
      const today = getTodayISO();

      const todayTasks: TaskSummary[] = [];
      const overdueTasks: TaskSummary[] = [];
      const todayFullTasks: Task[] = [];
      const overdueFullTasks: Task[] = [];

      for (const task of tasks) {
        // Create summary object
        const summary: TaskSummary = {
          id: task.id,
          title: task.title,
          priority: task.priority,
          status: task.status,
          ...(task.category ? { category: task.category } : {}),
          tags: task.tags.map((t) => t.name),
          ...(task.isRecurring !== undefined
            ? { isRecurring: task.isRecurring }
            : {}),
        };

        // Today's tasks: dueAt === today, not done/cancelled
        if (
          task.dueAt === today &&
          task.status !== "done" &&
          task.status !== "cancelled"
        ) {
          todayTasks.push(summary);
          todayFullTasks.push(task);
        }

        // Overdue tasks: status === "overdue"
        if (task.status === "overdue") {
          overdueTasks.push(summary);
          overdueFullTasks.push(task);
        }
      }

      // Sort both lists by priority (high first)
      todayTasks.sort(sortByPriority);
      overdueTasks.sort(sortByPriority);

      const plan: TodayPlan = {
        date: today,
        todayTasks,
        todayCount: todayTasks.length,
        overdueTasks,
        overdueCount: overdueTasks.length,
      };

      const detailBlocks: DetailBlock[] = [];
      if (todayFullTasks.length > 0) {
        detailBlocks.push({
          type: "task-list",
          tasks: todayFullTasks,
          label: "Today",
        });
      }
      if (overdueFullTasks.length > 0) {
        detailBlocks.push({
          type: "task-list",
          tasks: overdueFullTasks,
          label: "Overdue",
        });
      }
      if (detailBlocks.length > 0) {
        ctx.showToast?.({
          variant: overdueFullTasks.length > 0 ? "warning" : "info",
          title: "Today's Plan",
          description: `${plan.todayCount} due today, ${plan.overdueCount} overdue`,
          detail: detailBlocks,
          timeout: 10000,
        });
      }

      return {
        name: "get_today_plan",
        result: plan,
      };
    },
  };
}
