import type { CapabilityContext, ToolSpec } from "../types";

export function createNotifyUserTool(ctx: CapabilityContext): ToolSpec {
  return {
    name: "notify_user",
    description:
      "Show a notification to the user with a title, optional description, body text, and optional timeout. Use this to communicate results, progress, or important information.",
    schema: {
      type: "object",
      properties: {
        variant: {
          type: "string",
          description: "Visual style of the notification",
          enum: ["success", "error", "info", "warning"],
        },
        title: {
          type: "string",
          description: "Short headline for the notification (required)",
        },
        description: {
          type: "string",
          description: "Brief subtitle below the title",
        },
        body: {
          type: "string",
          description: "Longer text content for detailed information",
        },
        timeout: {
          type: "number",
          description:
            "Auto-dismiss after this many milliseconds. Use 0 or null for persistent notifications. Default: persistent",
        },
      },
      required: ["variant", "title"],
    },

    async execute(args: Record<string, unknown>) {
      const variant = args.variant as "success" | "error" | "info" | "warning";
      const title = args.title as string;
      const description = args.description as string | undefined;
      const body = args.body as string | undefined;
      const rawTimeout = args.timeout as number | null | undefined;
      const timeout =
        rawTimeout === undefined || rawTimeout === null || rawTimeout === 0
          ? null
          : rawTimeout;

      ctx.showToast?.({
        variant,
        title,
        description,
        body,
        timeout,
      });

      return {
        name: "notify_user",
        result: { success: true },
      };
    },
  };
}
