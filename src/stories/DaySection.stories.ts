import type { Meta, StoryObj } from "@storybook/react-vite";
import { DaySection } from "../components/DaySection";
import type { Task, DayGroup, TaskStatus, AppSettings } from "../types";
import { DateTime } from "luxon";

const meta: Meta<typeof DaySection> = {
  title: "Components/DaySection",
  component: DaySection,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const today = DateTime.now();

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Review pull requests",
    description: "Check and approve pending PRs",
    status: "todo" as TaskStatus,
    priority: "high",
    createdAt: today.toISO()!,
    dueDate: today.toISO()!,
    category: "Work",
    tags: [{ id: "1", name: "work" }],
  },
  {
    id: "2",
    title: "Update documentation",
    status: "todo" as TaskStatus,
    priority: "medium",
    createdAt: today.toISO()!,
    dueDate: today.toISO()!,
    category: "Work",
    tags: [{ id: "2", name: "docs" }],
  },
  {
    id: "3",
    title: "Deploy to production",
    status: "scheduled" as TaskStatus,
    priority: "high",
    createdAt: today.toISO()!,
    dueDate: today.toISO()!,
    category: "Work",
    tags: [{ id: "3", name: "deploy" }],
  },
];

const defaultSettings: AppSettings = {
  theme: "light",
  dateFormat: "MMM d",
  showCompleted: true,
  showProgressBar: true,
  soundEnabled: false,
  fontSize: "base",
  useRelativeDates: true,
  groupingStrategy: ["dueDate"],
  enableVoiceInput: true,
  voiceProvider: "browser",
  defaultFocusMode: false,
  totalTokenUsage: 0,
  defaultCategory: "General",
  aiConfig: {
    enabled: true,
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
};

const mockDayGroup: DayGroup = {
  date: today.toISO()!.split("T")[0],
  tasks: mockTasks,
};

export const Today: Story = {
  args: {
    group: mockDayGroup,
    onUpdateTask: (task: Task) => console.log("Update task:", task),
    onAddTask: (task: Partial<Task>) => console.log("Add task:", task),
    onAICommand: async (input: string) => console.log("AI command:", input),
    onEditTask: (task: Task) => console.log("Edit task:", task),
    onDeleteTask: (id: string) => console.log("Delete task:", id),
    settings: defaultSettings,
    isAiMode: false,
    onVoiceError: (msg: string) => console.error("Voice error:", msg),
  },
};

export const WithFewTasks: Story = {
  args: {
    ...Today.args,
    group: {
      ...mockDayGroup,
      tasks: mockTasks.slice(0, 1),
    },
  },
};

export const WithManyTasks: Story = {
  args: {
    ...Today.args,
    group: {
      ...mockDayGroup,
      tasks: [
        ...mockTasks,
        ...mockTasks.map((t, i) => ({
          ...t,
          id: `${t.id}-dup-${i}`,
          title: `${t.title} (Copy ${i + 1})`,
        })),
      ],
    },
  },
};

const dayGroup: DayGroup = {
  date: today.toISO(),
  tasks: mockTasks.filter((t) => t.dueDate === today.toISO()),
};

export const Default: Story = {
  args: {
    group: dayGroup,
    settings: defaultSettings,
  },
};

export const Empty: Story = {
  args: {
    group: {
      date: today.toISO(),
      tasks: [],
    },
    settings: defaultSettings,
  },
};

export const MultipleTasks: Story = {
  args: {
    group: {
      date: today.toISO(),
      tasks: mockTasks,
    },
    settings: defaultSettings,
  },
};
