/**
 * Voice Input Provider Abstraction
 *
 * This module provides a pluggable voice input system supporting multiple providers:
 * - Browser: Web Speech API (free, limited accuracy, requires internet in Chrome/Edge)
 * - OpenAI: Whisper API (paid, highly accurate, requires API key)
 * - Gemini: Google Speech-to-Text (paid, accurate, requires API key)
 *
 * @module voice-providers
 */

import { logger } from "./logger";

export interface VoiceInputResult {
  transcript: string;
  confidence?: number;
}

export interface VoiceInputError {
  code: string;
  message: string;
}

/**
 * Base interface for all voice input providers
 */
export interface IVoiceProvider {
  /**
   * Start listening for voice input
   * @param language - Language code (e.g., "en-US", empty for system default)
   * @param onResult - Callback when transcription is ready
   * @param onError - Callback when an error occurs
   * @returns Cleanup function to stop listening
   */
  start(
    language: string,
    onResult: (result: VoiceInputResult) => void,
    onError: (error: VoiceInputError) => void,
  ): () => void;

  /**
   * Check if this provider is available in the current environment
   */
  isAvailable(): boolean;

  /**
   * Get human-readable name for this provider
   */
  getName(): string;
}

// ============================================================================
// Browser Web Speech API Provider
// ============================================================================

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
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

export class BrowserVoiceProvider implements IVoiceProvider {
  getName(): string {
    return "Browser (Web Speech API)";
  }

  isAvailable(): boolean {
    const win = window as unknown as WindowWithSpeech;
    return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
  }

  start(
    language: string,
    onResult: (result: VoiceInputResult) => void,
    onError: (error: VoiceInputError) => void,
  ): () => void {
    const win = window as unknown as WindowWithSpeech;
    const SpeechRecognitionCtor =
      win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      onError({
        code: "not-supported",
        message: "Browser does not support Web Speech API",
      });
      return () => {};
    }

    try {
      logger.info("Voice", "Starting Browser Speech Recognition...");
      const recognition = new SpeechRecognitionCtor();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language || navigator.language || "en-US";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[0]?.[0];
        if (result) {
          logger.info("Voice", "Browser transcript received", {
            text: result.transcript,
            confidence: result.confidence,
          });
          onResult({
            transcript: result.transcript,
            confidence: result.confidence,
          });
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        const errorCode = event.error;

        // Ignore 'no-speech' and 'aborted' as they're not actual errors
        // 'no-speech' = silence timeout, 'aborted' = user clicked stop
        if (errorCode === "no-speech" || errorCode === "aborted") {
          return;
        }

        if (errorCode === "not-allowed") {
          onError({
            code: "permission-denied",
            message: "Microphone access denied. Please check permissions.",
          });
        } else if (errorCode === "network") {
          onError({
            code: "network",
            message:
              "Network error. Browser voice input requires internet connection.",
          });
        } else {
          onError({
            code: errorCode,
            message: `Voice input error: ${errorCode}`,
          });
        }
        logger.error("Voice", "Browser recognition error", errorCode);
      };

      recognition.start();

      return () => {
        try {
          recognition.abort();
          logger.info("Voice", "Browser recognition stopped");
        } catch (e) {
          logger.warn("Voice", "Error stopping recognition", e);
        }
      };
    } catch (e) {
      logger.error("Voice", "Failed to initialize Browser recognition", e);
      onError({
        code: "initialization-failed",
        message: "Failed to initialize voice input",
      });
      return () => {};
    }
  }
}

// ============================================================================
// OpenAI Whisper Provider
// ============================================================================

export interface OpenAIWhisperConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export class OpenAIWhisperProvider implements IVoiceProvider {
  private config: OpenAIWhisperConfig;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  constructor(config: OpenAIWhisperConfig) {
    this.config = config;
  }

  getName(): string {
    return "OpenAI (Whisper)";
  }

