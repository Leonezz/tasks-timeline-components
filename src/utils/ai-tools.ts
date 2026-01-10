import { type FunctionDeclaration, Type } from "@google/genai";

// Define tool declarations for Gemini Function Calling
export const getToolDefinitions = (): FunctionDeclaration[] => {
  return [
    {
      name: "create_task",
      description: "Creates a new task with given properties.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "The title of the task." },
          description: {
            type: Type.STRING,
            description: "Additional details about the task.",
          },
          priority: {
            type: Type.STRING,
            description: "Task priority: low, medium, or high.",
            enum: ["low", "medium", "high"],
          },
          dueAt: {
            type: Type.STRING,
            description: "ISO 8601 date string (YYYY-MM-DD).",
          },
          category: {
            type: Type.STRING,
            description: "The organizational category.",
          },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
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
        type: Type.OBJECT,
        properties: {
          status: {
            type: Type.STRING,
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
            type: Type.STRING,
            description: "Filter by date (YYYY-MM-DD).",
          },
          search: {
            type: Type.STRING,
            description: "Search term for task title.",
          },
        },
      },
    },
    {
      name: "update_task",
      description: "Updates properties of an existing task.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            description: "The unique ID of the task to update.",
          },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          status: {
            type: Type.STRING,
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
          priority: { type: Type.STRING, enum: ["low", "medium", "high"] },
          dueAt: { type: Type.STRING },
          category: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["id"],
      },
    },
    {
      name: "delete_task",
      description: "Deletes a task by its ID.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            description: "The ID of the task to delete.",
          },
        },
        required: ["id"],
      },
    },
  ];
};
