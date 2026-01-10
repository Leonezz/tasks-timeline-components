import type { Meta, StoryObj } from "@storybook/react-vite";
import { within, userEvent } from "@storybook/test";
import { DateBadge } from "../../components/DateBadge";
import type { Task } from "../../types";
import { AppProvider } from "../../components/AppContext";
import { taskBuilder } from "../fixtures";
import { delay } from "../test-utils";
import { DateTime } from "luxon";

const meta: Meta<typeof DateBadge> = {
  title: "UI/DateBadge",
  component: DateBadge,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    onUpdate: { action: "task-updated" },
  },
  decorators: [
    (Story) => (
      <AppProvider>
        <div className="p-4 bg-slate-50 min-w-[200px]">
          <Story />
        </div>
      </AppProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const today = DateTime.now();
const tomorrow = today.plus({ days: 1 });
const yesterday = today.minus({ days: 1 });

const defaultTask = taskBuilder.base({
  id: "1",
  title: "Sample Task",
  dueAt: today.toISODate()!,
});

const handleUpdate = (task: Task) => console.log("Updated task:", task);

// ========================================
// Due Date Stories
// ========================================

export const DueDate: Story = {
  args: {
    task: defaultTask,
    onUpdate: handleUpdate,
    type: "dueDate",
    date: today.toISODate()!,
    label: "Today",
    icon: "Calendar",
    className:
      "flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border text-rose-600 bg-rose-50/80 border-rose-100/50",
  },
};

export const DueTomorrow: Story = {
  args: {
    ...DueDate.args,
    date: tomorrow.toISODate()!,
    label: "Tomorrow",
    className:
      "flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border text-amber-600 bg-amber-50/80 border-amber-100/50",
  },
};

export const Overdue: Story = {
  args: {
    ...DueDate.args,
    date: yesterday.toISODate()!,
    label: yesterday.toFormat("MMM d"),
    className:
      "flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border text-rose-700 bg-rose-100 border-rose-200 font-bold",
  },
};

export const NoDueDate: Story = {
  args: {
    ...DueDate.args,
    date: undefined,
    label: "No date",
    className:
      "flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border text-slate-400 bg-slate-50 border-slate-100",
  },
};

// ========================================
// Start Date Stories
// ========================================

export const StartDate: Story = {
  args: {
    task: taskBuilder.base({ startAt: today.toISO()! }),
    onUpdate: handleUpdate,
    type: "startAt",
    date: today.toISO()!,
    label: "Today 9:00 AM",
    icon: "PlayCircle",
    className:
      "flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border text-blue-600 bg-blue-50/80 border-blue-100/50",
  },
};

export const StartDateWithTime: Story = {
  args: {
    ...StartDate.args,
    date: today.set({ hour: 14, minute: 30 }).toISO()!,
    label: "Today 2:30 PM",
  },
};

export const NoStartDate: Story = {
  args: {
    ...StartDate.args,
    date: undefined,
    label: "No start",
    className:
      "flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border text-slate-400 bg-slate-50 border-slate-100",
  },
};

// ========================================
// Created Date Stories
// ========================================

export const CreatedDate: Story = {
  args: {
    task: taskBuilder.base({ createdAt: yesterday.toISO()! }),
    onUpdate: handleUpdate,
    type: "createdAt",
    date: yesterday.toISO()!,
    label: "Yesterday 3:45 PM",
    icon: "Plus",
    className:
      "flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border text-slate-500 bg-slate-50/80 border-slate-100/50",
  },
};

export const CreatedToday: Story = {
  args: {
    ...CreatedDate.args,
    date: today.toISO()!,
    label: "Today 9:00 AM",
  },
};

// ========================================
// Completed Date Stories
// ========================================

export const CompletedDate: Story = {
  args: {
    task: taskBuilder.completed({ completedAt: today.toISO()! }),
    onUpdate: handleUpdate,
    type: "completedAt",
    date: today.toISO()!,
    label: "Today 4:20 PM",
    icon: "CheckCircle2",
    className:
      "flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded border text-emerald-600 bg-emerald-50/80 border-emerald-100/50",
  },
};

export const CompletedYesterday: Story = {
  args: {
    ...CompletedDate.args,
    date: yesterday.toISO()!,
    label: "Yesterday 11:15 AM",
  },
};

// ========================================
// With Prefix
// ========================================

export const WithPrefix: Story = {
  args: {
    ...DueDate.args,
    prefix: "DUE: ",
  },
};

export const WithPrefixStartDate: Story = {
  args: {
    ...StartDate.args,
    prefix: "START: ",
  },
};

// ========================================
// Input Type Variants
// ========================================

export const DateOnlyInput: Story = {
  args: {
    ...DueDate.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Open date picker popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });

    await step("Verify date input is visible", async () => {
      const dateInput = canvas.getByDisplayValue(today.toISODate()!);
      expect(dateInput).toBeInTheDocument();
      expect(dateInput).toHaveAttribute("type", "date");
    });
  },
};

