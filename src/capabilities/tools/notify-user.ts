import type { ToastVariant } from "../../types";
import type { CapabilityContext, ToolSpec } from "../types";

const VARIANTS: readonly ToastVariant[] = [
  "success",
  "error",
  "info",
  "warning",
];

const isVariant = (value: unknown): value is ToastVariant =>
  typeof value === "string" && (VARIANTS as readonly string[]).includes(value);

/** Arguments a toast can't render, as a message for the model; null when valid. */
function invalidArguments(args: Record<string, unknown>): string | null {
  if (!isVariant(args.variant)) {
    return `variant must be one of ${VARIANTS.map((v) => `"${v}"`).join(", ")}, got ${JSON.stringify(args.variant) ?? "nothing"}. Call notify_user again with a valid variant.`;
  }
  if (typeof args.title !== "string" || args.title.trim() === "") {
    return "title must be a non-empty string. Call notify_user again with a title.";
  }
  return null;
}

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
          description:
            "Longer text content for detailed information (Markdown supported)",
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
      // Models that don't enforce the schema's enum (some OpenAI-compatible
      // providers) can send any variant; a toast with an unknown variant has
      // no icon to render, so refuse it here instead of crashing the app.
      const invalid = invalidArguments(args);
      if (invalid) {
        return {
          name: "notify_user",
          result: { success: false, error: invalid },
        };
      }
      const variant = args.variant as ToastVariant;
      const title = args.title as string;
      const description = args.description as string | undefined;
      const body = args.body as string | undefined;
      const rawTimeout = args.timeout as number | null | undefined;
      const timeout =
        rawTimeout === undefined || rawTimeout === null || rawTimeout === 0
          ? null
          : rawTimeout;

      if (ctx.showToast) {
        ctx.showToast({ variant, title, description, body, timeout });
        return { name: "notify_user", result: { success: true } };
      }

      // Explicit degraded mode: the host can only show one plain line
      if (ctx.notify) {
        ctx.notify(variant, description ? `${title}: ${description}` : title);
        return {
          name: "notify_user",
          result: {
            success: true,
            degraded: true,
            warning:
              "This host cannot show rich notifications, so only the title and description were shown; body and timeout were dropped.",
          },
        };
      }

      return {
        name: "notify_user",
        result: {
          success: false,
          error:
            "This host cannot show notifications. Reply with a text response instead.",
        },
      };
    },
  };
}
