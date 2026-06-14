export type Priority = "low" | "medium" | "high";
export type TaskStatus =
  | "done"
  | "scheduled"
  | "todo"
  | "due"
  | "overdue"
  | "cancelled"
  | "unplanned"
  | "doing";

export type ISO8601String = string;

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;

  createdAt?: ISO8601String;
  startAt?: ISO8601String;
  dueAt?: ISO8601String;
  completedAt?: ISO8601String;
  cancelledAt?: ISO8601String;

  priority: Priority;
  category?: string;
  tags: Tag[];
  isRecurring?: boolean;
  recurringInterval?: string;
  extra?: {
    [key: string]: string | undefined;
  };
}

export interface DayGroup {
  date: ISO8601String;
  tasks: Task[];
}

export interface YearGroup {
  year: number;
  dayGroups: DayGroup[];
  totalTasks: number;
  completedTasks: number;
}

export type ThemeOption = "light" | "dark" | "midnight" | "coffee" | "system";
export type FontSize = "sm" | "base" | "lg" | "xl";
export type AIProvider =
  | "gemini"
  | "openai"
  | "anthropic"
  | "openai-compatible";
export type VoiceProvider = "browser" | "openai" | "gemini";
export type DateGroupBy = "dueAt" | "createdAt" | "startAt" | "completedAt";

export interface ProviderConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  /** OpenAI-family providers only. Disable to use Chat Completions instead of Responses API. */
  useResponsesApi?: boolean;
}

export interface AIConfig {
  enabled: boolean;
  defaultMode: boolean;
  activeProvider: AIProvider;
  providers: Record<AIProvider, ProviderConfig>;
  systemPrompt: string;
}

export interface VoiceConfig {
  enabled: boolean;
  activeProvider: VoiceProvider;
  language: string; // Empty string means use system language (navigator.language)
  providers: {
    browser: Record<string, never>; // No config needed for browser
    openai: {
      apiKey: string;
      baseUrl: string;
      model: string; // e.g., "whisper-1"
    };
    gemini: {
      apiKey: string;
      model: string; // e.g., "gemini-pro-speech"
    };
  };
}

export interface AppSettings {
  theme: ThemeOption;
  dateFormat: string;
  showCompleted: boolean;
  showProgressBar: boolean;
  soundEnabled: boolean;
  fontSize: FontSize;
  useRelativeDates: boolean;
  groupingStrategy: DateGroupBy[];
  aiConfig: AIConfig;
  voiceConfig: VoiceConfig;

  // New Features
  defaultFocusMode: boolean;
  totalTokenUsage: number;
  tokenUsageByModel: Record<string, TokenUsageRecord>;
  defaultCategory: string;

  settingButtonOnInputBar?: boolean;
  tagsFilterOnInputBar?: boolean;
  categoriesFilterOnInputBar?: boolean;
  priorityFilterOnInputBar?: boolean;
  statusFilterOnInputBar?: boolean;
  sortOnInputBar?: boolean;

  filters: FilterState;
  sort: SortState;
}

export interface TokenUsageRecord {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface FilterRule<T = string> {
  include: T[];
  exclude: T[];
}

export interface FilterState {
  tags: FilterRule;
  categories: FilterRule;
  priorities: FilterRule<Priority>;
  statuses: FilterRule<TaskStatus>;
  enableScript: boolean;
  script: string;
}

export type SortField =
  | "createdAt"
  | "dueAt"
  | "startAt"
  | "priority"
  | "title"
  | "custom";
export type SortDirection = "asc" | "desc";

export interface SortState {
  field: SortField;
  direction: SortDirection;
  script: string;
}

/** Available icon names from lucide-react */
export type LucideIconName = keyof typeof import("lucide-react");

/**
 * Custom Settings Tab
 * Allows host applications to inject custom tabs into the Settings page
 */
export interface CustomSettingsTab {
  /** Unique identifier for the tab. Avoid using reserved IDs: 'general', 'filters', 'ai', 'docs', 'about' */
  id: string;
  /** Display label shown in the tab bar */
  label: string;
  /**
   * Optional icon name from lucide-react.
   * @see https://lucide.dev/icons for available icon names
   */
  icon?: LucideIconName;
  /** The content to render when tab is active */
  content: React.ReactNode;
}

// --- Agent Interaction Types ---

export type AgentSessionStatus = "running" | "complete" | "error";

export type AgentEntryKind =
  | "user"
  | "assistant"
  | "status"
  | "tool-call"
  | "tool-result"
  | "error";

export interface AgentEntry {
  id: string;
  kind: AgentEntryKind;
  title: string;
  body?: string;
  timestamp: ISO8601String;
  toolName?: string;
  payload?: unknown;
}

export interface AgentSession {
  id: string;
  prompt: string;
  provider: AIProvider;
  model: string;
  status: AgentSessionStatus;
  startedAt: ISO8601String;
  updatedAt: ISO8601String;
  entries: AgentEntry[];
}

export type AgentEvent =
  | {
      kind: "session-start";
      sessionId: string;
      timestamp: ISO8601String;
      prompt: string;
      provider: AIProvider;
      model: string;
    }
  | {
      kind: "status";
      sessionId: string;
      timestamp: ISO8601String;
      message: string;
    }
  | {
      kind: "assistant-message";
      sessionId: string;
      timestamp: ISO8601String;
      text: string;
    }
  | {
      kind: "tool-call";
      sessionId: string;
      timestamp: ISO8601String;
      toolCallId?: string;
      toolName: string;
      args: Record<string, unknown>;
    }
  | {
      kind: "tool-result";
      sessionId: string;
      timestamp: ISO8601String;
      toolCallId?: string;
      toolName: string;
      result: unknown;
    }
  | {
      kind: "error";
      sessionId: string;
      timestamp: ISO8601String;
      message: string;
    }
  | {
      kind: "session-complete";
      sessionId: string;
      timestamp: ISO8601String;
    };

// --- Enriched Toast Types ---

export type ToastVariant = "success" | "error" | "info" | "warning";

export type DetailBlock =
  | { type: "text"; content: string }
  | { type: "task-list"; tasks: Task[]; label?: string }
  | {
      type: "stats";
      data: {
        total: number;
        byStatus: Record<string, number>;
        byPriority: Record<string, number>;
      };
    }
  | { type: "key-value"; entries: { key: string; value: string }[] };

export type ToastInteraction =
  | { kind: "dismiss" }
  | {
      kind: "confirm";
      onConfirm: () => void;
      onCancel?: () => void;
      confirmLabel?: string;
      cancelLabel?: string;
    }
  | {
      kind: "select";
      options: { label: string; value: string }[];
      onSelect: (value: string) => void;
      onCancel?: () => void;
    }
  | {
      kind: "prompt";
      onSubmit: (text: string) => void;
      onCancel?: () => void;
      placeholder?: string;
    };

export interface ToastMessage {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  body?: string;
  detail?: DetailBlock[];
  interaction: ToastInteraction;
  timeout: number | null;
}

/**
 * Persistence Abstraction
 */
export interface TaskRepository {
  name: string;

  // Tasks
  loadTasks(): Promise<Task[]>;
  saveTasks(tasks: Task[]): Promise<void>;
  updateTask(task: Task): Promise<void>;
  deleteTask(id: string): Promise<void>;
}

export interface SettingsRepository {
  name: string;

  // Settings
  loadSettings(): Promise<AppSettings | null>;
  saveSettings(settings: AppSettings): Promise<void>;
}
