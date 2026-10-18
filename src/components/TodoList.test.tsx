import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  SettingsProvider,
  TasksProvider,
  type SettingsContextType,
  type TasksContextType,
} from "../contexts";
import type { FilterState, SortState, Task } from "../types";
import { settingsBuilder } from "../stories/fixtures";
import { getDaysFromNowISO, getTodayISO } from "../utils/date-helpers";
import { BacklogSection } from "./BacklogSection";
import { TodoList } from "./TodoList";

const filters: FilterState = {
  tags: { include: [], exclude: [] },
  categories: { include: [], exclude: [] },
  priorities: { include: [], exclude: [] },
  statuses: { include: [], exclude: [] },
  enableScript: false,
  script: "",
};

const sort: SortState = { field: "dueAt", direction: "asc", script: "" };

const makeTask = (overrides: Partial<Task> & { id: string }): Task => ({
  title: `Task ${overrides.id}`,
  status: "todo",
  priority: "medium",
  tags: [],
  ...overrides,
});

const render = (
  children: React.ReactNode,
  { tasks, isFocusMode = false }: { tasks: Task[]; isFocusMode?: boolean },
) => {
  const tasksContext: TasksContextType = {
      tasks,
      availableCategories: [],
      availableTags: [],
      onUpdateTask: () => undefined,
      onDeleteTask: () => undefined,
      onAddTask: () => undefined,
      onAICommand: async () => undefined,
    },
    settingsContext: SettingsContextType = {
      settings: settingsBuilder.default(),
      updateSettings: () => undefined,
      isFocusMode,
      toggleFocusMode: () => undefined,
      isAiMode: false,
      toggleAiMode: () => undefined,
      filters,
      onFilterChange: () => undefined,
      sort,
      onSortChange: () => undefined,
      onVoiceError: () => undefined,
    };

  return renderToStaticMarkup(
    <TasksProvider value={tasksContext}>
      <SettingsProvider value={settingsContext}>{children}</SettingsProvider>
    </TasksProvider>,
  );
};

describe("TodoList backlog", () => {
  it("starts collapsed and renders no backlog rows", () => {
    const html = render(<TodoList />, {
      tasks: [makeTask({ id: "undated", title: "Someday item" })],
    });

    expect(html).toContain('aria-label="Expand backlog, 1 undated task"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain("Someday item");
    expect(html).not.toContain("data-lazy-placeholder");
  });

  it("renders a standalone BacklogSection collapsed unless defaultOpen is set", () => {
    const tasks = [makeTask({ id: "undated", title: "Someday item" })],
      collapsed = render(<BacklogSection tasks={tasks} lazy={false} />, {
        tasks,
      }),
      open = render(<BacklogSection tasks={tasks} lazy={false} defaultOpen />, {
        tasks,
      });

    expect(collapsed).toContain('aria-expanded="false"');
    expect(collapsed).not.toContain("Someday item");
    expect(open).toContain('aria-expanded="true"');
    expect(open).toContain("Someday item");
  });

  it("throws when controlled without onOpenChange, instead of ignoring clicks", () => {
    const tasks = [makeTask({ id: "undated" })];

    expect(() =>
      render(<BacklogSection tasks={tasks} open />, { tasks }),
    ).toThrow(/onOpenChange/);
  });
});

describe("TodoList year header", () => {
  it("leaves today's tasks out of the year totals", () => {
    const today = getTodayISO(),
      // Same year as today unless today is 1 January
      earlier = getDaysFromNowISO(-1).startsWith(today.slice(0, 4))
        ? getDaysFromNowISO(-1)
        : getDaysFromNowISO(1),
      html = render(<TodoList />, {
        tasks: [
          makeTask({ id: "today-1", dueAt: today }),
          makeTask({ id: "today-2", dueAt: today }),
          makeTask({ id: "earlier", dueAt: earlier }),
        ],
      }),
      year = today.slice(0, 4);

    expect(html).toContain(
      `aria-label="Collapse ${year}, 1 task, 0% complete"`,
    );
    expect(html).toContain('aria-label="0 of 1 tasks complete"');
  });

  it("keeps the timeline mounted but hidden in focus mode", () => {
    const html = render(<TodoList />, {
      tasks: [makeTask({ id: "older", dueAt: getDaysFromNowISO(-30) })],
      isFocusMode: true,
    });

    expect(html).toMatch(/<div[^>]*hidden=""[^>]*data-timeline-body/);
  });
});
