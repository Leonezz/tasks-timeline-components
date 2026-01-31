import { useCallback, useState } from "react";
import {
  BrowserVoiceProvider,
  OpenAIWhisperProvider,
  GeminiSpeechProvider,
  type IVoiceProvider,
  type VoiceInputResult,
  type VoiceInputError,
} from "../utils/voice-providers";
import type { VoiceConfig } from "../types";
import { logger } from "../utils/logger";

export const useVoiceInput = (
  voiceConfig: VoiceConfig,
  onResult: (text: string) => void,
  onError: (msg: string) => void,
) => {
  const [isListening, setIsListening] = useState(false);
  const [stopFn, setStopFn] = useState<(() => void) | null>(null);

  const start = useCallback(() => {
    if (!voiceConfig.enabled) {
      logger.warn("Voice", "Voice input is disabled in settings");
      return;
    }

    // Get the appropriate provider
    let provider: IVoiceProvider | null = null;

    switch (voiceConfig.activeProvider) {
      case "browser":
        provider = new BrowserVoiceProvider();
        break;
      case "openai":
        provider = new OpenAIWhisperProvider(voiceConfig.providers.openai);
        break;
      case "gemini":
        provider = new GeminiSpeechProvider(voiceConfig.providers.gemini);
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
      language: voiceConfig.language || navigator.language,
    });

    setIsListening(true);

    const handleResult = (result: VoiceInputResult) => {
      logger.info("Voice", "Transcription received", {
        text: result.transcript,
        confidence: result.confidence,
      });
      setIsListening(false);
      onResult(result.transcript);
    };

    const handleError = (error: VoiceInputError) => {
      logger.error("Voice", "Voice input error", error);
      setIsListening(false);
      onError(error.message);
    };

    const cleanup = provider.start(
      voiceConfig.language,
      handleResult,
      handleError,
    );

    setStopFn(() => cleanup);
  }, [voiceConfig, onResult, onError]);

  const stop = useCallback(() => {
    if (stopFn) {
      stopFn();
      setStopFn(null);
    }
    setIsListening(false);
  }, [stopFn]);

  return { isListening, start, stop };
};
