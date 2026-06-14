import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import {
  generateText,
  jsonSchema,
  type JSONValue,
  type LanguageModel,
  type ModelMessage,
  type ToolSet,
} from "ai";
import type { ProviderConfig } from "../types";
import type {
  AIProviderResponse,
  ChatMessage,
  IAIProvider,
  TestResult,
  ToolDefinition,
  ToolResult,
} from "./types";

export type AISDKProviderType =
  | "gemini"
  | "openai"
  | "anthropic"
  | "openai-compatible";

const DEFAULT_MODELS: Record<AISDKProviderType, string> = {
  gemini: "gemini-2.0-flash",
  openai: "gpt-4o",
  anthropic: "claude-sonnet-4-20250514",
  "openai-compatible": "gpt-4o",
};

type OpenAILanguageModelMode = "responses" | "chat";

function getOpenAILanguageModelMode(
  type: AISDKProviderType,
  config: ProviderConfig,
): OpenAILanguageModelMode | undefined {
  if (type === "openai") {
    return config.useResponsesApi === false ? "chat" : "responses";
  }

  if (type === "openai-compatible") {
    return config.useResponsesApi ? "responses" : "chat";
  }

  return undefined;
}

function createOpenAILanguageModel(
  provider: ReturnType<typeof createOpenAI>,
  model: string,
  mode: OpenAILanguageModelMode,
): LanguageModel {
  if (mode === "chat") {
    return provider.chat(model as Parameters<typeof provider.chat>[0]);
  }

  return provider(model as Parameters<typeof provider>[0]);
}

function createLanguageModel(
  type: AISDKProviderType,
  config: ProviderConfig,
): LanguageModel {
  const model = config.model || DEFAULT_MODELS[type];
  const baseURL = normalizeBaseURL(type, config.baseUrl);

  switch (type) {
    case "gemini": {
      const provider = createGoogleGenerativeAI({
        apiKey: config.apiKey,
        baseURL,
      });
      return provider(model);
    }
    case "openai": {
      const provider = createOpenAI({
        apiKey: config.apiKey,
        baseURL,
      });
      return createOpenAILanguageModel(
        provider,
        model,
        getOpenAILanguageModelMode(type, config) ?? "responses",
      );
    }
    case "anthropic": {
      const provider = createAnthropic({
        apiKey: config.apiKey,
        baseURL,
      });
      return provider(model);
    }
    case "openai-compatible": {
      const provider = createOpenAI({
        apiKey: config.apiKey,
        baseURL,
        name: "openai-compatible",
      });
      return createOpenAILanguageModel(
        provider,
        model,
        getOpenAILanguageModelMode(type, config) ?? "chat",
      );
    }
  }
}

function normalizeBaseURL(
  type: AISDKProviderType,
  baseUrl: string,
): string | undefined {
  if (!baseUrl) return undefined;

  const normalized = baseUrl.replace(/\/$/, "");
  if (type === "anthropic" && normalized === "https://api.anthropic.com") {
    return "https://api.anthropic.com/v1";
  }

  return baseUrl;
}

function toAISDKTools(tools: ToolDefinition[]): ToolSet | undefined {
  if (tools.length === 0) return undefined;

  return Object.fromEntries(
    tools.map((tool) => [
      tool.name,
      {
        description: tool.description,
        inputSchema: jsonSchema(
          tool.parameters as unknown as Parameters<typeof jsonSchema>[0],
        ),
      },
    ]),
  ) as ToolSet;
}

function toToolCallId(toolName: string, index: number): string {
  return `call_${toolName}_${index}`;
}

