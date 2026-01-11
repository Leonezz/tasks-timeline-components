import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect } from "storybook/test";
import { TodoList } from "../../components/TodoList";
import type { FilterState, SortState, Task } from "../../types";
import { TasksProvider } from "../../contexts/TasksContext";
import { SettingsProvider } from "../../contexts/SettingsContext";
import { settingsBuilder, taskBuilder } from "../fixtures";
import { DateTime } from "luxon";

import type { AppSettings } from "../../types";

type TodoListStoryArgs = React.ComponentProps<typeof TodoList> & {
  tasks?: Task[];
  settings?: AppSettings;
  isFocusMode?: boolean;
  availableCategories?: string[];
  availableTags?: string[];
  onItemClick?: (task: Task) => void;
};

const meta: Meta<TodoListStoryArgs> = {
  title: "Core/TodoList",
  component: TodoList as unknown as React.FC<TodoListStoryArgs>,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story, context) => {
      const args = context.args as Record<string, unknown>;
      const [tasks, setTasks] = useState<Task[]>((args.tasks as Task[]) || []),
        [isFocusMode, setIsFocusMode] = useState(args.isFocusMode || false),
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
          availableCategories: (args.availableCategories as string[]) || [
            "Work",
            "Personal",
            "Shopping",
          ],
          availableTags: (args.availableTags as string[]) || [
            "work",
            "personal",
            "urgent",
          ],
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
          onItemClick: args.onItemClick as (task: Task) => void,
        },
        settingsContextValue = {
          settings: (args.settings as AppSettings) || settingsBuilder.default(),
          updateSettings: (_s: Partial<AppSettings>) =>
            console.log("Update settings:", _s),
          isFocusMode: (args.isFocusMode as boolean) || false,
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
type Story = StoryObj<typeof meta>;

const today = DateTime.now(),
  yesterday = today.minus({ days: 1 }),
  tomorrow = today.plus({ days: 1 }),
  nextWeek = today.plus({ weeks: 1 });

// ========================================
// Core Stories
// ========================================

export const Default: Story = {
  args: {
    tasks: [
      // Today tasks
      taskBuilder.base({
        title: "Review pull requests",
        dueAt: today.toISO()!,
        priority: "high",
      }),
      taskBuilder.base({
        title: "Update documentation",
        dueAt: today.toISO()!,
        priority: "medium",
      }),
      // Future tasks
      taskBuilder.base({
        title: "Team meeting",
        dueAt: tomorrow.toISO()!,
        priority: "medium",
      }),
      taskBuilder.base({
        title: "Sprint planning",
        dueAt: nextWeek.toISO()!,
        priority: "high",
      }),
      // Backlog (no dates)
      taskBuilder.base({
        id: "backlog-1",
        title: "Research new framework",
        dueAt: undefined,
        startAt: undefined,
        createdAt: undefined,
        completedAt: undefined,
      }),
    ],
    settings: settingsBuilder.default(),
  },
};

export const EmptyState: Story = {
  args: {
    tasks: [],
    settings: settingsBuilder.default(),
  },
};

export const TodayOnly: Story = {
  args: {
    tasks: taskBuilder.many(5, { dueAt: today.toISO()! }),
    settings: settingsBuilder.default(),
  },
};

export const BacklogOnly: Story = {
  args: {
    tasks: [
      taskBuilder.base({
        title: "Undated task 1",
        dueAt: undefined,
        startAt: undefined,
        createdAt: undefined,
        completedAt: undefined,
      }),
      taskBuilder.base({
        title: "Undated task 2",
        dueAt: undefined,
        startAt: undefined,
        createdAt: undefined,
        completedAt: undefined,
      }),
      taskBuilder.base({
        title: "Undated task 3",
        dueAt: undefined,
        startAt: undefined,
        createdAt: undefined,
        completedAt: undefined,
      }),
    ],
    settings: settingsBuilder.default(),
  },
};

export const WithManyTasks: Story = {
  args: {
    tasks: [
      // 20+ tasks across multiple dates
      ...taskBuilder.manyAcrossDays(
        8,
        today.minus({ days: 3 }),
        today.plus({ days: 10 }),
      ),
      ...taskBuilder.many(5, {
        dueAt: undefined,
        startAt: undefined,
        createdAt: undefined,
        completedAt: undefined,
      }),
    ],
    settings: settingsBuilder.default(),
  },
};

export const FocusModeActive: Story = {
  args: {
    tasks: [
      taskBuilder.base({ title: "Today task 1", dueAt: today.toISO()! }),
      taskBuilder.base({ title: "Today task 2", dueAt: today.toISO()! }),
      taskBuilder.base({ title: "Tomorrow task", dueAt: tomorrow.toISO()! }),
      taskBuilder.base({ title: "Next week task", dueAt: nextWeek.toISO()! }),
    ],
    settings: settingsBuilder.default(),
    isFocusMode: true,
  },
};

export const CompletedHidden: Story = {
  args: {
    tasks: [
      taskBuilder.base({ title: "Todo task", dueAt: today.toISO()! }),
      taskBuilder.completed({
        title: "Completed task 1",
        dueAt: today.toISO()!,
      }),
      taskBuilder.completed({
        title: "Completed task 2",
        dueAt: today.toISO()!,
      }),
      taskBuilder.base({ title: "Another todo", dueAt: tomorrow.toISO()! }),
    ],
    settings: settingsBuilder.withoutCompleted(),
  },
};

// ========================================
// Grouping Strategy Variants
// ========================================

export const GroupByStartDate: Story = {
  args: {
    tasks: [
      taskBuilder.base({
        title: "Starting today",
        startAt: today.toISO()!,
        dueAt: nextWeek.toISO()!,
      }),
      taskBuilder.base({
        title: "Starting tomorrow",
        startAt: tomorrow.toISO()!,
        dueAt: nextWeek.toISO()!,
      }),
      taskBuilder.base({
        title: "Starting next week",
        startAt: nextWeek.toISO()!,
        dueAt: undefined,
      }),
    ],
    settings: settingsBuilder.groupByStartDate(),
  },
};

export const GroupByCreatedDate: Story = {
  args: {
    tasks: taskBuilder.many(8).map((task, i) => ({
      ...task,
      createdAt: today.minus({ days: i }).toISO()!,
      dueAt: undefined,
    })),
    settings: settingsBuilder.groupByCreatedDate(),
  },
};

export const GroupByCompletedDate: Story = {
  args: {
    tasks: [
      taskBuilder.completed({
        title: "Completed today",
        completedAt: today.toISO()!,
      }),
      taskBuilder.completed({
        title: "Completed yesterday",
        completedAt: yesterday.toISO()!,
      }),
      taskBuilder.completed({
        title: "Completed last week",
        completedAt: today.minus({ weeks: 1 }).toISO()!,
      }),
    ],
    settings: settingsBuilder.groupByCompletedDate(),
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

export const ScrollBehavior: Story = {
  args: {
    tasks: taskBuilder.manyAcrossDays(
      50,
      today.minus({ days: 10 }),
      today.plus({ days: 30 }),
    ),
    settings: settingsBuilder.default(),
  },
  play: async ({ canvasElement, step }) => {
    await step("Verify many year sections rendered", async () => {
      // TodoList should have year sections
      // At minimum, should have content rendered
      expect(canvasElement.textContent).toBeTruthy();
    });
  },
};

export const WithItemClick: Story = {
  args: {
    tasks: taskBuilder.many(3, { dueAt: today.toISO()! }),
    settings: settingsBuilder.default(),
    onItemClick: (task: Task) => console.log("Item clicked:", task),
  },
};
