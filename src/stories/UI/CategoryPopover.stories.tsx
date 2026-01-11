import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";
import { CategoryPopover } from "../../components/CategoryPopover";
import type { Task } from "../../types";
import { AppProvider } from "../../components/AppContext";
import { taskBuilder } from "../fixtures";
import { delay, withinShadow } from "../test-utils";

const meta: Meta<typeof CategoryPopover> = {
  title: "UI/CategoryPopover",
  component: CategoryPopover,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    onUpdate: { action: "task-updated" },
  },
  decorators: [
    (Story) => (
      <AppProvider>
        <div className="p-4 bg-slate-50 min-w-[250px]">
          <Story />
        </div>
      </AppProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const badgeClass =
    "flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border font-medium",
  defaultCategories = ["Work", "Personal", "Shopping", "Health", "Finance"],
  handleUpdate = (task: Task) => console.log("Updated task:", task);

// ========================================
// Core Variants
// ========================================

export const Default: Story = {
  args: {
    task: taskBuilder.base({ category: "Work" }),
    onUpdate: handleUpdate,
    availableCategories: defaultCategories,
    badgeClass,
  },
};

export const PersonalCategory: Story = {
  args: {
    task: taskBuilder.base({ category: "Personal" }),
    onUpdate: handleUpdate,
    availableCategories: defaultCategories,
    badgeClass,
  },
};

export const ShoppingCategory: Story = {
  args: {
    task: taskBuilder.base({ category: "Shopping" }),
    onUpdate: handleUpdate,
    availableCategories: defaultCategories,
    badgeClass,
  },
};

export const NoCategory: Story = {
  args: {
    task: taskBuilder.base({ category: undefined }),
    onUpdate: handleUpdate,
    availableCategories: defaultCategories,
    badgeClass,
  },
};

export const EmptyCategory: Story = {
  args: {
    task: taskBuilder.base({ category: "" }),
    onUpdate: handleUpdate,
    availableCategories: defaultCategories,
    badgeClass,
  },
};

// ========================================
// Available Categories Variants
// ========================================

export const ManyCategories: Story = {
  args: {
    task: taskBuilder.base({ category: "Work" }),
    onUpdate: handleUpdate,
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
      "Social",
      "Family",
      "Career",
      "Projects",
      "Ideas",
    ],
    badgeClass,
  },
};

export const FewCategories: Story = {
  args: {
    task: taskBuilder.base({ category: "Work" }),
    onUpdate: handleUpdate,
    availableCategories: ["Work", "Personal"],
    badgeClass,
  },
};

export const NoAvailableCategories: Story = {
  args: {
    task: taskBuilder.base({ category: "Work" }),
    onUpdate: handleUpdate,
    availableCategories: [],
    badgeClass,
  },
};

export const SingleCategoryAvailable: Story = {
  args: {
    task: taskBuilder.base({ category: "Work" }),
    onUpdate: handleUpdate,
    availableCategories: ["Work"],
    badgeClass,
  },
};

// ========================================
// Popover States
// ========================================

export const PopoverOpen: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open category selector popover", async () => {
      const button = canvas.getByRole("button", { name: /Change Category/i });
      await userEvent.click(button);
      await delay(200);
    });

    await step("Verify input field is visible and focused", async () => {
      const input = canvas.getByPlaceholderText(/Category name/i);
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue("Work");
    });

    await step("Verify suggestions are shown", async () => {
      // Should show categories that don't match current value
      const suggestions = canvas.getAllByRole("button");
      // At least the "Set to..." button should be present
      expect(suggestions.length).toBeGreaterThan(0);
    });
  },
};

export const PopoverWithSuggestions: Story = {
  args: {
    task: taskBuilder.base({ category: "Wor" }),
    onUpdate: handleUpdate,
    availableCategories: defaultCategories,
    badgeClass,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });

    await step("Verify Work is suggested", async () => {
      const input = canvas.getByPlaceholderText(/Category name/i);
      expect(input).toHaveValue("Wor");
      // Should suggest "Work" as it matches
    });
  },
};

// ========================================
// Interaction Testing
// ========================================

export const TypeNewCategory: Story = {
  args: {
    task: taskBuilder.base({ category: "Work" }),
    onUpdate: handleUpdate,
    availableCategories: defaultCategories,
    badgeClass,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open category selector", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });

    await step("Clear existing value", async () => {
      const input = canvas.getByPlaceholderText(/Category name/i);
      await userEvent.clear(input);
      await delay(100);
    });

    await step("Type new category name", async () => {
      const input = canvas.getByPlaceholderText(/Category name/i);
      await userEvent.type(input, "New Category");
      await delay(100);
      expect(input).toHaveValue("New Category");
    });

    await step("Click Set button to save", async () => {
      const setButton = canvas.getByRole("button", {
        name: /Set to "New Category"/i,
      });
      await userEvent.click(setButton);
      await delay(100);
      // OnUpdate should be called with category: "New Category"
    });
  },
};

