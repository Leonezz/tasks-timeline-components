import type { Meta, StoryObj } from "@storybook/react-vite";
import { TasksTimelineApp } from "../TasksTimelineApp";

const meta: Meta<typeof TasksTimelineApp> = {
  title: "TasksTimelineApp",
  component: TasksTimelineApp,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const App: Story = {
  args: {
    onItemClick: (item) => {
      console.log("on click: ", item);
    },
  },
};
