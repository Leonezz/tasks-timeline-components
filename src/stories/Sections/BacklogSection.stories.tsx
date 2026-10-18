import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useMemo, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { BacklogSection } from "../../components/BacklogSection";
import type { FilterState, SortState, Task, AppSettings } from "../../types";
import { SettingsProvider } from "../../contexts/SettingsContext";
import { TasksProvider, useTasksContext } from "../../contexts/TasksContext";
import { edgeCaseTasks, settingsBuilder, taskBuilder } from "../fixtures";
import { DateTime } from "luxon";
import { delay } from "../test-utils";

// Extend component props with story-specific args for decorator usage
interface BacklogSectionStoryArgs {
  tasks: Task[];
  lazy?: boolean;
  defaultOpen?: boolean;
  settings?: ReturnType<typeof settingsBuilder.default>;
}

const meta: Meta<BacklogSectionStoryArgs> = {
  title: "Sections/BacklogSection",
  component: BacklogSection as unknown as React.FC<BacklogSectionStoryArgs>,
  tags: ["autodocs"],
  args: {
    lazy: false,
    // The section starts collapsed by default; most stories show its rows
    defaultOpen: true,
  },
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story, context) => {
      const args = context.args as Record<string, unknown>;
      const [tasks, setTasks] = useState<Task[]>((args.tasks as Task[]) || []),
        [isFocusMode, setIsFocusMode] = useState(false),
        [isAiMode, setIsAiMode] = useState(false),
        [filters, setFilters] = useState<FilterState>({
          tags: { include: [], exclude: [] },
          categories: { include: [], exclude: [] },
          priorities: { include: [], exclude: [] },
          statuses: { include: [], exclude: [] },
          enableScript: false,
          script: "",
        }),
        [sort, setSort] = useState<SortState>({
          field: "dueAt",
          direction: "asc",
          script: "",
        }),
        tasksContextValue = {
          tasks,
          availableCategories: ["Work", "Personal", "Shopping"],
          availableTags: ["work", "personal", "urgent"],
          onUpdateTask: (task: Task) => {
            setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
            console.log("Update task:", task);
          },
          onDeleteTask: (id: string) => {
            setTasks((prev) => prev.filter((t) => t.id !== id));
            console.log("Delete task:", id);
          },
          onAddTask: (task: Partial<Task>) => {
            const newTask: Task = {
              id: `task-${Date.now()}`,
              title: task.title || "New Task",
              status: "todo",
              priority: "medium",
              createdAt: DateTime.now().toISO()!,
              ...task,
            } as Task;
            setTasks((prev) => [...prev, newTask]);
            console.log("Add task:", newTask);
          },
          onEditTask: (task: Task) => console.log("Edit task:", task),
          onAICommand: async (input: string) =>
            console.log("AI command:", input),
        },
        settingsContextValue = {
          settings:
            ((context.args as Record<string, unknown>)
              .settings as AppSettings) || settingsBuilder.default(),
          updateSettings: (_s: Partial<AppSettings>) =>
            console.log("Update settings:", _s),
          isFocusMode,
          toggleFocusMode: () => setIsFocusMode(!isFocusMode),
          isAiMode,
          toggleAiMode: () => setIsAiMode(!isAiMode),
          filters,
          onFilterChange: setFilters,
          sort,
          onSortChange: setSort,
          onVoiceError: (msg: string) => console.error("Voice error:", msg),
          onOpenSettings: () => console.log("Open settings"),
        };

      return (
        <TasksProvider value={tasksContextValue}>
          <SettingsProvider value={settingsContextValue}>
            <div className="p-4">
              <Story />
            </div>
          </SettingsProvider>
        </TasksProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<BacklogSectionStoryArgs>;

// Helper to create undated tasks (backlog tasks)
const createUndatedTask = (overrides?: Partial<Task>): Task =>
  taskBuilder.base({
    dueAt: undefined,
    startAt: undefined,
    createdAt: undefined,
    completedAt: undefined,
    ...overrides,
  });

// ========================================
// Core Stories
// ========================================

export const Default: Story = {
  args: {
    tasks: [
      createUndatedTask({
        title: "Research new framework",
        priority: "medium",
      }),
      createUndatedTask({ title: "Update dependencies", priority: "low" }),
      createUndatedTask({ title: "Write blog post", priority: "medium" }),
      createUndatedTask({ title: "Refactor auth module", priority: "high" }),
      createUndatedTask({
        title: "Review security guidelines",
        priority: "medium",
      }),
    ],
    settings: settingsBuilder.default(),
  },
};

export const EmptyBacklog: Story = {
  args: {
    tasks: [],
    settings: settingsBuilder.default(),
  },
};

export const SingleTask: Story = {
  args: {
    tasks: [createUndatedTask({ title: "Single backlog task" })],
    settings: settingsBuilder.default(),
  },
};

export const ManyTasks: Story = {
  args: {
    tasks: Array.from({ length: 20 }, (_, i) =>
      createUndatedTask({ title: `Backlog task ${i + 1}` }),
    ),
    settings: settingsBuilder.default(),
  },
};

// ========================================
// Priority Variants
// ========================================

export const AllHighPriority: Story = {
  args: {
    tasks: [
      createUndatedTask({ title: "Critical bug fix", priority: "high" }),
      createUndatedTask({ title: "Security patch", priority: "high" }),
      createUndatedTask({ title: "Performance issue", priority: "high" }),
    ],
    settings: settingsBuilder.default(),
  },
};

export const MixedPriorities: Story = {
  args: {
    tasks: [
      createUndatedTask({ title: "High priority task", priority: "high" }),
      createUndatedTask({ title: "High priority task 2", priority: "high" }),
      createUndatedTask({ title: "Medium priority task", priority: "medium" }),
      createUndatedTask({
        title: "Medium priority task 2",
        priority: "medium",
      }),
      createUndatedTask({ title: "Low priority task", priority: "low" }),
      createUndatedTask({ title: "Low priority task 2", priority: "low" }),
    ],
    settings: settingsBuilder.default(),
  },
};

// ========================================
// Status Variants
// ========================================

export const WithCompletedTasks: Story = {
  args: {
    tasks: [
      createUndatedTask({ title: "Todo task 1", status: "todo" }),
      createUndatedTask({ title: "Completed task 1", status: "done" }),
      createUndatedTask({ title: "Todo task 2", status: "todo" }),
      createUndatedTask({ title: "Completed task 2", status: "done" }),
    ],
    settings: settingsBuilder.default(),
  },
};

export const AllCompleted: Story = {
  args: {
    tasks: [
      createUndatedTask({ title: "Completed task 1", status: "done" }),
      createUndatedTask({ title: "Completed task 2", status: "done" }),
      createUndatedTask({ title: "Completed task 3", status: "done" }),
    ],
    settings: settingsBuilder.default(),
  },
};

// ========================================
// Missing Strategy Variants
// ========================================

export const WithMissingDueDate: Story = {
  args: {
    tasks: [
      createUndatedTask({
        title: "Task missing due date",
        dueAt: undefined,
        startAt: DateTime.now().toISO()!,
      }),
      createUndatedTask({
        title: "Task missing all dates",
        dueAt: undefined,
        startAt: undefined,
      }),
    ],
    settings: settingsBuilder.default(), // GroupingStrategy: ["dueAt"]
  },
};

export const WithMissingStartDate: Story = {
  args: {
    tasks: [
      createUndatedTask({
        title: "Task missing start date",
        startAt: undefined,
        dueAt: DateTime.now().toISO()!,
      }),
      createUndatedTask({
        title: "Task missing all dates",
        startAt: undefined,
        dueAt: undefined,
      }),
    ],
    settings: settingsBuilder.groupByStartDate(), // GroupingStrategy: ["startAt"]
  },
};

// ========================================
// Edge Cases
// ========================================

export const VeryLongTitles: Story = {
  args: {
    tasks: [
      createUndatedTask({ ...edgeCaseTasks.veryLongTitle }),
      createUndatedTask({ title: "Normal task" }),
      createUndatedTask({ ...edgeCaseTasks.veryLongTitle }),
    ],
    settings: settingsBuilder.default(),
  },
};

export const ManyTags: Story = {
  args: {
    tasks: [
      createUndatedTask({ ...edgeCaseTasks.manyTags }),
      createUndatedTask({
        title: "Normal task with few tags",
        tags: [{ id: "1", name: "work" }],
      }),
    ],
    settings: settingsBuilder.default(),
  },
};

export const UnicodeContent: Story = {
  args: {
    tasks: [
      createUndatedTask({ ...edgeCaseTasks.unicodeTitle }),
      createUndatedTask({ title: "Regular English task" }),
      createUndatedTask({ title: "另一个中文任务" }),
    ],
    settings: settingsBuilder.default(),
  },
};

// ========================================
// Theme Variants
// ========================================

export const DarkMode: Story = {
  args: {
    ...Default.args,
    settings: settingsBuilder.darkMode(),
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};

export const LargeFontSize: Story = {
  args: {
    ...Default.args,
    settings: settingsBuilder.largeFontSize(),
  },
};

// ========================================
// Interaction Testing
// ========================================

export const ExpandCollapse: Story = {
  args: {
    ...Default.args,
    defaultOpen: false,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Find backlog header", async () => {
      const header = canvas.getByText(/Backlog \/ Undated/i);
      expect(header).toBeInTheDocument();
    });

    await step("Verify task count badge", async () => {
      // Should show count of tasks (e.g., "5")
      const badge = canvas.getByText("5");
      expect(badge).toBeInTheDocument();
    });

    await step("Starts collapsed, with no rows mounted", async () => {
      const expandButton = canvas.getByRole("button", {
        name: /^Expand backlog/,
      });
      expect(expandButton).toHaveAttribute("aria-expanded", "false");
      expect(canvas.queryByText("Research new framework")).toBeNull();
    });

    await step("Click to expand", async () => {
      const expandButton = canvas.getByRole("button", {
        name: /^Expand backlog/,
      });
      await userEvent.click(expandButton);
      await delay(400); // Wait for expand animation
      expect(expandButton).toHaveAttribute("aria-expanded", "true");
      expect(canvas.getByText("Research new framework")).toBeInTheDocument();
    });

    await step("Click again to collapse", async () => {
      const collapseButton = canvas.getByRole("button", {
        name: /^Collapse backlog/,
      });
      await userEvent.click(collapseButton);
      await delay(400); // Wait for collapse animation
      expect(collapseButton).toHaveAttribute("aria-expanded", "false");
      expect(canvas.queryByText("Research new framework")).toBeNull();
    });
  },
};

// The timeline owns the open state (TodoList), so the user's choice survives
// filter changes that unmount the section and focus mode.
const ControlledBacklog = ({ tasks }: { tasks: Task[] }) => {
  const [open, setOpen] = useState(false),
    [shown, setShown] = useState(true);
  return (
    <div>
      <button type="button" onClick={() => setShown((v) => !v)}>
        Toggle section
      </button>
      {shown && (
        <BacklogSection
          tasks={tasks}
          lazy={false}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </div>
  );
};

export const ControlledOpenState: Story = {
  args: { ...Default.args },
  render: (args) => <ControlledBacklog tasks={args.tasks} />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Expand, unmount and remount: stays expanded", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: /^Expand backlog/ }),
      );
      await userEvent.click(
        canvas.getByRole("button", { name: "Toggle section" }),
      );
      expect(canvas.queryByRole("button", { name: /backlog/ })).toBeNull();
      await userEvent.click(
        canvas.getByRole("button", { name: "Toggle section" }),
      );
      expect(
        canvas.getByRole("button", { name: /^Collapse backlog/ }),
      ).toHaveAttribute("aria-expanded", "true");
    });

    await step("Collapse, unmount and remount: stays collapsed", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: /^Collapse backlog/ }),
      );
      await userEvent.click(
        canvas.getByRole("button", { name: "Toggle section" }),
      );
      await userEvent.click(
        canvas.getByRole("button", { name: "Toggle section" }),
      );
      expect(
        canvas.getByRole("button", { name: /^Expand backlog/ }),
      ).toHaveAttribute("aria-expanded", "false");
    });
  },
};

