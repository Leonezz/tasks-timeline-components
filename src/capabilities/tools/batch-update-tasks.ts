import type { Task, Priority } from "../../types";
import type { CapabilityContext, ToolSpec } from "../types";
import { deriveTaskStatus } from "../../utils/task";

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
              description: "New status (only terminal/settable states allowed)",
              enum: ["todo", "done", "cancelled"],
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
                "Recurrence rule in RRULE RFC 5545 format (e.g. FREQ=WEEKLY;BYDAY=MO). Use empty string to clear recurrence.",
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

      const status = filter.status as string | undefined;
      const category = filter.category as string | undefined;
      const tag = filter.tag as string | undefined;
      const recurring = filter.recurring as boolean | undefined;

      const allTasks = await ctx.getTasks();

      // Filter tasks based on criteria
      const filtered = allTasks.filter((task: Task) => {
        if (status !== undefined && task.status !== status) return false;
        if (category !== undefined && task.category !== category) return false;
        if (tag !== undefined && !matchesTag(task, tag)) return false;
        if (recurring !== undefined) {
          if (recurring && task.isRecurring !== true) return false;
          if (!recurring && task.isRecurring === true) return false;
        }
        return true;
      });

      if (filtered.length > 0) {
        const confirmed = await ctx.confirm?.(
          `Update ${filtered.length} task${filtered.length === 1 ? "" : "s"}?`,
          "This will apply changes to all matching tasks.",
        );
        if (confirmed === false) {
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
          const recurrence = update.recurrence as string;
          if (recurrence === "") {
            fieldUpdates.isRecurring = undefined;
            fieldUpdates.recurringInterval = undefined;
          } else {
            fieldUpdates.isRecurring = true;
            fieldUpdates.recurringInterval = recurrence;
          }
        }

        // Apply updates immutably
        const merged = { ...task, ...fieldUpdates };

        // Derive status AFTER all updates applied
        const derivedStatus = deriveTaskStatus(merged);
        const finalTask = { ...merged, status: derivedStatus };

        await ctx.updateTask(finalTask);
        updatedIds.push(task.id);
        updated.push(finalTask);
      }

      if (updated.length > 0) {
        ctx.showToast?.({
          variant: "success",
          title: `Updated ${updated.length} task${updated.length === 1 ? "" : "s"}`,
          detail: [
            { type: "task-list", tasks: updated, label: "Updated Tasks" },
          ],
          timeout: 6000,
        });
      }

      ctx.notify?.(
        "success",
        `Updated ${filtered.length} task${filtered.length === 1 ? "" : "s"}`,
      );

      return {
        name: "batch_update_tasks",
        result: {
          success: true,
          updatedCount: filtered.length,
          taskIds: updatedIds,
        },
      };
    },
  };
}
