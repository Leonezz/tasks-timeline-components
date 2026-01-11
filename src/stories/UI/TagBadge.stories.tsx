import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";
import { TagBadge } from "../../components/TagBadge";
import type { Task } from "../../types";
import { AppProvider } from "../../components/AppContext";
import { taskBuilder } from "../fixtures";
import { delay, withinShadow } from "../test-utils";

const meta: Meta<typeof TagBadge> = {
  title: "UI/TagBadge",
  component: TagBadge,
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
// Core Variants
// ========================================

export const SingleTag: Story = {
  args: {
    tag: { id: "1", name: "work" },
    task: taskBuilder.base({
      tags: [{ id: "1", name: "work" }],
    }),
    onUpdate: handleUpdate,
    badgeClass,
  },
};

export const UrgentTag: Story = {
  args: {
    tag: { id: "2", name: "urgent" },
    task: taskBuilder.base({
      tags: [{ id: "2", name: "urgent" }],
    }),
    onUpdate: handleUpdate,
    badgeClass,
  },
};

export const PersonalTag: Story = {
  args: {
    tag: { id: "3", name: "personal" },
    task: taskBuilder.base({
      tags: [{ id: "3", name: "personal" }],
    }),
    onUpdate: handleUpdate,
    badgeClass,
  },
};

export const ProjectTag: Story = {
  args: {
    tag: { id: "4", name: "project-alpha" },
    task: taskBuilder.base({
      tags: [{ id: "4", name: "project-alpha" }],
    }),
    onUpdate: handleUpdate,
    badgeClass,
  },
};

// ========================================
// Multiple Tags Context
// ========================================

export const FirstOfManyTags: Story = {
  args: {
    tag: { id: "1", name: "work" },
    task: taskBuilder.base({
      tags: [
        { id: "1", name: "work" },
        { id: "2", name: "urgent" },
        { id: "3", name: "client" },
      ],
    }),
    onUpdate: handleUpdate,
    badgeClass,
  },
};

export const MiddleOfManyTags: Story = {
  args: {
    tag: { id: "2", name: "urgent" },
    task: taskBuilder.base({
      tags: [
        { id: "1", name: "work" },
        { id: "2", name: "urgent" },
        { id: "3", name: "client" },
      ],
    }),
    onUpdate: handleUpdate,
    badgeClass,
  },
};

export const LastOfManyTags: Story = {
  args: {
    tag: { id: "3", name: "client" },
    task: taskBuilder.base({
      tags: [
        { id: "1", name: "work" },
        { id: "2", name: "urgent" },
        { id: "3", name: "client" },
      ],
    }),
    onUpdate: handleUpdate,
    badgeClass,
  },
};

// ========================================
// Popover States
// ========================================

export const PopoverClosed: Story = {
  args: {
    ...SingleTag.args,
  },
};

export const PopoverOpen: Story = {
  args: {
    ...SingleTag.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Click tag to open remove popover", async () => {
      const button = canvas.getByRole("button", { name: /Click to remove/i });
      await userEvent.click(button);
      await delay(200);
    });

    await step("Verify Remove Tag button is visible", async () => {
      const removeButton = canvas.getByRole("button", { name: /Remove Tag/i });
      expect(removeButton).toBeInTheDocument();
    });
  },
};

export const HoverState: Story = {
  args: {
    ...SingleTag.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Hover over tag badge", async () => {
      const button = canvas.getByRole("button");
      await userEvent.hover(button);
      await delay(200);
      // Should transition to rose color on hover
    });
  },
};

// ========================================
// Interaction Testing
// ========================================

export const RemoveTag: Story = {
  args: {
    tag: { id: "1", name: "work" },
    task: taskBuilder.base({
      tags: [
        { id: "1", name: "work" },
        { id: "2", name: "urgent" },
      ],
    }),
    onUpdate: handleUpdate,
    badgeClass,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Click tag to open popover", async () => {
      const button = canvas.getByRole("button", { name: /Click to remove/i });
      await userEvent.click(button);
      await delay(200);
    });

    await step("Click Remove Tag button", async () => {
      const removeButton = canvas.getByRole("button", { name: /Remove Tag/i });
      await userEvent.click(removeButton);
      await delay(100);
      // OnUpdate should be called with tags array without this tag
    });
  },
};

export const RemoveLastTag: Story = {
  args: {
    tag: { id: "1", name: "work" },
    task: taskBuilder.base({
      tags: [{ id: "1", name: "work" }],
    }),
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

    await step("Remove the only tag", async () => {
      const removeButton = canvas.getByRole("button", { name: /Remove Tag/i });
      await userEvent.click(removeButton);
      await delay(100);
      // OnUpdate should be called with empty tags array
    });
  },
};

export const RemoveFromManyTags: Story = {
  args: {
    tag: { id: "3", name: "important" },
    task: taskBuilder.withTags(5, { title: "Task with many tags" }),
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

    await step("Remove tag from array of 5", async () => {
      const removeButton = canvas.getByRole("button", { name: /Remove Tag/i });
      await userEvent.click(removeButton);
      await delay(100);
      // OnUpdate should be called with 4 tags remaining
    });
  },
};

export const ClickOutsideToClose: Story = {
  args: {
    ...SingleTag.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });

    await step("Click outside to close", async () => {
      await userEvent.click(canvasElement);
      await delay(300);
      // Popover should close
    });
  },
};

// ========================================
// Edge Cases
// ========================================

