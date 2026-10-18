import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon } from "../../components/Icon";
import { ICONS } from "../../components/icon-registry";

const meta: Meta<typeof Icon> = {
  title: "UI/Icon",
  component: Icon,
  tags: ["autodocs"],
  argTypes: {
    name: {
      control: "select",
      options: Object.keys(ICONS),
      description: "Lucide icon name (one of the icons the library bundles)",
    },
    size: {
      control: { type: "number", min: 12, max: 48, step: 4 },
      defaultValue: 24,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "Check",
    size: 24,
  },
};

export const Small: Story = {
  args: {
    name: "Check",
    size: 16,
  },
};

export const Large: Story = {
  args: {
    name: "Check",
    size: 32,
  },
};

export const CheckIcon: Story = {
  args: {
    name: "Check",
    size: 24,
  },
};

export const AlertIcon: Story = {
  args: {
    name: "AlertCircle",
    size: 24,
  },
};

export const Trash: Story = {
  args: {
    name: "Trash2",
    size: 20,
  },
};

export const Edit: Story = {
  args: {
    name: "Pencil",
    size: 20,
  },
};

export const Calendar: Story = {
  args: {
    name: "Calendar",
    size: 20,
  },
};
