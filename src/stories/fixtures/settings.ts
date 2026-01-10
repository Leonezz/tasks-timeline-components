import type { AppSettings } from "../../types";

/**
 * Settings builder factory for creating AppSettings mock data
 * Eliminates duplication of defaultSettings across story files
 */
export const settingsBuilder = {
  /**
   * Default application settings
   */
  default: (): AppSettings => ({
    theme: "light",
    dateFormat: "MMM d",
    showCompleted: true,
    showProgressBar: true,
    soundEnabled: false,
    fontSize: "base",
    useRelativeDates: true,
    groupingStrategy: ["dueAt"],
    enableVoiceInput: false,
    voiceProvider: "browser",
    defaultFocusMode: false,
    totalTokenUsage: 0,
    defaultCategory: "General",
    aiConfig: {
      enabled: false,
      defaultMode: false,
      activeProvider: "gemini",
      providers: {
        gemini: { apiKey: "", model: "gemini-2-flash", baseUrl: "" },
        openai: { apiKey: "", model: "gpt-4o", baseUrl: "" },
        anthropic: {
          apiKey: "",
          model: "claude-3-5-sonnet-20240620",
          baseUrl: "",
        },
      },
    },
    filters: {
      tags: [],
      categories: [],
      priorities: [],
      statuses: [],
      enableScript: false,
      script: "",
    },
    sort: {
      field: "createdAt",
      direction: "asc",
      script: "",
    },
  }),

  /**
   * Settings with AI enabled
   */
  withAI: (overrides?: Partial<AppSettings>): AppSettings => ({
    ...settingsBuilder.default(),
    aiConfig: {
      enabled: true,
      defaultMode: true,
      activeProvider: "gemini",
      providers: {
        gemini: { apiKey: "test-key", model: "gemini-2-flash", baseUrl: "" },
        openai: { apiKey: "", model: "gpt-4o", baseUrl: "" },
        anthropic: {
          apiKey: "",
          model: "claude-3-5-sonnet-20240620",
          baseUrl: "",
        },
      },
    },
    ...overrides,
  }),

  /**
   * Dark mode theme
   */
  darkMode: (overrides?: Partial<AppSettings>): AppSettings => ({
    ...settingsBuilder.default(),
    theme: "dark",
    ...overrides,
  }),

  /**
   * Midnight theme
   */
  midnightTheme: (overrides?: Partial<AppSettings>): AppSettings => ({
    ...settingsBuilder.default(),
    theme: "midnight",
    ...overrides,
  }),

  /**
   * Coffee theme
   */
  coffeeTheme: (overrides?: Partial<AppSettings>): AppSettings => ({
    ...settingsBuilder.default(),
    theme: "coffee",
    ...overrides,
  }),

  /**
   * Minimal UI with all optional elements hidden
   */
  minimalUI: (overrides?: Partial<AppSettings>): AppSettings => ({
    ...settingsBuilder.default(),
    settingButtonOnInputBar: false,
    tagsFilterOnInputBar: false,
    categoriesFilterOnInputBar: false,
    priorityFilterOnInputBar: false,
    statusFilterOnInputBar: false,
    sortOnInputBar: false,
    showProgressBar: false,
    ...overrides,
  }),

  /**
   * Focus mode enabled
   */
  focusMode: (overrides?: Partial<AppSettings>): AppSettings => ({
    ...settingsBuilder.default(),
    defaultFocusMode: true,
    ...overrides,
  }),

  /**
   * Large font size for accessibility
   */
  largeFontSize: (overrides?: Partial<AppSettings>): AppSettings => ({
    ...settingsBuilder.default(),
    fontSize: "xl",
    ...overrides,
  }),

  /**
   * Small font size
   */
  smallFontSize: (overrides?: Partial<AppSettings>): AppSettings => ({
    ...settingsBuilder.default(),
    fontSize: "sm",
    ...overrides,
  }),

  /**
   * Hide completed tasks
   */
  hideCompleted: (overrides?: Partial<AppSettings>): AppSettings => ({
    ...settingsBuilder.default(),
    showCompleted: false,
    ...overrides,
  }),

  /**
   * Alias for hideCompleted (for clarity in story names)
   */
  withoutCompleted: (overrides?: Partial<AppSettings>): AppSettings => ({
    ...settingsBuilder.default(),
    showCompleted: false,
    ...overrides,
  }),

  /**
   * Group tasks by start date instead of due date
   */
  groupByStartDate: (overrides?: Partial<AppSettings>): AppSettings => ({
    ...settingsBuilder.default(),
    groupingStrategy: ["startAt"],
    ...overrides,
  }),

  /**
   * Group tasks by created date
   */
  groupByCreatedDate: (overrides?: Partial<AppSettings>): AppSettings => ({
    ...settingsBuilder.default(),
    groupingStrategy: ["createdAt"],
    ...overrides,
  }),

  /**
   * Group tasks by completed date
   */
  groupByCompletedDate: (overrides?: Partial<AppSettings>): AppSettings => ({
    ...settingsBuilder.default(),
    groupingStrategy: ["completedAt"],
    ...overrides,
  }),

  /**
   * Voice input enabled
   */
  withVoiceInput: (overrides?: Partial<AppSettings>): AppSettings => ({
    ...settingsBuilder.default(),
    enableVoiceInput: true,
    voiceProvider: "browser",
    ...overrides,
  }),

  /**
   * All AI providers configured
   */
  allProvidersConfigured: (overrides?: Partial<AppSettings>): AppSettings => ({
    ...settingsBuilder.default(),
    aiConfig: {
      enabled: true,
      defaultMode: true,
      activeProvider: "gemini",
      providers: {
        gemini: {
          apiKey: "test-gemini-key",
          model: "gemini-2-flash",
          baseUrl: "",
        },
        openai: {
          apiKey: "test-openai-key",
          model: "gpt-4o",
          baseUrl: "",
        },
        anthropic: {
          apiKey: "test-anthropic-key",
          model: "claude-3-5-sonnet-20240620",
          baseUrl: "",
        },
      },
    },
    ...overrides,
  }),

  /**
   * Custom filter script enabled
   */
  withFilterScript: (script: string, overrides?: Partial<AppSettings>): AppSettings => ({
    ...settingsBuilder.default(),
    filters: {
      tags: [],
      categories: [],
      priorities: [],
      statuses: [],
      enableScript: true,
      script,
    },
    ...overrides,
  }),

  /**
   * Custom sort script enabled
   */
  withSortScript: (script: string, overrides?: Partial<AppSettings>): AppSettings => ({
    ...settingsBuilder.default(),
    sort: {
      field: "createdAt",
      direction: "asc",
      script,
    },
    ...overrides,
  }),
};
