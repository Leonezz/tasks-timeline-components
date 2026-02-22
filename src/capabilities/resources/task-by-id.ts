import type { CapabilityContext, ResourceSpec } from "../types";

export function createTaskByIdResource(ctx: CapabilityContext): ResourceSpec {
  return {
    name: "task-by-id",
    uri: "tasks://task",
    uriTemplate: "tasks://{taskId}",
    description: "Retrieve a single task by its ID.",
    mimeType: "application/json",

    async read(params) {
      const taskId = params?.taskId ?? "";
      const task = await ctx.getTask(taskId);

      return {
        contents: [
          {
            uri: `tasks://${taskId}`,
            text: JSON.stringify({
              task: task ?? null,
              found: task !== null,
            }),
            mimeType: "application/json",
          },
        ],
      };
    },
  };
}
