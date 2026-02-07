import type {
  IAIProvider,
  AIProviderResponse,
  ToolDefinition,
  ToolResult,
  ChatMessage,
  TestResult,
} from "./types";
import type { ProviderConfig } from "../types";

export class AnthropicProvider implements IAIProvider {
  private readonly config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  private async getClient() {
    try {
      const mod = await import("@anthropic-ai/sdk");
      const Anthropic = mod.default;
      return new Anthropic({
        apiKey: this.config.apiKey,
        baseURL: this.config.baseUrl || undefined,
      });
    } catch {
      throw new Error(
        "The '@anthropic-ai/sdk' package is required. Install it with: pnpm add @anthropic-ai/sdk",
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

    // Build Anthropic messages
    const messages: Array<{
      role: "user" | "assistant";
      content:
        | string
        | Array<{
            type: string;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            [key: string]: any;
          }>;
    }> = [];

    // Add history
    if (history) {
      for (const msg of history) {
        if (msg.role === "user") {
          messages.push({ role: "user", content: msg.content || "" });
        } else if (msg.role === "assistant") {
          const content: Array<{
            type: string;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            [key: string]: any;
          }> = [];
          if (msg.content) {
            content.push({ type: "text", text: msg.content });
          }
          if (msg.toolCalls) {
            for (const tc of msg.toolCalls) {
              content.push({
                type: "tool_use",
                id: tc.id || `toolu_${tc.name}`,
                name: tc.name,
                input: tc.args,
              });
            }
          }
          messages.push({
            role: "assistant",
            content: content.length > 0 ? content : "",
          });
        } else if (msg.role === "tool" && msg.toolResults) {
          const content = msg.toolResults.map((tr) => ({
            type: "tool_result",
            tool_use_id: tr.id || `toolu_${tr.name}`,
            content: JSON.stringify(tr.result),
          }));
          messages.push({ role: "user", content });
        }
      }
    }

    // Add tool results or user prompt
    if (toolResults && toolResults.length > 0) {
      const content = toolResults.map((tr) => ({
        type: "tool_result",
        tool_use_id: tr.id || `toolu_${tr.name}`,
        content: JSON.stringify(tr.result),
      }));
      messages.push({ role: "user", content });
    } else {
      messages.push({ role: "user", content: prompt });
    }

    // Format tools for Anthropic
    const anthropicTools = tools.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.parameters as {
        type: "object";
        properties: Record<string, unknown>;
        required?: string[];
      },
    }));

    const response = await client.messages.create({
      model: this.config.model || "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages as unknown as Parameters<
        typeof client.messages.create
      >[0]["messages"],
      tools: anthropicTools,
    });

    const result: AIProviderResponse = {};

    for (const block of response.content) {
      if (block.type === "text") {
        result.text = (result.text || "") + block.text;
      } else if (block.type === "tool_use") {
        if (!result.toolCalls) result.toolCalls = [];
        result.toolCalls.push({
          id: block.id,
          name: block.name,
          args: (block.input as Record<string, unknown>) || {},
        });
      }
    }

    if (response.usage) {
      result.tokenCount =
        response.usage.input_tokens + response.usage.output_tokens;
    }

    return result;
  }

  async test(): Promise<TestResult> {
    try {
      const client = await this.getClient();
      const response = await client.messages.create({
        model: this.config.model || "claude-sonnet-4-20250514",
        max_tokens: 10,
        messages: [{ role: "user", content: "Say hello in one word." }],
      });
      const text =
        response.content[0]?.type === "text"
          ? response.content[0].text.trim()
          : "";
      return {
        success: true,
        message: `Connected to ${this.config.model || "claude-sonnet-4-20250514"}. Response: "${text}"`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
