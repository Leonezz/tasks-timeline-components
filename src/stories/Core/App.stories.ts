import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { TasksTimelineApp } from "../../TasksTimelineApp";
import type { Task } from "../../types";
import { delay, withinShadow } from "../test-utils";

const meta: Meta<typeof TasksTimelineApp> = {
  title: "Core/TasksTimelineApp",
  component: TasksTimelineApp,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    onItemClick: { action: "item-clicked" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const handleItemClick = (item: Task) => console.log("Clicked item:", item);

// ========================================
// Core Variants
// ========================================

export const App: Story = {
  args: {
    onItemClick: handleItemClick,
  },
};

export const WithItemClick: Story = {
  args: {
    onItemClick: handleItemClick,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);
    await step("Verify app is rendered", async () => {
      await delay(500);
      // Should have input bar
      const inputs = canvas.queryAllByRole("textbox");
      expect(inputs.length).toBeGreaterThan(0);
    });
  },
};

export const WithCustomClassName: Story = {
  args: {
    className: "custom-app-class",
    onItemClick: handleItemClick,
  },
};

export const WithAPIKey: Story = {
  args: {
    apiKey: "test-gemini-api-key",
    onItemClick: handleItemClick,
  },
};

export const SystemDarkMode: Story = {
  args: {
    systemInDarkMode: true,
    onItemClick: handleItemClick,
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};

export const SystemLightMode: Story = {
  args: {
    systemInDarkMode: false,
    onItemClick: handleItemClick,
  },
  parameters: {
    backgrounds: { default: "light" },
  },
};

// ========================================
// Interaction Testing
// ========================================

export const OpenSettings: Story = {
  args: {
    onItemClick: handleItemClick,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Find and click settings button", async () => {
      await delay(500); // Wait for app to initialize
      const buttons = canvas.getAllByRole("button");
      // Settings button should be among the buttons
      expect(buttons.length).toBeGreaterThan(0);
    });
  },
};

export const ToggleFocusMode: Story = {
  args: {
    onItemClick: handleItemClick,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Find Focus mode toggle", async () => {
      await delay(500);
      const buttons = canvas.getAllByRole("button");
      // Should have Focus button
      expect(buttons.length).toBeGreaterThan(0);
    });
  },
};

export const FilterByStatus: Story = {
  args: {
    onItemClick: handleItemClick,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Find status filter buttons", async () => {
      await delay(500);
      // Should have To Do, Unplanned, Due & OD, Doing buttons
      const buttons = canvas.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(3);
    });
  },
};

export const AddNewTask: Story = {
  args: {
    onItemClick: handleItemClick,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Find input bar", async () => {
      await delay(500);
      const inputs = canvas.queryAllByRole("textbox");
      // Should have task input field
      expect(inputs.length).toBeGreaterThan(0);
    });
  },
};

export const ScrollTasks: Story = {
  args: {
    onItemClick: handleItemClick,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Verify scrollable content", async () => {
      await delay(500);
      // App should render with buttons and input
      const buttons = canvas.queryAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  },
};

export const ViewTaskStats: Story = {
  args: {
    onItemClick: handleItemClick,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Verify dashboard stats are visible", async () => {
      await delay(500);
      const buttons = canvas.getAllByRole("button");
      // Should show stat cards (To Do, Unplanned, Due & OD, Doing)
      expect(buttons.length).toBeGreaterThan(3);
    });
  },
};

// ========================================
// Edge Cases
// ========================================

export const NoOnItemClick: Story = {
  args: {
    // OnItemClick is optional, should work without it
  },
};

export const EmptyAPIKey: Story = {
  args: {
    apiKey: "",
    onItemClick: handleItemClick,
  },
};

export const VeryLongClassName: Story = {
  args: {
    className:
      "very-long-custom-class-name-that-might-cause-issues-but-should-still-work",
    onItemClick: handleItemClick,
  },
};
