import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";
import { DateBadge } from "../../components/DateBadge";
import type { Task } from "../../types";
import { AppProvider } from "../../components/AppContext";
import { taskBuilder } from "../fixtures";
import { delay, withinShadow } from "../test-utils";
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
        <div className="p-4 bg-slate-50 min-w-50">
          <Story />
        </div>
      </AppProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const today = DateTime.now(),
  tomorrow = today.plus({ days: 1 }),
  yesterday = today.minus({ days: 1 }),
  defaultTask = taskBuilder.base({
    id: "1",
    title: "Sample Task",
    dueAt: today.toISODate()!,
  }),
  handleUpdate = (task: Task) => console.log("Updated task:", task),
  // The calendar header is formatted by date-fns in English, e.g. "March 2026"
  calendarMonth = (date: DateTime) =>
    date.setLocale("en-US").toFormat("MMMM yyyy");

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
    const canvas = withinShadow(canvasElement);

    await step("Open date picker popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });

    await step("Verify calendar is visible without a time field", async () => {
      expect(canvas.getByText(calendarMonth(today))).toBeInTheDocument();
      expect(canvas.queryByText("Time")).not.toBeInTheDocument();
    });
  },
};

export const DateTimeInput: Story = {
  args: {
    ...StartDate.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open datetime picker popover", async () => {
      const button = canvas.getByRole("button");
      await userEvent.click(button);
      await delay(200);
    });

    await step("Verify calendar and time field are visible", async () => {
      expect(canvas.getByText(calendarMonth(today))).toBeInTheDocument();
      const timeInput = canvas.getByDisplayValue(today.toFormat("HH:mm"));
      expect(timeInput).toHaveAttribute("type", "time");
    });
  },
};

// ========================================
// Interaction Testing
// ========================================

// Fixed dates keep calendar day names unique: March 2026 starts on a Sunday
export const ChangeDueDate: Story = {
  args: {
    ...DueDate.args,
    date: "2026-03-10",
    label: "Mar 10",
    onUpdate: fn(),
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open date picker", async () => {
      const button = canvas.getByTitle("Change due date");
      await userEvent.click(button);
      await delay(200);
    });

    await step("Pick a new date", async () => {
      const current = canvas.getByRole("gridcell", {
          name: "Tuesday, March 10, 2026",
        }),
        next = canvas.getByRole("gridcell", { name: "Friday, March 20, 2026" });
      expect(current).toHaveAttribute("aria-selected", "true");
      expect(next).not.toHaveAttribute("aria-selected");
      await userEvent.click(next);
      await delay(100);
      expect(next).toHaveAttribute("aria-selected", "true");
      expect(current).not.toHaveAttribute("aria-selected");
    });

    await step("Save new date", async () => {
      const saveButton = canvas.getByRole("button", { name: /Save/i });
      await userEvent.click(saveButton);
      await delay(100);
      expect(args.onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ dueAt: "2026-03-20" }),
      );
    });
  },
};

export const ChangeStartDate: Story = {
  args: {
    ...StartDate.args,
    date: DateTime.local(2026, 3, 10, 9, 30).toISO()!,
    label: "Mar 10 9:30 AM",
    onUpdate: fn(),
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open datetime picker", async () => {
      const button = canvas.getByTitle("Change start date");
      await userEvent.click(button);
      await delay(200);
    });

    await step("Pick a new date and time", async () => {
      await userEvent.click(
        canvas.getByRole("gridcell", { name: "Friday, March 20, 2026" }),
      );
      const timeInput = canvas.getByLabelText("Time");
      expect(timeInput).toHaveValue("09:30");
      await userEvent.clear(timeInput);
      await userEvent.type(timeInput, "10:00");
      await delay(100);
    });

    await step("Save new datetime", async () => {
      const saveButton = canvas.getByRole("button", { name: /Save/i });
      await userEvent.click(saveButton);
      await delay(100);
      expect(args.onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          startAt: DateTime.local(2026, 3, 20, 10, 0).toISO(),
        }),
      );
    });
  },
};

