import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { userEvent } from "storybook/test";
import { withinShadow } from "../test-utils";
import { TaskItem } from "../../components/TaskItem";
import type { FilterState, SortState, Task, AppSettings } from "../../types";
import { TasksProvider } from "../../contexts/TasksContext";
import { SettingsProvider } from "../../contexts/SettingsContext";
import { AppProvider } from "../../components/AppContext";
import { DateTime } from "luxon";
import { edgeCaseTasks, settingsBuilder, taskBuilder } from "../fixtures";

// Extend component props with story-specific args for decorator usage
interface TaskItemStoryArgs {
  task: Task;
  missingStrategies?: string[];
  settings?: ReturnType<typeof settingsBuilder.default>;
}

const meta: Meta<TaskItemStoryArgs> = {
  title: "Core/TaskItem",
  component: TaskItem as unknown as React.FC<TaskItemStoryArgs>,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    task: {
      name: "task",
      description: "The task data to display",
      control: { type: "object" },
    },
    missingStrategies: {
      name: "missingStrategies",
      description: "How to handle missing data",
      control: { type: "object" },
    },
  },
  decorators: [
    (Story, context) => {
      const [tasks, setTasks] = useState<Task[]>([]),
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
          onItemClick: (task: Task) => console.log("Item clicked:", task),
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
        <AppProvider>
          <TasksProvider value={tasksContextValue}>
            <SettingsProvider value={settingsContextValue}>
              <div className="p-4 bg-white min-w-80">
                <Story />
              </div>
            </SettingsProvider>
          </TasksProvider>
        </AppProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<TaskItemStoryArgs>;

// Shared mock data using fixtures
const defaultTask = taskBuilder.base({
  id: "1",
  title: "Complete project setup",
  description: "Set up the component library configuration and build system",
  priority: "high",
});

export const Default: Story = {
  args: {
    task: defaultTask,
  },
};

export const Completed: Story = {
  args: {
    task: taskBuilder.completed({
      title: "Completed project setup",
      description: "Successfully set up the component library",
    }),
  },
};

export const HighPriority: Story = {
  args: {
    task: taskBuilder.highPriority({
      title: "Urgent: Complete critical bug fix",
    }),
  },
};

export const Overdue: Story = {
  args: {
    task: taskBuilder.overdue({
      title: "Overdue: Submit quarterly report",
    }),
  },
};

export const WithDescription: Story = {
  args: {
    task: taskBuilder.withFullDescription({
      title: "Task with comprehensive description",
    }),
  },
};

export const WithTags: Story = {
  args: {
    task: taskBuilder.withTags(3, {
      title: "Task with multiple tags",
    }),
  },
};

// ========================================
// Edge Cases
// ========================================

export const VeryLongTitle: Story = {
  args: {
    task: edgeCaseTasks.veryLongTitle,
  },
};

export const ManyTags: Story = {
  args: {
    task: edgeCaseTasks.manyTags,
  },
};

export const NoTags: Story = {
  args: {
    task: edgeCaseTasks.noTags,
  },
};

export const NoDescription: Story = {
  args: {
    task: edgeCaseTasks.noDescription,
  },
};

export const UnicodeTitle: Story = {
  args: {
    task: edgeCaseTasks.unicodeTitle,
  },
};

export const DueToday: Story = {
  args: {
    task: taskBuilder.dueToday({
      title: "Due today: Review pull request",
    }),
  },
};

export const Doing: Story = {
  args: {
    task: taskBuilder.doing({
      title: "In Progress: Implementing new feature",
    }),
  },
};

export const Scheduled: Story = {
  args: {
    task: taskBuilder.scheduled({
      title: "Scheduled: Team planning meeting",
    }),
  },
};

export const Cancelled: Story = {
  args: {
    task: taskBuilder.cancelled({
      title: "Cancelled task example",
    }),
  },
};

export const WithRecurrence: Story = {
  args: {
    task: taskBuilder.withRecurrence({
      title: "Recurring: Daily standup",
    }),
  },
};

// ========================================
// Theme Variants
// ========================================

export const DarkMode: Story = {
  args: {
    task: defaultTask,
    settings: settingsBuilder.darkMode(),
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};

export const LargeFontSize: Story = {
  args: {
    task: defaultTask,
    settings: settingsBuilder.largeFontSize(),
  },
};

export const SmallFontSize: Story = {
  args: {
    task: defaultTask,
    settings: settingsBuilder.smallFontSize(),
  },
};

// ========================================
// Interaction Testing
// ========================================

export const ItemClickInteraction: Story = {
  args: {
    task: defaultTask,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Click on task item", async () => {
      const taskElement = canvas.getByText(/Complete project setup/i);
      await userEvent.click(taskElement);
    });
  },
};
