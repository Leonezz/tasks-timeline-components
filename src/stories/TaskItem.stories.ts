import type { Meta, StoryObj } from "@storybook/react-vite";
import { TaskItem } from "../components/TaskItem";
import type { Task, TaskStatus, AppSettings } from "../types";

const meta: Meta<typeof TaskItem> = {
  title: "Components/TaskItem",
  component: TaskItem,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultSettings: AppSettings = {
  theme: "light",
  dateFormat: "MMM d",
  showCompleted: true,
  showProgressBar: true,
  soundEnabled: false,
  fontSize: "base",
  useRelativeDates: true,
  groupingStrategy: ["dueAt"],
  enableVoiceInput: false,
  voiceProvider: "browser",
  defaultFocusMode: false,
  totalTokenUsage: 0,
  defaultCategory: "General",
  aiConfig: {
    enabled: false,
    defaultMode: false,
    activeProvider: "gemini",
    providers: {
      gemini: { apiKey: "", model: "gemini-2-flash", baseUrl: "" },
      openai: { apiKey: "", model: "gpt-4o", baseUrl: "" },
      anthropic: {
        apiKey: "",
        model: "claude-3-5-sonnet-20240620",
        baseUrl: "",
      },
    },
  },
  filters: {
    tags: ["#"],
    categories: [],
    priorities: [],
    statuses: [],
    enableScript: false,
    script: "",
  },
  sort: {
    field: "createdAt",
    direction: "asc",
    script: "",
  },
};

const defaultTask: Task = {
  id: "1",
  title: "Complete project setup",
  description: "Set up the component library configuration and build system",
  status: "todo" as TaskStatus,
  priority: "high",
  createdAt: new Date().toISOString(),
  dueAt: new Date(Date.now() + 86400000).toISOString(),
  tags: [{ id: "tag-1", name: "work" }],
  category: "Work",
};

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
    task: {
      ...defaultTask,
      status: "done" as TaskStatus,
      completedAt: new Date().toISOString(),
    },
  },
};

export const HighPriority: Story = {
  args: {
    ...Default.args,
    task: {
      ...defaultTask,
      priority: "high",
      dueAt: new Date(Date.now() + 3600000).toISOString(),
    },
  },
};

export const Overdue: Story = {
  args: {
    ...Default.args,
    task: {
      ...defaultTask,
      status: "overdue" as TaskStatus,
      dueAt: new Date(Date.now() - 86400000).toISOString(),
      priority: "high",
    },
  },
};

export const WithDescription: Story = {
  args: {
    ...Default.args,
    task: {
      ...defaultTask,
      description:
        "This is a comprehensive task with a detailed description that explains what needs to be done and any important notes.",
    },
  },
};

export const WithTags: Story = {
  args: {
    ...Default.args,
    task: {
      ...defaultTask,
      tags: [
        { id: "tag-1", name: "urgent" },
        { id: "tag-2", name: "work" },
        { id: "tag-3", name: "review" },
      ],
    },
  },
};
