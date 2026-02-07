import type { AIProvider, ProviderConfig } from "../types";
import type { IAIProvider, TestResult } from "./types";

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

export async function createProvider(
  type: AIProvider,
  config: ProviderConfig,
): Promise<IAIProvider> {
  switch (type) {
    case "gemini": {
      const { GeminiProvider } = await import("./gemini-provider");
      return new GeminiProvider(config);
    }
    case "openai": {
      const { OpenAIProvider } = await import("./openai-provider");
      return new OpenAIProvider({
        ...config,
        baseUrl: config.baseUrl || "https://api.openai.com/v1",
        model: config.model || "gpt-4o",
      });
    }
    case "anthropic": {
      const { AnthropicProvider } = await import("./anthropic-provider");
      return new AnthropicProvider({
        ...config,
        baseUrl: config.baseUrl || "https://api.anthropic.com",
        model: config.model || "claude-sonnet-4-20250514",
      });
    }
    case "openai-compatible": {
      const { OpenAIProvider } = await import("./openai-provider");
      return new OpenAIProvider(config);
    }
  }
}

export async function testProvider(
  type: AIProvider,
  config: ProviderConfig,
): Promise<TestResult> {
  try {
    const provider = await createProvider(type, config);
    return await provider.test();
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
