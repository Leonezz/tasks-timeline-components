import type { Meta, StoryObj } from "@storybook/react-vite";
import { SettingsPageGeneral } from "../components/settings/SettingsPageGeneral";
import type { AppSettings } from "../types";

const meta: Meta<typeof SettingsPageGeneral> = {
  title: "Components/Settings/SettingsPageGeneral",
  component: SettingsPageGeneral,
  tags: ["audodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const settings: AppSettings = {
  theme: "light",
  dateFormat: "MM, DD",
  showCompleted: true,
  showProgressBar: true,
  soundEnabled: true,
  fontSize: "base",
  useRelativeDates: true,
  groupingStrategy: ["dueDate"],
  aiConfig: {
    enabled: true,
    defaultMode: true,
    activeProvider: "gemini",
    providers: {
      gemini: {
        apiKey: "",
        baseUrl: "",
        model: "",
      },
      anthropic: {
        apiKey: "",
        baseUrl: "",
        model: "",
      },
      openai: {
        apiKey: "",
        baseUrl: "",
        model: "",
      },
    },
  },

  enableVoiceInput: true,
  voiceProvider: "browser",
  defaultFocusMode: true,
  totalTokenUsage: 0,
  defaultCategory: "",
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

export const Default: Story = {
  args: {
    settings: settings,
    onUpdateSettings: (s) => {},
    availableCategories: [],
  },
};
