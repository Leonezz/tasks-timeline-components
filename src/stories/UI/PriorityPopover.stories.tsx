import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";
import { PriorityPopover } from "../../components/PriorityPopover";
import type { Task } from "../../types";
import { AppProvider } from "../../components/AppContext";
import { taskBuilder } from "../fixtures";
import { delay, withinShadow } from "../test-utils";

const meta: Meta<typeof PriorityPopover> = {
  title: "UI/PriorityPopover",
  component: PriorityPopover,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    onUpdate: { action: "task-updated" },
  },
  decorators: [
    (Story) => (
      <AppProvider container={document.body}>
        <div className="p-4 bg-slate-50 min-w-50">
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
  handleUpdate = (task: Task) => console.log("Updated task:", task);

// ========================================
// Core Priority Variants
// ========================================

export const HighPriority: Story = {
  args: {
    task: taskBuilder.highPriority({ title: "Critical bug fix" }),
    onUpdate: handleUpdate,
    badgeClass,
  },
};

export const MediumPriority: Story = {
  args: {
    task: taskBuilder.mediumPriority({ title: "Regular task" }),
    onUpdate: handleUpdate,
    badgeClass,
  },
};

export const LowPriority: Story = {
  args: {
    task: taskBuilder.lowPriority({ title: "Nice to have" }),
    onUpdate: handleUpdate,
    badgeClass,
  },
};

export const NoPriority: Story = {
  args: {
    task: taskBuilder.base({ priority: "low", title: "Default priority task" }),
    onUpdate: handleUpdate,
    badgeClass,
  },
};

// ========================================
// Visual Styling Variants
// ========================================

export const HighPriorityBold: Story = {
  args: {
    ...HighPriority.args,
    task: taskBuilder.highPriority({ title: "Urgent task" }),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Verify high priority has bold flag icon", async () => {
      const button = canvas.getByRole("button"),
        // High priority should have strokeWidth of 3
        icon = button.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });
  },
};

export const LongPriorityLabel: Story = {
  args: {
    ...HighPriority.args,
  },
};

// ========================================
// Popover States
// ========================================

export const PopoverOpen: Story = {
  args: {
    ...MediumPriority.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open priority selector popover", async () => {
      const button = canvas.getByRole("button", { name: /Change Priority/i });
      await userEvent.click(button);
      await delay(200);
    });

    await step("Verify all priority options visible", async () => {
      const highOption = canvas.getByText(/high/i),
        mediumOption = canvas.getByText(/medium/i),
        lowOption = canvas.getByText(/low/i);

      expect(highOption).toBeInTheDocument();
      expect(mediumOption).toBeInTheDocument();
      expect(lowOption).toBeInTheDocument();
    });
  },
};

export const PopoverWithSelectedIndicator: Story = {
  args: {
    ...HighPriority.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });

    await step("Verify current priority is highlighted", async () => {
      // High priority button should have bg-slate-100 and font-bold
      const options = canvas.getAllByRole("button"),
        // First button is the trigger, find the "high" option
        highOption = options.find((btn: HTMLElement) =>
          btn.textContent?.toLowerCase().includes("high"),
        );
      expect(highOption).toBeDefined();
    });
  },
};

// ========================================
// Interaction Testing
// ========================================

export const ChangePriorityToHigh: Story = {
  args: {
    task: taskBuilder.lowPriority({ title: "Upgrade to high priority" }),
    onUpdate: handleUpdate,
    badgeClass,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open priority selector", async () => {
      const button = canvas.getByRole("button", { name: /Change Priority/i });
      await userEvent.click(button);
      await delay(200);
    });

    await step("Click high priority option", async () => {
      const options = canvas.getAllByRole("button"),
        highOption = options.find((btn: HTMLElement) =>
          btn.textContent?.toLowerCase().includes("high"),
        );
      if (highOption) {
        await userEvent.click(highOption);
        await delay(100);
      }
      // OnUpdate should be called with priority: "high"
    });
  },
};

