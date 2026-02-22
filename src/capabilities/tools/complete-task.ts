import type { Task } from "../../types";
import type { CapabilityContext, ToolSpec } from "../types";
import { generateTimestampId, getNowISO } from "../../utils/date-helpers";
import { deriveTaskStatus } from "../../utils/task";

export function createCompleteTaskTool(ctx: CapabilityContext): ToolSpec {
  return {
    name: "complete_task",
    description:
      "Mark a task as done. For recurring tasks, completes the current instance and creates the next occurrence.",
    schema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The ID of the task to complete (required)",
        },
      },
      required: ["id"],
    },

    async execute(args: Record<string, unknown>) {
      const id = args.id as string;

      const existingTask = await ctx.getTask(id);
      if (!existingTask) {
        return {
          name: "complete_task",
          result: { success: false, error: `Task not found: ${id}` },
        };
      }

      const now = getNowISO();
      const completedTask: Task = {
        ...existingTask,
        status: "done",
        completedAt: now,
      };

      await ctx.updateTask(completedTask);

      let createdNextOccurrence = false;

      if (existingTask.isRecurring && existingTask.recurringInterval) {
        const nextTask: Task = {
          ...existingTask,
          id: generateTimestampId("ai"),
          status: "todo",
          createdAt: now,
          completedAt: undefined,
          cancelledAt: undefined,
        };

        const derivedStatus = deriveTaskStatus(nextTask);
        const finalNextTask: Task = { ...nextTask, status: derivedStatus };

        await ctx.addTask(finalNextTask);
        createdNextOccurrence = true;
      }

      ctx.notify?.(
        "success",
        `Completed task: ${existingTask.title}${createdNextOccurrence ? " (next occurrence created)" : ""}`,
      );

      return {
        name: "complete_task",
        result: {
          success: true,
          id,
          title: existingTask.title,
          createdNextOccurrence,
        },
      };
    },
  };
}
