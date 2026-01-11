import { useCallback, useState } from "react";
import { logger } from "../utils/logger";

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
    length: number;
  };
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror:
    | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void)
    | null;
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void)
    | null;
}

interface WindowWithSpeech extends Window {
  SpeechRecognition?: new () => SpeechRecognition;
  webkitSpeechRecognition?: new () => SpeechRecognition;
}

export const useVoiceInput = (
  enabled: boolean,
  onResult: (text: string) => void,
  onError: (msg: string) => void
) => {
  const [isListening, setIsListening] = useState(false),

   start = useCallback(() => {
    if (!enabled) {return;}

    const win = window as unknown as WindowWithSpeech,
     SpeechRecognitionCtor =
      win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      onError("Browser does not support voice input.");
      return;
    }

    try {
      logger.info("Voice", "Starting speech recognition...");
      const recognition = new SpeechRecognitionCtor();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false);
        const errorMsg = event.error;

        // Ignore 'no-speech' as it just means silence
        if (errorMsg === "no-speech") {return;}

        if (errorMsg === "not-allowed") {
          const msg = "Microphone access denied. Please check permissions.";
          onError(msg);
          logger.error("Voice", msg);
        } else if (errorMsg === "network") {
          const msg = "Network error during voice recognition.";
          onError(msg);
          logger.error("Voice", msg);
        } else {
          const msg = `Voice input error: ${errorMsg}`;
          onError(msg);
          logger.warn("Voice", msg);
        }
      };
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          logger.info("Voice", "Transcript received", { text: transcript });
          onResult(transcript);
        }
      };

      recognition.start();
    } catch (e) {
      console.error("Speech API Error", e);
      onError("Failed to initialize voice input.");
      logger.error("Voice", "Initialization failed", e);
      setIsListening(false);
    }
  }, [enabled, onResult, onError, setIsListening]);

  return { isListening, start };
};
