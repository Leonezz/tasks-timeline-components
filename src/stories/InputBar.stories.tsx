import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { InputBar } from "../components/InputBar";
import type { FilterState, SortState, Task, AppSettings } from "../types";

const meta: Meta<typeof InputBar> = {
  title: "Components/InputBar",
  component: InputBar,
  tags: ["autodocs"],
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

const defaultSettings: AppSettings = {
  theme: "light",
  dateFormat: "MMM d",
  showCompleted: true,
  showProgressBar: true,
  soundEnabled: false,
  fontSize: "base",
  useRelativeDates: true,
  groupingStrategy: ["dueAt"],
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
  filters: defaultFilterState,
  sort: defaultSortState,
};

function DefaultInputBar({ settings }: { settings: Partial<AppSettings> }) {
  const [isAiMode, setIsAiMode] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);
  const [sort, setSort] = useState<SortState>(defaultSortState);

  return (
    <div className="w-full max-w-2xl">
      <InputBar
        onOpenSettings={() => console.log("Open settings")}
        filters={filters}
        onFilterChange={setFilters}
        sort={sort}
        onSortChange={setSort}
        availableTags={["work", "personal", "urgent"]}
        availableCategories={["Work", "Personal", "Shopping"]}
        settings={{ ...defaultSettings, ...settings }}
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
  render: () => <DefaultInputBar settings={defaultSettings} />,
};

export const WithoutAI: Story = {
  render: () => (
    <DefaultInputBar
      settings={{ aiConfig: { ...defaultSettings.aiConfig, enabled: false } }}
    />
  ),
};

export const WithoutSetting: Story = {
  render: () => (
    <DefaultInputBar settings={{ settingButtonOnInputBar: false }} />
  ),
};

export const WithoutTagsFilter: Story = {
  render: () => <DefaultInputBar settings={{ tagsFilterOnInputBar: false }} />,
};

export const WithoutCategoryFilter: Story = {
  render: () => (
    <DefaultInputBar settings={{ categoriesFilterOnInputBar: false }} />
  ),
};

export const WithoutAllFilter: Story = {
  render: () => (
    <DefaultInputBar
      settings={{
        tagsFilterOnInputBar: false,
        categoriesFilterOnInputBar: false,
        priorityFilterOnInputBar: false,
        statusFilterOnInputBar: false,
      }}
    />
  ),
};

export const WithoutSort: Story = {
  render: () => (
    <DefaultInputBar
      settings={{
        sortOnInputBar: false,
      }}
    />
  ),
};

export const WithoutAllFilterAndSort: Story = {
  render: () => (
    <DefaultInputBar
      settings={{
        tagsFilterOnInputBar: false,
        categoriesFilterOnInputBar: false,
        priorityFilterOnInputBar: false,
        statusFilterOnInputBar: false,
        sortOnInputBar: false,
      }}
    />
  ),
};