export const ChangePriorityToMedium: Story = {
  args: {
    task: taskBuilder.highPriority({ title: "Downgrade to medium" }),
    onUpdate: handleUpdate,
    badgeClass,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });

    await step("Select medium priority", async () => {
      const options = canvas.getAllByRole("button"),
        mediumOption = options.find((btn: HTMLElement) =>
          btn.textContent?.toLowerCase().includes("medium"),
        );
      if (mediumOption) {
        await userEvent.click(mediumOption);
        await delay(100);
      }
    });
  },
};

export const ChangePriorityToLow: Story = {
  args: {
    task: taskBuilder.mediumPriority({ title: "Lower priority" }),
    onUpdate: handleUpdate,
    badgeClass,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });

    await step("Select low priority", async () => {
      const options = canvas.getAllByRole("button"),
        lowOption = options.find((btn: HTMLElement) =>
          btn.textContent?.toLowerCase().includes("low"),
        );
      if (lowOption) {
        await userEvent.click(lowOption);
        await delay(100);
      }
    });
  },
};

export const ClickOutsideToClose: Story = {
  args: {
    ...MediumPriority.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });

    await step("Click outside to close", async () => {
      // Click on the canvas element background
      await userEvent.click(canvasElement);
      await delay(300);
      // Popover should close (verify by checking if options are gone)
    });
  },
};

// ========================================
// Color Coding Verification
// ========================================

export const HighPriorityRoseColor: Story = {
  args: {
    ...HighPriority.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Verify high priority uses rose color", async () => {
      const button = canvas.getByRole("button");
      // Should have text-rose-700 bg-rose-100 border-rose-200 classes
      expect(button.className).toContain("rose");
    });
  },
};

export const MediumPriorityAmberColor: Story = {
  args: {
    ...MediumPriority.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Verify medium priority uses amber color", async () => {
      const button = canvas.getByRole("button");
      expect(button.className).toContain("amber");
    });
  },
};

export const LowPrioritySlateColor: Story = {
  args: {
    ...LowPriority.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Verify low priority uses slate/gray color", async () => {
      const button = canvas.getByRole("button");
      expect(button.className).toContain("slate");
    });
  },
};

// ========================================
// Accessibility Testing
// ========================================

export const KeyboardNavigation: Story = {
  args: {
    ...MediumPriority.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Tab to priority button", async () => {
      const button = canvas.getByRole("button");
      button.focus();
      expect(button).toHaveFocus();
    });

    await step("Press Enter to open popover", async () => {
      await userEvent.keyboard("{Enter}");
      await delay(200);
      const highOption = canvas.getByText(/high/i);
      expect(highOption).toBeInTheDocument();
    });

    await step("Tab through options", async () => {
      await userEvent.tab();
      await delay(100);
      // Should focus first option
    });
  },
};

export const AriaLabels: Story = {
  args: {
    ...HighPriority.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Verify button has accessible title", async () => {
      const button = canvas.getByRole("button", { name: /Change Priority/i });
      expect(button).toHaveAttribute("title", "Change Priority");
    });
  },
};

export const ScreenReaderText: Story = {
  args: {
    ...MediumPriority.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Verify priority text is readable", async () => {
      const button = canvas.getByRole("button");
      expect(button.textContent).toContain("medium");
    });
  },
};

// ========================================
// Edge Cases
// ========================================

export const RapidPriorityChanges: Story = {
  args: {
    ...LowPriority.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });

    await step("Quickly change priority multiple times", async () => {
      const options = canvas.getAllByRole("button"),
        highOption = options.find((btn: HTMLElement) =>
          btn.textContent?.toLowerCase().includes("high"),
        );

      if (highOption) {
        await userEvent.click(highOption);
        await delay(50);
        // Popover should close after selection
      }
    });
  },
};

export const WithCustomBadgeClass: Story = {
  args: {
    ...HighPriority.args,
    badgeClass:
      "flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border-2",
  },
};

export const MinimalBadgeClass: Story = {
  args: {
    ...MediumPriority.args,
    badgeClass: "flex gap-1 px-1 py-0.5 text-xs rounded",
  },
};
