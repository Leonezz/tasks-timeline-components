import { afterEach, describe, expect, it, vi } from "vitest";
import { AISDKProvider } from "./ai-sdk-provider";

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

function stubFetch(body: unknown) {
  const fetchMock = vi.fn<typeof fetch>(
    async () =>
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function requestHeaders(fetchMock: ReturnType<typeof stubFetch>): Headers {
  const init = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
  return new Headers(init?.headers);
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
