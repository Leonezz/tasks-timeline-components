import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { DaySection } from "../../components/DaySection";
import type {
  DayGroup,
  FilterState,
  SortState,
  Task,
  AppSettings,
} from "../../types";
import { TasksProvider } from "../../contexts/TasksContext";
import { SettingsProvider } from "../../contexts/SettingsContext";
import { DateTime } from "luxon";
import { settingsBuilder, taskBuilder } from "../fixtures";
import { delay } from "../test-utils";

// Extend component props with story-specific args for decorator usage
interface DaySectionStoryArgs {
  group: DayGroup;
  lazy?: boolean;
  settings?: ReturnType<typeof settingsBuilder.default>;
  isAiMode?: boolean;
  availableCategories?: string[];
}

const meta: Meta<DaySectionStoryArgs> = {
  title: "Sections/DaySection",
  component: DaySection as unknown as React.FC<DaySectionStoryArgs>,
  tags: ["autodocs"],
  args: {
    lazy: false,
  },
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story, context) => {
      const [tasks, setTasks] = useState<Task[]>([]),
        [isFocusMode, setIsFocusMode] = useState(false),
        [isAiMode, setIsAiMode] = useState(context.args.isAiMode || false),
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
          availableCategories: context.args.availableCategories || [
            "Work",
            "Personal",
            "Shopping",
          ],
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
type Story = StoryObj<DaySectionStoryArgs>;

const today = DateTime.now(),
  mockTasks: Task[] = [
    taskBuilder.base({
      id: "1",
      title: "Review pull requests",
      description: "Check and approve pending PRs",
      status: "todo",
      priority: "high",
      dueAt: today.toISO()!,
      category: "Work",
      tags: [{ id: "1", name: "work" }],
    }),
    taskBuilder.base({
      id: "2",
      title: "Update documentation",
      status: "todo",
      priority: "medium",
      dueAt: today.toISO()!,
      category: "Work",
      tags: [{ id: "2", name: "docs" }],
    }),
    taskBuilder.base({
      id: "3",
      title: "Deploy to production",
      status: "scheduled",
      priority: "high",
      dueAt: today.toISO()!,
      category: "Work",
      tags: [{ id: "3", name: "deploy" }],
    }),
  ],
  mockDayGroup: DayGroup = {
    date: today.toISO()!.split("T")[0],
    tasks: mockTasks,
  };

export const Default: Story = {
  args: {
    group: mockDayGroup,
  },
};

export const WithFewTasks: Story = {
  args: {
    group: {
      ...mockDayGroup,
      tasks: mockTasks.slice(0, 1),
    },
  },
};

export const WithManyTasks: Story = {
  args: {
    group: {
      ...mockDayGroup,
      tasks: taskBuilder.many(12, { dueAt: today.toISO()! }),
    },
  },
};

export const Empty: Story = {
  args: {
    group: {
      date: today.toISO()!.split("T")[0],
      tasks: [],
    },
  },
};

export const Weekend: Story = {
  args: {
    group: {
      date: today.set({ weekday: 6 }).toISO()!.split("T")[0], // Saturday
      tasks: mockTasks,
    },
  },
};

// ========================================
// Status Variants
// ========================================

export const WithCompletedTasks: Story = {
  args: {
    group: {
      date: today.toISO()!.split("T")[0],
      tasks: [
        ...mockTasks,
        taskBuilder.completed({
          title: "Completed task 1",
          dueAt: today.toISO()!,
        }),
        taskBuilder.completed({
          title: "Completed task 2",
          dueAt: today.toISO()!,
        }),
      ],
    },
  },
};

export const WithOverdueTasks: Story = {
  args: {
    group: {
      date: today.toISO()!.split("T")[0],
      tasks: [
        taskBuilder.overdue({
          title: "Overdue task 1",
          dueAt: today.toISO()!,
        }),
        taskBuilder.overdue({
          title: "Overdue task 2",
          dueAt: today.toISO()!,
        }),
        ...mockTasks,
      ],
    },
  },
};

export const MixedPriorities: Story = {
  args: {
    group: {
      date: today.toISO()!.split("T")[0],
      tasks: [
        taskBuilder.highPriority({
          title: "High priority task",
          dueAt: today.toISO()!,
        }),
        taskBuilder.mediumPriority({
          title: "Medium priority task",
          dueAt: today.toISO()!,
        }),
        taskBuilder.lowPriority({
          title: "Low priority task",
          dueAt: today.toISO()!,
        }),
      ],
    },
  },
};

// ========================================
// Theme Variants
// ========================================

export const DarkMode: Story = {
  args: {
    group: mockDayGroup,
    settings: settingsBuilder.darkMode(),
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};

export const AIMode: Story = {
  args: {
    group: mockDayGroup,
    settings: settingsBuilder.withAI(),
    isAiMode: true,
  },
};

// ========================================
// Interaction Testing
// ========================================

export const AddTaskInline: Story = {
  args: {
    group: mockDayGroup,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Find inline add task input", async () => {
      // DaySection has an inline add task input in each day
      const addButtons = canvas.queryAllByRole("button", { name: /add/i });
      // Verify at least one add button exists
      expect(addButtons.length).toBeGreaterThan(0);
    });
  },
};

export const UpdateTaskStatus: Story = {
  args: {
    group: mockDayGroup,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Click task checkbox to complete", async () => {
      const checkboxes = canvas.getAllByRole("checkbox");
      if (checkboxes.length > 0) {
        await userEvent.click(checkboxes[0]);
        await delay(100);
      }
    });
  },
};
