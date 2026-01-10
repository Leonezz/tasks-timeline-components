import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TodoList } from "./components/TodoList";
import { InputBar } from "./components/InputBar";
import { SettingsModal } from "./components/settings/SettingsModal";
import { TaskEditModal } from "./components/TaskEditModal";
import { Toast, type ToastMessage, type ToastType } from "./components/Toast";
import type {
  Task,
  AppSettings,
  FilterState,
  SortState,
  Priority,
  TaskStatus,
  TaskRepository,
  SettingsRepository,
} from "./types";
import { generateMockData } from "./mockData";
import { cn, deriveTaskStatus, deepEqual } from "./utils";
import { logger } from "./utils/logger";
import { BrowserTaskRepository, BrowserSettingsRepository } from "./storage";
import { Icon } from "./components/Icon";
import { AppProvider } from "./components/AppContext";
import { TasksProvider, SettingsProvider } from "./contexts";

// Logic Hooks
import { useTaskFiltering } from "./hooks/useTaskFiltering";
import { useTaskStats } from "./hooks/useTaskStats";
import { useAIAgent } from "./hooks/useAIAgent";

// Default Settings Definition
const DEFAULT_SETTINGS: AppSettings = {
  theme: "light",
  dateFormat: "MMM d",
  showCompleted: true,
  showProgressBar: true,
  soundEnabled: false,
  fontSize: "base",
  useRelativeDates: true,
  groupingStrategy: ["dueAt"],

  // New Features
  enableVoiceInput: true,
  voiceProvider: "browser",
  defaultFocusMode: false,
  totalTokenUsage: 0,
  defaultCategory: "General",

  settingButtonOnInputBar: undefined,

  aiConfig: {
    enabled: true,
    defaultMode: false,
    activeProvider: "gemini",
    providers: {
      gemini: {
        apiKey: "",
        model: "gemini-3-flash-preview",
        baseUrl: "",
      },
      openai: { apiKey: "", model: "gpt-4o", baseUrl: "" },
      anthropic: {
        apiKey: "",
        model: "claude-3-5-sonnet-20240620",
        baseUrl: "",
      },
    },
  },
  filters: {
    tags: ["#"],
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
};

export interface TasksTimelineAppProps {
  className?: string;
  taskRepository?: TaskRepository;
  settingsRepository?: SettingsRepository;
  apiKey?: string;
  systemInDarkMode?: boolean;
  onItemClick?: (item: Task) => void;

  // CRUD operation callbacks for external synchronization
  onTaskAdded?: (task: Task) => void | Promise<void>;
  onTaskUpdated?: (task: Task, previous: Task) => void | Promise<void>;
  onTaskDeleted?: (taskId: string, previous: Task) => void | Promise<void>;
}

export const TasksTimelineApp: React.FC<TasksTimelineAppProps> = ({
  className,
  taskRepository,
  settingsRepository,
  apiKey,
  systemInDarkMode,
  onItemClick,
  onTaskAdded,
  onTaskUpdated,
  onTaskDeleted,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Use state for the container ref to ensure re-render when it's attached,
  // allowing the Provider to pass the correct element to children.
  const [containerElement, setContainerElement] =
    useState<HTMLDivElement | null>(null);

  // Notification State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Initialize repositories (use props or fallback to browser storage)
  const taskRepo = useMemo(
    () => taskRepository || new BrowserTaskRepository(),
    [taskRepository]
  );
  const settingsRepo = useMemo(
    () => settingsRepository || new BrowserSettingsRepository(),
    [settingsRepository]
  );

  // App Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
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
  });

  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  // Focus Mode State
  const [isFocusMode, setIsFocusMode] = useState(
    DEFAULT_SETTINGS.defaultFocusMode
  );

  // Global AI Mode State (Synced across inputs)
  const [isAiMode, setIsAiMode] = useState(false);

  // Initial Load from Repository
  useEffect(() => {
    const loadData = async () => {
      setIsSyncing(true);
      logger.info("App", "Initializing application...");

      try {
        const [loadedTasks, loadedSettings] = await Promise.all([
          taskRepo.loadTasks(),
          settingsRepo.loadSettings(),
        ]);

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
              },
            },
          };

          // Override API key from prop if present, even if settings exist
          if (apiKey) {
            mergedSettings.aiConfig.providers.gemini.apiKey = apiKey;
          }

          setSettings(mergedSettings);

          // Set derived states from settings
          setIsFocusMode(mergedSettings.defaultFocusMode);
          setIsAiMode(
            mergedSettings.aiConfig.enabled &&
              mergedSettings.aiConfig.defaultMode
          );
        } else {
          // Use defaults
          setIsAiMode(
            DEFAULT_SETTINGS.aiConfig.enabled &&
              DEFAULT_SETTINGS.aiConfig.defaultMode
          );
        }
        setIsSettingsLoaded(true);

        // Process Tasks
        let finalTasks = loadedTasks;
        if (loadedTasks.length > 0) {
          // Apply auto-status logic on load
          finalTasks = loadedTasks.map((t) => ({
            ...t,
            status: deriveTaskStatus(t),
          }));
          logger.info("App", "Loaded existing tasks", {
            count: finalTasks.length,
          });
        } else {
          // Fallback to mock data if empty
          const mock = generateMockData();
          finalTasks = mock.map((t) => ({ ...t, status: deriveTaskStatus(t) }));
          logger.info("App", "Initialized with mock data");
        }
        setTasks(finalTasks);
      } catch (e) {
        logger.error("App", "Failed to load data", e);
      } finally {
        setIsSyncing(false);
      }
    };
    loadData();
  }, [taskRepo, settingsRepo, apiKey]); // Re-run if container mounts late

  // Persist Settings on change
  useEffect(() => {
    if (isSettingsLoaded) {
      settingsRepo.saveSettings(settings);
    }
  }, [settings, settingsRepo, isSettingsLoaded]);

  // Periodic Status Update (Every 30 seconds)
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTasks((currentTasks) => {
        let hasChanges = false;
        const updated = currentTasks.map((t) => {
          const newStatus = deriveTaskStatus(t);
          if (newStatus !== t.status) {
            hasChanges = true;
            return { ...t, status: newStatus };
          }
          return t;
        });
        return hasChanges ? updated : currentTasks;
      });
    }, 600000); // 10 minites

    return () => clearInterval(intervalId);
  }, []);

  const addNotification = (
    type: ToastType,
    title: string,
    description?: string
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);
    logger.info("Notification", title, { type, description });
  };

  const removeNotification = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTokenUsage = (newTokens: number) => {
    setSettings((prev) => ({
      ...prev,
      totalTokenUsage: prev.totalTokenUsage + newTokens,
    }));
  };

  const [filters, setFilters] = useState<FilterState>(settings.filters);
  const [sort, setSort] = useState<SortState>(settings.sort);

  // Apply Theme (Reactive to settings change)
  useEffect(() => {
    logger.info("App", "system in dark mode: ", systemInDarkMode);
    if (!containerElement) {
      return;
    }
    if (settings.theme === "system") {
      const theme = systemInDarkMode ? "midnight" : "light";
      logger.info("App", "adjust system theme to: ", theme);
      containerElement.setAttribute("data-theme", theme);
    } else {
      logger.info("App", "set theme: ", settings.theme);
      containerElement.setAttribute("data-theme", settings.theme);
    }
  }, [settings.theme, containerElement, systemInDarkMode]);

  const { processedTasks, uniqueTags, uniqueCategories } = useTaskFiltering(
    tasks,
    filters,
    sort
  );
  const stats = useTaskStats(tasks);

  const handleUpdateTask = async (updatedTask: Task) => {
    const original = tasks.find((t) => t.id === updatedTask.id);

    if (!original) {
      console.warn(`Task ${updatedTask.id} not found`);
      return;
    }

    // Apply auto-status logic whenever a task is updated
    const processed = { ...updatedTask, status: deriveTaskStatus(updatedTask) };

    // ✅ Check if ACTUALLY changed (after processing)
    if (deepEqual(original, processed)) {
      logger.info("Task", "No changes detected, skipping update", {
        id: processed.id,
      });
      return; // No-op, skip update entirely
    }

    // Update local state
    setTasks((prev) =>
      prev.map((t) => (t.id === processed.id ? processed : t))
    );

    logger.info("Task", "Updated task", {
      id: processed.id,
      title: processed.title,
    });

    // ✅ Persist only this ONE task (granular update)
    if (onTaskUpdated) {
      // Hooks take priority
      try {
        await onTaskUpdated(processed, original);
      } catch (error) {
        logger.error("Task", "Failed to persist update via hook", { error });
      }
    } else {
      // Fallback to repository for backwards compatibility
      try {
        await taskRepo.updateTask(processed);
      } catch (error) {
        logger.error("Task", "Failed to persist update via repository", { error });
      }
    }
  };

  const handleDeleteTask = async (id: string) => {
    const original = tasks.find((t) => t.id === id);

    if (!original) {
      console.warn(`Task ${id} not found`);
      return;
    }

    // Update local state
    setTasks((prev) => prev.filter((t) => t.id !== id));

    addNotification("info", "Task Deleted", "Item removed from your list");
    logger.info("Task", "Deleted task", { id });

    // ✅ Delete only this ONE task (granular delete)
    if (onTaskDeleted) {
      // Hooks take priority
      try {
        await onTaskDeleted(id, original);
      } catch (error) {
        logger.error("Task", "Failed to persist delete via hook", { error });
      }
    } else {
      // Fallback to repository for backwards compatibility
      try {
        await taskRepo.deleteTask(id);
      } catch (error) {
        logger.error("Task", "Failed to persist delete via repository", { error });
      }
    }
  };

  const handleEditTaskSave = (updatedTask: Task) => {
    handleUpdateTask(updatedTask);
    setEditingTask(null);
  };

  const handleAddTask = async (
    dateOrTask: string | Partial<Task>,
    title?: string
  ) => {
    let newTask: Task;
    const baseTask = {
      id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
      if (!newTask.title) newTask.title = "Untitled Task";
    } else {
      return;
    }

    // Auto-evaluate new tasks too (e.g. if added with tomorrow's due date)
    newTask.status = deriveTaskStatus(newTask);

    // Update local state
    setTasks((prev) => [...prev, newTask]);

    logger.info("Task", "Created task", {
      id: newTask.id,
      title: newTask.title,
    });

    // ✅ Notify parent about new task
    if (onTaskAdded) {
      // Hooks take priority
      try {
        await onTaskAdded(newTask);
      } catch (error) {
        logger.error("Task", "Failed to persist add via hook", { error });
      }
    } else {
      // Fallback to repository for backwards compatibility
      // For add, we save entire array since repositories typically expect full state
      try {
        await taskRepo.saveTasks([...tasks, newTask]);
      } catch (error) {
        logger.error("Task", "Failed to persist add via repository", { error });
      }
    }
  };

  const { handleAICommand } = useAIAgent(
    tasks,
    setTasks,
    settings,
    handleAddTask,
    addNotification,
    updateTokenUsage
  );

  const toggleDashboardFilter = (statuses: TaskStatus[]) => {
    const isSelected =
      statuses.every((s) => filters.statuses.includes(s)) &&
      filters.statuses.length === statuses.length;
    setFilters((prev) => ({ ...prev, statuses: isSelected ? [] : statuses }));
  };

  const isFilterActive = (statuses: TaskStatus[]) => {
    return (
      statuses.every((s) => filters.statuses.includes(s)) &&
      filters.statuses.length === statuses.length
    );
  };

  const handleVoiceError = (msg: string) => {
    addNotification("error", "Voice Input Error", msg);
    logger.error("Voice", msg);
  };

  return (
    <div
      ref={setContainerElement}
      className={cn(
        "tasks-timeline-app bg-paper text-slate-900 font-sans selection:bg-rose-100 selection:text-rose-900 transition-colors duration-300 antialiased",
        className
      )}
    >
      <AppProvider container={containerElement}>
        <TasksProvider
          value={{
            tasks: processedTasks,
            availableCategories: uniqueCategories,
            availableTags: uniqueTags,
            onUpdateTask: handleUpdateTask,
            onDeleteTask: handleDeleteTask,
            onAddTask: handleAddTask,
            onEditTask: setEditingTask,
            onAICommand: handleAICommand,
            onItemClick,
          }}
        >
          <SettingsProvider
            value={{
              settings,
              updateSettings: (partial) => setSettings((prev) => ({ ...prev, ...partial })),
              isFocusMode,
              toggleFocusMode: () => setIsFocusMode(!isFocusMode),
              isAiMode,
              toggleAiMode: () => setIsAiMode(!isAiMode),
              filters,
              onFilterChange: setFilters,
              sort,
              onSortChange: setSort,
              onVoiceError: handleVoiceError,
              onOpenSettings:
                settings.settingButtonOnInputBar === false
                  ? undefined
                  : () => setIsSettingsOpen(true),
            }}
          >
        <div className="max-w-3xl mx-auto min-h-screen bg-white shadow-xl shadow-slate-200/50 border-x border-slate-100 pb-10 relative">
          <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-sm transition-all duration-300">
            {/* Persistence Status Indicator */}
            <div className="h-1 w-full bg-slate-50 relative overflow-hidden">
              {isSyncing && (
                <motion.div
                  initial={{ left: "-100%" }}
                  animate={{ left: "100%" }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear",
                  }}
                  className="absolute top-0 h-full w-1/3 bg-blue-500/30 blur-sm"
                />
              )}
            </div>

            <InputBar />

            <div className="px-4 sm:px-6 pb-3">
              <div className="flex items-center gap-2">
                {/* Focus Mode Toggle with Fixed Width */}
                <button
                  onClick={() => setIsFocusMode(!isFocusMode)}
                  className={cn(
                    "rounded-lg p-2 flex flex-col items-center justify-center border w-20 shrink-0 transition-all",
                    isFocusMode
                      ? "bg-purple-100 border-purple-400 text-purple-700 shadow-inner"
                      : "bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-600 hover:border-slate-200"
                  )}
                  title={
                    isFocusMode ? "Turn Off Focus Mode" : "Turn On Focus Mode"
                  }
                >
                  <Icon
                    name={isFocusMode ? "Minimize2" : "Target"}
                    size={20}
                    className="mb-0.5"
                  />
                  <span className="text-[9px] font-bold uppercase tracking-wider">
                    Focus
                  </span>
                </button>

                <div className="grid grid-cols-4 gap-2 flex-1">
                  {/* 1. To Do */}
                  <button
                    onClick={() => toggleDashboardFilter(["todo"])}
                    className={cn(
                      "rounded-lg p-2 flex flex-col items-center justify-center border",
                      isFilterActive(["todo"])
                        ? "bg-slate-100 border-slate-400"
                        : "bg-slate-50 border-slate-100"
                    )}
                  >
                    <span className="text-lg font-black text-slate-800 leading-none">
                      {stats.todo}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                      To Do
                    </span>
                  </button>

                  {/* 2. Unplanned */}
                  <button
                    onClick={() => toggleDashboardFilter(["unplanned"])}
                    className={cn(
                      "rounded-lg p-2 flex flex-col items-center justify-center border",
                      isFilterActive(["unplanned"])
                        ? "bg-purple-100 border-purple-400"
                        : "bg-purple-50 border-purple-100"
                    )}
                  >
                    <span className="text-lg font-black text-purple-600 leading-none">
                      {stats.unplanned}
                    </span>
                    <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider mt-1">
                      Unplanned
                    </span>
                  </button>

                  {/* 3. Due & Overdue */}
                  <button
                    onClick={() => toggleDashboardFilter(["due", "overdue"])}
                    className={cn(
                      "rounded-lg p-2 flex flex-col items-center justify-center border",
                      isFilterActive(["due", "overdue"])
                        ? "bg-rose-100 border-rose-400"
                        : "bg-rose-50 border-rose-100"
                    )}
                  >
                    <span className="text-lg font-black text-rose-600 leading-none">
                      {stats.urgent}
                    </span>
                    <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider mt-1 truncate w-full text-center">
                      Due & OD
                    </span>
                  </button>

                  {/* 4. Doing (Scheduled + Doing) */}
                  <button
                    onClick={() =>
                      toggleDashboardFilter(["scheduled", "doing"])
                    }
                    className={cn(
                      "rounded-lg p-2 flex flex-col items-center justify-center border",
                      isFilterActive(["scheduled", "doing"])
                        ? "bg-blue-100 border-blue-400"
                        : "bg-blue-50 border-blue-100"
                    )}
                  >
                    <span className="text-lg font-black text-blue-600 leading-none">
                      {stats.scheduled + stats.doing}
                    </span>
                    <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider mt-1">
                      Doing
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <main className="px-4 sm:px-6 pt-6">
            <TodoList />
          </main>

          <footer className="mt-10 py-6 text-center text-slate-400 text-xs border-t border-slate-50">
            <p>Timeline Tasks View • Storage: {taskRepo.name}</p>
          </footer>

          {/* Toast Container */}
          <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
              {toasts.map((toast) => (
                <Toast
                  key={toast.id}
                  toast={toast}
                  onDismiss={removeNotification}
                />
              ))}
            </AnimatePresence>
          </div>

          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            settings={settings}
            onUpdateSettings={setSettings}
            availableTags={uniqueTags}
            availableCategories={uniqueCategories}
          />

          <TaskEditModal
            isOpen={!!editingTask}
            onClose={() => setEditingTask(null)}
            task={editingTask}
            onSave={handleEditTaskSave}
            availableCategories={uniqueCategories}
          />
        </div>
          </SettingsProvider>
        </TasksProvider>
      </AppProvider>
    </div>
  );
};
