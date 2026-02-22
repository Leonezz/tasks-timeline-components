import type { CapabilityContext, ResourceSpec } from "../types";

export function createAllTasksResource(ctx: CapabilityContext): ResourceSpec {
  return {
    name: "all-tasks",
    uri: "tasks://all",
    description: "List of all tasks in the system.",
    mimeType: "application/json",

    async read() {
      const tasks = await ctx.getTasks();

      return {
        contents: [
          {
            uri: "tasks://all",
            text: JSON.stringify({
              tasks,
              count: tasks.length,
              generatedAt: new Date().toISOString(),
            }),
            mimeType: "application/json",
          },
        ],
      };
    },
  };
}
