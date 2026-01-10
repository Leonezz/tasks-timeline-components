import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent } from "@storybook/test";
import { TaskItem } from "../../components/TaskItem";
import type { Task } from "../../types";
import { settingsBuilder, taskBuilder, edgeCaseTasks } from "../fixtures";

const meta: Meta<typeof TaskItem> = {
  title: "Core/TaskItem",
  component: TaskItem,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    onUpdate: { action: "updated" },
    onDelete: { action: "deleted" },
    onEdit: { action: "edited" },
    onItemClick: { action: "item-clicked" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Shared mock data using fixtures
const defaultSettings = settingsBuilder.default();
const defaultTask = taskBuilder.base({
  id: "1",
  title: "Complete project setup",
  description: "Set up the component library configuration and build system",
  priority: "high",
});

const handleUpdate = (task: Task) => console.log("Update task:", task);
const handleDelete = (id: string) => console.log("Delete task:", id);
const handleEdit = (task: Task) => console.log("Edit task:", task);

export const Default: Story = {
  args: {
    task: defaultTask,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
    onEdit: handleEdit,
    settings: defaultSettings,
  },
};

export const Completed: Story = {
  args: {
    ...Default.args,
    task: taskBuilder.completed({
      title: "Completed project setup",
      description: "Successfully set up the component library",
    }),
  },
};

export const HighPriority: Story = {
  args: {
    ...Default.args,
    task: taskBuilder.highPriority({
      title: "Urgent: Complete critical bug fix",
    }),
  },
};

export const Overdue: Story = {
  args: {
    ...Default.args,
    task: taskBuilder.overdue({
      title: "Overdue: Submit quarterly report",
    }),
  },
};

export const WithDescription: Story = {
  args: {
    ...Default.args,
    task: taskBuilder.withFullDescription({
      title: "Task with comprehensive description",
    }),
  },
};

export const WithTags: Story = {
  args: {
    ...Default.args,
    task: taskBuilder.withTags(3, {
      title: "Task with multiple tags",
    }),
  },
};

// ========================================
// NEW STORIES: Edge Cases
// ========================================

export const VeryLongTitle: Story = {
  args: {
    ...Default.args,
    task: edgeCaseTasks.veryLongTitle,
  },
};

export const ManyTags: Story = {
  args: {
    ...Default.args,
    task: edgeCaseTasks.manyTags,
  },
};

export const NoTags: Story = {
  args: {
    ...Default.args,
    task: edgeCaseTasks.noTags,
  },
};

export const NoDescription: Story = {
  args: {
    ...Default.args,
    task: edgeCaseTasks.noDescription,
  },
};

export const UnicodeTitle: Story = {
  args: {
    ...Default.args,
    task: edgeCaseTasks.unicodeTitle,
  },
};

export const DueToday: Story = {
  args: {
    ...Default.args,
    task: taskBuilder.dueToday({
      title: "Due today: Review pull request",
    }),
  },
};

export const Doing: Story = {
  args: {
    ...Default.args,
    task: taskBuilder.doing({
      title: "In Progress: Implementing new feature",
    }),
  },
};

export const Scheduled: Story = {
  args: {
    ...Default.args,
    task: taskBuilder.scheduled({
      title: "Scheduled: Team planning meeting",
    }),
  },
};

export const Cancelled: Story = {
  args: {
    ...Default.args,
    task: taskBuilder.cancelled({
      title: "Cancelled task example",
    }),
  },
};

export const WithRecurrence: Story = {
  args: {
    ...Default.args,
    task: taskBuilder.withRecurrence({
      title: "Recurring: Daily standup",
    }),
  },
};

// ========================================
// NEW STORIES: Responsive/Theme Testing
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

export const SmallFontSize: Story = {
  args: {
    ...Default.args,
    settings: settingsBuilder.smallFontSize(),
  },
};

// ========================================
// NEW STORIES: Interaction Testing
// ========================================

export const ItemClickInteraction: Story = {
  args: {
    ...Default.args,
    onItemClick: (task: Task) => console.log("Item clicked:", task),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Click on task item", async () => {
      const taskElement = canvas.getByText(/Complete project setup/i);
      await userEvent.click(taskElement);
    });
  },
};
