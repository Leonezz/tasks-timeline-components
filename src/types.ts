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
export type AIProvider = "gemini" | "openai" | "anthropic";
export type VoiceProvider = "browser" | "gemini-whisper"; // Placeholder for future expansion
export type DateGroupBy = "dueAt" | "createdAt" | "startAt" | "completedAt";

export interface ProviderConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface AIConfig {
  enabled: boolean;
  defaultMode: boolean;
  activeProvider: AIProvider;
  providers: Record<AIProvider, ProviderConfig>;
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

  // New Features
  enableVoiceInput: boolean;
  voiceProvider: VoiceProvider;
  defaultFocusMode: boolean;
  totalTokenUsage: number;
  defaultCategory: string;

  settingButtonOnInputBar?: false;
  tagsFilterOnInputBar?: false;
  categoriesFilterOnInputBar?: false;
  priorityFilterOnInputBar?: false;
  statusFilterOnInputBar?: false;
  sortOnInputBar?: false;

  filters: FilterState;
  sort: SortState;
}

export interface FilterState {
  tags: string[];
  categories: string[];
  priorities: Priority[];
  statuses: TaskStatus[];
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