  isAvailable(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  start(
    language: string,
    onResult: (result: VoiceInputResult) => void,
    onError: (error: VoiceInputError) => void,
  ): () => void {
    if (!this.config.apiKey) {
      onError({
        code: "missing-api-key",
        message: "OpenAI API key is required. Please configure in settings.",
      });
      return () => {};
    }

    logger.info("Voice", "Starting OpenAI Whisper recording...");
    this.audioChunks = [];

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        this.mediaRecorder = new MediaRecorder(stream);

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };

        this.mediaRecorder.onstop = async () => {
          logger.info("Voice", "Recording stopped, sending to Whisper API...");
          const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });

          try {
            const transcript = await this.transcribeWithWhisper(
              audioBlob,
              language,
            );
            logger.info("Voice", "Whisper transcript received", {
              text: transcript,
            });
            onResult({ transcript });
          } catch (e) {
            logger.error("Voice", "Whisper API error", e);
            onError({
              code: "api-error",
              message:
                e instanceof Error ? e.message : "Failed to transcribe audio",
            });
          } finally {
            // Clean up stream
            stream.getTracks().forEach((track) => track.stop());
          }
        };

        this.mediaRecorder.start();
        logger.info("Voice", "MediaRecorder started");
      })
      .catch((e) => {
        logger.error("Voice", "Failed to access microphone", e);
        onError({
          code: "permission-denied",
          message: "Microphone access denied. Please check permissions.",
        });
      });

    return () => {
      if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
        this.mediaRecorder.stop();
      }
    };
  }

  private async transcribeWithWhisper(
    audioBlob: Blob,
    language: string,
  ): Promise<string> {
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.webm");
    formData.append("model", this.config.model || "whisper-1");
    if (language) {
      formData.append("language", language.split("-")[0]); // "en-US" -> "en"
    }

    const baseUrl =
      this.config.baseUrl || "https://api.openai.com/v1/audio/transcriptions";

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.text || "";
  }
}

// ============================================================================
// Gemini Speech-to-Text Provider
// ============================================================================

export interface GeminiSpeechConfig {
  apiKey: string;
  model: string;
}

export class GeminiSpeechProvider implements IVoiceProvider {
  private config: GeminiSpeechConfig;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  constructor(config: GeminiSpeechConfig) {
    this.config = config;
  }

  getName(): string {
    return "Google Gemini (Speech-to-Text)";
  }

  isAvailable(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  start(
    language: string,
    onResult: (result: VoiceInputResult) => void,
    onError: (error: VoiceInputError) => void,
  ): () => void {
    if (!this.config.apiKey) {
      onError({
        code: "missing-api-key",
        message: "Gemini API key is required. Please configure in settings.",
      });
      return () => {};
    }

    logger.info("Voice", "Starting Gemini speech recording...");
    this.audioChunks = [];

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        this.mediaRecorder = new MediaRecorder(stream);

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };

        this.mediaRecorder.onstop = async () => {
          logger.info("Voice", "Recording stopped, sending to Gemini API...");
          const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });

          try {
            const transcript = await this.transcribeWithGemini(
              audioBlob,
              language,
            );
            logger.info("Voice", "Gemini transcript received", {
              text: transcript,
            });
            onResult({ transcript });
          } catch (e) {
            logger.error("Voice", "Gemini API error", e);
            onError({
              code: "api-error",
              message:
                e instanceof Error ? e.message : "Failed to transcribe audio",
            });
          } finally {
            // Clean up stream
            stream.getTracks().forEach((track) => track.stop());
          }
        };

        this.mediaRecorder.start();
        logger.info("Voice", "MediaRecorder started");
      })
      .catch((e) => {
        logger.error("Voice", "Failed to access microphone", e);
        onError({
          code: "permission-denied",
          message: "Microphone access denied. Please check permissions.",
        });
      });

    return () => {
      if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
        this.mediaRecorder.stop();
      }
    };
  }

  private async transcribeWithGemini(
    audioBlob: Blob,
    language: string,
  ): Promise<string> {
    // Convert audio blob to base64
    const base64Audio = await this.blobToBase64(audioBlob);

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model || "gemini-1.5-flash"}:generateContent?key=${this.config.apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `Transcribe this audio to text${language ? ` in ${language}` : ""}.`,
            },
            {
              inline_data: {
                mime_type: "audio/webm",
                data: base64Audio,
              },
            },
          ],
        },
      ],
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const transcript = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return transcript;
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
