import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
  useTransition,
  useDeferredValue,
} from "react";
import { AnimatePresence } from "framer-motion";
import { ErrorBoundary } from "react-error-boundary";
import { TodoList } from "./components/TodoList";
import { InputBar } from "./components/InputBar";
import { SettingsModal } from "./components/settings/SettingsModal";
import {
  TaskEditModal,
  type RecurrenceFormat,
} from "./components/TaskEditModal";
import { Toast } from "./components/Toast";
import { AgentConversationPanel } from "./components/AgentConversationPanel";
import type {
  AgentEvent,
  AIProvider,
  AppSettings,
  CustomSettingsTab,
  FilterState,
  Priority,
  SettingsRepository,
  SecretFieldRenderer,
  SortState,
  Task,
  TaskStatus,
  ToastMessage,
  ToastVariant,
  TokenUsageRecord,
} from "./types";
import type { VoiceRuntime } from "./utils/voice-providers";
import { cn, deriveWorkflowStatus } from "./utils";
import { logger } from "./utils/logger";
import { BrowserSettingsRepository } from "./storage";
import { Icon } from "./components/Icon";
import { AppProvider } from "./components/AppContext";
import { SettingsProvider, TasksProvider } from "./contexts";
import type { Capabilities, CapabilityContext, ToolSpec } from "./capabilities";
import type { AIProviderFactory } from "./hooks/useAIAgent";
import {
  AIErrorFallback,
  TaskListErrorFallback,
  ModalErrorFallback,
} from "./components/ErrorFallback";

// Logic Hooks
import { hasStatusRule, useTaskFiltering } from "./hooks/useTaskFiltering";
import { useDashboardCards } from "./hooks/useDashboardCards";
import type { DashboardCard } from "./utils/dashboard";
import { useAIAgent } from "./hooks/useAIAgent";
import { useAgentSessions } from "./hooks/useAgentSessions";
import { DEFAULT_SETTINGS } from "./defaultSettings";
import { useSettingsPersistence } from "./hooks/useSettingsPersistence";
import {
  createToastId,
  createToastInteractionController,
} from "./hooks/toastInteractions";
import { useEditorSaveSession } from "./hooks/editorSaveSession";
import { persistTaskUpdate as saveTaskUpdate } from "./utils/task-update";

interface AgentPanelState {
  isOpen: boolean;
  activeSessionId: string | null;
  unreadCount: number;
}

type AgentPanelAction =
  | { type: "open" }
  | { type: "close" }
  | { type: "select"; sessionId: string }
  | { type: "delete-session"; sessionId: string; nextSessionId: string | null }
  | { type: "new-session" }
  | { type: "event"; event: AgentEvent };

const DEFAULT_AGENT_PANEL_STATE: AgentPanelState = {
  isOpen: false,
  activeSessionId: null,
  unreadCount: 0,
};

function agentPanelReducer(
  state: AgentPanelState,
  action: AgentPanelAction,
): AgentPanelState {
  switch (action.type) {
    case "open":
      return { ...state, isOpen: true, unreadCount: 0 };
    case "close":
      return { ...state, isOpen: false };
    case "select":
      return { ...state, activeSessionId: action.sessionId, unreadCount: 0 };
    case "delete-session":
      return {
        ...state,
        activeSessionId:
          state.activeSessionId === action.sessionId
            ? action.nextSessionId
            : state.activeSessionId,
        unreadCount: 0,
      };
    case "new-session":
      return { ...state, isOpen: true, activeSessionId: null, unreadCount: 0 };
    case "event":
      if (action.event.kind === "session-start") {
        return {
          isOpen: true,
          activeSessionId: action.event.sessionId,
          unreadCount: 0,
        };
      }
      return {
        ...state,
        unreadCount: state.isOpen ? 0 : state.unreadCount + 1,
      };
  }
}

export interface TasksTimelineAppProps {
  className?: string;

  // Controlled tasks data (required)
  tasks: Task[];
  /**
   * Stores a new task. Return the stored task if the host assigns its own id,
   * so the built-in agent reports the id later tool calls must use.
   */
  onTaskAdded: (task: Task) => void | Task | Promise<void | Task>;
  onTaskUpdated: (task: Task, previous: Task) => void | Promise<void>;
  onTaskDeleted: (taskId: string, previous: Task) => void | Promise<void>;

