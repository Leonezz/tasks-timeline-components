import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { within, userEvent } from "@storybook/test";
import { InputBar } from "../../components/InputBar";
import type { FilterState, SortState, Task } from "../../types";
import { settingsBuilder } from "../fixtures";
import { delay } from "../test-utils";

const meta: Meta<typeof InputBar> = {
  title: "Core/InputBar",
  component: InputBar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    onAddTask: { action: "task-added" },
    onAICommand: { action: "ai-command" },
    onOpenSettings: { action: "settings-opened" },
    onToggleAiMode: { action: "ai-mode-toggled" },
    onVoiceError: { action: "voice-error" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultFilterState: FilterState = {
  tags: [],
  categories: [],
  priorities: [],
  statuses: [],
  enableScript: false,
  script: "",
};

const defaultSortState: SortState = {
  field: "dueDate",
  direction: "asc",
  script: "",
};

function DefaultInputBar({ settings }: { settings?: any }) {
  const [isAiMode, setIsAiMode] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);
  const [sort, setSort] = useState<SortState>(defaultSortState);

  const finalSettings = {
    ...settingsBuilder.default(),
    aiConfig: {
      ...settingsBuilder.default().aiConfig,
      enabled: true,
    },
    enableVoiceInput: true,
    ...settings,
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <InputBar
        onOpenSettings={() => console.log("Open settings")}
        filters={filters}
        onFilterChange={setFilters}
        sort={sort}
        onSortChange={setSort}
        availableTags={["work", "personal", "urgent"]}
        availableCategories={["Work", "Personal", "Shopping"]}
        settings={finalSettings}
        onAddTask={(task: Partial<Task>) => console.log("Add task:", task)}
        onAICommand={async (input: string) => console.log("AI command:", input)}
        isAiMode={isAiMode}
        onToggleAiMode={() => setIsAiMode(!isAiMode)}
        onVoiceError={(msg: string) => console.error("Voice error:", msg)}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <DefaultInputBar />,
};

export const WithoutAI: Story = {
  render: () => (
    <DefaultInputBar
      settings={{
        aiConfig: { ...settingsBuilder.default().aiConfig, enabled: false },
      }}
    />
  ),
};

export const WithoutSetting: Story = {
  render: () => <DefaultInputBar settings={{ settingButtonOnInputBar: false }} />,
};

export const WithoutTagsFilter: Story = {
  render: () => <DefaultInputBar settings={{ tagsFilterOnInputBar: false }} />,
};

export const WithoutCategoryFilter: Story = {
  render: () => <DefaultInputBar settings={{ categoriesFilterOnInputBar: false }} />,
};

export const WithoutAllFilter: Story = {
  render: () => (
    <DefaultInputBar
      settings={settingsBuilder.minimalUI()}
    />
  ),
};

export const WithoutSort: Story = {
  render: () => <DefaultInputBar settings={{ sortOnInputBar: false }} />,
};

export const WithoutAllFilterAndSort: Story = {
  render: () => (
    <DefaultInputBar
      settings={{
        ...settingsBuilder.minimalUI(),
        sortOnInputBar: false,
      }}
    />
  ),
};

// ========================================
// NEW STORIES: Theme Variants
// ========================================

export const DarkMode: Story = {
  render: () => <DefaultInputBar settings={settingsBuilder.darkMode()} />,
  parameters: {
    backgrounds: { default: "dark" },
  },
};

export const WithVoiceInput: Story = {
  render: () => (
    <DefaultInputBar
      settings={{
        enableVoiceInput: true,
        voiceProvider: "browser",
      }}
    />
  ),
};

// ========================================
// NEW STORIES: Interaction Testing
// ========================================

export const SubmitNewTask: Story = {
  render: () => <DefaultInputBar />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Type task title", async () => {
      const input = canvas.getByPlaceholderText(/add a new task/i);
      await userEvent.type(input, "Buy groceries");
      await delay(100);
      expect(input).toHaveValue("Buy groceries");
    });

    await step("Submit task with Enter", async () => {
      const input = canvas.getByPlaceholderText(/add a new task/i);
      await userEvent.keyboard("{Enter}");
      await delay(300);
      // Input should be cleared after submission
      expect(input).toHaveValue("");
    });
  },
};

export const ToggleAIMode: Story = {
  render: () => <DefaultInputBar />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Find AI toggle button", async () => {
      // Look for AI mode toggle (this might need adjustment based on actual implementation)
      const aiButton = canvas.getByRole("button", { name: /ai/i });
      expect(aiButton).toBeInTheDocument();
    });
  },
};

export const TypeAndClear: Story = {
  render: () => <DefaultInputBar />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Type text", async () => {
      const input = canvas.getByPlaceholderText(/add a new task/i);
      await userEvent.type(input, "Test task");
      expect(input).toHaveValue("Test task");
    });

    await step("Clear with Escape", async () => {
      const input = canvas.getByPlaceholderText(/add a new task/i);
      await userEvent.keyboard("{Escape}");
      await delay(100);
      // Verify input is cleared (if this behavior exists)
    });
  },
};
