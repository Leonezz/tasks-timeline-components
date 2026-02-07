import type { ToolDefinition } from "./types";

export const getToolDefinitions = (): ToolDefinition[] => [
  {
    name: "create_task",
    description: "Creates a new task with given properties.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "The title of the task." },
        description: {
          type: "string",
          description: "Additional details about the task.",
        },
        priority: {
          type: "string",
          description: "Task priority: low, medium, or high.",
          enum: ["low", "medium", "high"],
        },
        dueAt: {
          type: "string",
          description: "ISO 8601 date string (YYYY-MM-DD).",
        },
        category: {
          type: "string",
          description: "The organizational category.",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "A list of tag names.",
        },
      },
      required: ["title"],
    },
  },
  {
    name: "query_tasks",
    description: "Queries existing tasks based on filters.",
    parameters: {
      type: "object",
      properties: {
        status: {
          type: "string",
          description: "Filter by task status.",
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
        date: {
          type: "string",
          description: "Filter by date (YYYY-MM-DD).",
        },
        search: {
          type: "string",
          description: "Search term for task title.",
        },
      },
    },
  },
  {
    name: "update_task",
    description: "Updates properties of an existing task.",
    parameters: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique ID of the task to update.",
        },
        title: { type: "string" },
        description: { type: "string" },
        status: {
          type: "string",
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
        priority: { type: "string", enum: ["low", "medium", "high"] },
        dueAt: { type: "string" },
        category: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_task",
    description: "Deletes a task by its ID.",
    parameters: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The ID of the task to delete.",
        },
      },
      required: ["id"],
    },
  },
];
