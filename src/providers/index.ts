import type { AIProvider, ProviderConfig } from "../types";
import type { IAIProvider, TestResult } from "./types";
import { GeminiProvider } from "./gemini-provider";
import { OpenAIProvider } from "./openai-provider";
import { AnthropicProvider } from "./anthropic-provider";

export { getToolDefinitions } from "./tools";
export { getSystemPrompt } from "./system-prompt";
export type {
  IAIProvider,
  AIProviderResponse,
  ToolDefinition,
  ToolCall,
  ToolResult,
  ChatMessage,
  TestResult,
} from "./types";

export function createProvider(
  type: AIProvider,
  config: ProviderConfig,
): IAIProvider {
  switch (type) {
    case "gemini":
      return new GeminiProvider(config);
    case "openai":
      return new OpenAIProvider({
        ...config,
        baseUrl: config.baseUrl || "https://api.openai.com/v1",
        model: config.model || "gpt-4o",
      });
    case "anthropic":
      return new AnthropicProvider({
        ...config,
        baseUrl: config.baseUrl || "https://api.anthropic.com",
        model: config.model || "claude-sonnet-4-20250514",
      });
    case "openai-compatible":
      return new OpenAIProvider(config);
  }
}

export async function testProvider(
  type: AIProvider,
  config: ProviderConfig,
): Promise<TestResult> {
  try {
    const provider = createProvider(type, config);
    return await provider.test();
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
