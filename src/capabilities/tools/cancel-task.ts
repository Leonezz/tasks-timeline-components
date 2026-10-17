import type { Task } from "../../types";
import type { CapabilityContext, ToolSpec } from "../types";
import { getNowISO } from "../../utils/date-helpers";
import { deriveWorkflowStatus, withStatusDates } from "../../utils/task";

export function createCancelTaskTool(ctx: CapabilityContext): ToolSpec {
  return {
    name: "cancel_task",
    description:
      "Cancel a task. For recurring tasks, cancels the entire series.",
    schema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The ID of the task to cancel (required)",
        },
      },
      required: ["id"],
    },

    async execute(args: Record<string, unknown>) {
      const id = args.id as string;

      const existingTask = await ctx.getTask(id);
      if (!existingTask) {
        return {
          name: "cancel_task",
          result: { success: false, error: `Task not found: ${id}` },
        };
      }

      // A task that is already cancelled keeps the date it was cancelled on
      const alreadyCancelled =
        deriveWorkflowStatus(existingTask) === "cancelled";
      const cancelledTask: Task = withStatusDates(existingTask, {
        ...existingTask,
        status: "cancelled",
        cancelledAt:
          (alreadyCancelled ? existingTask.cancelledAt : undefined) ??
          getNowISO(),
      });

      await ctx.updateTask(cancelledTask);
      ctx.notify?.("info", `Cancelled task: ${existingTask.title}`);

      return {
        name: "cancel_task",
        result: { success: true, id, title: existingTask.title },
      };
    },
  };
}