function toModelMessages(
  prompt: string,
  history?: ChatMessage[],
  toolResults?: ToolResult[],
): ModelMessage[] {
  if (!history || history.length === 0) {
    if (toolResults && toolResults.length > 0) {
      return [
        {
          role: "user",
          content: prompt,
        },
        toToolMessage(toolResults),
      ];
    }

    return [
      {
        role: "user",
        content: prompt,
      },
    ];
  }

  const messages: ModelMessage[] = [];

  for (const message of history) {
    if (message.role === "user") {
      messages.push({
        role: "user",
        content: message.content || "",
      });
      continue;
    }

    if (message.role === "assistant") {
      const assistantContent: Exclude<
        Extract<ModelMessage, { role: "assistant" }>["content"],
        string
      > = [];

      if (message.content) {
        assistantContent.push({
          type: "text",
          text: message.content,
        });
      }

      for (const [index, toolCall] of (
        message.toolCalls ?? []
      ).entries()) {
        assistantContent.push({
          type: "tool-call",
          toolCallId: toolCall.id || toToolCallId(toolCall.name, index),
          toolName: toolCall.name,
          input: toolCall.args,
        });
      }

      messages.push({
        role: "assistant",
        content:
          assistantContent.length > 0
            ? assistantContent
            : message.content || "",
      });
      continue;
    }

    if (message.role === "tool" && message.toolResults) {
      messages.push(toToolMessage(message.toolResults));
    }
  }

  return messages;
}

function toToolMessage(
  toolResults: ToolResult[],
): Extract<ModelMessage, { role: "tool" }> {
  return {
    role: "tool",
    content: toolResults.map((toolResult, index) => ({
      type: "tool-result",
      toolCallId: toolResult.id || toToolCallId(toolResult.name, index),
      toolName: toolResult.name,
      output: {
        type: "json",
        value: toJSONValue(toolResult.result),
      },
    })),
  };
}

function toJSONValue(value: unknown): JSONValue {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (Array.isArray(value)) return value.map(toJSONValue);
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        toJSONValue(item),
      ]),
    ) as JSONValue;
  }

  return String(value);
}

export class AISDKProvider implements IAIProvider {
  private readonly type: AISDKProviderType;
  private readonly config: ProviderConfig;

  constructor(type: AISDKProviderType, config: ProviderConfig) {
    this.type = type;
    this.config = config;
  }

  async chat(
    systemPrompt: string,
    prompt: string,
    tools: ToolDefinition[],
    toolResults?: ToolResult[],
    history?: ChatMessage[],
  ): Promise<AIProviderResponse> {
    const response = await generateText({
      model: createLanguageModel(this.type, this.config),
      system: systemPrompt,
      messages: toModelMessages(prompt, history, toolResults),
      tools: toAISDKTools(tools),
    });

    return {
      text: response.text,
      toolCalls:
        response.toolCalls.length > 0
          ? response.toolCalls.map((toolCall) => ({
              id: toolCall.toolCallId,
              name: toolCall.toolName,
              args:
                toolCall.input &&
                typeof toolCall.input === "object" &&
                !Array.isArray(toolCall.input)
                  ? (toolCall.input as Record<string, unknown>)
                  : {},
            }))
          : undefined,
      tokenCount: response.totalUsage.totalTokens ?? undefined,
      tokenUsage: {
        inputTokens: response.totalUsage.inputTokens ?? 0,
        outputTokens: response.totalUsage.outputTokens ?? 0,
        totalTokens: response.totalUsage.totalTokens ?? 0,
      },
    };
  }

  async test(): Promise<TestResult> {
    try {
      const response = await generateText({
        model: createLanguageModel(this.type, this.config),
        prompt: "Say hello in one word.",
        maxOutputTokens: 10,
      });

      return {
        success: true,
        message: `Connected to ${this.config.model || DEFAULT_MODELS[this.type]}${this.connectionModeLabel()}. Response: "${response.text.trim()}"`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private connectionModeLabel(): string {
    const mode = getOpenAILanguageModelMode(this.type, this.config);
    if (mode === "responses") return " via Responses API";
    if (mode === "chat") return " via Chat Completions";
    return "";
  }
}
