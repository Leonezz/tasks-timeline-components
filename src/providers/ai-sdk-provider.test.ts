import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ProviderConfig } from "../types";
import { AISDKProvider, type AISDKProviderType } from "./ai-sdk-provider";

const anthropicMessage = {
  id: "msg_1",
  type: "message",
  role: "assistant",
  model: "claude-sonnet-4-20250514",
  content: [{ type: "text", text: "Hello" }],
  stop_reason: "end_turn",
  stop_sequence: null,
  usage: { input_tokens: 3, output_tokens: 1 },
};

const geminiResponse = {
  candidates: [
    {
      content: { role: "model", parts: [{ text: "Hello" }] },
      finishReason: "STOP",
      index: 0,
    },
  ],
  usageMetadata: {
    promptTokenCount: 3,
    candidatesTokenCount: 1,
    totalTokenCount: 4,
  },
};

const openAIResponsesResponse = {
  id: "resp_1",
  created_at: 0,
  model: "gpt-4o",
  output: [
    {
      type: "message",
      role: "assistant",
      id: "msg_1",
      content: [{ type: "output_text", text: "Hello", annotations: [] }],
    },
  ],
  usage: { input_tokens: 3, output_tokens: 1 },
};

const openAIChatCompletion = {
  id: "chatcmpl-1",
  object: "chat.completion",
  created: 0,
  model: "deepseek-chat",
  choices: [
    {
      index: 0,
      message: { role: "assistant", content: "Hello" },
      finish_reason: "stop",
    },
  ],
  usage: { prompt_tokens: 3, completion_tokens: 1, total_tokens: 4 },
};

function jsonFetch(body: unknown) {
  return vi.fn<typeof fetch>(
    async () =>
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
  );
}

function stubFetch(body: unknown) {
  const fetchMock = jsonFetch(body);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function requestHeaders(fetchMock: ReturnType<typeof jsonFetch>): Headers {
  const init = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
  return new Headers(init?.headers);
}

function requestUrl(fetchMock: ReturnType<typeof jsonFetch>): string {
  return String(fetchMock.mock.calls[0]?.[0]);
}

// The AI SDK reads these in Node (browsers have no process.env). Clear them so
// a developer's shell cannot change the URLs these tests expect.
function clearBaseUrlEnv() {
  vi.stubEnv("ANTHROPIC_BASE_URL", undefined);
  vi.stubEnv("OPENAI_BASE_URL", undefined);
}

describe("AISDKProvider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("lets Anthropic requests run from a browser", async () => {
    const fetchMock = stubFetch(anthropicMessage);
    const provider = new AISDKProvider("anthropic", {
      apiKey: "test-key",
      baseUrl: "",
      model: "claude-sonnet-4-20250514",
    });

    const result = await provider.test();

    expect(result.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();
    const headers = requestHeaders(fetchMock);
    expect(headers.get("anthropic-dangerous-direct-browser-access")).toBe(
      "true",
    );
    expect(headers.get("x-api-key")).toBe("test-key");
  });
});

