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
  },
};

export const AIEnabledDefaultOn: Story = {
  args: {
    settings: settingsBuilder.withAI(),
    onUpdateSettings: handleUpdateSettings,
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
  },
};

export const AllProvidersConfigured: Story = {
  args: {
    settings: settingsBuilder.allProvidersConfigured(),
    onUpdateSettings: handleUpdateSettings,
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
  },
};

export const WithTokenUsage: Story = {
  args: {
    settings: {
      ...settingsBuilder.withAI(),
      totalTokenUsage: 125000,
    },
    onUpdateSettings: handleUpdateSettings,
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
      totalTokenUsage: 500000,
    },
    onUpdateSettings: handleUpdateSettings,
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
    },
    onUpdateSettings: handleUpdateSettings,
  },
};
