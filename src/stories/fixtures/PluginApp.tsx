import React, { useEffect, useMemo, useState } from "react";
import { TasksTimelineApp } from "../../TasksTimelineApp";
import { MarkdownText } from "../../components/MarkdownText";
import { DEFAULT_SETTINGS } from "../../defaultSettings";
import type { AppSettings, SettingsRepository, Task } from "../../types";

/** Plugin 0.4.x defaults (tasks-timeline-obsidian src/settings.tsx). */
const PLUGIN_SETTINGS: AppSettings = {
  ...DEFAULT_SETTINGS,
  theme: "light",
  dateFormat: "MM, DD",
  showCompleted: true,
  showProgressBar: true,
  fontSize: "base",
  useRelativeDates: true,
  groupingStrategy: ["dueAt"],
  defaultFocusMode: false,
};

const pluginSettingsRepository: SettingsRepository = {
  name: "plugin-host-story",
  loadSettings: async () => ({ ...PLUGIN_SETTINGS }),
  saveSettings: async () => undefined,
};

/**
 * TasksTimelineApp as the Obsidian plugin renders it: the plugin's default
 * settings, a memoized Markdown title renderer, and the tasks loaded after
 * the first render (the plugin renders before it has read the vault).
 */
export const PluginApp: React.FC<{ tasks: Task[] }> = ({ tasks: allTasks }) => {
  const [tasks, setTasks] = useState<Task[]>([]),
    renderTitle = useMemo(
      () => (title: string) => (
        <MarkdownText
          content={title}
          inline
          compact
          paragraphClassName="inline whitespace-pre-wrap"
        />
      ),
      [],
    );
  useEffect(() => {
    const timer = setTimeout(() => setTasks(allTasks), 50);
    return () => clearTimeout(timer);
  }, [allTasks]);
  return (
    <TasksTimelineApp
      tasks={tasks}
      onTaskAdded={() => undefined}
      onTaskUpdated={() => undefined}
      onTaskDeleted={() => undefined}
      settingsRepository={pluginSettingsRepository}
      renderTitle={renderTitle}
    />
  );
};
