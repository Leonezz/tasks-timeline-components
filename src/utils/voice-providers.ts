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

export interface VoiceRuntimeRequest {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  contentType?: string;
  body?: string | ArrayBuffer;
}

export interface VoiceRuntimeResponse {
  status: number;
  text: string;
}

export interface VoiceRuntime {
  /**
   * Window to use for browser APIs. Obsidian popout windows expose their own
   * constructors, so hosts should pass the active workspace window when known.
   */
  win?: Window;
  /**
   * Host-provided HTTP implementation. Obsidian should wire this to requestUrl
   * to avoid browser CORS restrictions for OpenAI/Gemini transcription calls.
   */
  request?: (request: VoiceRuntimeRequest) => Promise<VoiceRuntimeResponse>;
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
    onEnd?: () => void,
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

function getRuntimeWindow(runtime?: VoiceRuntime): Window | undefined {
  if (runtime?.win) {
    return runtime.win;
  }
  if (typeof window !== "undefined") {
    return window;
  }
  return undefined;
}

function getRuntimeNavigator(runtime?: VoiceRuntime): Navigator | undefined {
  return getRuntimeWindow(runtime)?.navigator;
}

function getMediaRecorderCtor(
  runtime?: VoiceRuntime,
): typeof MediaRecorder | undefined {
  const win = getRuntimeWindow(runtime) as
    | (Window & { MediaRecorder?: typeof MediaRecorder })
    | undefined;
  if (win?.MediaRecorder) {
    return win.MediaRecorder;
  }
  if (typeof MediaRecorder !== "undefined") {
    return MediaRecorder;
  }
  return undefined;
}

function getFetch(runtime?: VoiceRuntime): typeof fetch | undefined {
  const win = getRuntimeWindow(runtime);
  if (win?.fetch) {
    return win.fetch.bind(win);
  }
  if (typeof fetch !== "undefined") {
    return fetch;
  }
  return undefined;
}

async function sendVoiceRequest(
  runtime: VoiceRuntime | undefined,
  request: VoiceRuntimeRequest,
): Promise<VoiceRuntimeResponse> {
  if (runtime?.request) {
    return runtime.request(request);
  }

  const fetchImpl = getFetch(runtime);
  if (!fetchImpl) {
    throw new Error("No HTTP client is available for voice transcription.");
  }

  const headers = { ...(request.headers ?? {}) };
  if (request.contentType) {
    headers["Content-Type"] = request.contentType;
  }

  const response = await fetchImpl(request.url, {
    method: request.method ?? "GET",
    headers,
    body: request.body,
  });

  return {
    status: response.status,
    text: await response.text(),
  };
}

function assertOk(
  providerName: string,
  response: VoiceRuntimeResponse,
): void {
  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      `${providerName} API error: ${response.status} - ${response.text}`,
    );
  }
}

function parseJson<T>(providerName: string, text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`${providerName} API returned invalid JSON.`);
  }
}

export class BrowserVoiceProvider implements IVoiceProvider {
  private runtime?: VoiceRuntime;

  constructor(runtime?: VoiceRuntime) {
    this.runtime = runtime;
  }

  getName(): string {
    return "Browser (Web Speech API)";
  }

  isAvailable(): boolean {
    const win = getRuntimeWindow(this.runtime) as
      | WindowWithSpeech
      | undefined;
    return !!(win?.SpeechRecognition || win?.webkitSpeechRecognition);
  }

