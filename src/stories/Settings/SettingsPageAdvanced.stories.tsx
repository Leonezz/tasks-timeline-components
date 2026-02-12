import { SettingsPageAdvanced } from "../../components/settings/SettingsPageAdvanced";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { AppSettings } from "../../types";
import { expect, within } from "storybook/test";
import { settingsBuilder } from "../fixtures";

const meta: Meta<typeof SettingsPageAdvanced> = {
  title: "Settings/SettingsPageAdvanced",
  component: SettingsPageAdvanced,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    onUpdateSettings: { action: "settings-updated" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const handleUpdateSettings = (s: AppSettings) =>
  console.log("Updated settings:", s);

// ========================================
// Core Variants
// ========================================

export const Default: Story = {
  args: {
    settings: settingsBuilder.default(),
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal", "urgent"],
  },
};

export const NoTags: Story = {
  args: {
    ...Default.args,
    availableTags: [],
  },
};

export const ManyTags: Story = {
  args: {
    ...Default.args,
    availableTags: [
      "work",
      "personal",
      "urgent",
      "client",
      "project-alpha",
      "project-beta",
      "bug",
      "feature",
      "documentation",
      "testing",
    ],
  },
};

// ========================================
// AI Configuration Variants
// ========================================

export const AIDisabled: Story = {
  args: {
    settings: {
      ...settingsBuilder.default(),
      aiConfig: {
        ...settingsBuilder.default().aiConfig,
        enabled: false,
      },
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"],
  },
};

export const AIEnabledDefaultOff: Story = {
  args: {
    settings: {
      ...settingsBuilder.default(),
      aiConfig: {
        ...settingsBuilder.default().aiConfig,
        enabled: true,
        defaultMode: false,
      },
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"],
  },
};

export const AIEnabledDefaultOn: Story = {
  args: {
    settings: settingsBuilder.withAI(),
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"],
  },
};

export const GeminiProvider: Story = {
  args: {
    settings: settingsBuilder.withAI({
      aiConfig: {
        enabled: true,
        defaultMode: true,
        activeProvider: "gemini",
        providers: {
          gemini: {
            apiKey: "test-gemini-key",
            model: "gemini-2.0-flash",
            baseUrl: "",
          },
          openai: { apiKey: "", model: "gpt-4o", baseUrl: "" },
          anthropic: {
            apiKey: "",
            model: "claude-sonnet-4-20250514",
            baseUrl: "",
          },
          "openai-compatible": { apiKey: "", model: "", baseUrl: "" },
        },
        systemPrompt: "",
      },
    }),
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"],
  },
};

export const OpenAIProvider: Story = {
  args: {
    settings: settingsBuilder.withAI({
      aiConfig: {
        enabled: true,
        defaultMode: true,
        activeProvider: "openai",
        providers: {
          gemini: { apiKey: "", model: "gemini-2.0-flash", baseUrl: "" },
          openai: {
            apiKey: "sk-test-openai-key",
            model: "gpt-4o",
            baseUrl: "",
          },
          anthropic: {
            apiKey: "",
            model: "claude-sonnet-4-20250514",
            baseUrl: "",
          },
          "openai-compatible": { apiKey: "", model: "", baseUrl: "" },
        },
        systemPrompt: "",
      },
    }),
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"],
  },
};

export const AnthropicProvider: Story = {
  args: {
    settings: settingsBuilder.withAI({
      aiConfig: {
        enabled: true,
        defaultMode: true,
        activeProvider: "anthropic",
        providers: {
          gemini: { apiKey: "", model: "gemini-2.0-flash", baseUrl: "" },
          openai: { apiKey: "", model: "gpt-4o", baseUrl: "" },
          anthropic: {
            apiKey: "sk-ant-test-key",
            model: "claude-sonnet-4-20250514",
            baseUrl: "",
          },
          "openai-compatible": { apiKey: "", model: "", baseUrl: "" },
        },
        systemPrompt: "",
      },
    }),
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"],
  },
};

export const AllProvidersConfigured: Story = {
  args: {
    settings: settingsBuilder.allProvidersConfigured(),
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"],
  },
};

export const WithCustomBaseURL: Story = {
  args: {
    settings: {
      ...settingsBuilder.withAI(),
      aiConfig: {
        enabled: true,
        defaultMode: true,
        activeProvider: "openai",
        providers: {
          gemini: { apiKey: "", model: "gemini-2.0-flash", baseUrl: "" },
          openai: {
            apiKey: "sk-test-key",
            model: "gpt-4o",
            baseUrl: "https://custom-api.example.com",
          },
          anthropic: {
            apiKey: "",
            model: "claude-sonnet-4-20250514",
            baseUrl: "",
          },
          "openai-compatible": { apiKey: "", model: "", baseUrl: "" },
        },
        systemPrompt: "",
      },
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"],
  },
};

export const WithTokenUsage: Story = {
  args: {
    settings: {
      ...settingsBuilder.withAI(),
      totalTokenUsage: 125000,
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"],
  },
};

// ========================================
// Voice Input Variants
// ========================================

export const VoiceInputDisabled: Story = {
  args: {
    settings: {
      ...settingsBuilder.default(),
      voiceConfig: {
        ...settingsBuilder.default().voiceConfig,
        enabled: false,
      },
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"],
  },
};

export const VoiceInputBrowser: Story = {
  args: {
    settings: {
      ...settingsBuilder.withVoiceInput(),
      voiceConfig: {
        ...settingsBuilder.withVoiceInput().voiceConfig,
        activeProvider: "browser",
      },
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"],
  },
};

export const VoiceInputOpenAI: Story = {
  args: {
    settings: {
      ...settingsBuilder.withVoiceInput(),
      voiceConfig: {
        ...settingsBuilder.withVoiceInput().voiceConfig,
        activeProvider: "openai",
        providers: {
          ...settingsBuilder.withVoiceInput().voiceConfig.providers,
          openai: {
            apiKey: "sk-test-key",
            baseUrl: "https://api.openai.com/v1/audio/transcriptions",
            model: "whisper-1",
          },
        },
      },
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"],
  },
};

export const VoiceInputGemini: Story = {
  args: {
    settings: {
      ...settingsBuilder.withVoiceInput(),
      voiceConfig: {
        ...settingsBuilder.withVoiceInput().voiceConfig,
        activeProvider: "gemini",
        providers: {
          ...settingsBuilder.withVoiceInput().voiceConfig.providers,
          gemini: {
            apiKey: "AIza-test-key",
            model: "gemini-1.5-flash",
          },
        },
      },
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"],
  },
};

// ========================================
// Filter Script Variants
// ========================================

export const FilterScriptDisabled: Story = {
  args: {
    ...Default.args,
    settings: {
      ...settingsBuilder.default(),
      filters: {
        tags: [],
        categories: [],
        priorities: [],
        statuses: [],
        enableScript: false,
        script: "",
      },
    },
  },
};

export const FilterScriptEnabled: Story = {
  args: {
    settings: settingsBuilder.withFilterScript(
      "return task.priority === 'high';",
    ),
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"],
  },
};

export const ComplexFilterScript: Story = {
  args: {
    settings: settingsBuilder.withFilterScript(
      "return task.priority === 'high' && task.tags.some(t => t.name === 'urgent');",
    ),
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal", "urgent"],
  },
};

export const FilterScriptWithError: Story = {
  args: {
    settings: settingsBuilder.withFilterScript(
      "return task.invalid syntax here",
    ),
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"],
  },
};

// ========================================
// Sort Variants
// ========================================

export const SortByDueDate: Story = {
  args: {
    settings: {
      ...settingsBuilder.default(),
      sort: {
        field: "dueAt",
        direction: "asc",
        script: "",
      },
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"],
  },
};

export const SortByCreatedDate: Story = {
  args: {
    settings: {
      ...settingsBuilder.default(),
      sort: {
        field: "createdAt",
        direction: "asc",
        script: "",
      },
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"],
  },
};

export const SortByPriority: Story = {
  args: {
    settings: {
      ...settingsBuilder.default(),
      sort: {
        field: "priority",
        direction: "desc",
        script: "",
      },
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"],
  },
};

export const SortByTitle: Story = {
  args: {
    settings: {
      ...settingsBuilder.default(),
      sort: {
        field: "title",
        direction: "asc",
        script: "",
      },
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"],
  },
};

export const SortDescending: Story = {
  args: {
    settings: {
      ...settingsBuilder.default(),
      sort: {
        field: "dueAt",
        direction: "desc",
        script: "",
      },
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"],
  },
};

export const CustomSortScript: Story = {
  args: {
    settings: settingsBuilder.withSortScript(
      "return a.title.localeCompare(b.title);",
    ),
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"],
  },
};

export const ComplexSortScript: Story = {
  args: {
    settings: settingsBuilder.withSortScript(
      "const priorityOrder = { high: 3, medium: 2, low: 1 }; return priorityOrder[b.priority] - priorityOrder[a.priority];",
    ),
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal"],
  },
};

// ========================================
// Tags Filter Variants
// ========================================

export const WithSelectedTags: Story = {
  args: {
    settings: {
      ...settingsBuilder.default(),
      filters: {
        ...settingsBuilder.default().filters,
        tags: ["work", "urgent"],
      },
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal", "urgent", "client"],
  },
};

export const AllTagsSelected: Story = {
  args: {
    settings: {
      ...settingsBuilder.default(),
      filters: {
        ...settingsBuilder.default().filters,
        tags: ["work", "personal", "urgent"],
      },
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal", "urgent"],
  },
};

// ========================================
// Interaction Testing
// ========================================

export const ToggleAIEnabled: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Find Enable AI toggle", async () => {
      const buttons = canvas.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  },
};

export const SwitchAIProvider: Story = {
  args: {
    ...AIEnabledDefaultOn.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Find AI provider buttons", async () => {
      const buttons = canvas.getAllByRole("button");
      // Should have Gemini, OpenAI, Anthropic buttons
      expect(buttons.length).toBeGreaterThan(2);
    });
  },
};

export const EnterAPIKey: Story = {
  args: {
    ...AIEnabledDefaultOn.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Find API key input", async () => {
      const inputs = canvas.getAllByDisplayValue("");
      // Should have password input for API key
      expect(inputs.length).toBeGreaterThan(0);
    });
  },
};

export const ToggleVoiceInput: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Find Voice Input toggle", async () => {
      const buttons = canvas.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  },
};

export const SelectTagFilter: Story = {
  args: {
    ...ManyTags.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Find tag filter buttons", async () => {
      const buttons = canvas.getAllByRole("button");
      // Should have buttons for each tag
      expect(buttons.length).toBeGreaterThan(5);
    });
  },
};

export const EnableFilterScript: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Find Script Filter toggle", async () => {
      const buttons = canvas.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  },
};

export const TypeFilterScript: Story = {
  args: {
    ...FilterScriptEnabled.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Find filter script textarea", async () => {
      const textareas = canvas.getAllByRole("textbox");
      // Should have textarea for script
      expect(textareas.length).toBeGreaterThan(0);
    });
  },
};

export const ChangeSortField: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Find sort field selector", async () => {
      const selects = canvas.getAllByRole("combobox");
      expect(selects.length).toBeGreaterThan(0);
    });
  },
};