  // Optional configurations
  settingsRepository?: SettingsRepository;
  apiKey?: string;
  systemInDarkMode?: boolean;
  onItemClick?: (item: Task) => void;
  /** Custom tabs to inject into the Settings page */
  customSettingsTabs?: CustomSettingsTab[];
  /** Host-provided renderer for secret selector controls. */
  renderSecretField?: SecretFieldRenderer;
  /** Custom renderer for task titles. When provided, replaces the default plain-text display. */
  renderTitle?: (title: string) => React.ReactNode;
  /**
   * How the task editor writes edited recurrence rules. "text" writes
   * Obsidian Tasks text ("every 2 weeks on Monday") for hosts that store tasks
   * as Obsidian Tasks lines. "auto" (default) writes text for tasks whose rule
   * is text or that came from the Obsidian Tasks parser, and RRULE otherwise.
   * The built-in agent's task tools follow it too ("text": rules are stored
   * as text, and rules a line can't hold are rejected before saving).
   */
  recurrenceFormat?: RecurrenceFormat;
  /** Additional system prompt injected by the host application */
  aiSystemPrompt?: string;
  /**
   * Host-provided AI provider factory. Defaults to the built-in provider
   * adapters. Also used by the Settings "Test Connection" button.
   */
  aiProviderFactory?: AIProviderFactory;
  /**
   * Fetch for the built-in AI providers (agent and Settings "Test Connection").
   * Lets hosts route provider requests around browser CORS, e.g. through
   * Obsidian's `requestUrl`. Cannot be combined with `aiProviderFactory` (throws).
   */
  aiFetch?: typeof fetch;
  /** Host-provided capability context for the built-in AI agent. */
  aiCapabilityContext?: CapabilityContext;
  /** Fully constructed host capabilities for the built-in AI agent. */
  aiCapabilities?: Capabilities;
  /**
   * Extra host tools appended to the built-in agent tools. Names must not collide
   * with built-in tools. Cannot be combined with `aiCapabilities` (throws).
   */
  aiExtraTools?: ToolSpec[];
  /** Maximum tool-call rounds per agent turn before the agent stops. Defaults to 16. */
  aiMaxToolRounds?: number;
  /** Host runtime for voice input in embedded environments such as Obsidian. */
  voiceRuntime?: VoiceRuntime;
  /** Optional host observer for structured agent lifecycle events. */
  onAgentEvent?: (event: AgentEvent) => void;
}

