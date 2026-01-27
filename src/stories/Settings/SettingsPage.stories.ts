import type { Meta, StoryObj } from "@storybook/react-vite";
import { createElement } from "react";
import { SettingsPage } from "../../components/settings/SettingsPage";
import type { AppSettings, CustomSettingsTab } from "../../types";

const meta: Meta<typeof SettingsPage> = {
  title: "Settings/SettingsPage",
  component: SettingsPage,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
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
  groupingStrategy: ["dueAt"],
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
    settings,
    onUpdateSettings: () => {},

    availableCategories: [],
    availableTags: [],
    inSeperatePage: true,
  },
};

// Example custom tabs for host applications
const customTabs: CustomSettingsTab[] = [
  {
    id: "host-settings",
    label: "Host App",
    icon: "Plug",
    content: createElement(
      "div",
      { className: "p-6" },
      createElement(
        "h3",
        { className: "text-lg font-semibold mb-4" },
        "Host Application Settings",
      ),
      createElement(
        "p",
        { className: "text-slate-600 mb-4" },
        "This tab is injected by the host application. It can contain any React content.",
      ),
      createElement(
        "div",
        { className: "bg-slate-100 rounded-lg p-4" },
        createElement(
          "label",
          { className: "block text-sm font-medium mb-2" },
          "Custom Setting",
        ),
        createElement("input", {
          type: "text",
          placeholder: "Enter value...",
          className:
            "w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
        }),
      ),
    ),
  },
  {
    id: "sync-settings",
    label: "Sync",
    icon: "Cloud",
    content: createElement(
      "div",
      { className: "p-6" },
      createElement(
        "h3",
        { className: "text-lg font-semibold mb-4" },
        "Sync Settings",
      ),
      createElement(
        "p",
        { className: "text-slate-600" },
        "Configure cloud synchronization options here.",
      ),
    ),
  },
];

export const WithCustomTabs: Story = {
  args: {
    settings,
    onUpdateSettings: () => {},
    availableCategories: [],
    availableTags: [],
    inSeperatePage: true,
    customTabs,
  },
};
