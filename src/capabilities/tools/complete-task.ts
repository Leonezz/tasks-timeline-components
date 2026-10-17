import type { Task } from "../../types";
import type { CapabilityContext, ToolSpec } from "../types";
import {
  generateTimestampId,
  getNowISO,
  getTodayISO,
} from "../../utils/date-helpers";
import { nextOccurrence } from "../../utils/next-occurrence";
import { deriveWorkflowStatus, isTaskRecurring } from "../../utils/task";

export function createCompleteTaskTool(ctx: CapabilityContext): ToolSpec {
  return {
    name: "complete_task",
    description:
      "Mark a task as done. For recurring tasks, completes the current instance and creates the next occurrence with its dates moved forward. A task that is already done is left unchanged and reported with alreadyCompleted: true.",
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

      // Completed recurring lines stay in Obsidian notes; completing one again
      // (or retrying after a failed write) must not add another occurrence
      if (deriveWorkflowStatus(existingTask) === "done") {
        return {
          name: "complete_task",
          result: {
            success: true,
            id,
            title: existingTask.title,
            alreadyCompleted: true,
            createdNextOccurrence: false,
            message: "The task was already done, so nothing was changed.",
          },
        };
      }

      // Work out the next occurrence first, so an unreadable rule changes nothing
      const recurs =
        isTaskRecurring(existingTask) &&
        Boolean(existingTask.recurringInterval);
      let next: Task | null = null;
      if (recurs) {
        try {
          next = nextOccurrence(existingTask, getTodayISO());
        } catch (error) {
          return {
            name: "complete_task",
            result: {
              success: false,
              error: `${error instanceof Error ? error.message : String(error)} Task ${id} was not completed.`,
            },
          };
        }
      }

      const now = getNowISO();
      const completedTask: Task = {
        ...existingTask,
        status: "done",
        completedAt: now,
      };

      await ctx.updateTask(completedTask);

      const createdNextOccurrence = next !== null;
      if (next) {
        const nextTask: Task = {
          ...next,
          id: generateTimestampId("ai"),
          status: "todo",
          createdAt: now,
          completedAt: undefined,
          cancelledAt: undefined,
          // A 🆔 id names one task, so the next occurrence has no 🆔 or ⛔,
          // as in Obsidian Tasks
          taskId: undefined,
          dependsOn: undefined,
        };

        try {
          await ctx.addTask({
            ...nextTask,
            status: deriveWorkflowStatus(nextTask),
          });
        } catch (error) {
          // The task is already done; give the model what it needs to recreate
          // the next occurrence instead of completing the task again
          return {
            name: "complete_task",
            result: {
              success: false,
              id,
              title: existingTask.title,
              completed: true,
              createdNextOccurrence: false,
              error: `Task ${id} was marked done, but creating its next occurrence failed: ${error instanceof Error ? error.message : String(error)}. Create it with create_task using nextOccurrence.`,
              // The create_task arguments for the missing occurrence
              nextOccurrence: {
                title: nextTask.title,
                ...(nextTask.description
                  ? { description: nextTask.description }
                  : {}),
                priority: nextTask.priority,
                ...(nextTask.dueAt ? { dueAt: nextTask.dueAt } : {}),
                ...(nextTask.startAt ? { startAt: nextTask.startAt } : {}),
                ...(nextTask.category ? { category: nextTask.category } : {}),
                tags: nextTask.tags.map((tag) => tag.name),
                recurrence: nextTask.recurringInterval,
              },
            },
          };
        }
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
          ...(recurs && !createdNextOccurrence
            ? {
                message:
                  "The recurrence has ended, so no next occurrence was created.",
              }
            : {}),
        },
      };
    },
  };
}
