import type { CapabilityContext, ToolSpec } from "../types";

export function createDeleteTaskTool(ctx: CapabilityContext): ToolSpec {
  return {
    name: "delete_task",
    description: "Delete an existing task by its ID.",
    schema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The ID of the task to delete (required)",
        },
      },
      required: ["id"],
    },

    async execute(args: Record<string, unknown>) {
      const id = args.id as string;

      const existingTask = await ctx.getTask(id);
      if (!existingTask) {
        return {
          name: "delete_task",
          result: { success: false, message: `Task not found: ${id}` },
        };
      }

      const confirmed = await ctx.confirm?.(
        `Delete "${existingTask.title}"?`,
        "This action cannot be undone.",
      );
      if (confirmed === false) {
        return {
          name: "delete_task",
          result: { success: false, message: "Cancelled by user" },
        };
      }

      await ctx.deleteTask(id);
      ctx.notify?.("info", `Deleted task: ${existingTask.title}`);

      return {
        name: "delete_task",
        result: { success: true, id, title: existingTask.title },
      };
    },
  };
}
