import React, {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import type { AppSettings, Task } from "../types";
import { useStableArray } from "../hooks/useStableArray";
import { SettingsContext, TasksContext } from "./context-objects";
import type { TasksContextType } from "./TasksContext";

/* eslint-disable react-refresh/only-export-components */
/**
 * What a task row needs, kept referentially stable while tasks, filters and
 * focus mode change. Rows read this instead of the tasks and settings
 * contexts, so React.memo(TaskItem) skips rows whose task did not change.
 */
export interface TaskRowContextType {
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onEditTask?: (task: Task) => void;
  onItemClick?: (item: Task) => void;
  availableCategories: string[];
  renderTitle?: (title: string) => React.ReactNode;
  settings: AppSettings;
}

const TaskRowContext = createContext<TaskRowContextType | undefined>(undefined);

export function useTaskRowContext(): TaskRowContextType {
  const context = useContext(TaskRowContext);
  if (!context) {
    throw new Error(
      "Task rows must be rendered inside TasksProvider > SettingsProvider",
    );
  }
  return context;
}

/**
 * Derives the row context from the nearest tasks and settings contexts.
 * Both providers render one, so whichever provider is innermost wins, as
 * with the contexts themselves. Callbacks are wrapped once and call the
 * latest handler, so their identity never changes; the value changes only
 * with categories, renderTitle, settings, or whether an optional handler is
 * present.
 */
export function TaskRowBridge({ children }: { children: ReactNode }) {
  const tasksContext = useContext(TasksContext),
    settings: AppSettings | undefined = useContext(SettingsContext)?.settings,
    latest = useRef<TasksContextType | undefined>(tasksContext);

  useLayoutEffect(() => {
    latest.current = tasksContext;
  });

  const onUpdateTask = useCallback(
      (task: Task) => latest.current?.onUpdateTask(task),
      [],
    ),
    onDeleteTask = useCallback(
      (id: string) => latest.current?.onDeleteTask(id),
      [],
    ),
    onEditTask = useCallback(
      (task: Task) => latest.current?.onEditTask?.(task),
      [],
    ),
    onItemClick = useCallback(
      (task: Task) => latest.current?.onItemClick?.(task),
      [],
    ),
    hasTasksContext = tasksContext !== undefined,
    hasEditTask = Boolean(tasksContext?.onEditTask),
    hasItemClick = Boolean(tasksContext?.onItemClick),
    // Rebuilt from the tasks on every change; keep it while its items match
    stableCategories = useStableArray(tasksContext?.availableCategories ?? []),
    availableCategories = tasksContext ? stableCategories : undefined,
    renderTitle = tasksContext?.renderTitle,
    value = useMemo<TaskRowContextType | undefined>(
      () =>
        hasTasksContext && availableCategories && settings
          ? {
              onUpdateTask,
              onDeleteTask,
              onEditTask: hasEditTask ? onEditTask : undefined,
              onItemClick: hasItemClick ? onItemClick : undefined,
              availableCategories,
              renderTitle,
              settings,
            }
          : undefined,
      [
        hasTasksContext,
        hasEditTask,
        hasItemClick,
        availableCategories,
        renderTitle,
        settings,
        onUpdateTask,
        onDeleteTask,
        onEditTask,
        onItemClick,
      ],
    );

  return (
    <TaskRowContext.Provider value={value}>{children}</TaskRowContext.Provider>
  );
}
