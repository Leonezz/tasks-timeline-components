import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent } from "@storybook/test";
import { DaySection } from "../../components/DaySection";
import type { Task, DayGroup } from "../../types";
import { DateTime } from "luxon";
import { settingsBuilder, taskBuilder } from "../fixtures";
import { delay } from "../test-utils";

const meta: Meta<typeof DaySection> = {
  title: "Sections/DaySection",
  component: DaySection,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    onUpdateTask: { action: "task-updated" },
    onAddTask: { action: "task-added" },
    onAICommand: { action: "ai-command" },
    onEditTask: { action: "task-edited" },
    onDeleteTask: { action: "task-deleted" },
    onVoiceError: { action: "voice-error" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Shared mock data using fixtures
const defaultSettings = settingsBuilder.default();
const today = DateTime.now();

const mockTasks: Task[] = [
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
];

const handleUpdateTask = (task: Task) => console.log("Update task:", task);
const handleAddTask = (task: Partial<Task>) => console.log("Add task:", task);
const handleAICommand = async (input: string) => console.log("AI command:", input);
const handleEditTask = (task: Task) => console.log("Edit task:", task);
const handleDeleteTask = (id: string) => console.log("Delete task:", id);
const handleVoiceError = (msg: string) => console.error("Voice error:", msg);

const mockDayGroup: DayGroup = {
  date: today.toISO()!.split("T")[0],
  tasks: mockTasks,
};

export const Default: Story = {
  args: {
    group: mockDayGroup,
    onUpdateTask: handleUpdateTask,
    onAddTask: handleAddTask,
    onAICommand: handleAICommand,
    onEditTask: handleEditTask,
    onDeleteTask: handleDeleteTask,
    settings: defaultSettings,
    isAiMode: false,
    onVoiceError: handleVoiceError,
    availableCategories: ["Work", "Personal", "Shopping"],
  },
};

export const WithFewTasks: Story = {
  args: {
    ...Default.args,
    group: {
      ...mockDayGroup,
      tasks: mockTasks.slice(0, 1),
    },
  },
};

export const WithManyTasks: Story = {
  args: {
    ...Default.args,
    group: {
      ...mockDayGroup,
      tasks: taskBuilder.many(12, { dueAt: today.toISO()! }),
    },
  },
};

export const Empty: Story = {
  args: {
    ...Default.args,
    group: {
      date: today.toISO()!.split("T")[0],
      tasks: [],
    },
  },
};

export const Weekend: Story = {
  args: {
    ...Default.args,
    group: {
      date: today.set({ weekday: 6 }).toISO()!.split("T")[0], // Saturday
      tasks: mockTasks,
    },
  },
};

// ========================================
// NEW STORIES: Status Variants
// ========================================

export const WithCompletedTasks: Story = {
  args: {
    ...Default.args,
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
    ...Default.args,
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
    ...Default.args,
    group: {
      date: today.toISO()!.split("T")[0],
      tasks: [
        taskBuilder.highPriority({ title: "High priority task", dueAt: today.toISO()! }),
        taskBuilder.mediumPriority({ title: "Medium priority task", dueAt: today.toISO()! }),
        taskBuilder.lowPriority({ title: "Low priority task", dueAt: today.toISO()! }),
      ],
    },
  },
};

// ========================================
// NEW STORIES: Theme Variants
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

export const AIMode: Story = {
  args: {
    ...Default.args,
    isAiMode: true,
    settings: settingsBuilder.withAI(),
  },
};

// ========================================
// NEW STORIES: Interaction Testing
// ========================================

export const AddTaskInline: Story = {
  args: {
    ...Default.args,
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
    ...Default.args,
    onUpdateTask: (task: Task) => console.log("Task updated:", task),
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

