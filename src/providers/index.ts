import type { AIProvider, ProviderConfig } from "../types";
import type {
  AIProviderFactory,
  IAIProvider,
  ProviderRuntimeOptions,
  TestResult,
} from "./types";
import { GeminiProvider } from "./gemini-provider";
import { OpenAICompatibleProvider, OpenAIProvider } from "./openai-provider";
import { AnthropicProvider } from "./anthropic-provider";

export { getToolDefinitions } from "./tools";
export { getSystemPrompt } from "./system-prompt";
export type {
  IAIProvider,
  AIProviderFactory,
  AIProviderResponse,
  ProviderRuntimeOptions,
  ToolDefinition,
  ToolCall,
  ToolResult,
  ChatMessage,
  TestResult,
} from "./types";

export interface ProviderFactoryOptions extends ProviderRuntimeOptions {
  /** Host factory that builds its own providers instead of the built-in ones. */
  providerFactory?: AIProviderFactory;
}

export async function createProvider(
  type: AIProvider,
  config: ProviderConfig,
  options: ProviderRuntimeOptions = {},
): Promise<IAIProvider> {
  switch (type) {
    case "gemini":
      return new GeminiProvider(config, options);
    case "openai":
      return new OpenAIProvider(
        {
          ...config,
          baseUrl: config.baseUrl || "https://api.openai.com/v1",
          model: config.model || "gpt-4o",
        },
        options,
      );
    case "anthropic":
      return new AnthropicProvider(
        {
          ...config,
          baseUrl: config.baseUrl || "https://api.anthropic.com/v1",
          model: config.model || "claude-sonnet-4-20250514",
        },
        options,
      );
    case "openai-compatible":
      return new OpenAICompatibleProvider(config, options);
  }
}

/**
 * Returns the factory the built-in agent and the Settings "Test Connection"
 * button share: the host's factory when given, otherwise the built-in
 * providers with the host's fetch.
 *
 * Throws when both are given (a custom factory makes its own requests, so the
 * fetch would otherwise be ignored without notice) and when the fetch is not a
 * function, instead of falling back to the global fetch.
 */
export function resolveProviderFactory(
  options: ProviderFactoryOptions = {},
): AIProviderFactory {
  if (options.fetch !== undefined && typeof options.fetch !== "function") {
    throw new Error(
      `A custom fetch (aiFetch) must be a function like the global fetch, got ${
        options.fetch === null ? "null" : typeof options.fetch
      }. Omit it to use the global fetch.`,
    );
  }
  if (options.providerFactory && options.fetch) {
    throw new Error(
      "A custom fetch (aiFetch) cannot be combined with a custom provider factory (aiProviderFactory): " +
        "the fetch only reaches the built-in providers, and a custom factory makes its own requests. " +
        "Use your fetch inside the factory, or drop the factory.",
    );
  }
  if (options.providerFactory) return options.providerFactory;

  const runtimeOptions: ProviderRuntimeOptions = { fetch: options.fetch };
  return (type, config) => createProvider(type, config, runtimeOptions);
}

export async function testProvider(
  type: AIProvider,
  config: ProviderConfig,
  options: ProviderFactoryOptions = {},
): Promise<TestResult> {
  try {
    const provider = await resolveProviderFactory(options)(type, config);
    return await provider.test();
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
