import type {
  IAIProvider,
  AIProviderResponse,
  ToolDefinition,
  ToolResult,
  ChatMessage,
  TestResult,
} from "./types";
import type { ProviderConfig } from "../types";

export class OpenAIProvider implements IAIProvider {
  private readonly config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  private async getClient() {
    try {
      const { default: OpenAI } = await import("openai");
      return new OpenAI({
        apiKey: this.config.apiKey,
        baseURL: this.config.baseUrl || undefined,
        dangerouslyAllowBrowser: true,
      });
    } catch {
      throw new Error(
        "The 'openai' package is required. Install it with: pnpm add openai",
      );
    }
  }

  async chat(
    systemPrompt: string,
    prompt: string,
    tools: ToolDefinition[],
    toolResults?: ToolResult[],
    history?: ChatMessage[],
  ): Promise<AIProviderResponse> {
    const client = await this.getClient();

    // Build OpenAI messages
    const messages: Array<{
      role: "system" | "user" | "assistant" | "tool";
      content?: string | null;
      tool_calls?: Array<{
        id: string;
        type: "function";
        function: { name: string; arguments: string };
      }>;
      tool_call_id?: string;
    }> = [{ role: "system", content: systemPrompt }];

    // Add history
    if (history) {
      for (const msg of history) {
        if (msg.role === "user") {
          messages.push({ role: "user", content: msg.content || "" });
        } else if (msg.role === "assistant") {
          const assistantMsg: (typeof messages)[number] = {
            role: "assistant",
            content: msg.content || null,
          };
          if (msg.toolCalls && msg.toolCalls.length > 0) {
            assistantMsg.tool_calls = msg.toolCalls.map((tc, i) => ({
              id: `call_${i}`,
              type: "function" as const,
              function: {
                name: tc.name,
                arguments: JSON.stringify(tc.args),
              },
            }));
          }
          messages.push(assistantMsg);
        } else if (msg.role === "tool" && msg.toolResults) {
          for (const tr of msg.toolResults) {
            messages.push({
              role: "tool",
              content: JSON.stringify(tr.result),
              tool_call_id: `call_${msg.toolResults.indexOf(tr)}`,
            });
          }
        }
      }
    }

    // Add tool results or user prompt
    if (toolResults && toolResults.length > 0) {
      for (const tr of toolResults) {
        messages.push({
          role: "tool",
          content: JSON.stringify(tr.result),
          tool_call_id: `call_${tr.name}`,
        });
      }
    } else {
      messages.push({ role: "user", content: prompt });
    }

    // Format tools for OpenAI
    const openaiTools = tools.map((t) => ({
      type: "function" as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));

    const response = await client.chat.completions.create({
      model: this.config.model || "gpt-4o",
      messages: messages as Parameters<
        typeof client.chat.completions.create
      >[0]["messages"],
      tools: openaiTools.length > 0 ? openaiTools : undefined,
    });

    const choice = response.choices[0];
    const result: AIProviderResponse = {};

    if (choice?.message?.content) {
      result.text = choice.message.content;
    }

    if (choice?.message?.tool_calls && choice.message.tool_calls.length > 0) {
      result.toolCalls = choice.message.tool_calls
        .filter((tc) => tc.type === "function")
        .map((tc) => ({
          name: (tc as { function: { name: string; arguments: string } })
            .function.name,
          args: JSON.parse(
            (tc as { function: { name: string; arguments: string } }).function
              .arguments,
          ) as Record<string, unknown>,
        }));
    }

    if (response.usage) {
      result.tokenCount = response.usage.total_tokens;
    }

    return result;
  }

  async test(): Promise<TestResult> {
    try {
      const client = await this.getClient();
      const response = await client.chat.completions.create({
        model: this.config.model || "gpt-4o",
        messages: [{ role: "user", content: "Say hello in one word." }],
        max_tokens: 10,
      });
      const text = response.choices[0]?.message?.content?.trim();
      return {
        success: true,
        message: `Connected to ${this.config.model || "gpt-4o"}. Response: "${text}"`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
