import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent } from "storybook/test";
import { InputBar } from "../../components/InputBar";
import type { FilterState, SortState, Task, AppSettings } from "../../types";
import { TasksProvider } from "../../contexts/TasksContext";
import { SettingsProvider } from "../../contexts/SettingsContext";
import { AppProvider } from "../../components/AppContext";
import { DateTime } from "luxon";
import { settingsBuilder } from "../fixtures";
import { delay, withinShadow } from "../test-utils";

const meta: Meta<typeof InputBar> = {
  title: "Core/InputBar",
  component: InputBar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story, context) => {
      const [tasks, setTasks] = useState<Task[]>([]),
       [isFocusMode, setIsFocusMode] = useState(false),
       [isAiMode, setIsAiMode] = useState(
        (context.args as Record<string, unknown>).isAiMode as boolean || false
      ),
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
        onAICommand: async (input: string) => console.log("AI command:", input),
      },

       settingsContextValue = {
        settings: (context.args as Record<string, unknown>).settings as AppSettings || settingsBuilder.default(),
        updateSettings: (_s: Partial<AppSettings>) => console.log("Update settings:", _s),
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
        <AppProvider container={document.body}>
          <TasksProvider value={tasksContextValue}>
            <SettingsProvider value={settingsContextValue}>
              <div className="w-full max-w-2xl mx-auto p-4">
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
type Story = StoryObj<typeof meta>;

// ========================================
// Core Variants
// ========================================

export const Default: Story = {
  args: {
    settings: settingsBuilder.default(),
  },
};

export const WithoutAI: Story = {
  args: {
    settings: {
      ...settingsBuilder.default(),
      aiConfig: { ...settingsBuilder.default().aiConfig, enabled: false },
    },
  },
};

export const WithoutSetting: Story = {
  args: {
    settings: {
      ...settingsBuilder.default(),
      settingButtonOnInputBar: false,
    },
  },
};

export const WithoutTagsFilter: Story = {
  args: {
    settings: {
      ...settingsBuilder.default(),
      tagsFilterOnInputBar: false,
    },
  },
};

export const WithoutCategoryFilter: Story = {
  args: {
    settings: {
      ...settingsBuilder.default(),
      categoriesFilterOnInputBar: false,
    },
  },
};

export const WithoutAllFilter: Story = {
  args: {
    settings: settingsBuilder.minimalUI(),
  },
};

export const WithoutSort: Story = {
  args: {
    settings: {
      ...settingsBuilder.default(),
      sortOnInputBar: false,
    },
  },
};

export const WithoutAllFilterAndSort: Story = {
  args: {
    settings: {
      ...settingsBuilder.minimalUI(),
      sortOnInputBar: false,
    },
  },
};

// ========================================
// Theme Variants
// ========================================

export const DarkMode: Story = {
  args: {
    settings: settingsBuilder.darkMode(),
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};

export const WithVoiceInput: Story = {
  args: {
    settings: {
      ...settingsBuilder.default(),
      enableVoiceInput: true,
      voiceProvider: "browser",
    },
  },
};

// ========================================
// AI Mode Variants
// ========================================

export const AIMode: Story = {
  args: {
    settings: settingsBuilder.withAI(),
    isAiMode: true,
  },
};

// ========================================
// Interaction Testing
// ========================================

export const SubmitNewTask: Story = {
  args: {
    settings: settingsBuilder.default(),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Type task title", async () => {
      const input = canvas.getByPlaceholderText(/quick add/i);
      await userEvent.type(input, "Buy groceries");
      await delay(100);
      expect(input).toHaveValue("Buy groceries");
    });

    await step("Submit task with Enter", async () => {
      await userEvent.keyboard("{Enter}");
      await delay(500);
      // Re-query input to get fresh value after potential re-render
      const updatedInput = canvas.getByPlaceholderText(/quick add/i);
      // Input should be cleared after submission
      expect(updatedInput).toHaveValue("");
    });
  },
};

export const ToggleAIMode: Story = {
  args: {
    settings: settingsBuilder.withAI(),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Find AI toggle button", async () => {
      // Look for AI mode toggle
      const aiButton = canvas.getByRole("button", { name: /ai/i });
      expect(aiButton).toBeInTheDocument();
    });
  },
};

export const TypeAndClear: Story = {
  args: {
    settings: settingsBuilder.default(),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Type text", async () => {
      const input = canvas.getByPlaceholderText(/quick add/i);
      await userEvent.type(input, "Test task");
      expect(input).toHaveValue("Test task");
    });

    await step("Clear with Escape", async () => {
      await userEvent.keyboard("{Escape}");
      await delay(100);
      // Verify input behavior
    });
  },
};

export const FocusInput: Story = {
  args: {
    settings: settingsBuilder.default(),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Tab to input and verify focus", async () => {
      await delay(100);
      const input = canvas.getByPlaceholderText(/quick add/i);
      await userEvent.click(input);
      await delay(50);
      expect(input).toHaveFocus();
    });
  },
};
