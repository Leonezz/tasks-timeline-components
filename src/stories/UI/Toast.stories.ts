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
      id: "6",
      variant: "warning",
      title: "Warning",
      description: "This action cannot be undone.",
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
