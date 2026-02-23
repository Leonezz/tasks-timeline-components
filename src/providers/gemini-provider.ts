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

async function loadGeminiSDK() {
  try {
    return await import("@google/genai");
  } catch {
    throw new Error(
      "The '@google/genai' package is required. Install it with: pnpm add @google/genai",
    );
  }
}

function mapJsonSchemaTypeToGemini(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Type: any,
  type: JSONSchemaProperty["type"],
) {
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

function convertProperty(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Type: any,
  prop: JSONSchemaProperty,
): Record<string, unknown> {
  const result: Record<string, unknown> = {
    type: mapJsonSchemaTypeToGemini(Type, prop.type),
  };
  if (prop.description) result.description = prop.description;
  if (prop.enum) result.enum = prop.enum;
  if (prop.items) result.items = convertProperty(Type, prop.items);
  if (prop.properties) {
    result.properties = Object.fromEntries(
      Object.entries(prop.properties).map(([k, v]) => [
        k,
        convertProperty(Type, v),
      ]),
    );
  }
  if (prop.required) result.required = prop.required;
  return result;
}

function toGeminiFunctionDeclarations(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Type: any,
  tools: ToolDefinition[],
) {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: {
      type: Type.OBJECT,
      properties: Object.fromEntries(
        Object.entries(tool.parameters.properties).map(([k, v]) => [
          k,
          convertProperty(Type, v),
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
    const { GoogleGenAI, Type } = await loadGeminiSDK();
    const ai = new GoogleGenAI({ apiKey: this.config.apiKey });
    const geminiFunctions = toGeminiFunctionDeclarations(Type, tools);

    // Build Gemini history from ChatMessage[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const geminiHistory: Array<{ role: string; parts: any[] }> = [];
    if (history) {
      for (const msg of history) {
        if (msg.role === "user") {
          geminiHistory.push({
            role: "user",
            parts: [{ text: msg.content || "" }],
          });
        } else if (msg.role === "assistant") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const parts: any[] = [];
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
          const parts = msg.toolResults.map((tr) => ({
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let message: string | any[];
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result.toolCalls = response.functionCalls.map((fc: any) => ({
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
      const { GoogleGenAI } = await loadGeminiSDK();
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
