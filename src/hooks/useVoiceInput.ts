import { useCallback, useEffect, useRef, useState } from "react";
import {
  BrowserVoiceProvider,
  OpenAIWhisperProvider,
  GeminiSpeechProvider,
  type IVoiceProvider,
  type VoiceInputResult,
  type VoiceInputError,
  type VoiceRuntime,
} from "../utils/voice-providers";
import type { VoiceConfig } from "../types";
import { logger } from "../utils/logger";

export const useVoiceInput = (
  voiceConfig: VoiceConfig,
  onResult: (text: string) => void,
  onError: (msg: string) => void,
  runtime?: VoiceRuntime,
) => {
  const [isListening, setIsListening] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);

  const stop = useCallback(() => {
    const stopFn = stopRef.current;
    stopRef.current = null;
    if (stopFn) {
      stopFn();
    }
    setIsListening(false);
  }, []);

  useEffect(() => {
    return () => {
      if (stopRef.current) {
        stopRef.current();
        stopRef.current = null;
      }
    };
  }, []);

  const start = useCallback(() => {
    if (!voiceConfig.enabled) {
      logger.warn("Voice", "Voice input is disabled in settings");
      return;
    }

    if (stopRef.current) {
      stopRef.current();
      stopRef.current = null;
    }

    // Get the appropriate provider
    let provider: IVoiceProvider | null = null;

    switch (voiceConfig.activeProvider) {
      case "browser":
        provider = new BrowserVoiceProvider(runtime);
        break;
      case "openai":
        provider = new OpenAIWhisperProvider(
          voiceConfig.providers.openai,
          runtime,
        );
        break;
      case "gemini":
        provider = new GeminiSpeechProvider(
          voiceConfig.providers.gemini,
          runtime,
        );
        break;
      default:
        onError(`Unknown voice provider: ${voiceConfig.activeProvider}`);
        return;
    }

    // Check if provider is available
    if (!provider.isAvailable()) {
      onError(`${provider.getName()} is not available in this browser.`);
      logger.error("Voice", `Provider ${provider.getName()} is not available`);
      return;
    }

    logger.info("Voice", `Starting ${provider.getName()}...`, {
      language:
        voiceConfig.language ||
        runtime?.win?.navigator.language ||
        (typeof navigator !== "undefined" ? navigator.language : "en-US"),
    });

    setIsListening(true);
    let finished = false;

    const finish = () => {
      finished = true;
      stopRef.current = null;
      setIsListening(false);
    };

    const handleResult = (result: VoiceInputResult) => {
      logger.info("Voice", "Transcription received", {
        text: result.transcript,
        confidence: result.confidence,
      });
      finish();
      onResult(result.transcript);
    };

    const handleError = (error: VoiceInputError) => {
      logger.error("Voice", "Voice input error", error);
      finish();
      onError(error.message);
    };

    const cleanup = provider.start(
      voiceConfig.language,
      handleResult,
      handleError,
      finish,
    );

    if (!finished) {
      stopRef.current = cleanup;
    }
  }, [voiceConfig, onResult, onError, runtime]);

  return { isListening, start, stop };
};
