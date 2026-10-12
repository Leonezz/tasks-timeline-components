import type { AppSettings } from "./types";

/** Default settings used by TasksTimelineApp when no persisted settings exist. */
export const DEFAULT_SETTINGS: AppSettings = {
  theme: "light",
  dateFormat: "MMM d",
  showCompleted: true,
  showProgressBar: true,
  soundEnabled: false,
  fontSize: "base",
  useRelativeDates: true,
  groupingStrategy: ["dueAt"],

  aiConfig: {
    enabled: true,
    defaultMode: false,
    activeProvider: "gemini",
    providers: {
      gemini: {
        apiKey: "",
        model: "gemini-2.0-flash",
        baseUrl: "",
      },
      openai: {
        apiKey: "",
        model: "gpt-4o",
        baseUrl: "",
        useResponsesApi: true,
      },
      anthropic: {
        apiKey: "",
        model: "claude-sonnet-4-20250514",
        baseUrl: "",
      },
      "openai-compatible": {
        apiKey: "",
        model: "",
        baseUrl: "",
        useResponsesApi: false,
      },
    },
    systemPrompt: "",
  },

  voiceConfig: {
    enabled: true,
    activeProvider: "browser",
    language: "", // Empty means use system language (navigator.language)
    providers: {
      browser: {},
      openai: {
        apiKey: "",
        baseUrl: "https://api.openai.com/v1/audio/transcriptions",
        model: "whisper-1",
      },
      gemini: {
        apiKey: "",
        model: "gemini-1.5-flash",
      },
    },
  },

  // New Features
  defaultFocusMode: false,
  totalTokenUsage: 0,
  tokenUsageByModel: {},
  defaultCategory: "General",

  filters: {
    tags: { include: [], exclude: [] },
    categories: { include: [], exclude: [] },
    priorities: { include: [], exclude: [] },
    statuses: { include: [], exclude: [] },
    enableScript: false,
    script: "",
  },
  sort: {
    field: "createdAt",
    direction: "asc",
    script: "",
  },
};
