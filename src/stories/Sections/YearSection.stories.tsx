import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { within, userEvent } from "@storybook/test";
import { YearSection } from "../../components/YearSection";
import type { YearGroup, FilterState, SortState, Task } from "../../types";
import { SettingsProvider } from "../../contexts/SettingsContext";
import { TasksProvider } from "../../contexts/TasksContext";
import { settingsBuilder, taskBuilder } from "../fixtures";
import { DateTime } from "luxon";
import { delay } from "../test-utils";

const meta: Meta<typeof YearSection> = {
  title: "Sections/YearSection",
  component: YearSection,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story, context) => {
      const [tasks, setTasks] = useState<Task[]>([]);
      const [isFocusMode, setIsFocusMode] = useState(false);
      const [isAiMode, setIsAiMode] = useState(false);
      const [filters, setFilters] = useState<FilterState>({
        tags: [],
        categories: [],
        priorities: [],
        statuses: [],
        enableScript: false,
        script: "",
      });
      const [sort, setSort] = useState<SortState>({
        field: "dueAt",
        direction: "asc",
        script: "",
      });

      const tasksContextValue = {
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
        onAICommand: async (input: string) => console.log("AI command:", input),
      };

      const settingsContextValue = {
        settings: context.args.settings || settingsBuilder.default(),
        updateSettings: (s: any) => console.log("Update settings:", s),
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
type Story = StoryObj<typeof meta>;

const currentYear = DateTime.now().year;
const today = DateTime.now();

// Helper to create YearGroup
const createYearGroup = (
  year: number,
  dayCount: number,
  tasksPerDay: number = 3,
  completedRatio: number = 0.5
): YearGroup => {
  const dayGroups = Array.from({ length: dayCount }, (_, i) => {
    const date = DateTime.local(year, 1, 1).plus({ days: i * 7 });
    const dayTasks = taskBuilder.many(tasksPerDay, {
      dueAt: date.toISO()!,
    });

    // Mark some as completed based on ratio
    const completedCount = Math.floor(tasksPerDay * completedRatio);
    dayTasks.slice(0, completedCount).forEach((t) => {
      t.status = "done";
      t.completedAt = date.toISO()!;
    });

    return {
      date: date.toISODate()!,
      tasks: dayTasks,
    };
  });

  const allTasks = dayGroups.flatMap((d) => d.tasks);
  const completedCount = allTasks.filter((t) => t.status === "done").length;

  return {
    year,
    dayGroups,
    totalTasks: allTasks.length,
    completedTasks: completedCount,
  };
};

// ========================================
// Core Stories
// ========================================

export const Default: Story = {
  args: {
    group: createYearGroup(currentYear, 5, 3, 0.4),
    settings: settingsBuilder.default(),
  },
};

export const Expanded: Story = {
  args: {
    ...Default.args,
    // YearSection defaults to expanded (isOpen: true)
  },
};

export const ProgressBarVisible: Story = {
  args: {
    group: createYearGroup(currentYear, 5, 4, 0.6),
    settings: settingsBuilder.default(), // showProgressBar: true by default
  },
};

export const ProgressBarHidden: Story = {
  args: {
    group: createYearGroup(currentYear, 5, 4, 0.6),
    settings: settingsBuilder.minimalUI(), // showProgressBar: false
  },
};

// ========================================
// Progress Variants
// ========================================

export const AllTasksCompleted: Story = {
  args: {
    group: createYearGroup(currentYear, 5, 3, 1.0), // 100% completion
    settings: settingsBuilder.default(),
  },
};

export const NoTasksCompleted: Story = {
  args: {
    group: createYearGroup(currentYear, 5, 3, 0), // 0% completion
    settings: settingsBuilder.default(),
  },
};

export const HalfCompleted: Story = {
  args: {
    group: createYearGroup(currentYear, 5, 4, 0.5), // 50% completion
    settings: settingsBuilder.default(),
  },
};

// ========================================
// Scale Variants
// ========================================

export const ManyDays: Story = {
  args: {
    group: createYearGroup(currentYear, 30, 2, 0.3), // 30 days, fewer tasks per day
    settings: settingsBuilder.default(),
  },
};

export const FewTasksPerDay: Story = {
  args: {
    group: createYearGroup(currentYear, 10, 1, 0.5), // Sparse year with 1 task per day
    settings: settingsBuilder.default(),
  },
};

export const DenseYear: Story = {
  args: {
    group: createYearGroup(currentYear, 15, 8, 0.4), // Many tasks per day
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
// Edge Cases
// ========================================

export const SingleDay: Story = {
  args: {
    group: createYearGroup(currentYear, 1, 3, 0.3),
    settings: settingsBuilder.default(),
  },
};

export const EmptyYear: Story = {
  args: {
    group: {
      year: currentYear,
      dayGroups: [],
      totalTasks: 0,
      completedTasks: 0,
    },
    settings: settingsBuilder.default(),
  },
};

export const PastYear: Story = {
  args: {
    group: createYearGroup(currentYear - 1, 8, 4, 0.8),
    settings: settingsBuilder.default(),
  },
};

export const FutureYear: Story = {
  args: {
    group: createYearGroup(currentYear + 1, 6, 3, 0.1),
    settings: settingsBuilder.default(),
  },
};

// ========================================
// Interaction Testing
// ========================================

export const ExpandCollapse: Story = {
  args: {
    group: createYearGroup(currentYear, 5, 3, 0.5),
    settings: settingsBuilder.default(),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Find year header", async () => {
      const yearHeader = canvas.getByText(currentYear.toString());
      expect(yearHeader).toBeInTheDocument();
    });

    await step("Click to collapse year section", async () => {
      const collapseButton = canvas.getByRole("button");
      await userEvent.click(collapseButton);
      await delay(500); // Wait for collapse animation
    });

    await step("Click again to expand", async () => {
      const expandButton = canvas.getByRole("button");
      await userEvent.click(expandButton);
      await delay(500); // Wait for expand animation
    });
  },
};

export const ProgressBarAnimation: Story = {
  args: {
    group: createYearGroup(currentYear, 5, 4, 0.75),
    settings: settingsBuilder.default(),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Verify progress text displays correctly", async () => {
      // Should show "X / Y" format
      const progressText = canvas.getByText(/\//, { exact: false });
      expect(progressText).toBeInTheDocument();
    });

    await step("Verify summary text displays", async () => {
      // Should show "X unfinished tasks in Y active days"
      const summaryText = canvas.getByText(/unfinished tasks in/);
      expect(summaryText).toBeInTheDocument();
    });
  },
};