export const ToggleSortDirection: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Find sort direction button", async () => {
      const buttons = canvas.getAllByRole("button");
      // Should have ASC/DESC button
      expect(buttons.length).toBeGreaterThan(0);
    });
  },
};

// ========================================
// Edge Cases
// ========================================

export const AllFeaturesEnabled: Story = {
  args: {
    settings: {
      ...settingsBuilder.allProvidersConfigured(),
      voiceConfig: {
        enabled: true,
        activeProvider: "gemini",
        language: "",
        providers: {
          browser: {},
          openai: {
            apiKey: "sk-test-key",
            baseUrl: "https://api.openai.com/v1/audio/transcriptions",
            model: "whisper-1",
          },
          gemini: {
            apiKey: "AIza-test-key",
            model: "gemini-1.5-flash",
          },
        },
      },
      filters: {
        tags: ["work", "urgent"],
        categories: [],
        priorities: [],
        statuses: [],
        enableScript: true,
        script: "return task.priority === 'high';",
      },
      sort: {
        field: "custom",
        direction: "asc",
        script: "return a.title.localeCompare(b.title);",
      },
      totalTokenUsage: 500000,
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal", "urgent", "client"],
  },
};

export const AllFeaturesDisabled: Story = {
  args: {
    settings: {
      ...settingsBuilder.default(),
      aiConfig: {
        ...settingsBuilder.default().aiConfig,
        enabled: false,
      },
      voiceConfig: {
        ...settingsBuilder.default().voiceConfig,
        enabled: false,
      },
      filters: {
        tags: [],
        categories: [],
        priorities: [],
        statuses: [],
        enableScript: false,
        script: "",
      },
    },
    onUpdateSettings: handleUpdateSettings,
    availableTags: [],
  },
};

export const VeryLongScript: Story = {
  args: {
    settings: settingsBuilder.withFilterScript(
      "// This is a very long filter script with multiple lines\n" +
        "const isHighPriority = task.priority === 'high';\n" +
        "const isUrgent = task.tags.some(t => t.name === 'urgent');\n" +
        "const isDueSoon = task.dueAt && new Date(task.dueAt) < new Date(Date.now() + 86400000);\n" +
        "return isHighPriority || (isUrgent && isDueSoon);",
    ),
    onUpdateSettings: handleUpdateSettings,
    availableTags: ["work", "personal", "urgent"],
  },
};
