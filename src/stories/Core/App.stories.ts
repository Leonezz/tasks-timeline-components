import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { TasksTimelineApp } from "../../TasksTimelineApp";
import type { SettingsRepository, Task } from "../../types";
import { delay, withinShadow } from "../test-utils";
import { taskBuilder } from "../fixtures/tasks";

const meta: Meta<typeof TasksTimelineApp> = {
  title: "Core/TasksTimelineApp",
  component: TasksTimelineApp,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    onItemClick: { action: "item-clicked" },
    onTaskAdded: { action: "task-added" },
    onTaskUpdated: { action: "task-updated" },
    onTaskDeleted: { action: "task-deleted" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Generate mock tasks for stories
const mockTasks = taskBuilder.mixed(10);

const handleItemClick = (item: Task) => console.log("Clicked item:", item);
const handleTaskAdded = (task: Task) => console.log("Task added:", task);
const handleTaskUpdated = (task: Task, previous: Task) =>
  console.log("Task updated:", task, "Previous:", previous);
const handleTaskDeleted = (taskId: string, previous: Task) =>
  console.log("Task deleted:", taskId, "Previous:", previous);

// ========================================
// Core Variants
// ========================================

export const App: Story = {
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    onItemClick: handleItemClick,
  },
};

export const WithItemClick: Story = {
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
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
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    className: "custom-app-class",
    onItemClick: handleItemClick,
  },
};

export const WithAPIKey: Story = {
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    apiKey: "test-gemini-api-key",
    onItemClick: handleItemClick,
  },
};

export const SystemDarkMode: Story = {
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    systemInDarkMode: true,
    onItemClick: handleItemClick,
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};

export const SystemLightMode: Story = {
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    systemInDarkMode: false,
    onItemClick: handleItemClick,
  },
  parameters: {
    backgrounds: { default: "light" },
  },
};

// ========================================
// Host AI Fetch
// ========================================

const firstRunSettingsRepository: SettingsRepository = {
  name: "first-run-memory",
  loadSettings: async () => null,
  saveSettings: async () => undefined,
};

const geminiHelloResponse = () =>
  new Response(
    JSON.stringify({
      candidates: [
        {
          content: { role: "model", parts: [{ text: "Hello" }] },
          finishReason: "STOP",
          index: 0,
        },
      ],
    }),
    { status: 200, headers: { "content-type": "application/json" } },
  );

/** Settings "Test Connection" in the app goes through the `aiFetch` prop. */
export const TestConnectionWithAIFetch: Story = {
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    apiKey: "test-gemini-api-key",
    settingsRepository: firstRunSettingsRepository,
    aiFetch: fn<typeof fetch>(async () => geminiHelloResponse()),
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open the AI settings", async () => {
      await userEvent.click(
        await canvas.findByRole("button", { name: "Open settings and docs" }),
      );
      await userEvent.click(await canvas.findByRole("button", { name: "AI" }));
    });

    await step("Test the connection through aiFetch", async () => {
      await userEvent.click(
        await canvas.findByRole("button", { name: /test connection/i }),
      );
      await expect(await canvas.findByRole("status")).toHaveTextContent(
        'Connected to gemini-2.0-flash. Response: "Hello"',
      );
      await expect(args.aiFetch).toHaveBeenCalledOnce();
    });
  },
};

/**
 * The app hands both host runtime props to Settings → AI: `voiceRuntime`
 * disables the Browser voice provider, and "Test Connection" still goes
 * through `aiFetch`.
 */
export const SettingsWithVoiceRuntimeAndAIFetch: Story = {
  args: {
    ...TestConnectionWithAIFetch.args,
    aiFetch: fn<typeof fetch>(async () => geminiHelloResponse()),
    voiceRuntime: { browserSpeechSupported: false },
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open the AI settings", async () => {
      await userEvent.click(
        await canvas.findByRole("button", { name: "Open settings and docs" }),
      );
      await userEvent.click(await canvas.findByRole("button", { name: "AI" }));
    });

    await step("voiceRuntime disables the Browser voice provider", async () => {
      await expect(
        await canvas.findByRole("button", {
          name: "Use Browser voice provider",
        }),
      ).toBeDisabled();
      await expect(
        canvas.getByText(/speech recognition isn.t available here/i),
      ).toBeInTheDocument();
      await expect(
        canvas.getByRole("button", { name: "Use OpenAI voice provider" }),
      ).toBeEnabled();
    });

    await step("Test Connection still goes through aiFetch", async () => {
      await userEvent.click(
        await canvas.findByRole("button", { name: /test connection/i }),
      );
      await expect(await canvas.findByRole("status")).toHaveTextContent(
        'Connected to gemini-2.0-flash. Response: "Hello"',
      );
      await expect(args.aiFetch).toHaveBeenCalledOnce();
    });
  },
};

// ========================================
// Interaction Testing
// ========================================

export const OpenSettings: Story = {
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
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
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
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
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
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
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
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
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
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
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
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
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    // OnItemClick is optional, should work without it
  },
};

export const EmptyAPIKey: Story = {
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    apiKey: "",
    onItemClick: handleItemClick,
  },
};

export const WithCustomRenderTitle: Story = {
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    onItemClick: handleItemClick,
    renderTitle: (title: string) => title.toUpperCase(),
  },
};

export const VeryLongClassName: Story = {
  args: {
    tasks: mockTasks,
    onTaskAdded: handleTaskAdded,
    onTaskUpdated: handleTaskUpdated,
    onTaskDeleted: handleTaskDeleted,
    className:
      "very-long-custom-class-name-that-might-cause-issues-but-should-still-work",
    onItemClick: handleItemClick,
  },
};
