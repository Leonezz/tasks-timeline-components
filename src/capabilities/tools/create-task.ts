import type { Task, Tag } from "../../types";
import type { CapabilityContext, ToolSpec } from "../types";
import { generateTimestampId, getNowISO } from "../../utils/date-helpers";
import { deriveWorkflowStatus } from "../../utils/task";

export function createCreateTaskTool(ctx: CapabilityContext): ToolSpec {
  return {
    name: "create_task",
    description:
      "Create a new task with a title and optional details like description, priority, dates, tags, and recurrence.",
    schema: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The title of the task (required)",
        },
        description: {
          type: "string",
          description: "A detailed description of the task",
        },
        priority: {
          type: "string",
          description: "Task priority level",
          enum: ["low", "medium", "high"],
        },
        status: {
          type: "string",
          description:
            "Initial explicit workflow status. Due, overdue, scheduled, and unplanned are derived from dates.",
          enum: ["todo", "doing", "done", "cancelled"],
        },
        dueAt: {
          type: "string",
          description: "Due date in ISO 8601 format (YYYY-MM-DD)",
        },
        startAt: {
          type: "string",
          description: "Start date in ISO 8601 format (YYYY-MM-DD)",
        },
        category: {
          type: "string",
          description: "Task category",
        },
        tags: {
          type: "array",
          description: "List of tag names to attach to the task",
          items: { type: "string" },
        },
        recurrence: {
          type: "string",
          description:
            "Recurrence rule in RRULE RFC 5545 format (e.g. FREQ=WEEKLY;BYDAY=MO)",
        },
      },
      required: ["title"],
    },

    async execute(args: Record<string, unknown>) {
      const title = args.title as string;
      const description = args.description as string | undefined;
      const priority = (args.priority as "low" | "medium" | "high") ?? "medium";
      const status =
        (args.status as "todo" | "doing" | "done" | "cancelled") ?? "todo";
      const dueAt = args.dueAt as string | undefined;
      const startAt = args.startAt as string | undefined;
      const category = args.category as string | undefined;
      const rawTags = (args.tags as string[] | undefined) ?? [];
      const recurrence = args.recurrence as string | undefined;

      const id = generateTimestampId("ai");
      const createdAt = getNowISO();

      const tags: Tag[] = rawTags.map((name) => ({
        id: generateTimestampId("tag"),
        name,
      }));

      const task: Task = {
        id,
        title,
        ...(description !== undefined ? { description } : {}),
        priority,
        status,
        createdAt,
        ...(dueAt !== undefined ? { dueAt } : {}),
        ...(startAt !== undefined ? { startAt } : {}),
        ...(category !== undefined ? { category } : {}),
        tags,
        ...(recurrence !== undefined
          ? { isRecurring: true, recurringInterval: recurrence }
          : {}),
      };

      const finalTask: Task = { ...task, status: deriveWorkflowStatus(task) };

      await ctx.addTask(finalTask);
      ctx.notify?.("success", `Created task: ${title}`);

      return {
        name: "create_task",
        result: { success: true, id, title },
      };
    },
  };
}