  start(
    language: string,
    onResult: (result: VoiceInputResult) => void,
    onError: (error: VoiceInputError) => void,
    onEnd?: () => void,
  ): () => void {
    const win = getRuntimeWindow(this.runtime) as
      | WindowWithSpeech
      | undefined;
    const SpeechRecognitionCtor =
      win?.SpeechRecognition || win?.webkitSpeechRecognition;

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
      let didEnd = false;
      const endListening = () => {
        if (!didEnd) {
          didEnd = true;
          onEnd?.();
        }
      };
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang =
        language || getRuntimeNavigator(this.runtime)?.language || "en-US";

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

      recognition.onend = () => {
        logger.info("Voice", "Browser recognition ended");
        endListening();
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        const errorCode = event.error;

        // Ignore 'no-speech' and 'aborted' as they're not actual errors
        // 'no-speech' = silence timeout, 'aborted' = user clicked stop
        if (errorCode === "no-speech" || errorCode === "aborted") {
          endListening();
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
        endListening();
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
        endListening();
      };
    } catch (e) {
      logger.error("Voice", "Failed to initialize Browser recognition", e);
      onError({
        code: "initialization-failed",
        message: "Failed to initialize voice input",
      });
      onEnd?.();
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
  private runtime?: VoiceRuntime;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  constructor(config: OpenAIWhisperConfig, runtime?: VoiceRuntime) {
    this.config = config;
    this.runtime = runtime;
  }

  getName(): string {
    return "OpenAI (Whisper)";
  }

  isAvailable(): boolean {
    return !!(
      getRuntimeNavigator(this.runtime)?.mediaDevices?.getUserMedia &&
      getMediaRecorderCtor(this.runtime)
    );
  }

  start(
    language: string,
    onResult: (result: VoiceInputResult) => void,
    onError: (error: VoiceInputError) => void,
    onEnd?: () => void,
  ): () => void {
    if (!this.config.apiKey) {
      onError({
        code: "missing-api-key",
        message: "OpenAI API key is required. Please configure in settings.",
      });
      onEnd?.();
      return () => {};
    }

    const mediaDevices = getRuntimeNavigator(this.runtime)?.mediaDevices,
      MediaRecorderCtor = getMediaRecorderCtor(this.runtime);

    if (!mediaDevices?.getUserMedia || !MediaRecorderCtor) {
      onError({
        code: "not-supported",
        message: "Microphone recording is not available in this browser.",
      });
      onEnd?.();
      return () => {};
    }

    logger.info("Voice", "Starting OpenAI Whisper recording...");
    this.audioChunks = [];
    let stopRequested = false;

    mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        this.mediaRecorder = new MediaRecorderCtor(stream);

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
            onEnd?.();
          }
        };

        this.mediaRecorder.start();
        logger.info("Voice", "MediaRecorder started");
        if (stopRequested && this.mediaRecorder.state !== "inactive") {
          this.mediaRecorder.stop();
        }
      })
      .catch((e) => {
        logger.error("Voice", "Failed to access microphone", e);
        onError({
          code: "permission-denied",
          message: "Microphone access denied. Please check permissions.",
        });
        onEnd?.();
      });

    return () => {
      stopRequested = true;
      if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
        this.mediaRecorder.stop();
      }
    };
  }

  private async transcribeWithWhisper(
    audioBlob: Blob,
    language: string,
  ): Promise<string> {
    const { body, contentType } = await this.buildMultipartBody(
      audioBlob,
      language,
    );
    const response = await sendVoiceRequest(this.runtime, {
      url: this.resolveTranscriptionUrl(),
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      contentType,
      body,
    });

    assertOk("OpenAI", response);
    const data = parseJson<{ text?: unknown }>("OpenAI", response.text);
    return typeof data.text === "string" ? data.text : "";
  }

  private resolveTranscriptionUrl(): string {
    const fallback = "https://api.openai.com/v1/audio/transcriptions",
      trimmed = this.config.baseUrl.trim();

    if (!trimmed) {
      return fallback;
    }

    const normalized = trimmed.replace(/\/+$/, "");
    if (normalized.endsWith("/audio/transcriptions")) {
      return normalized;
    }
    return `${normalized}/audio/transcriptions`;
  }

  private async buildMultipartBody(
    audioBlob: Blob,
    language: string,
  ): Promise<{ body: ArrayBuffer; contentType: string }> {
    const boundary = `----tasks-timeline-${Math.random()
        .toString(36)
        .slice(2)}`,
      encoder = new TextEncoder(),
      chunks: Uint8Array[] = [],
      appendText = (text: string) => chunks.push(encoder.encode(text)),
      appendBuffer = (buffer: ArrayBuffer) =>
        chunks.push(new Uint8Array(buffer)),
      appendField = (name: string, value: string) => {
        appendText(
          `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`,
        );
      };

    appendField("model", this.config.model || "whisper-1");
    if (language) {
      appendField("language", language.split("-")[0] ?? language);
    }
    appendText(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="audio.webm"\r\nContent-Type: ${audioBlob.type || "audio/webm"}\r\n\r\n`,
    );
    appendBuffer(await audioBlob.arrayBuffer());
    appendText(`\r\n--${boundary}--\r\n`);

    const size = chunks.reduce((total, chunk) => total + chunk.byteLength, 0),
      body = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return {
      body: body.buffer as ArrayBuffer,
      contentType: `multipart/form-data; boundary=${boundary}`,
    };
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
  private runtime?: VoiceRuntime;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  constructor(config: GeminiSpeechConfig, runtime?: VoiceRuntime) {
    this.config = config;
    this.runtime = runtime;
  }

  getName(): string {
    return "Google Gemini (Speech-to-Text)";
  }

  isAvailable(): boolean {
    return !!(
      getRuntimeNavigator(this.runtime)?.mediaDevices?.getUserMedia &&
      getMediaRecorderCtor(this.runtime)
    );
  }

  start(
    language: string,
    onResult: (result: VoiceInputResult) => void,
    onError: (error: VoiceInputError) => void,
    onEnd?: () => void,
  ): () => void {
    if (!this.config.apiKey) {
      onError({
        code: "missing-api-key",
        message: "Gemini API key is required. Please configure in settings.",
      });
      onEnd?.();
      return () => {};
    }

    const mediaDevices = getRuntimeNavigator(this.runtime)?.mediaDevices,
      MediaRecorderCtor = getMediaRecorderCtor(this.runtime);

    if (!mediaDevices?.getUserMedia || !MediaRecorderCtor) {
      onError({
        code: "not-supported",
        message: "Microphone recording is not available in this browser.",
      });
      onEnd?.();
      return () => {};
    }

    logger.info("Voice", "Starting Gemini speech recording...");
    this.audioChunks = [];
    let stopRequested = false;

    mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        this.mediaRecorder = new MediaRecorderCtor(stream);

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
            onEnd?.();
          }
        };

        this.mediaRecorder.start();
        logger.info("Voice", "MediaRecorder started");
        if (stopRequested && this.mediaRecorder.state !== "inactive") {
          this.mediaRecorder.stop();
        }
      })
      .catch((e) => {
        logger.error("Voice", "Failed to access microphone", e);
        onError({
          code: "permission-denied",
          message: "Microphone access denied. Please check permissions.",
        });
        onEnd?.();
      });

    return () => {
      stopRequested = true;
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

    const model = encodeURIComponent(this.config.model || "gemini-1.5-flash"),
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(this.config.apiKey)}`;

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

    const response = await sendVoiceRequest(this.runtime, {
      url: apiUrl,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      contentType: "application/json",
      body: JSON.stringify(requestBody),
    });

    assertOk("Gemini", response);
    const data = parseJson<{
      candidates?: Array<{
        content?: { parts?: Array<{ text?: unknown }> };
      }>;
    }>("Gemini", response.text);
    return (
      data.candidates?.[0]?.content?.parts
        ?.map((part) => (typeof part.text === "string" ? part.text : ""))
        .join("")
        .trim() ?? ""
    );
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
