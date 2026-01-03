/**
 * Example: Basic Task List with Input
 *
 * This example shows the simplest way to use the Tasks Timeline component library.
 */

import React, { useState } from "react";
import {
  TodoList,
  InputBar,
  type Task,
  type AppSettings,
  SortState,
  FilterState,
} from "@tasks-timeline/components";
import "@tasks-timeline/components/styles";

const DEFAULT_SETTINGS: AppSettings = {
  theme: "light",
  dateFormat: "MMM d",
  showCompleted: true,
  showProgressBar: true,
  soundEnabled: false,
  fontSize: "base",
  useRelativeDates: true,
  groupingStrategy: ["dueDate"],
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
      gemini: { apiKey: "", model: "gemini-3-flash-preview", baseUrl: "" },
      openai: { apiKey: "", model: "gpt-4o", baseUrl: "" },
      anthropic: {
        apiKey: "",
        model: "claude-3-5-sonnet-20240620",
        baseUrl: "",
      },
    },
  },
};

export default function BasicExample() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    tags: [],
    categories: [],
    priorities: [],
    statuses: [],
    script: "",
    enableScript: false,
  });
  const [sort, setSort] = useState<SortState>({
    field: "createdAt",
    direction: "asc",
    script: "",
  });
  const [isAiMode, setIsAiMode] = useState(false);

  const handleAddTask = (task: Partial<Task>) => {
    setTasks([
      ...tasks,
      {
        title: "",
        ...task,
        id: task.id || crypto.randomUUID(),
      } as Task,
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8">My Tasks</h1>

        <InputBar
          onAddTask={handleAddTask}
          settings={DEFAULT_SETTINGS}
          filters={filters}
          onFilterChange={setFilters}
          sort={sort}
          onSortChange={setSort}
          availableTags={[]}
          availableCategories={[]}
          onAICommand={async (input: string) => {}}
          isAiMode={isAiMode}
          onToggleAiMode={() => setIsAiMode(!isAiMode)}
          onVoiceError={(error: string) => {}}
        />

        <div className="mt-8">
          <TodoList
            tasks={tasks}
            settings={DEFAULT_SETTINGS}
            onUpdateTask={(task: Task) => {
              setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
            }}
            onAddTask={handleAddTask}
            onDeleteTask={(id: string) => {
              setTasks(tasks.filter((t) => t.id !== id));
            }}
            onAICommand={async (input: string) => {}}
            isFocusMode={false}
            isAiMode={isAiMode}
            onVoiceError={(error: string) => {}}
          />
        </div>
      </div>
    </div>
  );
}
