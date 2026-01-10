import type { Meta, StoryObj } from "@storybook/react-vite";
import { HelpModal } from "../../components/HelpModal";

const meta: Meta<typeof HelpModal> = {
  title: "Modals/HelpModal",
  component: HelpModal,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: () => console.log("Close modal"),
  },
};

export const Open: Story = {
  args: {
    isOpen: true,
    onClose: () => console.log("Close modal"),
  },
  parameters: {
    layout: "fullscreen",
  },
};
