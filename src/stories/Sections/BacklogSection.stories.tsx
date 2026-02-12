import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { BacklogSection } from "../../components/BacklogSection";
import type { FilterState, SortState, Task, AppSettings } from "../../types";
import { SettingsProvider } from "../../contexts/SettingsContext";
import { TasksProvider } from "../../contexts/TasksContext";
import { edgeCaseTasks, settingsBuilder, taskBuilder } from "../fixtures";
import { DateTime } from "luxon";
import { delay } from "../test-utils";

// Extend component props with story-specific args for decorator usage
interface BacklogSectionStoryArgs {
  tasks: Task[];
  lazy?: boolean;
  settings?: ReturnType<typeof settingsBuilder.default>;
}

const meta: Meta<BacklogSectionStoryArgs> = {
  title: "Sections/BacklogSection",
  component: BacklogSection as unknown as React.FC<BacklogSectionStoryArgs>,
  tags: ["autodocs"],
  args: {
    lazy: false,
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
          tags: [],
          categories: [],
          priorities: [],
          statuses: [],
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

    await step("Click to collapse backlog section", async () => {
      const collapseButton = canvas.getByRole("button");
      await userEvent.click(collapseButton);
      await delay(400); // Wait for collapse animation
    });

    await step("Click again to expand", async () => {
      const expandButton = canvas.getByRole("button");
      await userEvent.click(expandButton);
      await delay(400); // Wait for expand animation
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
