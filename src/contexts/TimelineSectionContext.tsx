import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import type { AppSettings, Task } from "../types";
import type { VoiceRuntime } from "../utils/voice-providers";
import { useStableArray } from "../hooks/useStableArray";
import { SettingsContext, TasksContext } from "./context-objects";
import type { SettingsContextType } from "./SettingsContext";
import type { TasksContextType } from "./TasksContext";

/* eslint-disable react-refresh/only-export-components */
/**
 * What the timeline's year, day and backlog sections need, kept
 * referentially stable while tasks, filters, stat cards and focus mode
 * change. Sections read this instead of the tasks and settings contexts, so
 * those changes render only the sections whose props changed, and none of
 * the timeline while focus mode hides it.
 */
export interface TimelineSectionContextType {
  settings: AppSettings;
  isAiMode: boolean;
  availableCategories: string[];
  onAddTask: (task: Partial<Task>) => void;
  onAICommand: (input: string) => Promise<void>;
  onVoiceError: (msg: string) => void;
  voiceRuntime?: VoiceRuntime;
}

const TimelineSectionContext = createContext<
  TimelineSectionContextType | undefined
>(undefined);

export function useTimelineSectionContext(): TimelineSectionContextType {
  const context = useContext(TimelineSectionContext);
  if (!context) {
    throw new Error(
      "Timeline sections must be rendered inside TasksProvider > SettingsProvider",
    );
  }
  return context;
}

const useLatest = <T,>(value: T) => {
  const latest = useRef(value);
  useLayoutEffect(() => {
    latest.current = value;
  });
  return latest;
};

/**
 * Derives the section context from the nearest tasks and settings contexts
 * (both providers render one; the innermost wins). Callbacks are wrapped
 * once and call the latest handler; categories keep their identity while
 * their items are unchanged.
 */
export function TimelineSectionBridge({ children }: { children: ReactNode }) {
  const tasksContext = useContext(TasksContext),
    settingsContext = useContext(SettingsContext),
    latestTasks = useLatest<TasksContextType | undefined>(tasksContext),
    latestSettings = useLatest<SettingsContextType | undefined>(
      settingsContext,
    ),
    availableCategories = useStableArray(
      tasksContext?.availableCategories ?? [],
    );

  const onAddTask = useCallback(
      (task: Partial<Task>) => latestTasks.current?.onAddTask(task),
      [latestTasks],
    ),
    onAICommand = useCallback(
      async (input: string) => latestTasks.current?.onAICommand(input),
      [latestTasks],
    ),
    onVoiceError = useCallback(
      (msg: string) => latestSettings.current?.onVoiceError(msg),
      [latestSettings],
    ),
    hasBoth = tasksContext !== undefined && settingsContext !== undefined,
    settings = settingsContext?.settings,
    isAiMode = settingsContext?.isAiMode ?? false,
    voiceRuntime = settingsContext?.voiceRuntime,
    value = useMemo<TimelineSectionContextType | undefined>(
      () =>
        hasBoth && settings
          ? {
              settings,
              isAiMode,
              availableCategories,
              onAddTask,
              onAICommand,
              onVoiceError,
              voiceRuntime,
            }
          : undefined,
      [
        hasBoth,
        settings,
        isAiMode,
        availableCategories,
        onAddTask,
        onAICommand,
        onVoiceError,
        voiceRuntime,
      ],
    );

  return (
    <TimelineSectionContext.Provider value={value}>
      {children}
    </TimelineSectionContext.Provider>
  );
}
