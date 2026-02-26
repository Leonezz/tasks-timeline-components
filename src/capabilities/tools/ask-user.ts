import type { CapabilityContext, ToolSpec } from "../types";

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
      },
      required: ["question"],
    },

    async execute(args: Record<string, unknown>) {
      const question = args.question as string;
      const options = args.options as
        | { label: string; value: string }[]
        | undefined;
      const confirm = args.confirm as boolean | undefined;

      const unavailable = {
        question,
        answer: null,
        error: "User interaction not available",
      };

      // Confirm mode
      if (confirm) {
        if (!ctx.confirm) {
          return { name: "ask_user", result: unavailable };
        }
        const description = args.description as string | undefined;
        const confirmed = await ctx.confirm(question, description);
        return {
          name: "ask_user",
          result: {
            question,
            answer: confirmed ? "yes" : "no",
          },
        };
      }

      // Select mode
      if (options && options.length > 0) {
        if (!ctx.select) {
          return { name: "ask_user", result: unavailable };
        }
        const selected = await ctx.select(question, options);
        return {
          name: "ask_user",
          result: {
            question,
            answer: selected,
          },
        };
      }

      // Free text mode
      if (!ctx.prompt) {
        return { name: "ask_user", result: unavailable };
      }
      const answer = await ctx.prompt(question);
      return {
        name: "ask_user",
        result: {
          question,
          answer,
        },
      };
    },
  };
}