describe("AISDKProvider with an injected fetch", () => {
  const cases: {
    type: AISDKProviderType;
    config: ProviderConfig;
    body: unknown;
    url: string;
  }[] = [
    {
      type: "gemini",
      config: { apiKey: "k", baseUrl: "", model: "gemini-2.0-flash" },
      body: geminiResponse,
      url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    },
    {
      type: "openai",
      config: { apiKey: "k", baseUrl: "", model: "gpt-4o" },
      body: openAIResponsesResponse,
      url: "https://api.openai.com/v1/responses",
    },
    {
      type: "anthropic",
      config: { apiKey: "k", baseUrl: "", model: "claude-sonnet-4-20250514" },
      body: anthropicMessage,
      url: "https://api.anthropic.com/v1/messages",
    },
    {
      type: "openai-compatible",
      config: {
        apiKey: "k",
        baseUrl: "https://llm.example.test/v1",
        model: "deepseek-chat",
      },
      body: openAIChatCompletion,
      url: "https://llm.example.test/v1/chat/completions",
    },
  ];

  beforeEach(clearBaseUrlEnv);

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it.each(cases)(
    "sends $type chat requests through it instead of the global fetch",
    async ({ type, config, body, url }) => {
      const globalFetch = stubFetch(body);
      const hostFetch = jsonFetch(body);
      const provider = new AISDKProvider(type, config, { fetch: hostFetch });

      const response = await provider.chat("You are helpful.", "Hi", []);

      expect(response.text).toBe("Hello");
      expect(hostFetch).toHaveBeenCalledOnce();
      expect(requestUrl(hostFetch)).toBe(url);
      expect(globalFetch).not.toHaveBeenCalled();
    },
  );

  it("sends the connection test through it", async () => {
    const globalFetch = stubFetch(anthropicMessage);
    const hostFetch = jsonFetch(anthropicMessage);
    const provider = new AISDKProvider(
      "anthropic",
      { apiKey: "k", baseUrl: "", model: "claude-sonnet-4-20250514" },
      { fetch: hostFetch },
    );

    const result = await provider.test();

    expect(result.success).toBe(true);
    expect(hostFetch).toHaveBeenCalledOnce();
    expect(globalFetch).not.toHaveBeenCalled();
  });

  it("reports the injected fetch's failure from the connection test", async () => {
    const globalFetch = stubFetch(geminiResponse);
    const hostFetch = vi.fn<typeof fetch>(async () => {
      throw new TypeError("requestUrl failed: net::ERR_NAME_NOT_RESOLVED");
    });
    const provider = new AISDKProvider(
      "gemini",
      { apiKey: "k", baseUrl: "", model: "gemini-2.0-flash" },
      { fetch: hostFetch },
    );

    const result = await provider.test();

    expect(result).toEqual({
      success: false,
      message: "requestUrl failed: net::ERR_NAME_NOT_RESOLVED",
    });
    expect(hostFetch).toHaveBeenCalledOnce();
    expect(globalFetch).not.toHaveBeenCalled();
  });

  it("rejects chat with the injected fetch's error instead of retrying globally", async () => {
    const globalFetch = stubFetch(geminiResponse);
    const hostFetch = vi.fn<typeof fetch>(async () => {
      throw new Error("requestUrl failed: certificate rejected");
    });
    const provider = new AISDKProvider(
      "gemini",
      { apiKey: "k", baseUrl: "", model: "gemini-2.0-flash" },
      { fetch: hostFetch },
    );

    await expect(provider.chat("system", "Hi", [])).rejects.toThrow(
      "requestUrl failed: certificate rejected",
    );
    expect(globalFetch).not.toHaveBeenCalled();
  });

  it("reports an error status the injected fetch returns", async () => {
    const hostFetch = vi.fn<typeof fetch>(
      async () =>
        new Response(
          JSON.stringify({
            type: "error",
            error: {
              type: "authentication_error",
              message: "invalid x-api-key",
            },
          }),
          { status: 401, headers: { "content-type": "application/json" } },
        ),
    );
    const provider = new AISDKProvider(
      "anthropic",
      { apiKey: "bad", baseUrl: "", model: "claude-sonnet-4-20250514" },
      { fetch: hostFetch },
    );

    const result = await provider.test();

    expect(result).toEqual({ success: false, message: "invalid x-api-key" });
  });

  it("rejects a result that is not a fetch Response", async () => {
    // What an unconverted Obsidian requestUrl result looks like.
    const requestUrlResult = {
      status: 200,
      headers: { "content-type": "application/json" },
      text: JSON.stringify(geminiResponse),
      json: geminiResponse,
    };
    const hostFetch = vi.fn(async () => requestUrlResult);
    const provider = new AISDKProvider(
      "gemini",
      { apiKey: "k", baseUrl: "", model: "gemini-2.0-flash" },
      { fetch: hostFetch as unknown as typeof fetch },
    );

    await expect(provider.chat("system", "Hi", [])).rejects.toThrow(
      /aiFetch\) must resolve to a fetch Response/,
    );
    const result = await provider.test();
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/must resolve to a fetch Response/);
  });
});
