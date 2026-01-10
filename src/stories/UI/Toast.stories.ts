import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toast } from "../../components/Toast";
import type { ToastMessage } from "../../components/Toast";

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
      type: "success",
      title: "Success!",
      description: "Your task has been created successfully.",
    } as ToastMessage,
    onDismiss: handleDismiss,
  },
};

export const Error: Story = {
  args: {
    toast: {
      id: "2",
      type: "error",
      title: "Error",
      description: "Failed to save task. Please try again.",
    } as ToastMessage,
    onDismiss: handleDismiss,
  },
};

export const Info: Story = {
  args: {
    toast: {
      id: "3",
      type: "info",
      title: "Information",
      description: "Your tasks are being synced to the cloud.",
    } as ToastMessage,
    onDismiss: handleDismiss,
  },
};

export const WithoutDescription: Story = {
  args: {
    toast: {
      id: "4",
      type: "success",
      title: "Task Created",
    } as ToastMessage,
    onDismiss: handleDismiss,
  },
};

export const LongDescription: Story = {
  args: {
    toast: {
      id: "5",
      type: "info",
      title: "Sync Complete",
      description:
        "All your tasks have been successfully synchronized with your other devices and cloud storage.",
    } as ToastMessage,
    onDismiss: handleDismiss,
  },
};