export const DateTimeInput: Story = {
  args: {
    ...StartDate.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Open datetime picker popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });

    await step("Verify datetime input is visible", async () => {
      const input = canvas.getByDisplayValue(
        today.toFormat("yyyy-MM-dd'T'HH:mm")
      );
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "datetime-local");
    });
  },
};

// ========================================
// Interaction Testing
// ========================================

export const ChangeDueDate: Story = {
  args: {
    ...DueDate.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Open date picker", async () => {
      const button = canvas.getByRole("button", { name: /Change Due Date/i });
      await userEvent.click(button);
      await delay(200);
    });

    await step("Change date value", async () => {
      const input = canvas.getByDisplayValue(today.toISODate()!);
      await userEvent.clear(input);
      await userEvent.type(input, tomorrow.toISODate()!);
      await delay(100);
    });

    await step("Save new date", async () => {
      const saveButton = canvas.getByRole("button", { name: /Save/i });
      await userEvent.click(saveButton);
      await delay(100);
      // onUpdate should be called with new dueDate
    });
  },
};

export const ChangeStartDate: Story = {
  args: {
    ...StartDate.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Open datetime picker", async () => {
      const button = canvas.getByRole("button", {
        name: /Change Start Date/i,
      });
      await userEvent.click(button);
      await delay(200);
    });

    await step("Change datetime value", async () => {
      const input = canvas.getByDisplayValue(
        today.toFormat("yyyy-MM-dd'T'HH:mm")
      );
      const newDateTime = tomorrow.set({ hour: 10, minute: 0 });
      await userEvent.clear(input);
      await userEvent.type(input, newDateTime.toFormat("yyyy-MM-dd'T'HH:mm"));
      await delay(100);
    });

    await step("Save new datetime", async () => {
      const saveButton = canvas.getByRole("button", { name: /Save/i });
      await userEvent.click(saveButton);
      await delay(100);
    });
  },
};

export const ClearDate: Story = {
  args: {
    ...DueDate.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Open date picker", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });

    await step("Clear date value", async () => {
      const input = canvas.getByDisplayValue(today.toISODate()!);
      await userEvent.clear(input);
      await delay(100);
    });

    await step("Save empty date (removes date)", async () => {
      const saveButton = canvas.getByRole("button", { name: /Save/i });
      await userEvent.click(saveButton);
      await delay(100);
      // onUpdate should be called with empty dueDate
    });
  },
};

// ========================================
// Edge Cases
// ========================================

export const VeryLongLabel: Story = {
  args: {
    ...DueDate.args,
    label: "A very long date label that might overflow the badge container",
  },
};

export const EmptyLabel: Story = {
  args: {
    ...DueDate.args,
    label: "",
  },
};

export const InvalidDate: Story = {
  args: {
    ...DueDate.args,
    date: "invalid-date-string",
    label: "Invalid",
  },
};

export const FarFutureDate: Story = {
  args: {
    ...DueDate.args,
    date: DateTime.local(2099, 12, 31).toISODate()!,
    label: "Dec 31, 2099",
  },
};

export const FarPastDate: Story = {
  args: {
    ...CreatedDate.args,
    date: DateTime.local(2000, 1, 1).toISO()!,
    label: "Jan 1, 2000",
  },
};

// ========================================
// Accessibility Testing
// ========================================

export const KeyboardNavigation: Story = {
  args: {
    ...DueDate.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Tab to badge button", async () => {
      const button = canvas.getByRole("button");
      button.focus();
      expect(button).toHaveFocus();
    });

    await step("Press Enter to open popover", async () => {
      await userEvent.keyboard("{Enter}");
      await delay(200);
      const input = canvas.getByDisplayValue(today.toISODate()!);
      expect(input).toBeInTheDocument();
    });
  },
};

export const AriaLabels: Story = {
  args: {
    ...DueDate.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Verify button has accessible title", async () => {
      const button = canvas.getByRole("button", { name: /Change Due Date/i });
      expect(button).toHaveAttribute("title", "Change Due Date");
    });
  },
};