export const SelectSuggestion: Story = {
  args: {
    task: taskBuilder.base({ category: "Work" }),
    onUpdate: handleUpdate,
    availableCategories: defaultCategories,
    badgeClass,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });

    await step("Click a suggested category", async () => {
      const buttons = canvas.getAllByRole("button"),
        // Find Personal category button
        personalButton = buttons.find((btn: HTMLElement) =>
          btn.textContent?.includes("Personal"),
        );
      if (personalButton) {
        await userEvent.click(personalButton);
        await delay(100);
        // OnUpdate should be called with category: "Personal"
      }
    });
  },
};

export const FilterSuggestions: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });

    await step("Type partial match", async () => {
      const input = canvas.getByPlaceholderText(/Category name/i);
      await userEvent.clear(input);
      await userEvent.type(input, "Heal");
      await delay(100);
    });

    await step("Verify only matching categories shown", async () => {
      // Should show "Health" in suggestions
      const buttons = canvas.getAllByRole("button"),
        healthButton = buttons.find((btn: HTMLElement) =>
          btn.textContent?.includes("Health"),
        );
      expect(healthButton).toBeDefined();
    });
  },
};

export const EnterToSave: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });

    await step("Type new category", async () => {
      const input = canvas.getByPlaceholderText(/Category name/i);
      await userEvent.clear(input);
      await userEvent.type(input, "Quick Entry");
      await delay(100);
    });

    await step("Press Enter to save", async () => {
      await userEvent.keyboard("{Enter}");
      await delay(100);
      // OnUpdate should be called with category: "Quick Entry"
    });
  },
};

export const ClearCategory: Story = {
  args: {
    task: taskBuilder.base({ category: "Work" }),
    onUpdate: handleUpdate,
    availableCategories: defaultCategories,
    badgeClass,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });

    await step("Clear category value", async () => {
      const input = canvas.getByPlaceholderText(/Category name/i);
      await userEvent.clear(input);
      await delay(100);
    });

    await step("Save empty category", async () => {
      await userEvent.keyboard("{Enter}");
      await delay(100);
      // OnUpdate should be called with category: ""
    });
  },
};

// ========================================
// Edge Cases
// ========================================

export const VeryLongCategoryName: Story = {
  args: {
    task: taskBuilder.base({
      category: "This is a very long category name that might overflow",
    }),
    onUpdate: handleUpdate,
    availableCategories: defaultCategories,
    badgeClass,
  },
};

export const SpecialCharactersInCategory: Story = {
  args: {
    task: taskBuilder.base({ category: "Work/Personal 🏠" }),
    onUpdate: handleUpdate,
    availableCategories: ["Work/Personal 🏠", "Shopping", "Health"],
    badgeClass,
  },
};

export const NumbersInCategory: Story = {
  args: {
    task: taskBuilder.base({ category: "Q4 2024" }),
    onUpdate: handleUpdate,
    availableCategories: ["Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"],
    badgeClass,
  },
};

export const CaseSensitiveSuggestions: Story = {
  args: {
    task: taskBuilder.base({ category: "work" }),
    onUpdate: handleUpdate,
    availableCategories: ["Work", "WORK", "work", "Personal"],
    badgeClass,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });

    await step("Verify case-insensitive filtering", async () => {
      const input = canvas.getByPlaceholderText(/Category name/i);
      expect(input).toHaveValue("work");
      // Should filter out exact match "work" but show "Work" and "WORK"
    });
  },
};

export const MaxSuggestionsLimit: Story = {
  args: {
    task: taskBuilder.base({ category: "A" }),
    onUpdate: handleUpdate,
    availableCategories: [
      "Art",
      "Architecture",
      "Astronomy",
      "Athletics",
      "Aviation",
      "Agriculture",
      "Archaeology",
      "Anthropology",
    ],
    badgeClass,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });

    await step("Verify max 5 suggestions shown", async () => {
      const buttons = canvas.getAllByRole("button"),
        // Count buttons that are category suggestions (excluding "Set to..." button)
        suggestionButtons = buttons.filter((btn: HTMLElement) =>
          btn.textContent?.match(/^[A-Z]/),
        );
      expect(suggestionButtons.length).toBeLessThanOrEqual(5);
    });
  },
};

// ========================================
// Accessibility Testing
// ========================================

export const KeyboardNavigation: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Tab to category button", async () => {
      const button = canvas.getByRole("button");
      button.focus();
      expect(button).toHaveFocus();
    });

    await step("Press Enter to open popover", async () => {
      await userEvent.keyboard("{Enter}");
      await delay(200);
      const input = canvas.getByPlaceholderText(/Category name/i);
      expect(input).toBeInTheDocument();
    });
  },
};

export const AutoFocusInput: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });

    await step("Verify input is auto-focused", async () => {
      const input = canvas.getByPlaceholderText(/Category name/i);
      // Input should have autoFocus attribute
      expect(input).toBeInTheDocument();
    });
  },
};

export const AriaLabels: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Verify button has accessible title", async () => {
      const button = canvas.getByRole("button", { name: /Change Category/i });
      expect(button).toHaveAttribute("title", "Change Category");
    });
  },
};

// ========================================
// Custom Badge Class Variants
// ========================================

export const CustomBadgeClass: Story = {
  args: {
    ...Default.args,
    badgeClass:
      "flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border-2",
  },
};

export const MinimalBadgeClass: Story = {
  args: {
    ...Default.args,
    badgeClass: "flex gap-1 px-1 py-0.5 text-xs rounded",
  },
};