export const TasksTimelineApp: React.FC<TasksTimelineAppProps> = ({
  className,
  tasks,
  onTaskAdded,
  onTaskUpdated,
  onTaskDeleted,
  settingsRepository,
  apiKey,
  systemInDarkMode,
  onItemClick,
  customSettingsTabs,
  renderSecretField,
  renderTitle,
  recurrenceFormat,
  aiSystemPrompt,
  aiProviderFactory,
  aiFetch,
  aiCapabilityContext,
  aiCapabilities,
  aiExtraTools,
  aiMaxToolRounds,
  voiceRuntime,
  onAgentEvent,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false),
    [agentPanelState, dispatchAgentPanel] = useReducer(
      agentPanelReducer,
      DEFAULT_AGENT_PANEL_STATE,
    ),
    [editingTask, setEditingTask] = useState<Task | null>(null),
    {
      open: openEditor,
      close: closeEditor,
      save: saveFromEditor,
    } = useEditorSaveSession(setEditingTask),
    // Use state for the container ref to ensure re-render when it's attached,
    // Allowing the Provider to pass the correct element to children.
    [containerElement, setContainerElement] = useState<HTMLDivElement | null>(
      null,
    ),
    // Toast State
    [toasts, setToasts] = useState<ToastMessage[]>([]),
    [expandedToastId, setExpandedToastId] = useState<string | null>(null),
    // Initialize settings repository (use prop or fallback to browser storage)
    settingsRepo = useMemo(
      () => settingsRepository || new BrowserSettingsRepository(),
      [settingsRepository],
    ),
    // App Settings
    [settings, setSettings] = useState<AppSettings>(() => {
      // Inject prop API key if provided into defaults
      if (apiKey) {
        return {
          ...DEFAULT_SETTINGS,
          aiConfig: {
            ...DEFAULT_SETTINGS.aiConfig,
            providers: {
              ...DEFAULT_SETTINGS.aiConfig.providers,
              gemini: { ...DEFAULT_SETTINGS.aiConfig.providers.gemini, apiKey },
            },
          },
        };
      }
      return DEFAULT_SETTINGS;
    }),
    [isSettingsLoaded, setIsSettingsLoaded] = useState(false),
    // Focus Mode State
    [, startFocusTransition] = useTransition(),
    [isFocusMode, setIsFocusMode] = useState(DEFAULT_SETTINGS.defaultFocusMode),
    // Global AI Mode State (Synced across inputs)
    [isAiMode, setIsAiMode] = useState(false),
    // Filter & Sort State (synced from settings on load and settings page changes)
    [filters, setFilters] = useState<FilterState>(settings.filters),
    [sort, setSort] = useState<SortState>(settings.sort),
    // The selected stat card. It is the status dimension of the filters, so
    // it is only in effect while the status filter is empty (see applyFilters)
    [selectedCard, setSelectedCard] = useState<DashboardCard | null>(null),
    activeCard = hasStatusRule(filters) ? null : selectedCard,
    // Defer filter updates to keep UI responsive during rapid filter changes
    deferredFilters = useDeferredValue(filters),
    deferredCard = useDeferredValue(activeCard);

  /** Sets filters; a status selection replaces the selected stat card. */
  const applyFilters = useCallback((next: FilterState) => {
    setFilters(next);
    if (hasStatusRule(next)) {
      setSelectedCard(null);
    }
  }, []);

  // Guards persistence: no saves after a failed load; failures exposed for toasts
  const { persistence: settingsPersistence, error: settingsPersistenceError } =
    useSettingsPersistence(settingsRepo);

  const { agentSessions, emitAgentEvent, removeAgentSession } =
      useAgentSessions(onAgentEvent),
    openAgentPanel = useCallback(() => {
      dispatchAgentPanel({ type: "open" });
    }, []),
    closeAgentPanel = useCallback(() => {
      dispatchAgentPanel({ type: "close" });
    }, []),
    deleteAgentPanelSession = useCallback(
      (sessionId: string) => {
        const nextSessionId =
          [...agentSessions]
            .filter((session) => session.id !== sessionId)
            .sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime(),
            )[0]?.id ?? null;

        removeAgentSession(sessionId);
        dispatchAgentPanel({
          type: "delete-session",
          sessionId,
          nextSessionId,
        });
      },
      [agentSessions, removeAgentSession],
    ),
    selectAgentSession = useCallback((sessionId: string) => {
      dispatchAgentPanel({ type: "select", sessionId });
    }, []),
    startNewAgentSession = useCallback(() => {
      dispatchAgentPanel({ type: "new-session" });
    }, []),
    handleAgentEvent = useCallback(
      (event: AgentEvent) => {
        emitAgentEvent(event);
        dispatchAgentPanel({ type: "event", event });
      },
      [emitAgentEvent],
    );

  // Load settings from repository
  useEffect(() => {
    const loadSettings = async () => {
      logger.info("App", "Loading settings...");

      const loadResult = await settingsPersistence.load();
      if (!loadResult.ok) {
        // App keeps working with in-memory defaults; persistence stays disabled
        // so stored settings are not overwritten with defaults.
        setIsSettingsLoaded(true);
        return;
      }

      const loadedSettings = loadResult.settings;

      // Process Settings
      if (loadedSettings) {
        // Deep merge to ensure new config fields aren't lost
        const mergedSettings: AppSettings = {
          ...DEFAULT_SETTINGS,
          ...loadedSettings,
          aiConfig: {
            ...DEFAULT_SETTINGS.aiConfig,
            ...(loadedSettings.aiConfig || {}),
            providers: {
              ...DEFAULT_SETTINGS.aiConfig.providers,
              ...(loadedSettings.aiConfig?.providers || {}),
              // Ensure each provider has all required fields
              ...Object.fromEntries(
                (
                  Object.keys(
                    DEFAULT_SETTINGS.aiConfig.providers,
                  ) as AIProvider[]
                ).map((key) => [
                  key,
                  {
                    ...DEFAULT_SETTINGS.aiConfig.providers[key],
                    ...(loadedSettings.aiConfig?.providers?.[key] || {}),
                  },
                ]),
              ),
            },
          },
          voiceConfig: {
            ...DEFAULT_SETTINGS.voiceConfig,
            ...(loadedSettings.voiceConfig || {}),
            providers: {
              ...DEFAULT_SETTINGS.voiceConfig.providers,
              ...(loadedSettings.voiceConfig?.providers || {}),
            },
          },
        };

        // Migrate old flat-array filter format to FilterRule
        if (mergedSettings.filters) {
          const f = mergedSettings.filters;
          if (
            Array.isArray(f.tags) &&
            (f.tags.length === 0 || typeof f.tags[0] === "string")
          ) {
            mergedSettings.filters = {
              tags: {
                include: f.tags as unknown as string[],
                exclude: [],
              },
              categories: {
                include: f.categories as unknown as string[],
                exclude: [],
              },
              priorities: {
                include: f.priorities as unknown as Priority[],
                exclude: [],
              },
              statuses: {
                include: f.statuses as unknown as TaskStatus[],
                exclude: [],
              },
              enableScript: f.enableScript ?? false,
              script: f.script ?? "",
            };
          }
        }

        // Override API key from prop if present, even if settings exist
        const finalSettings = apiKey
          ? {
              ...mergedSettings,
              aiConfig: {
                ...mergedSettings.aiConfig,
                providers: {
                  ...mergedSettings.aiConfig.providers,
                  gemini: {
                    ...mergedSettings.aiConfig.providers.gemini,
                    apiKey,
                  },
                },
              },
            }
          : mergedSettings;

        setSettings(finalSettings);

        // Set derived states from settings
        setIsFocusMode(finalSettings.defaultFocusMode);
        setIsAiMode(
          finalSettings.aiConfig.enabled && finalSettings.aiConfig.defaultMode,
        );
        applyFilters(finalSettings.filters);
        setSort(finalSettings.sort);
      } else {
        // Use defaults
        setIsAiMode(
          DEFAULT_SETTINGS.aiConfig.enabled &&
            DEFAULT_SETTINGS.aiConfig.defaultMode,
        );
      }
      setIsSettingsLoaded(true);
    };
    // Merging or migrating loaded settings can throw too; treat that like a
    // failed load so the app still starts and nothing is overwritten.
    loadSettings().catch((error: unknown) => {
      settingsPersistence.failLoad(error);
      setIsSettingsLoaded(true);
    });
  }, [settingsPersistence, apiKey, applyFilters]);

  // Persist Settings on change
  useEffect(() => {
    if (isSettingsLoaded) {
      // persist() never rejects and is a no-op after a failed load
      settingsPersistence.persist(settings);
    }
  }, [settings, settingsPersistence, isSettingsLoaded]);

  // Created once so its methods stay referentially stable: Toast restarts
  // its timer when onDismiss changes
  const [toastInteractions] = useState(() =>
      createToastInteractionController({
        show: (toast) => setToasts((prev) => [...prev, toast]),
        hide: (id) => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
          setExpandedToastId((prev) => (prev === id ? null : prev));
        },
      }),
    ),
    addToast = useCallback((toast: Omit<ToastMessage, "id">): string => {
      const id = createToastId();
      setToasts((prev) => [...prev, { ...toast, id }]);
      return id;
    }, []),
    removeToast = toastInteractions.dismiss,
    addNotification = useCallback(
      (type: ToastVariant, title: string, description?: string) => {
        addToast({
          variant: type,
          title,
          description,
          interaction: { kind: "dismiss" },
          timeout: 4000,
        });
        logger.info("Notification", title, { type, description });
      },
      [addToast],
    ),
    showToast = useCallback(
      (toast: Omit<ToastMessage, "id">) => {
        addToast(toast);
      },
      [addToast],
    ),
    confirmToast = toastInteractions.confirm,
    selectToast = toastInteractions.select,
    promptToast = toastInteractions.prompt,
    toggleExpandToast = useCallback((id: string) => {
      setExpandedToastId((prev) => (prev === id ? null : id));
    }, []),
    updateTokenUsage = (update: {
      provider: string;
      model: string;
      tokenUsage: TokenUsageRecord;
      totalTokens: number;
    }) => {
      setSettings((prev) => {
        const key = `${update.provider}:${update.model}`;
        const existing = prev.tokenUsageByModel[key] || {
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
        };
        return {
          ...prev,
          totalTokenUsage: prev.totalTokenUsage + update.totalTokens,
          tokenUsageByModel: {
            ...prev.tokenUsageByModel,
            [key]: {
              inputTokens: existing.inputTokens + update.tokenUsage.inputTokens,
              outputTokens:
                existing.outputTokens + update.tokenUsage.outputTokens,
              totalTokens: existing.totalTokens + update.tokenUsage.totalTokens,
            },
          },
        };
      });
    };

  // Questions still waiting at unmount reject, so the agent turn ends instead of hanging
  useEffect(() => {
    toastInteractions.activate();
    return () => toastInteractions.dispose();
  }, [toastInteractions]);

  // Surface settings load/save failures to the user (each failure once)
  useEffect(() => {
    if (!settingsPersistenceError) {
      return;
    }
    addToast({
      variant: "error",
      title: settingsPersistenceError.title,
      description: settingsPersistenceError.description,
      interaction: { kind: "dismiss" },
      timeout: null,
    });
  }, [settingsPersistenceError, addToast]);

  // Compute effective theme
  const effectiveTheme =
    settings.theme === "system"
      ? systemInDarkMode
        ? "midnight"
        : "light"
      : settings.theme;

  // Apply Theme (Reactive to settings change)
  useEffect(() => {
    logger.info("App", "system in dark mode: ", systemInDarkMode);
    if (!containerElement) {
      return;
    }
    logger.info("App", "set theme on outer container: ", effectiveTheme);
    containerElement.setAttribute("data-theme", effectiveTheme);
  }, [effectiveTheme, containerElement, systemInDarkMode]);

  const { processedTasks, baseTasks, uniqueTags, uniqueCategories } =
      useTaskFiltering(
        tasks,
        deferredFilters, // Use deferred filters for better performance
        sort,
        deferredCard,
      ),
    cardCounts = useDashboardCards(baseTasks, {
      isFocusMode,
      groupingStrategy: settings.groupingStrategy,
    }),
    /** Saves an update through the host; rejects when it can't be saved. */
    /**
     * Saves through the host; rejects when it can't be saved. `opened` is the
     * task as the editor opened it, so a stale editor can't overwrite another.
     */
    persistTaskUpdate = async (updatedTask: Task, opened?: Task) => {
      const saved = await saveTaskUpdate(
        tasks,
        updatedTask,
        onTaskUpdated,
        opened,
      );
      logger.info("Task", "Updated task", { id: saved.id, title: saved.title });
    },
    handleUpdateTask = async (updatedTask: Task) => {
      try {
        await persistTaskUpdate(updatedTask);
      } catch (error) {
        logger.error("Task", "Failed to update task", { error });
        addNotification("error", "Update Failed", "Could not save changes");
      }
    },
    handleDeleteTask = async (id: string) => {
      const original = tasks.find((t) => t.id === id);

      if (!original) {
        console.warn(`Task ${id} not found`);
        return;
      }

      addNotification("info", "Task Deleted", "Item removed from your list");
      logger.info("Task", "Deleted task", { id });

      // Call parent callback to delete task
      try {
        await onTaskDeleted(id, original);
      } catch (error) {
        logger.error("Task", "Failed to delete task", { error });
        addNotification("error", "Delete Failed", "Could not remove task");
      }
    },
    // Rejects while the editor is open so it keeps the user's edits and
    // shows the error; a failure after it closed becomes a notification
    handleEditTaskSave = (updatedTask: Task) =>
      saveFromEditor(
        () => persistTaskUpdate(updatedTask, editingTask ?? undefined),
        (error) =>
          addNotification(
            "error",
            "Update Failed",
            error instanceof Error ? error.message : String(error),
          ),
      ),
    handleAddTask = async (
      dateOrTask: string | Partial<Task>,
      title?: string,
    ) => {
      let newTask: Task;
      const baseTask = {
        id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        status: "todo" as TaskStatus,
        createdAt: new Date().toISOString(),
        priority: "medium" as Priority,
        tags: [],
        category: settings.defaultCategory, // Default category
      };

      if (typeof dateOrTask === "string" && title) {
        newTask = { ...baseTask, title, dueAt: dateOrTask };
      } else if (typeof dateOrTask === "object") {
        newTask = { ...baseTask, title: "New Task", ...dateOrTask } as Task;
        if (!newTask.title) {
          newTask.title = "Untitled Task";
        }
      } else {
        return;
      }

      newTask.status = deriveWorkflowStatus(newTask);

      logger.info("Task", "Created task", {
        id: newTask.id,
        title: newTask.title,
      });

      // Call parent callback to add task
      try {
        await onTaskAdded(newTask);
      } catch (error) {
        logger.error("Task", "Failed to add task", { error });
        addNotification("error", "Add Failed", "Could not create task");
      }
    },
    applyAgentSettings = useCallback(
      (nextSettings: AppSettings) => {
        setSettings(nextSettings);
        applyFilters(nextSettings.filters);
        setSort(nextSettings.sort);
      },
      [applyFilters],
    ),
    { handleAICommand } = useAIAgent(
      tasks,
      onTaskAdded,
      onTaskUpdated,
      onTaskDeleted,
      settings,
      handleAddTask,
      addNotification,
      updateTokenUsage,
      aiSystemPrompt,
      showToast,
      confirmToast,
      selectToast,
      promptToast,
      {
        providerFactory: aiProviderFactory,
        fetch: aiFetch,
        capabilityContext: aiCapabilityContext,
        capabilities: aiCapabilities,
        extraTools: aiExtraTools,
        maxToolRounds: aiMaxToolRounds,
        updateSettings: applyAgentSettings,
        onAgentEvent: handleAgentEvent,
        shouldNotifyAgentResponse: () => !agentPanelState.isOpen,
        recurrenceFormat,
      },
    ),
    handleTopInputAICommand = async (input: string) => {
      await handleAICommand(input, {
        sessionId: null,
      });
    },
    handlePanelAICommand = async (input: string) => {
      await handleAICommand(input, {
        sessionId: agentPanelState.activeSessionId,
      });
    },
    /**
     * Selects a stat card, or clears it when it is already selected. A card
     * replaces any status filter: the card's number is what the list shows.
     */
    toggleDashboardCard = (card: DashboardCard) => {
      if (activeCard === card) {
        setSelectedCard(null);
        return;
      }
      setSelectedCard(card);
      if (hasStatusRule(filters)) {
        setFilters({ ...filters, statuses: { include: [], exclude: [] } });
      }
    },
    isCardActive = (card: DashboardCard) => activeCard === card,
    handleVoiceError = (msg: string) => {
      addNotification("error", "Voice Input Error", msg);
      logger.error("Voice", msg);
    };

  return (
    <div
      ref={setContainerElement}
      className={cn(
        "tasks-timeline-app bg-paper text-slate-900 font-sans selection:bg-rose-100 selection:text-rose-900 transition-colors duration-300 antialiased",
        className,
      )}
    >
      <AppProvider theme={effectiveTheme}>
        <TasksProvider
          value={{
            tasks: processedTasks,
            availableCategories: uniqueCategories,
            availableTags: uniqueTags,
            onUpdateTask: handleUpdateTask,
            onDeleteTask: handleDeleteTask,
            onAddTask: handleAddTask,
            onEditTask: openEditor,
            onAICommand: handleTopInputAICommand,
            onItemClick,
            renderTitle,
          }}
        >
          <SettingsProvider
            value={{
              settings,
              updateSettings: (partial) => {
                setSettings((prev) => ({ ...prev, ...partial }));
                if (partial.filters) applyFilters(partial.filters);
                if (partial.sort) setSort(partial.sort);
              },
              isFocusMode,
              toggleFocusMode: () => setIsFocusMode(!isFocusMode),
              isAiMode,
              toggleAiMode: () => setIsAiMode(!isAiMode),
              filters,
              onFilterChange: applyFilters,
              sort,
              onSortChange: setSort,
              onVoiceError: handleVoiceError,
              voiceRuntime,
              hasAgentSession: agentSessions.length > 0,
              isAgentPanelOpen: agentPanelState.isOpen,
              isAgentConversationActive:
                agentPanelState.activeSessionId !== null,
              agentPanelUnreadCount: agentPanelState.unreadCount,
              onOpenAgentPanel: openAgentPanel,
              onOpenSettings:
                settings.settingButtonOnInputBar === false
                  ? undefined
                  : () => setIsSettingsOpen(true),
            }}
          >
            <div className="max-w-3xl mx-auto min-h-screen bg-white shadow-xl shadow-slate-200/50 border-x border-slate-100 pb-10 relative">
              <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-sm transition-all duration-300">
                <ErrorBoundary
                  FallbackComponent={AIErrorFallback}
                  onError={(error, info) => {
                    logger.error("InputBar", "Error caught by boundary", {
                      error,
                      info,
                    });
                    addNotification(
                      "error",
                      "Input Error",
                      error instanceof Error ? error.message : String(error),
                    );
                  }}
                  onReset={() => {
                    // Reset AI mode if there's an error
                    setIsAiMode(false);
                  }}
                >
                  <InputBar />
                </ErrorBoundary>

                <div className="px-4 sm:px-6 pb-3">
                  <div className="flex items-center gap-2">
                    {/* Focus Mode Toggle with Fixed Width */}
                    <button
                      onClick={() => {
                        startFocusTransition(() =>
                          setIsFocusMode(!isFocusMode),
                        );
                      }}
                      className={cn(
                        "rounded-lg p-2 flex flex-col items-center justify-center border w-20 shrink-0 transition-all",
                        isFocusMode
                          ? "bg-purple-100 border-purple-400 text-purple-700 shadow-inner"
                          : "bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-600 hover:border-slate-200",
                      )}
                      title={
                        isFocusMode
                          ? "Turn Off Focus Mode"
                          : "Turn On Focus Mode"
                      }
                    >
                      <Icon
                        name={isFocusMode ? "Minimize2" : "Target"}
                        size={20}
                        className="mb-0.5"
                      />
                      <span className="text-[9px] font-bold uppercase tracking-wider truncate w-full text-center">
                        Focus
                      </span>
                    </button>

                    <div className="grid grid-cols-4 gap-2 flex-1">
                      {/* 1. To Do */}
                      <button
                        onClick={() => toggleDashboardCard("todo")}
                        aria-pressed={isCardActive("todo")}
                        className={cn(
                          "rounded-lg p-2 flex flex-col items-center justify-center border",
                          isCardActive("todo")
                            ? "bg-slate-100 border-slate-400"
                            : "bg-slate-50 border-slate-100",
                        )}
                      >
                        <span className="text-lg font-black text-slate-800 leading-none">
                          {cardCounts.todo}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1 truncate w-full text-center">
                          To Do
                        </span>
                      </button>

                      {/* 2. Unplanned */}
                      <button
                        onClick={() => toggleDashboardCard("unplanned")}
                        aria-pressed={isCardActive("unplanned")}
                        className={cn(
                          "rounded-lg p-2 flex flex-col items-center justify-center border",
                          isCardActive("unplanned")
                            ? "bg-purple-100 border-purple-400"
                            : "bg-purple-50 border-purple-100",
                        )}
                      >
                        <span className="text-lg font-black text-purple-600 leading-none">
                          {cardCounts.unplanned}
                        </span>
                        <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider mt-1 truncate w-full text-center">
                          Unplanned
                        </span>
                      </button>

                      {/* 3. Due & Overdue */}
                      <button
                        onClick={() => toggleDashboardCard("urgent")}
                        aria-pressed={isCardActive("urgent")}
                        className={cn(
                          "rounded-lg p-2 flex flex-col items-center justify-center border",
                          isCardActive("urgent")
                            ? "bg-rose-100 border-rose-400"
                            : "bg-rose-50 border-rose-100",
                        )}
                      >
                        <span className="text-lg font-black text-rose-600 leading-none">
                          {cardCounts.urgent}
                        </span>
                        <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider mt-1 truncate w-full text-center">
                          Due & OD
                        </span>
                      </button>

                      {/* 4. Doing (Scheduled + Doing) */}
                      <button
                        onClick={() => toggleDashboardCard("doing")}
                        aria-pressed={isCardActive("doing")}
                        className={cn(
                          "rounded-lg p-2 flex flex-col items-center justify-center border",
                          isCardActive("doing")
                            ? "bg-blue-100 border-blue-400"
                            : "bg-blue-50 border-blue-100",
                        )}
                      >
                        <span className="text-lg font-black text-blue-600 leading-none">
                          {cardCounts.doing}
                        </span>
                        <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider mt-1 truncate w-full text-center">
                          Doing
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <main className="px-4 sm:px-6 pt-6">
                <AgentConversationPanel
                  isOpen={agentPanelState.isOpen}
                  sessions={agentSessions}
                  activeSessionId={agentPanelState.activeSessionId}
                  onSelectSession={selectAgentSession}
                  onStartNewSession={startNewAgentSession}
                  onSendMessage={handlePanelAICommand}
                  onClose={closeAgentPanel}
                  onDeleteSession={deleteAgentPanelSession}
                />

                <ErrorBoundary
                  FallbackComponent={TaskListErrorFallback}
                  onError={(error, info) => {
                    logger.error("TodoList", "Error caught by boundary", {
                      error,
                      info,
                    });
                    addNotification(
                      "error",
                      "Task List Error",
                      error instanceof Error ? error.message : String(error),
                    );
                  }}
                  onReset={() => {
                    // Reset filters to safe defaults
                    setSelectedCard(null);
                    setFilters({
                      tags: { include: [], exclude: [] },
                      categories: { include: [], exclude: [] },
                      priorities: { include: [], exclude: [] },
                      statuses: { include: [], exclude: [] },
                      script: "",
                      enableScript: false,
                    });
                  }}
                >
                  <TodoList />
                </ErrorBoundary>
              </main>

              <footer className="mt-10 py-6 text-center text-slate-400 text-xs border-t border-slate-50">
                <p>Timeline Tasks View</p>
              </footer>

              {/* Toast Container */}
              <div className="pointer-events-none fixed inset-x-3 bottom-3 z-50 flex flex-col-reverse gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6">
                <AnimatePresence>
                  {toasts.map((toast) => (
                    <Toast
                      key={toast.id}
                      toast={toast}
                      onDismiss={removeToast}
                      isExpanded={expandedToastId === toast.id}
                      onToggleExpand={toggleExpandToast}
                    />
                  ))}
                </AnimatePresence>
              </div>

              <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                settings={settings}
                onUpdateSettings={(newSettings) => {
                  setSettings(newSettings);
                  applyFilters(newSettings.filters);
                  setSort(newSettings.sort);
                }}
                availableTags={uniqueTags}
                availableCategories={uniqueCategories}
                customTabs={customSettingsTabs}
                renderSecretField={renderSecretField}
                voiceRuntime={voiceRuntime}
                aiProviderFactory={aiProviderFactory}
                aiFetch={aiFetch}
              />

              <ErrorBoundary
                FallbackComponent={ModalErrorFallback}
                onError={(error, info) => {
                  logger.error("TaskEditModal", "Error in modal", {
                    error,
                    info,
                  });
                  addNotification(
                    "error",
                    "Failed to Edit Task",
                    error instanceof Error ? error.message : String(error),
                  );
                }}
                onReset={() => {
                  closeEditor(); // Close modal on error
                }}
              >
                <TaskEditModal
                  isOpen={Boolean(editingTask)}
                  onClose={closeEditor}
                  task={editingTask}
                  onSave={handleEditTaskSave}
                  availableCategories={uniqueCategories}
                  recurrenceFormat={recurrenceFormat}
                />
              </ErrorBoundary>
            </div>
          </SettingsProvider>
        </TasksProvider>
      </AppProvider>
    </div>
  );
};