export const TaskInteractions: Story = {
  args: {
    tasks: [
      createUndatedTask({ title: "Task to complete", priority: "high" }),
      createUndatedTask({ title: "Task to edit", priority: "medium" }),
    ],
    settings: settingsBuilder.default(),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Verify tasks are rendered", async () => {
      const task1 = canvas.getByText("Task to complete"),
        task2 = canvas.getByText("Task to edit");
      expect(task1).toBeInTheDocument();
      expect(task2).toBeInTheDocument();
    });
  },
};

// ========================================
// Rows keep their state when the list shifts
// ========================================

const REMOVE_TASK_EVENT = "backlog-story:remove-task";

const SHIFT_TASKS: Task[] = Array.from({ length: 30 }, (_, i) =>
  createUndatedTask({ id: `r${i}`, title: `Undated ${i + 1}` }),
);

// Owns the tasks like a host: the play function removes one through an event,
// as a vault reload or a sync would, without touching the focused input.
const ShiftingBacklog = ({ lazy }: { lazy: boolean }) => {
  const outer = useTasksContext(),
    [tasks, setTasks] = useState(SHIFT_TASKS);

  useEffect(() => {
    const remove = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      setTasks((prev) => prev.filter((task) => task.id !== id));
    };
    window.addEventListener(REMOVE_TASK_EVENT, remove);
    return () => window.removeEventListener(REMOVE_TASK_EVENT, remove);
  }, []);

  const value = useMemo(
    () => ({
      ...outer,
      tasks,
      onUpdateTask: (task: Task) =>
        setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t))),
    }),
    [outer, tasks],
  );

  return (
    <TasksProvider value={value}>
      <BacklogSection tasks={tasks} lazy={lazy} defaultOpen />
    </TasksProvider>
  );
};

