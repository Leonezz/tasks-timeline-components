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

function DefaultInputBar() {
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
        settings={defaultSettings}
        onAddTask={(task: Partial<Task>) => console.log("Add task:", task)}
        onAICommand={async (input: string) => console.log("AI command:", input)}
        isAiMode={isAiMode}
        onToggleAiMode={() => setIsAiMode(!isAiMode)}
        onVoiceError={(msg: string) => console.error("Voice error:", msg)}
      />
    </div>
  );
}

function WithoutAIInputBar() {
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);
  const [sort, setSort] = useState<SortState>(defaultSortState);

  const settingsNoAI = {
    ...defaultSettings,
    aiConfig: { ...defaultSettings.aiConfig, enabled: false },
  };

  return (
    <div className="w-full max-w-2xl">
      <InputBar
        filters={filters}
        onFilterChange={setFilters}
        sort={sort}
        onSortChange={setSort}
        availableTags={[]}
        availableCategories={[]}
        settings={settingsNoAI}
        onAddTask={(task: Partial<Task>) => console.log("Add task:", task)}
        onAICommand={async (input: string) => console.log("AI command:", input)}
        isAiMode={false}
        onToggleAiMode={() => {}}
        onVoiceError={(msg: string) => console.error("Voice error:", msg)}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <DefaultInputBar />,
};

export const WithoutAI: Story = {
  render: () => <WithoutAIInputBar />,
};
