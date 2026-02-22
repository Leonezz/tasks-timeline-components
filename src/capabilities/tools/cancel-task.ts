import type { Task } from "../../types";
import type { CapabilityContext, ToolSpec } from "../types";
import { getNowISO } from "../../utils/date-helpers";

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

      const cancelledTask: Task = {
        ...existingTask,
        status: "cancelled",
        cancelledAt: getNowISO(),
      };

      await ctx.updateTask(cancelledTask);
      ctx.notify?.("info", `Cancelled task: ${existingTask.title}`);

      return {
        name: "cancel_task",
        result: { success: true, id, title: existingTask.title },
      };
    },
  };
}
