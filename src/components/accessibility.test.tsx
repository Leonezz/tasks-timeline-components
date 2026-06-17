import { DateTime } from "luxon";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SettingsProvider, type SettingsContextType } from "../contexts";
import { TasksProvider, type TasksContextType } from "../contexts";
import type { FilterState, SortState, Task } from "../types";
import { settingsBuilder } from "../stories/fixtures";
import { InputBar } from "./InputBar";
import { TaskItem } from "./TaskItem";
import { TodoList } from "./TodoList";

const filters: FilterState = {
  tags: { include: [], exclude: [] },
  categories: { include: [], exclude: [] },
  priorities: { include: [], exclude: [] },
  statuses: { include: [], exclude: [] },
  enableScript: false,
  script: "",
};

const sort: SortState = {
  field: "dueAt",
  direction: "asc",
  script: "",
};

const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: "task-1",
  title: "Review a very long task title that needs a reveal affordance",
  status: "todo",
  priority: "medium",
  createdAt: DateTime.now().toISO() ?? undefined,
  dueAt: DateTime.now().toISO() ?? undefined,
  startAt: undefined,
  completedAt: undefined,
  tags: [],
  category: "Work",
  isRecurring: false,
  recurringInterval: undefined,
  ...overrides,
});

const renderWithProviders = (
  children: React.ReactNode,
  {
    tasks = [],
    settings = settingsBuilder.default(),
    isFocusMode = false,
    isAiMode = false,
  }: {
    tasks?: Task[];
    settings?: SettingsContextType["settings"];
    isFocusMode?: boolean;
    isAiMode?: boolean;
  } = {},
) => {
  const tasksContext: TasksContextType = {
      tasks,
      availableCategories: ["Work", "Personal"],
      availableTags: ["work", "urgent"],
      onUpdateTask: () => undefined,
      onDeleteTask: () => undefined,
      onAddTask: () => undefined,
      onAICommand: async () => undefined,
    },
    settingsContext: SettingsContextType = {
      settings,
      updateSettings: () => undefined,
      isFocusMode,
      toggleFocusMode: () => undefined,
      isAiMode,
      toggleAiMode: () => undefined,
      filters,
      onFilterChange: () => undefined,
      sort,
      onSortChange: () => undefined,
      onVoiceError: () => undefined,
      onOpenSettings: () => undefined,
    };

  return renderToStaticMarkup(
    <TasksProvider value={tasksContext}>
      <SettingsProvider value={settingsContext}>{children}</SettingsProvider>
    </TasksProvider>,
  );
};

describe("component accessibility affordances", () => {
  it("labels input bar actions and active filter controls", () => {
    const html = renderWithProviders(<InputBar />, {
      settings: settingsBuilder.withAI(),
    });

    expect(html).toContain('aria-label="Quick add task"');
    expect(html).toContain('aria-label="Switch to AI task entry"');
    expect(html).toContain('aria-label="Open settings and docs"');
    expect(html).toContain('aria-label="Tags filter"');
    expect(html).toContain('aria-pressed="false"');
  });

  it("keeps truncated task titles revealable and task actions named", () => {
    const task = createTask();
    const html = renderWithProviders(<TaskItem task={task} />, {
      tasks: [task],
    });

    expect(html).toContain(`title="${task.title}"`);
    expect(html).toContain(`aria-label="Edit task title: ${task.title}"`);
    expect(html).toContain(
      `aria-label="Change status for ${task.title}. Current status: todo"`,
    );
    expect(html).toContain(`aria-label="Delete ${task.title}"`);
  });

  it("renders task title and description markdown", () => {
    const task = createTask({
      title: "**Commit fixes** with `tracing`",
      description: "Use **structured** logging.",
    });
    const html = renderWithProviders(<TaskItem task={task} />, {
      tasks: [task],
    });

    expect(html).toContain("<strong");
    expect(html).toContain("<code");
    expect(html).toContain("structured");
  });

  it("surfaces focus-mode empty CTA and hidden backlog notice", () => {
    const backlogTask = createTask({
      createdAt: undefined,
      dueAt: undefined,
      category: undefined,
    });
    const html = renderWithProviders(<TodoList />, {
      tasks: [backlogTask],
      isFocusMode: true,
    });

    expect(html).toContain("Focus mode is on. No tasks for today.");
    expect(html).toContain("Add today");
    expect(html).toContain("1 backlog task hidden in focus mode.");
    expect(html).toContain(
      'aria-label="Show backlog tasks by leaving focus mode"',
    );
  });
});
