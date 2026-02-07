import {
  GoogleGenAI,
  Type,
  type FunctionDeclaration,
  type Part,
} from "@google/genai";
import type {
  IAIProvider,
  AIProviderResponse,
  ToolDefinition,
  ToolResult,
  ChatMessage,
  TestResult,
  JSONSchemaProperty,
} from "./types";
import type { ProviderConfig } from "../types";

function mapJsonSchemaTypeToGemini(
  type: JSONSchemaProperty["type"],
): (typeof Type)[keyof typeof Type] {
  switch (type) {
    case "string":
      return Type.STRING;
    case "number":
      return Type.NUMBER;
    case "boolean":
      return Type.BOOLEAN;
    case "array":
      return Type.ARRAY;
    case "object":
      return Type.OBJECT;
  }
}

function convertProperty(prop: JSONSchemaProperty): Record<string, unknown> {
  const result: Record<string, unknown> = {
    type: mapJsonSchemaTypeToGemini(prop.type),
  };
  if (prop.description) result.description = prop.description;
  if (prop.enum) result.enum = prop.enum;
  if (prop.items) result.items = convertProperty(prop.items);
  if (prop.properties) {
    result.properties = Object.fromEntries(
      Object.entries(prop.properties).map(([k, v]) => [k, convertProperty(v)]),
    );
  }
  if (prop.required) result.required = prop.required;
  return result;
}

function toGeminiFunctionDeclarations(
  tools: ToolDefinition[],
): FunctionDeclaration[] {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: {
      type: Type.OBJECT,
      properties: Object.fromEntries(
        Object.entries(tool.parameters.properties).map(([k, v]) => [
          k,
          convertProperty(v),
        ]),
      ),
      required: tool.parameters.required,
    },
  }));
}

export class GeminiProvider implements IAIProvider {
  private readonly config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  async chat(
    systemPrompt: string,
    prompt: string,
    tools: ToolDefinition[],
    toolResults?: ToolResult[],
    history?: ChatMessage[],
  ): Promise<AIProviderResponse> {
    const ai = new GoogleGenAI({ apiKey: this.config.apiKey });
    const geminiFunctions = toGeminiFunctionDeclarations(tools);

    // Build Gemini history from ChatMessage[]
    const geminiHistory: Array<{ role: string; parts: Part[] }> = [];
    if (history) {
      for (const msg of history) {
        if (msg.role === "user") {
          geminiHistory.push({
            role: "user",
            parts: [{ text: msg.content || "" }],
          });
        } else if (msg.role === "assistant") {
          const parts: Part[] = [];
          if (msg.content) parts.push({ text: msg.content });
          if (msg.toolCalls) {
            for (const tc of msg.toolCalls) {
              parts.push({
                functionCall: { name: tc.name, args: tc.args },
              });
            }
          }
          geminiHistory.push({ role: "model", parts });
        } else if (msg.role === "tool" && msg.toolResults) {
          const parts: Part[] = msg.toolResults.map((tr) => ({
            functionResponse: {
              name: tr.name,
              response: { result: tr.result },
            },
          }));
          geminiHistory.push({ role: "function", parts });
        }
      }
    }

    const chat = ai.chats.create({
      model: this.config.model || "gemini-2.0-flash",
      config: {
        systemInstruction: systemPrompt,
        tools: [{ functionDeclarations: geminiFunctions }],
      },
      history: geminiHistory.length > 0 ? geminiHistory : undefined,
    });

    // Determine what to send
    let message: string | Part[];
    if (toolResults && toolResults.length > 0) {
      message = toolResults.map((tr) => ({
        functionResponse: {
          name: tr.name,
          response: { result: tr.result },
        },
      }));
    } else {
      message = prompt;
    }

    const response = await chat.sendMessage({ message });

    const result: AIProviderResponse = {};

    if (response.text) {
      result.text = response.text;
    }

    if (response.functionCalls && response.functionCalls.length > 0) {
      result.toolCalls = response.functionCalls.map((fc) => ({
        name: fc.name!,
        args: (fc.args as Record<string, unknown>) || {},
      }));
    }

    if (response.usageMetadata) {
      result.tokenCount = response.usageMetadata.totalTokenCount || 0;
    }

    return result;
  }

  async test(): Promise<TestResult> {
    try {
      const ai = new GoogleGenAI({ apiKey: this.config.apiKey });
      const response = await ai.models.generateContent({
        model: this.config.model || "gemini-2.0-flash",
        contents: "Say hello in one word.",
      });
      return {
        success: true,
        message: `Connected to Gemini. Response: "${response.text?.trim()}"`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
