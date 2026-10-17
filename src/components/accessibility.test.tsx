import { DateTime } from "luxon";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SettingsProvider, type SettingsContextType } from "../contexts";
import { TasksProvider, type TasksContextType } from "../contexts";
import type { FilterState, SortState, Task } from "../types";
import { settingsBuilder } from "../stories/fixtures";
import { InputBar } from "./InputBar";
import { TaskEditModal } from "./TaskEditModal";
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

  it("shows the Recurring badge for a task with a rule but no isRecurring flag", () => {
    const task = createTask({
      isRecurring: undefined,
      recurringInterval: "every week",
    });
    const html = renderWithProviders(<TaskItem task={task} />, {
      tasks: [task],
    });

    expect(html).toContain(">Recurring<");
  });

  it("describes a recurring task's rule as the editor reads it", () => {
    // rrule can't read this end date itself
    const task = createTask({
      isRecurring: true,
      recurringInterval: "FREQ=WEEKLY;UNTIL=2026-12-31",
    });
    const html = renderWithProviders(<TaskItem task={task} />, {
      tasks: [task],
    });

    expect(html).toContain(
      'aria-label="Recurring task: every week until December 31, 2026"',
    );
    expect(html).toContain('title="every week until December 31, 2026"');
  });

  it("does not force task titles to wrap inside the truncating title button", () => {
    const task = createTask();
    const html = renderWithProviders(<TaskItem task={task} />, {
      tasks: [task],
    });
    const titleButton = html.match(
      /<button[^>]*aria-label="Edit task title:[^"]*"[^>]*>([\s\S]*?)<\/button>/,
    );

    expect(titleButton?.[0]).toContain("truncate");
    expect(titleButton?.[1]).not.toContain("whitespace-pre-wrap");
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

describe("task editor accessibility", () => {
  const yearlyTask = {
    isRecurring: true,
    recurringInterval: "FREQ=YEARLY;BYMONTH=12;BYMONTHDAY=31",
  };
  const weeklyTask = {
    isRecurring: true,
    recurringInterval: "FREQ=WEEKLY;BYDAY=MO,WE",
  };
  const renderEditor = (overrides: Partial<Task> = {}) =>
    renderToStaticMarkup(
      <TaskEditModal
        isOpen
        task={createTask(overrides)}
        onSave={() => undefined}
        onClose={() => undefined}
        availableCategories={[]}
      />,
    );
  const escapeRegExp = (text: string) =>
    text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Without AppProvider there is no portal container; portalling to
  // document.body would leave the consumer's theme and shadow root behind
  it("renders in place without an AppProvider", () => {
    const html = renderToStaticMarkup(
      <div className="tasks-timeline-app" data-theme="midnight">
        <TaskEditModal
          isOpen
          task={createTask()}
          onSave={() => undefined}
          onClose={() => undefined}
          availableCategories={[]}
        />
      </div>,
    );

    expect(html).toMatch(
      /^<div class="tasks-timeline-app" data-theme="midnight">.*role="dialog"/,
    );
  });

  it("is a modal dialog named by its title", () => {
    const html = renderEditor();
    const dialog = /<div[^>]*role="dialog"[^>]*>/.exec(html)?.[0] ?? "";

    expect(dialog).toContain('aria-modal="true"');
    const labelledBy = /aria-labelledby="([^"]+)"/.exec(dialog)?.[1] ?? "";
    expect(labelledBy).not.toBe("");
    expect(html).toMatch(
      new RegExp(
        `<h2[^>]*id="${escapeRegExp(labelledBy)}"[^>]*>Edit Task</h2>`,
      ),
    );
  });

  it("exposes which yearly months are selected", () => {
    const html = renderEditor(yearlyTask);

    expect(html).toMatch(/<button[^>]*aria-pressed="true"[^>]*>Dec<\/button>/);
    expect(html).toMatch(/<button[^>]*aria-pressed="false"[^>]*>Jan<\/button>/);
  });

  it("does not use slate-400, which fails AA contrast, for text", () => {
    const classes = [
      ...renderEditor(yearlyTask).matchAll(/class="([^"]*)"/g),
    ].flatMap(([, list]) => list.split(/\s+/));

    expect(classes).toContain("text-slate-500");
    expect(classes).not.toContain("text-slate-400");
  });

  // Tailwind's dark: variant follows the OS colour scheme, but the theme
  // tokens already switch with data-theme: with a dark OS, dark: classes
  // invert the editor's colours a second time in every theme
  it("does not use dark: variants", () => {
    const classes = [yearlyTask, weeklyTask, {}]
      .flatMap((task) => [...renderEditor(task).matchAll(/class="([^"]*)"/g)])
      .flatMap(([, list]) => list.split(/\s+/));

    expect(classes.filter((name) => name.startsWith("dark:"))).toEqual([]);
  });
});
