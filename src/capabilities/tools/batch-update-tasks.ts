import type { Task, Priority } from "../../types";
import type { CapabilityContext, ToolSpec } from "../types";
import {
  deriveWorkflowStatus,
  isTaskRecurring,
  taskMatchesStatus,
  withStatusDates,
} from "../../utils/task";
import { confirmDestructiveAction } from "./confirm";
import { readRecurrenceArgument } from "../../utils/recurrence-argument";
import { getTodayISO } from "../../utils/date-helpers";

function matchesTag(task: Task, tag: string): boolean {
  const lowerTag = tag.toLowerCase();
  return task.tags.some((t) => t.name.toLowerCase() === lowerTag);
}

export function createBatchUpdateTasksTool(ctx: CapabilityContext): ToolSpec {
  return {
    name: "batch_update_tasks",
    description:
      "Update multiple tasks matching a filter criteria. All matching tasks receive the same updates. Filters use exact matching for status and category, case-insensitive matching for tags.",
    schema: {
      type: "object",
      properties: {
        filter: {
          type: "object",
          description:
            "Filter criteria to select tasks to update. All conditions are combined with AND logic.",
          properties: {
            status: {
              type: "string",
              description: "Filter by exact task status",
              enum: [
                "done",
                "scheduled",
                "todo",
                "due",
                "overdue",
                "cancelled",
                "unplanned",
                "doing",
              ],
            },
            category: {
              type: "string",
              description: "Filter by exact category match",
            },
            tag: {
              type: "string",
              description: "Filter by tag name (case-insensitive)",
            },
            recurring: {
              type: "boolean",
              description:
                "Filter by recurrence: true for recurring tasks, false for non-recurring",
            },
          },
        },
        update: {
          type: "object",
          description:
            "Fields to update on all matching tasks. Omitted fields are not changed.",
          properties: {
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
            category: {
              type: "string",
              description: "New task category",
            },
            recurrence: {
              type: "string",
              description:
                "Recurrence rule in RRULE RFC 5545 format (e.g. FREQ=WEEKLY;BYDAY=MO; end date as UNTIL=20261231; no DTSTART) or Obsidian Tasks text (e.g. every week, every week until December 31, 2026). Use empty string to clear recurrence.",
            },
          },
        },
      },
      required: ["filter", "update"],
    },

    async execute(args: Record<string, unknown>) {
      const filter = args.filter as Record<string, unknown> | undefined;
      const update = args.update as Record<string, unknown> | undefined;

      if (!filter || !update) {
        return {
          name: "batch_update_tasks",
          result: { success: false, error: "filter and update are required" },
        };
      }

      const recurrenceArgument = readRecurrenceArgument(
        update.recurrence,
        getTodayISO(),
        ctx.recurrenceFormat,
      );
      if (!recurrenceArgument.ok) {
        return {
          name: "batch_update_tasks",
          result: {
            success: false,
            error: recurrenceArgument.error,
            updated: 0,
          },
        };
      }

      const status = filter.status as string | undefined;
      const category = filter.category as string | undefined;
      const tag = filter.tag as string | undefined;
      const recurring = filter.recurring as boolean | undefined;

      const allTasks = await ctx.getTasks();

      // Filter tasks based on criteria
      const filtered = allTasks.filter((task: Task) => {
        if (status !== undefined && !taskMatchesStatus(task, status))
          return false;
        if (category !== undefined && task.category !== category) return false;
        if (tag !== undefined && !matchesTag(task, tag)) return false;
        if (recurring !== undefined && isTaskRecurring(task) !== recurring) {
          return false;
        }
        return true;
      });

      if (filtered.length > 0) {
        const confirmation = await confirmDestructiveAction(
          ctx,
          `Update ${filtered.length} task${filtered.length === 1 ? "" : "s"}?`,
          "This will apply changes to all matching tasks.",
        );
        if (confirmation.status === "unavailable") {
          return {
            name: "batch_update_tasks",
            result: { success: false, error: confirmation.error, updated: 0 },
          };
        }
        if (confirmation.status === "cancelled") {
          return {
            name: "batch_update_tasks",
            result: {
              success: false,
              message: "Cancelled by user",
              updated: 0,
            },
          };
        }
      }

      const updatedIds: string[] = [];
      const updated: Task[] = [];

      // Update each matched task immutably
      for (const task of filtered) {
        const fieldUpdates: Record<string, unknown> = {};

        if (update.status !== undefined) {
          fieldUpdates.status = update.status as string;
        }
        if (update.priority !== undefined) {
          fieldUpdates.priority = update.priority as Priority;
        }
        if (update.dueAt !== undefined) {
          fieldUpdates.dueAt = update.dueAt as string;
        }
        if (update.category !== undefined) {
          fieldUpdates.category = update.category as string;
        }

        // Handle recurrence
        if (update.recurrence !== undefined) {
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
        const merged = withStatusDates(task, { ...task, ...fieldUpdates });

        const finalTask = { ...merged, status: deriveWorkflowStatus(merged) };

        await ctx.updateTask(finalTask);
        updatedIds.push(task.id);
        updated.push(finalTask);
      }

      // One notification per batch: the rich toast when the host has one
      const summary = `Updated ${updated.length} task${updated.length === 1 ? "" : "s"}`;
      if (ctx.showToast && updated.length > 0) {
        ctx.showToast({
          variant: "success",
          title: summary,
          detail: [
            { type: "task-list", tasks: updated, label: "Updated Tasks" },
          ],
          timeout: 6000,
        });
      } else {
        ctx.notify?.("success", summary);
      }

      return {
        name: "batch_update_tasks",
        result: {
          success: true,
          updatedCount: filtered.length,
          taskIds: updatedIds,
          ...(recurrenceArgument.understoodAs
            ? { understoodAs: recurrenceArgument.understoodAs }
            : {}),
        },
      };
    },
  };
}
