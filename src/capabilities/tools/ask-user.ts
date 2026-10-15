import type { ToolResult } from "../../providers/types";
import type { CapabilityContext, ToolSpec } from "../types";

const INTERACTION_UNAVAILABLE = "User interaction not available";

export function createAskUserTool(ctx: CapabilityContext): ToolSpec {
  return {
    name: "ask_user",
    description:
      "Ask the user a question and wait for their response. Supports three modes: free-text input (question only), select from options (question + options), or yes/no confirmation (question + confirm). Use this when you need clarification or user input before proceeding.",
    schema: {
      type: "object",
      properties: {
        question: {
          type: "string",
          description: "The question to ask the user (required)",
        },
        options: {
          type: "array",
          description:
            "List of options for the user to choose from. When provided, renders a selection list.",
          items: {
            type: "object",
            properties: {
              label: {
                type: "string",
                description: "Display text for this option",
              },
              value: {
                type: "string",
                description: "Value returned when this option is selected",
              },
            },
          },
        },
        confirm: {
          type: "boolean",
          description:
            "When true, presents a yes/no confirmation dialog instead of free-text input",
        },
        description: {
          type: "string",
          description:
            "Extra context shown under the question. Only used with confirm: true.",
        },
      },
      required: ["question"],
    },

    async execute(args: Record<string, unknown>) {
      const question = args.question as string;
      const description = args.description as string | undefined;
      const options = args.options as
        | { label: string; value: string }[]
        | undefined;
      const confirm = args.confirm as boolean | undefined;

      // Confirm mode
      if (confirm) {
        const ask = ctx.confirm?.bind(ctx);
        return askUser(
          question,
          ask &&
            (async () => {
              const confirmed = await ask(question, description);
              return confirmed === null ? null : confirmed ? "yes" : "no";
            }),
        );
      }

      // Select mode
      if (options && options.length > 0) {
        const ask = ctx.select?.bind(ctx);
        return askUser(question, ask && (() => ask(question, options)));
      }

      // Free text mode
      const ask = ctx.prompt?.bind(ctx);
      return askUser(question, ask && (() => ask(question)));
    },
  };
}

/**
 * Runs one question and maps the outcome to the tool result:
 * an answer, `dismissed: true` when the user closed it, or an explicit error
 * when the host cannot ask (no callback, or the callback rejected).
 */
async function askUser(
  question: string,
  ask: (() => Promise<string | null>) | undefined,
): Promise<ToolResult> {
  if (!ask) {
    return {
      name: "ask_user",
      result: { question, answer: null, error: INTERACTION_UNAVAILABLE },
    };
  }
  try {
    const answer = await ask();
    return {
      name: "ask_user",
      result:
        answer === null
          ? { question, answer: null, dismissed: true }
          : { question, answer },
    };
  } catch (error) {
    return {
      name: "ask_user",
      result: {
        question,
        answer: null,
        error:
          error instanceof Error && error.message
            ? error.message
            : INTERACTION_UNAVAILABLE,
      },
    };
  }
}
