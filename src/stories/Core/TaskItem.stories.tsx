import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { userEvent } from "storybook/test";
import { withinShadow } from "../test-utils";
import { TaskItem } from "../../components/TaskItem";
import type { FilterState, SortState, Task, AppSettings } from "../../types";
import type { DateValidationState } from "../../utils";
import { TasksProvider } from "../../contexts/TasksContext";
import { SettingsProvider } from "../../contexts/SettingsContext";
import { AppProvider } from "../../components/AppContext";
import { DateTime } from "luxon";
import { edgeCaseTasks, settingsBuilder, taskBuilder } from "../fixtures";

// Extend component props with story-specific args for decorator usage
interface TaskItemStoryArgs {
  task: Task;
  dateValidation?: DateValidationState;
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
    dateValidation: {
      name: "dateValidation",
      description: "Date validation state for showing warnings",
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

// ========================================
// Date Validation Badge Stories
// ========================================

export const MissingDatesWarning: Story = {
  args: {
    task: edgeCaseTasks.missingStrategyDates,
    dateValidation: { hasMissingDates: true, hasInvalidDates: false },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows the consolidated 'No Dates' warning badge when required dates are missing based on grouping strategy.",
      },
    },
  },
};

export const InvalidDateWarning: Story = {
  args: {
    task: edgeCaseTasks.invalidDate,
    dateValidation: { hasMissingDates: false, hasInvalidDates: true },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows the 'Invalid Date' warning badge when dates have invalid format.",
      },
    },
  },
};

export const MultipleInvalidDates: Story = {
  args: {
    task: edgeCaseTasks.multipleInvalidDates,
    dateValidation: { hasMissingDates: false, hasInvalidDates: true },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows a single 'Invalid Date' badge even when multiple dates are invalid (consolidated).",
      },
    },
  },
};

export const MixedDateValidation: Story = {
  args: {
    task: edgeCaseTasks.mixedValidInvalidDates,
    dateValidation: { hasMissingDates: false, hasInvalidDates: true },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Invalid dates take priority over missing dates - shows 'Invalid Date' badge.",
      },
    },
  },
};

export const NoDatesNoWarning: Story = {
  args: {
    task: taskBuilder.base({
      title: "Task with all valid dates",
      dueAt: DateTime.now().plus({ days: 3 }).toISO()!,
      startAt: DateTime.now().toISO()!,
    }),
    dateValidation: undefined,
  },
  parameters: {
    docs: {
      description: {
        story:
          "When all dates are valid and present, no warning badge is shown.",
      },
    },
  },
};

// ========================================
// Status Transition Interaction Tests
// ========================================

export const StatusTransitionToDoing: Story = {
  args: {
    task: edgeCaseTasks.todoReadyForTransition,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Tests status transition from Todo to Doing - should auto-populate startAt date.",
      },
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open status popover", async () => {
      const statusButton = canvas.getByRole("button", {
        name: /Change Status/i,
      });
      await userEvent.click(statusButton);
    });

    await step("Select Doing status", async () => {
      // Wait for popover animation
      await new Promise((resolve) => setTimeout(resolve, 300));
      const doingOption = canvas.getByText(/^doing$/i);
      await userEvent.click(doingOption);
      // Console will log the update with auto-populated startAt
    });
  },
};

export const StatusTransitionToScheduled: Story = {
  args: {
    task: edgeCaseTasks.todoReadyForTransition,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Tests status transition from Todo to Scheduled - should auto-populate startAt date.",
      },
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open status popover", async () => {
      const statusButton = canvas.getByRole("button", {
        name: /Change Status/i,
      });
      await userEvent.click(statusButton);
    });

    await step("Select Scheduled status", async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const scheduledOption = canvas.getByText(/^scheduled$/i);
      await userEvent.click(scheduledOption);
    });
  },
};

export const StatusTransitionToDone: Story = {
  args: {
    task: taskBuilder.doing({
      id: "doing-for-done-test",
      title: "In progress task for completion test",
    }),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Tests status transition to Done - should auto-populate completedAt date.",
      },
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open status popover", async () => {
      const statusButton = canvas.getByRole("button", {
        name: /Change Status/i,
      });
      await userEvent.click(statusButton);
    });

    await step("Select Done status", async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const doneOption = canvas.getByText(/^done$/i);
      await userEvent.click(doneOption);
    });
  },
};

export const StatusTransitionToCancelled: Story = {
  args: {
    task: taskBuilder.doing({
      id: "doing-for-cancel-test",
      title: "In progress task for cancellation test",
    }),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Tests status transition to Cancelled - should auto-populate cancelledAt date.",
      },
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open status popover", async () => {
      const statusButton = canvas.getByRole("button", {
        name: /Change Status/i,
      });
      await userEvent.click(statusButton);
    });

    await step("Select Cancelled status", async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const cancelledOption = canvas.getByText(/^cancelled$/i);
      await userEvent.click(cancelledOption);
    });
  },
};
