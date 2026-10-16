import type { AIProvider, ProviderConfig, TokenUsageRecord } from "../types";

export interface JSONSchemaProperty {
  type: "string" | "number" | "boolean" | "array" | "object";
  description?: string;
  enum?: string[];
  items?: JSONSchemaProperty;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, JSONSchemaProperty>;
    required?: string[];
  };
}

export interface ToolCall {
  id?: string;
  name: string;
  args: Record<string, unknown>;
}

export interface ToolResult {
  id?: string;
  name: string;
  result: unknown;
}

export interface ChatMessage {
  role: "user" | "assistant" | "tool";
  content?: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}

export interface AIProviderResponse {
  text?: string;
  toolCalls?: ToolCall[];
  tokenCount?: number;
  tokenUsage?: TokenUsageRecord;
}

export interface TestResult {
  success: boolean;
  message: string;
}

export interface IAIProvider {
  chat(
    systemPrompt: string,
    prompt: string,
    tools: ToolDefinition[],
    toolResults?: ToolResult[],
    history?: ChatMessage[],
  ): Promise<AIProviderResponse>;

  test(): Promise<TestResult>;
}

export type AIProviderFactory = (
  provider: AIProvider,
  config: ProviderConfig,
) => Promise<IAIProvider>;

/**
 * Runtime options for the built-in providers. Kept apart from
 * `ProviderConfig` because they are never persisted with settings.
 */
export interface ProviderRuntimeOptions {
  /**
   * Fetch used for every provider request. Defaults to the global `fetch`.
   * Hosts pass their own to route requests around browser CORS, for example
   * through Obsidian's `requestUrl`.
   */
  fetch?: typeof fetch;
}
