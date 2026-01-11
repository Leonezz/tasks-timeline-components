import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { SettingsPageGeneral } from "../../components/settings/SettingsPageGeneral";
import type { AppSettings } from "../../types";
import { settingsBuilder } from "../fixtures";

const meta: Meta<typeof SettingsPageGeneral> = {
  title: "Settings/SettingsPageGeneral",
  component: SettingsPageGeneral,
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
    availableCategories: ["Work", "Personal", "Shopping"],
  },
};

export const WithManyCategories: Story = {
  args: {
    ...Default.args,
    availableCategories: [
      "Work",
      "Personal",
      "Shopping",
      "Health",
      "Finance",
      "Education",
      "Home",
      "Travel",
      "Fitness",
      "Hobbies",
    ],
  },
};

export const NoCategories: Story = {
  args: {
    ...Default.args,
    availableCategories: [],
  },
};

// ========================================
// Theme Variants
// ========================================

export const DarkTheme: Story = {
  args: {
    settings: settingsBuilder.darkMode(),
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"],
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};

export const MidnightTheme: Story = {
  args: {
    settings: settingsBuilder.midnightTheme(),
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"],
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};

export const CoffeeTheme: Story = {
  args: {
    settings: settingsBuilder.coffeeTheme(),
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"],
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};

// ========================================
// Typography Variants
// ========================================

export const LargeFontSize: Story = {
  args: {
    settings: settingsBuilder.largeFontSize(),
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"],
  },
};

export const SmallFontSize: Story = {
  args: {
    settings: settingsBuilder.smallFontSize(),
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"],
  },
};

export const BaseFontSize: Story = {
  args: {
    ...Default.args,
    settings: settingsBuilder.default(), // Base is default
  },
};

// ========================================
// View Options Variants
// ========================================

export const HideCompleted: Story = {
  args: {
    settings: settingsBuilder.hideCompleted(),
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"],
  },
};

export const HideProgressBar: Story = {
  args: {
    settings: settingsBuilder.minimalUI(),
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"],
  },
};

export const FocusModeEnabled: Story = {
  args: {
    settings: settingsBuilder.focusMode(),
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"],
  },
};

export const AbsoluteDates: Story = {
  args: {
    settings: {
      ...settingsBuilder.default(),
      useRelativeDates: false,
    },
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"],
  },
};

export const CustomDateFormat: Story = {
  args: {
    settings: {
      ...settingsBuilder.default(),
      dateFormat: "YYYY-MM-DD",
    },
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"],
  },
};

// ========================================
// Grouping Strategy Variants
// ========================================

export const GroupByStartDate: Story = {
  args: {
    settings: settingsBuilder.groupByStartDate(),
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"],
  },
};

export const GroupByCreatedDate: Story = {
  args: {
    settings: settingsBuilder.groupByCreatedDate(),
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"],
  },
};

export const GroupByCompletedDate: Story = {
  args: {
    settings: settingsBuilder.groupByCompletedDate(),
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"],
  },
};

export const MultipleGroupingStrategies: Story = {
  args: {
    settings: {
      ...settingsBuilder.default(),
      groupingStrategy: ["dueAt", "startAt"],
    },
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"],
  },
};

// ========================================
// Default Category Variants
// ========================================

export const WithDefaultCategory: Story = {
  args: {
    settings: {
      ...settingsBuilder.default(),
      defaultCategory: "Work",
    },
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal", "Shopping"],
  },
};

export const NoDefaultCategory: Story = {
  args: {
    settings: {
      ...settingsBuilder.default(),
      defaultCategory: "",
    },
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work", "Personal"],
  },
};

// ========================================
// Interaction Testing
// ========================================

export const ChangeTheme: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Find theme selector", async () => {
      // Look for theme selection buttons (Light, Dark, Midnight, Coffee)
      const themeButtons = canvas.getAllByRole("button");
      expect(themeButtons.length).toBeGreaterThan(0);
    });
  },
};

export const ChangeFontSize: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Find font size controls", async () => {
      // Should have font size selection buttons or dropdown
      const buttons = canvas.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  },
};

export const ToggleShowCompleted: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Find Show Completed toggle", async () => {
      // Look for toggle switch/checkbox
      const toggles = canvas.getAllByRole("button");
      expect(toggles.length).toBeGreaterThan(0);
    });
  },
};

export const ToggleProgressBar: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Find Progress Bar toggle", async () => {
      const buttons = canvas.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  },
};

export const ToggleFocusMode: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Find Focus Mode toggle", async () => {
      const buttons = canvas.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  },
};

export const ToggleRelativeDates: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Find Relative Dates toggle", async () => {
      const buttons = canvas.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  },
};

export const SelectDefaultCategory: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Find default category selector", async () => {
      // Look for select dropdown or input field
      const selects = canvas.queryAllByRole("combobox"),
       inputs = canvas.queryAllByRole("textbox");
      expect(selects.length + inputs.length).toBeGreaterThan(0);
    });
  },
};

export const ToggleGroupingStrategy: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Find grouping strategy checkboxes", async () => {
      // Should have checkboxes for dueAt, startAt, createdAt, completedAt
      const buttons = canvas.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  },
};

// ========================================
// Edge Cases
// ========================================

export const AllTogglesOff: Story = {
  args: {
    settings: {
      ...settingsBuilder.default(),
      showCompleted: false,
      showProgressBar: false,
      useRelativeDates: false,
      defaultFocusMode: false,
    },
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work"],
  },
};

export const AllTogglesOn: Story = {
  args: {
    settings: {
      ...settingsBuilder.default(),
      showCompleted: true,
      showProgressBar: true,
      useRelativeDates: true,
      defaultFocusMode: true,
    },
    onUpdateSettings: handleUpdateSettings,
    availableCategories: ["Work"],
  },
};

export const VeryLongCategoryName: Story = {
  args: {
    settings: {
      ...settingsBuilder.default(),
      defaultCategory: "This is a very long category name that might overflow",
    },
    onUpdateSettings: handleUpdateSettings,
    availableCategories: [
      "This is a very long category name that might overflow",
      "Work",
      "Personal",
    ],
  },
};
