import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toast } from "../../components/Toast";
import type { ToastMessage } from "../../types";

const meta: Meta<typeof Toast> = {
  title: "UI/Toast",
  component: Toast,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    onDismiss: { action: "dismissed" },
    onToggleExpand: { action: "toggle-expand" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const handleDismiss = (id: string) => console.log("Dismiss toast:", id);

export const Success: Story = {
  args: {
    toast: {
      id: "1",
      variant: "success",
      title: "Success!",
      description: "Your task has been created successfully.",
      interaction: { kind: "dismiss" },
      timeout: 4000,
    } as ToastMessage,
    onDismiss: handleDismiss,
  },
};

export const Error: Story = {
  args: {
    toast: {
      id: "2",
      variant: "error",
      title: "Error",
      description: "Failed to save task. Please try again.",
      interaction: { kind: "dismiss" },
      timeout: 4000,
    } as ToastMessage,
    onDismiss: handleDismiss,
  },
};

export const Info: Story = {
  args: {
    toast: {
      id: "3",
      variant: "info",
      title: "Information",
      description: "Your tasks are being synced to the cloud.",
      interaction: { kind: "dismiss" },
      timeout: 4000,
    } as ToastMessage,
    onDismiss: handleDismiss,
  },
};

export const Warning: Story = {
  args: {
    toast: {
      id: "warn-1",
      variant: "warning",
      title: "Attention Required",
      description: "3 tasks are overdue.",
      interaction: { kind: "dismiss" },
      timeout: 4000,
    } as ToastMessage,
    onDismiss: handleDismiss,
  },
};

export const WithoutDescription: Story = {
  args: {
    toast: {
      id: "4",
      variant: "success",
      title: "Task Created",
      interaction: { kind: "dismiss" },
      timeout: 4000,
    } as ToastMessage,
    onDismiss: handleDismiss,
  },
};

export const LongDescription: Story = {
  args: {
    toast: {
      id: "5",
      variant: "info",
      title: "Sync Complete",
      description:
        "All your tasks have been successfully synchronized with your other devices and cloud storage.",
      interaction: { kind: "dismiss" },
      timeout: 4000,
    } as ToastMessage,
    onDismiss: handleDismiss,
  },
};

export const WithBody: Story = {
  args: {
    toast: {
      id: "body-1",
      variant: "info",
      title: "Today's Plan",
      description: "5 tasks for today",
      body: "You have 3 high-priority tasks that need attention. Consider focusing on the project deadline first, then handling the bug reports.",
      interaction: { kind: "dismiss" },
      timeout: null,
    } as ToastMessage,
    onDismiss: handleDismiss,
  },
};

export const WithConfirm: Story = {
  args: {
    toast: {
      id: "confirm-1",
      variant: "info",
      title: 'Delete "Fix login bug"?',
      description: "This action cannot be undone.",
      interaction: {
        kind: "confirm",
        onConfirm: () => console.log("Confirmed!"),
        onCancel: () => console.log("Cancelled!"),
      },
      timeout: null,
    } as ToastMessage,
    onDismiss: handleDismiss,
  },
};

export const WithConfirmCustomLabels: Story = {
  args: {
    toast: {
      id: "confirm-2",
      variant: "warning",
      title: "Update 5 tasks?",
      description: "This will apply changes to all matching tasks.",
      interaction: {
        kind: "confirm",
        onConfirm: () => console.log("Confirmed!"),
        onCancel: () => console.log("Cancelled!"),
        confirmLabel: "Update All",
        cancelLabel: "Cancel",
      },
      timeout: null,
    } as ToastMessage,
    onDismiss: handleDismiss,
  },
};

export const WithSelect: Story = {
  args: {
    toast: {
      id: "select-1",
      variant: "info",
      title: "Choose a category",
      interaction: {
        kind: "select",
        options: [
          { label: "Work", value: "work" },
          { label: "Personal", value: "personal" },
          { label: "Health", value: "health" },
        ],
        onSelect: (value: string) => console.log("Selected:", value),
        onCancel: () => console.log("Cancelled!"),
      },
      timeout: null,
    } as ToastMessage,
    onDismiss: handleDismiss,
  },
};

export const WithTextDetail: Story = {
  args: {
    toast: {
      id: "detail-text-1",
      variant: "success",
      title: "Batch Update Complete",
      description: "3 tasks updated",
      detail: [
        {
          type: "text",
          content:
            "Changed priority to high for 3 tasks matching your filter criteria. All tasks were updated successfully.",
        },
      ],
      interaction: { kind: "dismiss" },
      timeout: 8000,
    } as ToastMessage,
    onDismiss: handleDismiss,
    isExpanded: true,
    onToggleExpand: (id: string) => console.log("Toggle expand:", id),
  },
};

export const WithTaskListDetail: Story = {
  args: {
    toast: {
      id: "detail-tasks-1",
      variant: "info",
      title: "Found 3 tasks",
      detail: [
        {
          type: "task-list",
          label: "Search Results",
          tasks: [
            {
              id: "1",
              title: "Fix login bug",
              status: "overdue",
              priority: "high",
              tags: [],
            },
            {
              id: "2",
              title: "Update API docs",
              status: "todo",
              priority: "medium",
              tags: [],
            },
            {
              id: "3",
              title: "Deploy v2.0",
              status: "scheduled",
              priority: "high",
              tags: [],
            },
          ],
        },
      ],
      interaction: { kind: "dismiss" },
      timeout: 8000,
    } as ToastMessage,
    onDismiss: handleDismiss,
    isExpanded: true,
    onToggleExpand: (id: string) => console.log("Toggle expand:", id),
  },
};

export const WithStatsDetail: Story = {
  args: {
    toast: {
      id: "detail-stats-1",
      variant: "info",
      title: "Task Statistics",
      description: "25 total tasks",
      detail: [
        {
          type: "stats",
          data: {
            total: 25,
            byStatus: {
              done: 10,
              todo: 5,
              doing: 3,
              overdue: 4,
              scheduled: 2,
              unplanned: 1,
            },
            byPriority: { high: 8, medium: 12, low: 5 },
          },
        },
      ],
      interaction: { kind: "dismiss" },
      timeout: 8000,
    } as ToastMessage,
    onDismiss: handleDismiss,
    isExpanded: true,
    onToggleExpand: (id: string) => console.log("Toggle expand:", id),
  },
};

export const WithKeyValueDetail: Story = {
  args: {
    toast: {
      id: "detail-kv-1",
      variant: "success",
      title: "Task Created",
      description: "New task added successfully",
      detail: [
        {
          type: "key-value",
          entries: [
            { key: "Title", value: "Fix login bug" },
            { key: "Priority", value: "High" },
            { key: "Due", value: "Tomorrow" },
            { key: "Category", value: "Work" },
          ],
        },
      ],
      interaction: { kind: "dismiss" },
      timeout: 6000,
    } as ToastMessage,
    onDismiss: handleDismiss,
    isExpanded: true,
    onToggleExpand: (id: string) => console.log("Toggle expand:", id),
  },
};

export const CollapsedWithDetail: Story = {
  args: {
    toast: {
      id: "collapsed-1",
      variant: "info",
      title: "Found 5 tasks",
      description: "Click to expand details",
      detail: [
        {
          type: "task-list",
          label: "Results",
          tasks: [
            {
              id: "1",
              title: "Task One",
              status: "todo",
              priority: "high",
              tags: [],
            },
            {
              id: "2",
              title: "Task Two",
              status: "doing",
              priority: "medium",
              tags: [],
            },
          ],
        },
      ],
      interaction: { kind: "dismiss" },
      timeout: null,
    } as ToastMessage,
    onDismiss: handleDismiss,
    isExpanded: false,
    onToggleExpand: (id: string) => console.log("Toggle expand:", id),
  },
};

export const WithPrompt: Story = {
  args: {
    toast: {
      id: "prompt-1",
      variant: "info",
      title: "What should we name this category?",
      interaction: {
        kind: "prompt",
        onSubmit: (text: string) => console.log("Submitted:", text),
        onCancel: () => console.log("Cancelled"),
        placeholder: "Enter category name...",
      },
      timeout: null,
    } as ToastMessage,
    onDismiss: handleDismiss,
  },
};

export const WithPromptNoPlaceholder: Story = {
  args: {
    toast: {
      id: "prompt-2",
      variant: "info",
      title: "What priority should this task have?",
      interaction: {
        kind: "prompt",
        onSubmit: (text: string) => console.log("Submitted:", text),
        onCancel: () => console.log("Cancelled"),
      },
      timeout: null,
    } as ToastMessage,
    onDismiss: handleDismiss,
  },
};
