import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "../defaultSettings";
import type { VoiceConfig, VoiceProvider } from "../types";
import {
  BROWSER_SPEECH_UNAVAILABLE_MESSAGE,
  type VoiceRuntime,
} from "../utils/voice-providers";
import { useVoiceInput } from "./useVoiceInput";

type VoiceInputHandle = ReturnType<typeof useVoiceInput>;

const constructed = vi.fn();

class FakeRecognition {
  continuous = false;
  interimResults = false;
  lang = "";
  onstart = null;
  onend = null;
  onerror = null;
  onresult = null;
  start = vi.fn();
  stop = vi.fn();
  abort = vi.fn();

  constructor() {
    constructed();
  }
}

const createRuntime = (
  overrides: Partial<VoiceRuntime> = {},
): VoiceRuntime => ({
  win: {
    SpeechRecognition: FakeRecognition,
    navigator: { language: "en-US" },
  } as unknown as Window,
  ...overrides,
});

const voiceConfigFor = (activeProvider: VoiceProvider): VoiceConfig => ({
  ...DEFAULT_SETTINGS.voiceConfig,
  enabled: true,
  activeProvider,
});

const renderVoiceInput = (voiceConfig: VoiceConfig, runtime: VoiceRuntime) => {
  const onResult = vi.fn(),
    onError = vi.fn();
  let handle: VoiceInputHandle | undefined;
  const capture = (value: VoiceInputHandle) => {
    handle = value;
  };
  const Probe = ({
    onReady,
  }: {
    onReady: (value: VoiceInputHandle) => void;
  }) => {
    onReady(useVoiceInput(voiceConfig, onResult, onError, runtime));
    return null;
  };
  renderToStaticMarkup(createElement(Probe, { onReady: capture }));
  if (!handle) {
    throw new Error("useVoiceInput did not render");
  }
  return { handle, onResult, onError };
};

describe("useVoiceInput with a host that disables browser speech", () => {
  it("explains why the browser provider cannot be used", () => {
    constructed.mockClear();
    const { handle } = renderVoiceInput(
      voiceConfigFor("browser"),
      createRuntime({ browserSpeechSupported: false }),
    );

    expect(handle.unavailableMessage).toBe(BROWSER_SPEECH_UNAVAILABLE_MESSAGE);
  });

  it("tells the user to pick another provider instead of starting recognition", () => {
    constructed.mockClear();
    const { handle, onError } = renderVoiceInput(
      voiceConfigFor("browser"),
      createRuntime({ browserSpeechSupported: false }),
    );

    handle.start();

    expect(onError).toHaveBeenCalledWith(BROWSER_SPEECH_UNAVAILABLE_MESSAGE);
    expect(constructed).not.toHaveBeenCalled();
  });

  it("does not block OpenAI or Gemini", () => {
    const openai = renderVoiceInput(
      voiceConfigFor("openai"),
      createRuntime({ browserSpeechSupported: false }),
    );
    const gemini = renderVoiceInput(
      voiceConfigFor("gemini"),
      createRuntime({ browserSpeechSupported: false }),
    );

    expect(openai.handle.unavailableMessage).toBeNull();
    expect(gemini.handle.unavailableMessage).toBeNull();
  });
});

describe("useVoiceInput with a host that does not set the flag", () => {
  it("starts browser recognition as before", () => {
    constructed.mockClear();
    const { handle, onError } = renderVoiceInput(
      voiceConfigFor("browser"),
      createRuntime(),
    );

    expect(handle.unavailableMessage).toBeNull();
    handle.start();

    expect(constructed).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });
});