const expectEditSurvivesShift = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  // Row 26 is the first row of the second chunk of 25
  const editButton = await waitFor(
    () => canvas.getByRole("button", { name: "Edit Undated 26" }),
    { timeout: 3000 },
  );
  await userEvent.click(editButton);
  const input = canvas.getByRole<HTMLInputElement>("textbox", {
    name: "Edit title for Undated 26",
  });
  await userEvent.type(input, " EDITED");
  expect(input).toHaveFocus();

  // A task above it disappears: row 26 moves into the first chunk
  window.dispatchEvent(new CustomEvent(REMOVE_TASK_EVENT, { detail: "r0" }));
  await waitFor(() =>
    expect(
      canvas.queryByRole("button", { name: "Edit task title: Undated 1" }),
    ).toBeNull(),
  );
  await delay(400);

  // The same input, with the typed text and the focus
  expect(input.isConnected).toBe(true);
  expect(input).toHaveValue("Undated 26 EDITED");
  expect(input).toHaveFocus();

  // And it still saves
  await userEvent.keyboard("{Enter}");
  await waitFor(() =>
    expect(
      canvas.getByRole("button", {
        name: "Edit task title: Undated 26 EDITED",
      }),
    ).toBeInTheDocument(),
  );
};

/**
 * An inline title edit survives a row moving into another chunk of 25 (here
 * a task above it disappears while the user is typing).
 */
export const EditSurvivesChunkShift: Story = {
  args: { tasks: [] },
  render: () => <ShiftingBacklog lazy={false} />,
  play: async ({ canvasElement }) => expectEditSurvivesShift(canvasElement),
};

/** The same with lazy chunks, as the timeline renders the backlog. */
export const EditSurvivesChunkShiftLazy: Story = {
  args: { tasks: [] },
  render: () => <ShiftingBacklog lazy />,
  play: async ({ canvasElement }) => {
    // Bring the end of the list into view so the second chunk mounts
    await waitFor(() =>
      expect(
        within(canvasElement).getByRole("button", {
          name: /^Collapse backlog/,
        }),
      ).toBeInTheDocument(),
    );
    window.scrollTo(0, document.documentElement.scrollHeight);
    await expectEditSurvivesShift(canvasElement);
  },
};