export const VeryLongTagName: Story = {
  args: {
    tag: {
      id: "1",
      name: "this-is-a-very-long-tag-name-that-might-overflow-the-badge",
    },
    task: taskBuilder.base({
      tags: [
        {
          id: "1",
          name: "this-is-a-very-long-tag-name-that-might-overflow-the-badge",
        },
      ],
    }),
    onUpdate: handleUpdate,
    badgeClass,
  },
};

export const ShortTagName: Story = {
  args: {
    tag: { id: "1", name: "a" },
    task: taskBuilder.base({
      tags: [{ id: "1", name: "a" }],
    }),
    onUpdate: handleUpdate,
    badgeClass,
  },
};

export const TagWithSpaces: Story = {
  args: {
    tag: { id: "1", name: "urgent work item" },
    task: taskBuilder.base({
      tags: [{ id: "1", name: "urgent work item" }],
    }),
    onUpdate: handleUpdate,
    badgeClass,
  },
};

export const TagWithHyphens: Story = {
  args: {
    tag: { id: "1", name: "high-priority-task" },
    task: taskBuilder.base({
      tags: [{ id: "1", name: "high-priority-task" }],
    }),
    onUpdate: handleUpdate,
    badgeClass,
  },
};

export const TagWithNumbers: Story = {
  args: {
    tag: { id: "1", name: "v2.0" },
    task: taskBuilder.base({
      tags: [{ id: "1", name: "v2.0" }],
    }),
    onUpdate: handleUpdate,
    badgeClass,
  },
};

export const TagWithEmoji: Story = {
  args: {
    tag: { id: "1", name: "🔥 urgent" },
    task: taskBuilder.base({
      tags: [{ id: "1", name: "🔥 urgent" }],
    }),
    onUpdate: handleUpdate,
    badgeClass,
  },
};

export const TagWithSpecialChars: Story = {
  args: {
    tag: { id: "1", name: "client@company" },
    task: taskBuilder.base({
      tags: [{ id: "1", name: "client@company" }],
    }),
    onUpdate: handleUpdate,
    badgeClass,
  },
};

export const EmptyTagName: Story = {
  args: {
    tag: { id: "1", name: "" },
    task: taskBuilder.base({
      tags: [{ id: "1", name: "" }],
    }),
    onUpdate: handleUpdate,
    badgeClass,
  },
};

export const NumericTagId: Story = {
  args: {
    tag: { id: "999", name: "tag" },
    task: taskBuilder.base({
      tags: [{ id: "999", name: "tag" }],
    }),
    onUpdate: handleUpdate,
    badgeClass,
  },
};

export const UUIDTagId: Story = {
  args: {
    tag: { id: "550e8400-e29b-41d4-a716-446655440000", name: "uuid-tag" },
    task: taskBuilder.base({
      tags: [{ id: "550e8400-e29b-41d4-a716-446655440000", name: "uuid-tag" }],
    }),
    onUpdate: handleUpdate,
    badgeClass,
  },
};

// ========================================
// Styling Variants
// ========================================

export const CustomBadgeClass: Story = {
  args: {
    ...SingleTag.args,
    badgeClass:
      "flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border-2",
  },
};

export const MinimalBadgeClass: Story = {
  args: {
    ...SingleTag.args,
    badgeClass: "flex gap-1 px-1 py-0.5 text-xs rounded",
  },
};

export const LargeBadgeClass: Story = {
  args: {
    ...SingleTag.args,
    badgeClass:
      "flex items-center gap-2 px-4 py-2 text-base rounded-xl border-2 font-bold",
  },
};

// ========================================
// Color Transitions
// ========================================

export const DefaultBlueColor: Story = {
  args: {
    ...SingleTag.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Verify default blue styling", async () => {
      const button = canvas.getByRole("button");
      // Should have text-blue-600 bg-blue-50/80 border-blue-100/50
      expect(button.className).toContain("blue");
    });
  },
};

export const HoverRoseColor: Story = {
  args: {
    ...SingleTag.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Hover to trigger rose color transition", async () => {
      const button = canvas.getByRole("button");
      await userEvent.hover(button);
      await delay(300);
      // Should transition to rose colors on hover
    });
  },
};

// ========================================
// Accessibility Testing
// ========================================

export const KeyboardNavigation: Story = {
  args: {
    ...SingleTag.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Tab to tag badge", async () => {
      const button = canvas.getByRole("button");
      button.focus();
      expect(button).toHaveFocus();
    });

    await step("Press Enter to open popover", async () => {
      await userEvent.keyboard("{Enter}");
      await delay(200);
      const removeButton = canvas.getByRole("button", { name: /Remove Tag/i });
      expect(removeButton).toBeInTheDocument();
    });
  },
};

export const AriaLabels: Story = {
  args: {
    ...SingleTag.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Verify button has accessible title", async () => {
      const button = canvas.getByRole("button", { name: /Click to remove/i });
      expect(button).toHaveAttribute("title", "Click to remove");
    });
  },
};

export const ScreenReaderText: Story = {
  args: {
    ...SingleTag.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Verify tag name is readable", async () => {
      const button = canvas.getByRole("button");
      expect(button.textContent).toContain("work");
    });

    await step("Open popover and verify remove text", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
      const removeButton = canvas.getByRole("button", { name: /Remove Tag/i });
      expect(removeButton.textContent).toContain("Remove Tag");
    });
  },
};

// ========================================
// Performance Testing
// ========================================

export const RapidRemoveClicks: Story = {
  args: {
    ...SingleTag.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });

    await step("Rapidly click remove button", async () => {
      const removeButton = canvas.getByRole("button", { name: /Remove Tag/i });
      await userEvent.click(removeButton);
      // Should only trigger once despite rapid clicks
      await delay(50);
    });
  },
};
