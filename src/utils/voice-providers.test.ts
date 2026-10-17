import { describe, expect, it, vi } from "vitest";
import {
  BROWSER_SPEECH_UNAVAILABLE_MESSAGE,
  BrowserVoiceProvider,
  isBrowserSpeechDisabledByHost,
  type VoiceRuntime,
} from "./voice-providers";

interface FakeSpeechErrorEvent {
  error: string;
  message: string;
}

class FakeRecognition {
  static instances: FakeRecognition[] = [];
  continuous = false;
  interimResults = false;
  lang = "";
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((event: FakeSpeechErrorEvent) => void) | null = null;
  onresult: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn();
  abort = vi.fn();

  constructor() {
    FakeRecognition.instances.push(this);
  }
}

const createSpeechRuntime = (
  overrides: Partial<VoiceRuntime> = {},
): VoiceRuntime => {
  FakeRecognition.instances = [];
  return {
    win: {
      SpeechRecognition: FakeRecognition,
      navigator: { language: "en-US" },
    } as unknown as Window,
    ...overrides,
  };
};

const startProvider = (runtime: VoiceRuntime) => {
  const onResult = vi.fn(),
    onError = vi.fn(),
    onEnd = vi.fn(),
    provider = new BrowserVoiceProvider(runtime);
  provider.start("", onResult, onError, onEnd);
  return { onResult, onError, onEnd };
};

describe("BrowserVoiceProvider network error", () => {
  it("tells the user to pick another provider without blaming the connection", () => {
    const { onError, onEnd } = startProvider(createSpeechRuntime());
    const recognition = FakeRecognition.instances[0];

    recognition.onerror?.({ error: "network", message: "" });

    expect(onError).toHaveBeenCalledWith({
      code: "network",
      message: BROWSER_SPEECH_UNAVAILABLE_MESSAGE,
    });
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it("names the alternative providers and where to choose them", () => {
    expect(BROWSER_SPEECH_UNAVAILABLE_MESSAGE).toContain("OpenAI or Gemini");
    expect(BROWSER_SPEECH_UNAVAILABLE_MESSAGE).toContain("Settings → AI");
    expect(BROWSER_SPEECH_UNAVAILABLE_MESSAGE).not.toMatch(
      /internet|connection/i,
    );
    expect(BROWSER_SPEECH_UNAVAILABLE_MESSAGE).not.toMatch(
      /electron|obsidian/i,
    );
  });
});

describe("VoiceRuntime.browserSpeechSupported", () => {
  it("keeps the browser provider available when the host does not set the flag", () => {
    const provider = new BrowserVoiceProvider(createSpeechRuntime());

    expect(provider.isAvailable()).toBe(true);
  });

  it("keeps the browser provider available when the host sets the flag to true", () => {
    const provider = new BrowserVoiceProvider(
      createSpeechRuntime({ browserSpeechSupported: true }),
    );

    expect(provider.isAvailable()).toBe(true);
  });

  it("reports the browser provider unavailable when the host sets the flag to false", () => {
    const provider = new BrowserVoiceProvider(
      createSpeechRuntime({ browserSpeechSupported: false }),
    );

    expect(provider.isAvailable()).toBe(false);
  });

  it("refuses to start recognition when the host sets the flag to false", () => {
    const { onError, onEnd, onResult } = startProvider(
      createSpeechRuntime({ browserSpeechSupported: false }),
    );

    expect(FakeRecognition.instances).toHaveLength(0);
    expect(onError).toHaveBeenCalledWith({
      code: "not-supported",
      message: BROWSER_SPEECH_UNAVAILABLE_MESSAGE,
    });
    expect(onEnd).toHaveBeenCalledTimes(1);
    expect(onResult).not.toHaveBeenCalled();
  });

  it("treats only an explicit false as a host opt-out", () => {
    expect(isBrowserSpeechDisabledByHost(undefined)).toBe(false);
    expect(isBrowserSpeechDisabledByHost({})).toBe(false);
    expect(
      isBrowserSpeechDisabledByHost({ browserSpeechSupported: true }),
    ).toBe(false);
    expect(
      isBrowserSpeechDisabledByHost({ browserSpeechSupported: false }),
    ).toBe(true);
  });
});
