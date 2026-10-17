import type { Tag } from "../../types";
import type { CapabilityContext, ToolSpec } from "../types";
import { generateTimestampId, getTodayISO } from "../../utils/date-helpers";
import { deriveWorkflowStatus, withStatusDates } from "../../utils/task";
import {
  earliestEndDate,
  readRecurrenceArgument,
} from "../../utils/recurrence-argument";

export function createUpdateTaskTool(ctx: CapabilityContext): ToolSpec {
  return {
    name: "update_task",
    description:
      "Update an existing task by ID. Only the fields you provide will be changed; all other fields are preserved.",
    schema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The ID of the task to update (required)",
        },
        title: {
          type: "string",
          description: "New title for the task",
        },
        description: {
          type: "string",
          description: "New description for the task",
        },
        status: {
          type: "string",
          description:
            "New explicit workflow status. Due, overdue, scheduled, and unplanned are derived from dates.",
          enum: ["todo", "doing", "done", "cancelled"],
        },
        priority: {
          type: "string",
          description: "New priority level",
          enum: ["low", "medium", "high"],
        },
        dueAt: {
          type: "string",
          description: "New due date in ISO 8601 format (YYYY-MM-DD)",
        },
        startAt: {
          type: "string",
          description: "New start date in ISO 8601 format (YYYY-MM-DD)",
        },
        completedAt: {
          type: "string",
          description: "Completion timestamp in ISO 8601 format",
        },
        category: {
          type: "string",
          description: "New task category",
        },
        tags: {
          type: "array",
          description: "New list of tag names (replaces existing tags)",
          items: { type: "string" },
        },
        recurrence: {
          type: "string",
          description:
            "Recurrence rule in RRULE RFC 5545 format (e.g. FREQ=WEEKLY;BYDAY=MO; end date as UNTIL=20261231; no DTSTART) or Obsidian Tasks text (e.g. every week, every week until December 31, 2026). Use empty string to clear recurrence.",
        },
      },
      required: ["id"],
    },

    async execute(args: Record<string, unknown>) {
      const id = args.id as string;

      const existingTask = await ctx.getTask(id);
      if (!existingTask) {
        return {
          name: "update_task",
          result: { success: false, error: `Task not found: ${id}` },
        };
      }

      const recurrenceArgument = readRecurrenceArgument(
        args.recurrence,
        earliestEndDate(
          getTodayISO(),
          (args.dueAt as string | undefined) ??
            existingTask.dueAt ??
            existingTask.extra?.scheduledAt ??
            (args.startAt as string | undefined) ??
            existingTask.startAt,
        ),
        ctx.recurrenceFormat,
      );
      if (!recurrenceArgument.ok) {
        return {
          name: "update_task",
          result: { success: false, error: recurrenceArgument.error },
        };
      }

      // Build field updates immutably
      const fieldUpdates: Record<string, unknown> = {};

      if (args.title !== undefined) {
        fieldUpdates.title = args.title as string;
      }
      if (args.description !== undefined) {
        fieldUpdates.description = args.description as string;
      }
      if (args.status !== undefined) {
        fieldUpdates.status = args.status as string;
      }
      if (args.priority !== undefined) {
        fieldUpdates.priority = args.priority as string;
      }
      if (args.dueAt !== undefined) {
        fieldUpdates.dueAt = args.dueAt as string;
      }
      if (args.startAt !== undefined) {
        fieldUpdates.startAt = args.startAt as string;
      }
      if (args.completedAt !== undefined) {
        fieldUpdates.completedAt = args.completedAt as string;
      }
      if (args.category !== undefined) {
        fieldUpdates.category = args.category as string;
      }

      // Handle tags: convert string array to Tag objects
      if (args.tags !== undefined) {
        const rawTags = args.tags as string[];
        const tags: Tag[] = rawTags.map((name) => ({
          id: generateTimestampId("tag"),
          name,
        }));
        fieldUpdates.tags = tags;
      }

      // Handle recurrence
      if (args.recurrence !== undefined) {
        const recurrence = recurrenceArgument.rule;
        if (!recurrence) {
          fieldUpdates.isRecurring = undefined;
          fieldUpdates.recurringInterval = undefined;
        } else {
          fieldUpdates.isRecurring = true;
          fieldUpdates.recurringInterval = recurrence;
        }
      }

      // Apply updates immutably
      const merged = withStatusDates(existingTask, {
        ...existingTask,
        ...fieldUpdates,
      });

      const finalTask = { ...merged, status: deriveWorkflowStatus(merged) };

      await ctx.updateTask(finalTask);
      ctx.notify?.("success", `Updated task: ${id}`);

      return {
        name: "update_task",
        result: {
          success: true,
          id,
          ...(recurrenceArgument.understoodAs
            ? { understoodAs: recurrenceArgument.understoodAs }
            : {}),
        },
      };
    },
  };
}