export const ClearDate: Story = {
  args: {
    ...DueDate.args,
    date: "2026-03-10",
    label: "Mar 10",
    onUpdate: fn(),
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open date picker", async () => {
      const button = canvas.getByTitle("Change due date");
      await userEvent.click(button);
      await delay(200);
    });

    await step("Deselect the current date", async () => {
      // Calendar's onSelect takes Date | undefined, like react-day-picker's
      // single mode: clicking the selected day again clears the selection
      const day = canvas.getByRole("gridcell", {
        name: "Tuesday, March 10, 2026",
      });
      expect(day).toHaveAttribute("aria-selected", "true");
      await userEvent.click(day);
      await delay(100);
      expect(day).not.toHaveAttribute("aria-selected");
    });

    await step("Save empty date (removes date)", async () => {
      const saveButton = canvas.getByRole("button", { name: /Save/i });
      await userEvent.click(saveButton);
      await delay(100);
      expect(args.onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ dueAt: "" }),
      );
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
    const canvas = withinShadow(canvasElement);

    await step("Tab to badge button", async () => {
      const button = canvas.getByRole("button");
      button.focus();
      expect(button).toHaveFocus();
    });

    await step("Press Enter to open popover", async () => {
      await userEvent.keyboard("{Enter}");
      await delay(200);
      const saveButton = canvas.getByRole("button", { name: "Save due date" });
      expect(saveButton).toBeInTheDocument();
    });
  },
};

// The calendar opens with focus on the selected day; arrow keys move through
// the days and Enter picks one
export const KeyboardPicksADay: Story = {
  args: {
    ...DueDate.args,
    date: "2026-03-10",
    label: "Mar 10",
    onUpdate: fn(),
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Enter opens the calendar on the selected day", async () => {
      canvas.getByTitle("Change due date").focus();
      await userEvent.keyboard("{Enter}");
      const selected = await canvas.findByRole("gridcell", {
        name: "Tuesday, March 10, 2026",
      });
      await waitFor(() => expect(selected).toHaveFocus());
    });

    await step("Arrow keys move to another day", async () => {
      await userEvent.keyboard("{ArrowDown}{ArrowRight}");
      expect(
        canvas.getByRole("gridcell", { name: "Wednesday, March 18, 2026" }),
      ).toHaveFocus();
    });

    await step("Enter picks it", async () => {
      await userEvent.keyboard("{Enter}");
      expect(
        canvas.getByRole("gridcell", { name: "Wednesday, March 18, 2026" }),
      ).toHaveAttribute("aria-selected", "true");
      await userEvent.click(
        canvas.getByRole("button", { name: "Save due date" }),
      );
      expect(args.onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ dueAt: "2026-03-18" }),
      );
    });
  },
};

export const AriaLabels: Story = {
  args: {
    ...DueDate.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Verify button names the field, task and date", async () => {
      // Same pattern as the category and priority badges
      const button = canvas.getByRole("button", {
        name: "Change due date for Sample Task. Current due date: Today",
      });
      expect(button).toHaveAttribute("title", "Change due date");
    });
  },
};

export const PrefixNotInAriaLabel: Story = {
  args: {
    ...WithPrefix.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Prefix is shown but not repeated in the name", async () => {
      const button = canvas.getByRole("button", {
        name: "Change due date for Sample Task. Current due date: Today",
      });
      expect(button).toHaveTextContent("DUE: Today");
    });
  },
};

export const MonthNavigation: Story = {
  args: {
    ...DueDate.args,
    date: "2026-03-10",
    label: "Mar 10",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = withinShadow(canvasElement);

    await step("Open date picker on the selected month", async () => {
      await userEvent.click(canvas.getByTitle("Change due date"));
      await delay(200);
      expect(canvas.getByText("March 2026")).toBeInTheDocument();
    });

    await step("Go to the next month", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Next month" }));
      expect(canvas.getByText("April 2026")).toBeInTheDocument();
    });

    await step("Go back two months", async () => {
      const previous = canvas.getByRole("button", { name: "Previous month" });
      await userEvent.click(previous);
      await userEvent.click(previous);
      expect(canvas.getByText("February 2026")).toBeInTheDocument();
    });
  },
};
