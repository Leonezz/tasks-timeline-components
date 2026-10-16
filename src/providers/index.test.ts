import { afterEach, describe, expect, it, vi } from "vitest";
import type { ProviderConfig } from "../types";
import { resolveProviderFactory, testProvider } from "./index";
import type { AIProviderFactory, IAIProvider } from "./types";

const GEMINI_CONFIG: ProviderConfig = {
  apiKey: "test-key",
  baseUrl: "",
  model: "gemini-2.0-flash",
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

function jsonFetch(body: unknown) {
  return vi.fn<typeof fetch>(
    async () =>
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
  );
}

function hostFactory(message: string) {
  const provider: IAIProvider = {
    chat: vi.fn<IAIProvider["chat"]>(),
    test: vi.fn<IAIProvider["test"]>(async () => ({ success: true, message })),
  };
  const factory = vi.fn<AIProviderFactory>(async () => provider);
  return { factory, provider };
}

describe("testProvider", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends the test request through an injected fetch", async () => {
    const globalFetch = jsonFetch(geminiResponse);
    vi.stubGlobal("fetch", globalFetch);
    const hostFetch = jsonFetch(geminiResponse);

    const result = await testProvider("gemini", GEMINI_CONFIG, {
      fetch: hostFetch,
    });

    expect(result).toEqual({
      success: true,
      message: 'Connected to gemini-2.0-flash. Response: "Hello"',
    });
    expect(hostFetch).toHaveBeenCalledOnce();
    expect(globalFetch).not.toHaveBeenCalled();
  });

  it("uses the global fetch when none is injected", async () => {
    const globalFetch = jsonFetch(geminiResponse);
    vi.stubGlobal("fetch", globalFetch);

    const result = await testProvider("gemini", GEMINI_CONFIG);

    expect(result.success).toBe(true);
    expect(globalFetch).toHaveBeenCalledOnce();
  });

  it("tests the provider a host factory builds", async () => {
    const globalFetch = jsonFetch(geminiResponse);
    vi.stubGlobal("fetch", globalFetch);
    const { factory, provider } = hostFactory("host provider ok");

    const result = await testProvider("gemini", GEMINI_CONFIG, {
      providerFactory: factory,
    });

    expect(result).toEqual({ success: true, message: "host provider ok" });
    expect(factory).toHaveBeenCalledWith("gemini", GEMINI_CONFIG);
    expect(provider.test).toHaveBeenCalledOnce();
    expect(globalFetch).not.toHaveBeenCalled();
  });

  it("fails when a fetch is combined with a host factory", async () => {
    const { factory } = hostFactory("unused");
    const hostFetch = jsonFetch(geminiResponse);

    const result = await testProvider("gemini", GEMINI_CONFIG, {
      providerFactory: factory,
      fetch: hostFetch,
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(
      /aiFetch.*cannot be combined.*aiProviderFactory/,
    );
    expect(factory).not.toHaveBeenCalled();
    expect(hostFetch).not.toHaveBeenCalled();
  });
});

describe("testProvider with an invalid fetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fails instead of falling back to the global fetch", async () => {
    const globalFetch = jsonFetch(geminiResponse);
    vi.stubGlobal("fetch", globalFetch);

    const result = await testProvider("gemini", GEMINI_CONFIG, {
      fetch: "requestUrl" as unknown as typeof fetch,
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/must be a function.*got string/);
    expect(globalFetch).not.toHaveBeenCalled();
  });
});

describe("resolveProviderFactory", () => {
  it("returns the host factory unchanged", () => {
    const { factory } = hostFactory("ok");

    expect(resolveProviderFactory({ providerFactory: factory })).toBe(factory);
  });

  it("builds built-in providers that use the injected fetch", async () => {
    const hostFetch = jsonFetch(geminiResponse);
    const factory = resolveProviderFactory({ fetch: hostFetch });

    const provider = await factory("gemini", GEMINI_CONFIG);
    const response = await provider.chat("system", "Hi", []);

    expect(response.text).toBe("Hello");
    expect(hostFetch).toHaveBeenCalledOnce();
  });

  it("throws when the fetch is not a function", () => {
    expect(() =>
      resolveProviderFactory({ fetch: null as unknown as typeof fetch }),
    ).toThrow(
      "A custom fetch (aiFetch) must be a function like the global fetch, got null.",
    );
  });

  it("throws when a fetch is combined with a host factory", () => {
    const { factory } = hostFactory("unused");

    expect(() =>
      resolveProviderFactory({
        providerFactory: factory,
        fetch: jsonFetch(geminiResponse),
      }),
    ).toThrow(/cannot be combined/);
  });
});
