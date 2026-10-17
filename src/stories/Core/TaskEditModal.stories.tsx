import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { AppProvider } from "../../components/AppContext";
import { TaskEditModal } from "../../components/TaskEditModal";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import type { Task } from "../../types";
import { taskBuilder } from "../fixtures";
import { delay, expectReadable } from "../test-utils";
import { RRule } from "rrule";
import { DateTime } from "luxon";

/** Renders the story in a shadow root, as the Obsidian plugin mounts the app. */
const ShadowRootFrame: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);
  return (
    <div
      data-testid="shadow-host"
      ref={(host) => {
        if (host && !shadowRoot) {
          setShadowRoot(host.shadowRoot ?? host.attachShadow({ mode: "open" }));
        }
      }}
    >
      {shadowRoot && createPortal(children, shadowRoot)}
    </div>
  );
};

const meta: Meta<typeof TaskEditModal> = {
  title: "Core/TaskEditModal",
  component: TaskEditModal,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    onSave: { action: "saved" },
    onClose: { action: "closed" },
  },
  decorators: [
    // AppProvider supplies the theme and the portal container the dialog
    // renders into, so it stays inside the story's canvas. With
    // `appProvider: false` the story is a consumer using the exported editor
    // in its own themed wrapper instead.
    (Story, { parameters }) => {
      const theme = parameters.theme as string | undefined;
      const content = (
        <div className="w-full h-screen flex items-center justify-center bg-slate-50">
          <Story />
        </div>
      );
      const app =
        parameters.appProvider === false ? (
          <div className="tasks-timeline-app" data-theme={theme}>
            {content}
          </div>
        ) : (
          <AppProvider theme={theme}>{content}</AppProvider>
        );
      return parameters.shadowRoot ? (
        <ShadowRootFrame>{app}</ShadowRootFrame>
      ) : (
        app
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultTask = taskBuilder.base({
    id: "1",
    title: "Complete project setup",
    description: "Set up the component library configuration and build system",
    priority: "high",
    category: "Work",
    tags: [
      { id: "1", name: "work" },
      { id: "2", name: "setup" },
    ],
  }),
  handleSave = (task: Task) => console.log("Save task:", task),
  handleClose = () => console.log("Close modal");

/**
 * Waits for the editor's open animation: until then its opacity blends every
 * colour, and the accessibility checks after the play function misread them.
 */
const waitForEditorToOpen = async (canvasElement: HTMLElement) => {
  const dialog = await within(canvasElement).findByRole("dialog", {
    name: "Edit Task",
  });
  await waitFor(() => expect(getComputedStyle(dialog).opacity).toBe("1"));
  return dialog;
};

// ========================================
// Core Stories
// ========================================

export const Default: Story = {
  args: {
    isOpen: true,
    task: defaultTask,
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work", "Personal", "Shopping", "Health"],
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    task: defaultTask,
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work", "Personal"],
  },
};

export const NewTask: Story = {
  args: {
    isOpen: true,
    task: null, // Creating new task from scratch
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work", "Personal", "Shopping"],
  },
};

export const AllFieldsFilled: Story = {
  args: {
    isOpen: true,
    task: taskBuilder.base({
      title: "Complete quarterly report",
      description:
        "Compile and analyze Q4 2024 performance metrics for executive review",
      priority: "high",
      category: "Work",
      tags: [
        { id: "1", name: "reporting" },
        { id: "2", name: "quarterly" },
        { id: "3", name: "urgent" },
      ],
    }),
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work", "Personal", "Shopping", "Health"],
  },
};

export const MinimalTask: Story = {
  args: {
    isOpen: true,
    task: taskBuilder.base({
      title: "Minimal task",
      description: "",
      category: undefined,
      tags: [],
    }),
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work", "Personal"],
  },
};

// ========================================
// Priority Variants
// ========================================

export const HighPriority: Story = {
  args: {
    ...Default.args,
    task: taskBuilder.highPriority({
      title: "Critical bug fix required",
    }),
  },
};

export const MediumPriority: Story = {
  args: {
    ...Default.args,
    task: taskBuilder.mediumPriority({
      title: "Regular task",
    }),
  },
};

export const LowPriority: Story = {
  args: {
    ...Default.args,
    task: taskBuilder.lowPriority({
      title: "Nice to have task",
    }),
  },
};

// ========================================
// Recurrence Stories
// ========================================

export const WithDailyRecurrence: Story = {
  args: {
    isOpen: true,
    task: taskBuilder.withRecurrence({
      title: "Daily standup",
      isRecurring: true,
      recurringInterval: new RRule({
        freq: RRule.DAILY,
        interval: 1,
      }).toString(),
    }),
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work"],
  },
};

export const WithWeeklyRecurrence: Story = {
  args: {
    isOpen: true,
    task: taskBuilder.withRecurrence({
      title: "Weekly team meeting",
      isRecurring: true,
      recurringInterval: new RRule({
        freq: RRule.WEEKLY,
        interval: 1,
        byweekday: [RRule.MO, RRule.WE, RRule.FR],
      }).toString(),
    }),
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work"],
  },
};

export const WithMonthlyRecurrence: Story = {
  args: {
    isOpen: true,
    task: taskBuilder.withRecurrence({
      title: "Monthly report",
      isRecurring: true,
      recurringInterval: new RRule({
        freq: RRule.MONTHLY,
        interval: 1,
        bymonthday: [1], // First day of month
      }).toString(),
    }),
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work"],
  },
};

export const WithYearlyRecurrence: Story = {
  args: {
    isOpen: true,
    task: taskBuilder.withRecurrence({
      title: "Annual performance review",
      isRecurring: true,
      recurringInterval: new RRule({
        freq: RRule.YEARLY,
        interval: 1,
        bymonth: [12], // December
        bymonthday: [31], // Last day
      }).toString(),
    }),
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work"],
  },
};

export const WithRecurrenceEndDate: Story = {
  args: {
    isOpen: true,
    task: taskBuilder.withRecurrence({
      title: "Task with limited recurrence",
      isRecurring: true,
      recurringInterval: new RRule({
        freq: RRule.WEEKLY,
        interval: 1,
        until: new Date(2025, 11, 31), // End on Dec 31, 2025
      }).toString(),
    }),
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work"],
  },
};

// Regression: parsed Obsidian Tasks lines (`🔁 every week`) carry a text rule
// and no isRecurring flag; saving without changes must keep the rule
export const SaveKeepsTextRecurrenceRule: Story = {
  args: {
    isOpen: true,
    task: taskBuilder.base({
      title: "Water the plants",
      isRecurring: undefined,
      recurringInterval: "every week",
    }),
    onSave: fn(),
    onClose: handleClose,
    availableCategories: ["Work"],
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Shows the task as recurring", async () => {
      expect(
        canvas.getByRole("switch", { name: /Toggle task recurrence/i }),
      ).toHaveAttribute("aria-checked", "true");
    });

    await step("Saving without changes keeps the rule", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /save/i }));
      expect(args.onSave).toHaveBeenCalledOnce();
      expect(args.onSave).toHaveBeenCalledWith(
        expect.objectContaining({ recurringInterval: "every week" }),
      );
    });
  },
};

// Editing an Obsidian Tasks rule must save text, which Obsidian Tasks lines
// can hold, not RRULE syntax
export const EditTextRecurrenceRuleSavesText: Story = {
  args: {
    isOpen: true,
    task: taskBuilder.base({
      title: "Water the plants",
      isRecurring: undefined,
      recurringInterval: "every week when done",
    }),
    onSave: fn(),
    onClose: handleClose,
    availableCategories: ["Work"],
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Change the frequency to daily", async () => {
      await userEvent.selectOptions(
        canvas.getByLabelText("Recurrence frequency"),
        String(RRule.DAILY),
      );
    });

    await step("Saves Obsidian Tasks text and keeps 'when done'", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /save/i }));
      expect(args.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          recurringInterval: "every day when done",
        }),
      );
    });
  },
};

// A host save that fails (e.g. a rule the vault can't store) must not close
// the editor and lose the user's edits
export const SaveFailureKeepsEdits: Story = {
  args: {
    isOpen: true,
    task: taskBuilder.base({ title: "Task to save" }),
    onSave: fn(async () => {
      throw new Error("The vault is read-only");
    }),
    onClose: fn(),
    availableCategories: ["Work"],
  },
  // Fail on any axe violation, the error text's contrast included
  parameters: { a11y: { test: "error" } },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Edit the title and save", async () => {
      const title = canvas.getByDisplayValue("Task to save");
      await userEvent.clear(title);
      await userEvent.type(title, "Renamed task");
      await userEvent.click(canvas.getByRole("button", { name: /save/i }));
    });

    await step("Shows the error and keeps the edit", async () => {
      expect(await canvas.findByRole("alert")).toHaveTextContent(
        "Could not save the task: The vault is read-only",
      );
      expect(canvas.getByDisplayValue("Renamed task")).toBeInTheDocument();
      expect(args.onClose).not.toHaveBeenCalled();
    });
    await waitForEditorToOpen(canvasElement);
  },
};

// Hosts that store Obsidian Tasks text see the text saving writes, which can
// be worded differently from rrule's ("every 2 years June on the 1st")
export const TextPreviewMatchesSavedRule: Story = {
  args: {
    isOpen: true,
    task: taskBuilder.base({
      title: "Renew the passport",
      isRecurring: undefined,
      recurringInterval: "every year on the 1st in June",
    }),
    onSave: fn(),
    onClose: handleClose,
    availableCategories: ["Work"],
    recurrenceFormat: "text",
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Repeat every 2 years", async () => {
      const interval = canvas.getByLabelText("Recurrence interval");
      // Clearing the field resets it to 1, so replace the value instead
      await userEvent.tripleClick(interval);
      await userEvent.keyboard("2");
    });

    await step("The preview is the text that is saved", async () => {
      expect(
        canvas.getByText("every 2 years on the 1st in June"),
      ).toBeInTheDocument();
      await userEvent.click(canvas.getByRole("button", { name: /save/i }));
      expect(args.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          recurringInterval: "every 2 years on the 1st in June",
        }),
      );
    });
  },
};

// Changing the settings of a rule with parts they can't show replaces it
export const WarnsWhichRulePartsSavingDrops: Story = {
  args: {
    isOpen: true,
    task: taskBuilder.withRecurrence({
      title: "Five weekly check-ins",
      isRecurring: true,
      recurringInterval: "FREQ=WEEKLY;COUNT=5",
    }),
    onSave: fn(),
    onClose: handleClose,
    availableCategories: ["Work"],
  },
  // Fail on any axe violation, the warning's contrast included
  parameters: { a11y: { test: "error" } },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Says which parts the settings can't show", async () => {
      expect(
        canvas.getByText(
          /These settings can't show: repetition count \(COUNT\)\./,
        ),
      ).toBeInTheDocument();
    });

    await step("Warns what saving drops once the settings change", async () => {
      const interval = canvas.getByLabelText("Recurrence interval");
      await userEvent.tripleClick(interval);
      await userEvent.keyboard("2");
      const warning = canvas.getByText(
        "Saving replaces the stored rule and drops the parts these settings can't show: repetition count (COUNT).",
      );
      expect(warning).toBeInTheDocument();
      // axe, which runs next, skips text scrolled out of view
      warning.scrollIntoView({ block: "nearest" });
    });
    await waitForEditorToOpen(canvasElement);
  },
};

// ========================================
// Accessibility
// ========================================

/** The element that has focus, inside a shadow root too. */
const focusedElement = (node: Node): Element | null => {
  const root = node.getRootNode() as Document | ShadowRoot;
  return root.activeElement;
};

/** The story's own content: inside its shadow root when it renders in one. */
const storyContent = (canvasElement: HTMLElement): HTMLElement => {
  const host = canvasElement.querySelector('[data-testid="shadow-host"]');
  if (!host) {
    return canvasElement;
  }
  const content = host.shadowRoot?.firstElementChild;
  if (!(content instanceof HTMLElement)) {
    throw new Error("The story's shadow root has no content yet");
  }
  return content;
};

/** The editor's dialog in `container`, once it has opened. */
const findEditor = (container: HTMLElement): Promise<HTMLElement> =>
  waitFor(() => {
    // Date pickers are dialogs too, but not modal ones
    const dialog = container.querySelector<HTMLElement>(
      '[role="dialog"][aria-modal="true"]',
    );
    if (!dialog) {
      throw new Error("The editor has not opened");
    }
    return dialog;
  });

/** A calendar day's name: the calendar names days with date-fns, in English. */
const calendarDayName = (date: DateTime) =>
  date.setLocale("en-US").toFormat("cccc, LLLL d, yyyy");

/**
 * Moves through an open date picker's calendar with arrow keys, from today
 * (its field has no date) into next month and back, then picks a day in next
 * month with Enter. The calendar moves focus itself, so this works in a
 * shadow root too, where user-event's Tab can't.
 */
const expectArrowKeysPickADay = async (
  picker: HTMLElement,
  field: HTMLElement,
) => {
  const expectFocusOn = async (date: DateTime) => {
    await waitFor(() =>
      expect(focusedElement(picker)).toBe(
        within(picker).getByRole("gridcell", { name: calendarDayName(date) }),
      ),
    );
    expect(
      within(picker).getByRole("grid", {
        name: date.setLocale("en-US").toFormat("LLLL yyyy"),
      }),
    ).toBeInTheDocument();
  };
  const today = DateTime.now().startOf("day");
  // Enough weeks down to leave this month, and one less to stay in it
  const weeks = Math.ceil((today.daysInMonth! - today.day + 1) / 7);
  const nextMonth = today.plus({ weeks });
  const picked = nextMonth.plus({ days: 1 });

  // The calendar opens on today, as the field has no date
  await expectFocusOn(today);
  await userEvent.keyboard("{ArrowDown}".repeat(weeks));
  await expectFocusOn(nextMonth);
  await userEvent.keyboard("{ArrowUp}");
  await expectFocusOn(nextMonth.minus({ weeks: 1 }));
  await userEvent.keyboard("{ArrowDown}{ArrowRight}");
  await expectFocusOn(picked);
  await userEvent.keyboard("{Enter}");
  // The editor's date fields keep their calendar open to set the time
  await waitFor(() =>
    expect(field).toHaveTextContent(picked.toFormat("MMM dd, yyyy HH:mm")),
  );
  expect(
    within(picker).getByRole("gridcell", { name: calendarDayName(picked) }),
  ).toHaveAttribute("aria-selected", "true");
};

/** Tab and Shift+Tab wrap around inside the dialog. */
const expectFocusTrapped = async (dialog: HTMLElement) => {
  const firstButton = within(dialog).getByRole("button", {
    name: "Close edit task modal",
  });
  const saveButton = within(dialog).getByRole("button", { name: /save/i });

  // Radix moves focus into the dialog when it opens
  await waitFor(() =>
    expect(dialog.contains(focusedElement(dialog))).toBe(true),
  );

  saveButton.focus();
  await userEvent.tab();
  expect(focusedElement(dialog)).toBe(firstButton);

  await userEvent.tab({ shift: true });
  expect(focusedElement(dialog)).toBe(saveButton);
};

export const DialogSemantics: Story = {
  args: {
    ...Default.args,
    onClose: fn(),
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    const dialog = await canvas.findByRole("dialog", { name: "Edit Task" });

    await step("Is a modal dialog named by its title", async () => {
      expect(dialog).toHaveAttribute("aria-modal", "true");
    });

    await step("Keeps Tab and Shift+Tab inside", async () => {
      await expectFocusTrapped(dialog);
    });

    await step("Closes on Escape", async () => {
      await userEvent.keyboard("{Escape}");
      expect(args.onClose).toHaveBeenCalledOnce();
    });
  },
};

// The Obsidian plugin renders the app in a shadow root, where
// document.activeElement is the shadow host rather than the focused field
export const DialogSemanticsInShadowRoot: Story = {
  args: {
    ...Default.args,
    onClose: fn(),
  },
  parameters: {
    shadowRoot: true,
  },
  play: async ({ args, canvasElement, step }) => {
    const host = canvasElement.querySelector<HTMLElement>(
      '[data-testid="shadow-host"]',
    );
    const shadowRoot = host?.shadowRoot;
    if (!shadowRoot) {
      throw new Error("The story did not render into a shadow root");
    }
    const dialog = await waitFor(() => {
      const found = shadowRoot.querySelector<HTMLElement>('[role="dialog"]');
      if (!found) {
        throw new Error("No dialog in the shadow root yet");
      }
      return found;
    });

    await step("Is a modal dialog", async () => {
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(within(dialog).getByRole("heading")).toHaveTextContent(
        "Edit Task",
      );
    });

    await step("Keeps Tab and Shift+Tab inside", async () => {
      await expectFocusTrapped(dialog);
    });

    await step("Closes on Escape", async () => {
      await userEvent.keyboard("{Escape}");
      expect(args.onClose).toHaveBeenCalledOnce();
    });
  },
};

// Date pickers portal their calendar outside the dialog; picking a date or
// pressing Escape there must not close the editor
export const DatePickerInsideDialog: Story = {
  args: {
    ...MinimalTask.args,
    onClose: fn(),
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Its calendar opens with focus on today", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: /Select due date/ }),
      );
      const today = await canvas.findByRole("gridcell", {
        name: calendarDayName(DateTime.now()),
      });
      await waitFor(() => expect(today).toHaveFocus());
      // The editor's focus trap sends focus back to the date field if the
      // calendar takes it before its popover's focus scope starts
      await delay(100);
      expect(today).toHaveFocus();
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(canvas.queryByRole("grid")).toBeNull());
    });

    await step("Escape closes the open calendar only", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: /Select due date/ }),
      );
      expect(
        await canvas.findByRole("button", { name: "Today" }),
      ).toBeInTheDocument();
      await userEvent.keyboard("{Escape}");
      await waitFor(() =>
        expect(canvas.queryByRole("button", { name: "Today" })).toBeNull(),
      );
      expect(args.onClose).not.toHaveBeenCalled();
    });

    await step("Picking a date keeps the editor open", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: /Select due date/ }),
      );
      await userEvent.click(
        await canvas.findByRole("button", { name: "Today" }),
      );
      expect(
        canvas.queryByRole("button", { name: /Select due date/ }),
      ).toBeNull();
      expect(
        canvas.getByRole("dialog", { name: "Edit Task" }),
      ).toBeInTheDocument();
      expect(args.onClose).not.toHaveBeenCalled();
    });
  },
};

// Radix's dialog overlay locks page scrolling with a document-level wheel and
// touchmove listener. In a shadow root that listener sees the shadow host as
// the event's target, so it cancelled scrolling inside the editor too.
export const ScrollsInShadowRoot: Story = {
  args: {
    ...WithYearlyRecurrence.args,
  },
  parameters: {
    shadowRoot: true,
  },
  play: async ({ canvasElement, step }) => {
    const dialog = await findEditor(
      await waitFor(() => storyContent(canvasElement)),
    );
    const body = Array.from(dialog.querySelectorAll<HTMLElement>("*")).find(
      (element) => getComputedStyle(element).overflowY === "auto",
    );
    if (!body) {
      throw new Error("The editor has no scrolling body");
    }

    await step("Wheel scrolling is not cancelled", async () => {
      const wheel = new WheelEvent("wheel", {
        deltaY: 120,
        bubbles: true,
        cancelable: true,
        composed: true,
      });
      body.dispatchEvent(wheel);
      expect(wheel.defaultPrevented).toBe(false);
    });

    await step("Touch scrolling is not cancelled", async () => {
      const touchAt = (clientY: number) => {
        const touch = new Touch({
          identifier: 1,
          target: body,
          clientX: 100,
          clientY,
        });
        return {
          touches: [touch],
          targetTouches: [touch],
          changedTouches: [touch],
          bubbles: true,
          cancelable: true,
          composed: true,
        };
      };
      body.dispatchEvent(new TouchEvent("touchstart", touchAt(200)));
      // A swipe up, which scrolls the body down
      const move = new TouchEvent("touchmove", touchAt(100));
      body.dispatchEvent(move);
      expect(move.defaultPrevented).toBe(false);
    });
  },
};

// In a shadow root, Radix's focus loops read document.activeElement (the
// shadow host). Tab from a date picker's last field left the editor for the
// host page, and Shift+Tab from the picker went back to the editor.
export const DatePickerKeepsTabInShadowRoot: Story = {
  args: {
    ...MinimalTask.args,
    onClose: fn(),
  },
  parameters: {
    shadowRoot: true,
  },
  play: async ({ canvasElement, step }) => {
    const content = await waitFor(() => storyContent(canvasElement));
    const dialog = await findEditor(content);
    const dueDate = within(dialog).getByRole("button", {
      name: /Select due date/,
    });
    await userEvent.click(dueDate);
    const picker = await waitFor(() => {
      const found = content.querySelector<HTMLElement>(
        "[data-radix-popper-content-wrapper]",
      );
      if (!found) {
        throw new Error("The date picker has not opened");
      }
      return found;
    });
    const fields = Array.from(
      picker.querySelectorAll<HTMLElement>("button, input"),
    ).filter((field) => field.tabIndex >= 0 && !field.hasAttribute("disabled"));
    const first = fields[0];
    const last = fields[fields.length - 1];

    await step(
      "Arrow keys move through days and months, and Enter picks one",
      async () => {
        await expectArrowKeysPickADay(picker, dueDate);
      },
    );

    await step("Tab from its last field wraps to its first", async () => {
      last.focus();
      await userEvent.tab();
      expect(focusedElement(picker)).toBe(first);
    });

    await step("Shift+Tab from its first field wraps to its last", async () => {
      await userEvent.tab({ shift: true });
      expect(focusedElement(picker)).toBe(last);
    });

    // In a shadow root Radix focuses a popover itself as it opens (date
    // pickers focus their calendar's day instead)
    await step("Shift+Tab from the picker itself stays in it", async () => {
      const popover = picker.querySelector<HTMLElement>('[role="dialog"]');
      if (!popover) {
        throw new Error("The date picker has no dialog element");
      }
      popover.focus();
      await userEvent.tab({ shift: true });
      expect(focusedElement(picker)).toBe(last);
    });
  },
};

/**
 * Opens the editor from a button, and from a popover button that closes the
 * popover as it opens the editor, as a task row's "Edit details" does.
 */
const EditorOpeners: React.FC<React.ComponentProps<typeof TaskEditModal>> = (
  props,
) => {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  return (
    <div className="flex gap-2">
      <button type="button" onClick={open}>
        Open editor
      </button>
      <Popover>
        <PopoverTrigger asChild>
          <button type="button">Task actions</button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverClose asChild>
            <button type="button" onClick={open}>
              Edit details
            </button>
          </PopoverClose>
        </PopoverContent>
      </Popover>
      <TaskEditModal
        {...props}
        isOpen={isOpen}
        onClose={close}
        onSave={close}
      />
    </div>
  );
};

/** Closing the editor returns focus to what opened it. */
const expectFocusReturned: Story["play"] = async ({ canvasElement, step }) => {
  const content = await waitFor(() => storyContent(canvasElement));
  const canvas = within(content);
  /** Opens the editor with Enter on `opener`, then closes it with `close`. */
  const openAndClose = async (
    opener: HTMLElement,
    close: (dialog: HTMLElement) => Promise<unknown>,
  ) => {
    opener.focus();
    await userEvent.keyboard("{Enter}");
    const dialog = await findEditor(content);
    await waitFor(() =>
      expect(dialog.contains(focusedElement(dialog))).toBe(true),
    );
    // A popup closing as the editor opens returns focus to its trigger a
    // moment later; in a shadow root that left the editor without focus
    await delay(100);
    expect(dialog.contains(focusedElement(dialog))).toBe(true);
    await close(dialog);
    await waitFor(() => expect(dialog.isConnected).toBe(false));
  };

  await step("Escape returns focus to the button that opened it", async () => {
    const opener = canvas.getByRole("button", { name: "Open editor" });
    await openAndClose(opener, () => userEvent.keyboard("{Escape}"));
    await waitFor(() => expect(focusedElement(content)).toBe(opener));
  });

  await step("Saving returns focus there too", async () => {
    const opener = canvas.getByRole("button", { name: "Open editor" });
    await openAndClose(opener, (dialog) =>
      userEvent.click(within(dialog).getByRole("button", { name: /save/i })),
    );
    await waitFor(() => expect(focusedElement(content)).toBe(opener));
  });

  await step(
    "When the opener has gone, focus returns to its popover's trigger",
    async () => {
      const trigger = canvas.getByRole("button", { name: "Task actions" });
      trigger.focus();
      await userEvent.keyboard("{Enter}");
      const edit = await canvas.findByRole("button", { name: "Edit details" });
      await openAndClose(edit, (dialog) =>
        userEvent.click(within(dialog).getByRole("button", { name: "Cancel" })),
      );
      expect(edit.isConnected).toBe(false);
      await waitFor(() => expect(focusedElement(content)).toBe(trigger));
    },
  );
};

// Radix returns focus to a Dialog.Trigger, and the editor has none, so focus
// fell to <body> and keyboard users restarted from the top of the page
export const ReturnsFocusToOpener: Story = {
  args: {
    ...Default.args,
  },
  render: (args) => <EditorOpeners {...args} />,
  play: expectFocusReturned,
};

export const ReturnsFocusToOpenerInShadowRoot: Story = {
  ...ReturnsFocusToOpener,
  parameters: {
    shadowRoot: true,
  },
};

// The exported editor used without AppProvider, which the package does not
// export, has no portal container: it renders in place, inside the
// consumer's themed wrapper, rather than in document.body
export const RendersInPlaceWithoutAppProvider: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    appProvider: false,
    theme: "midnight",
  },
  play: async ({ canvasElement, step }) => {
    const wrapper = canvasElement.querySelector<HTMLElement>(
      '.tasks-timeline-app[data-theme="midnight"]',
    );
    if (!wrapper) {
      throw new Error("The story has no themed wrapper");
    }
    const dialog = await findEditor(canvasElement.ownerDocument.body);

    await step("The editor renders in the themed wrapper", async () => {
      expect(wrapper.contains(dialog)).toBe(true);
      // The consumer's midnight card, not the light one on :root
      expect(getComputedStyle(dialog).getPropertyValue("--card")).toBe(
        getComputedStyle(wrapper).getPropertyValue("--card"),
      );
    });

    await step("So does a date picker's calendar, beside it", async () => {
      await userEvent.click(
        within(dialog).getByRole("button", { name: /Select due date/ }),
      );
      const calendar = await waitFor(() => {
        const found = wrapper.querySelector('[data-slot="calendar"]');
        if (!found) {
          throw new Error("No calendar has opened in the wrapper");
        }
        return found;
      });
      // The editor's transform and overflow would clip it
      expect(dialog.contains(calendar)).toBe(false);
      // The modal editor hides what was outside it as it opened
      expect(calendar.closest('[aria-hidden="true"]')).toBeNull();
      expect(getComputedStyle(calendar).getPropertyValue("--popover")).toBe(
        getComputedStyle(wrapper).getPropertyValue("--popover"),
      );
    });
  },
};

/** The focused element, inside shadow roots too. */
const deepFocusedElement = (): Element | null => {
  let focused = document.activeElement;
  while (focused?.shadowRoot?.activeElement) {
    focused = focused.shadowRoot.activeElement;
  }
  return focused;
};

/** The open date picker holding focus, if focus is in one. */
const focusedDatePicker = (): HTMLElement | null =>
  deepFocusedElement()?.closest<HTMLElement>(
    "[data-radix-popper-content-wrapper]",
  ) ?? null;

// ...and inside the consumer's own shadow root. Its date pickers' calendars
// render next to it there: in document.body they had none of the shadow
// root's styles, and the editor's focus trap, which keeps focus in the shadow
// root, sent focus from a calendar straight back to its date field.
export const RendersInPlaceInConsumerShadowRoot: Story = {
  args: {
    ...Default.args,
  },
  parameters: {
    appProvider: false,
    shadowRoot: true,
  },
  play: async ({ canvasElement, step }) => {
    const content = await waitFor(() => storyContent(canvasElement));
    const dialog = await findEditor(content);
    const dueDate = within(dialog).getByRole("button", {
      name: /Select due date/,
    });

    await step("The editor renders in the shadow root", async () => {
      expect(
        canvasElement.ownerDocument.body.querySelector('[role="dialog"]'),
      ).toBeNull();
    });

    await step(
      "Enter on a date field moves focus to its calendar",
      async () => {
        dueDate.focus();
        await userEvent.keyboard("{Enter}");
        await waitFor(() => expect(focusedDatePicker()).not.toBeNull());
        // The editor's focus trap sent it back to the date field
        await delay(100);
        expect(focusedDatePicker()).not.toBeNull();
      },
    );

    await step("The calendar renders in the consumer's wrapper", async () => {
      const picker = focusedDatePicker();
      expect(content.contains(picker)).toBe(true);
      // The editor's transform and overflow would clip it
      expect(dialog.contains(picker)).toBe(false);
    });

    await step(
      "Arrow keys move through days and months, and Enter picks one",
      async () => {
        const picker = focusedDatePicker();
        if (!picker) {
          throw new Error("Focus has left the date picker");
        }
        await expectArrowKeysPickADay(picker, dueDate);
      },
    );

    await step("The keyboard reaches the calendar's controls", async () => {
      const picker = focusedDatePicker();
      const time = picker?.querySelector<HTMLElement>('input[type="time"]');
      if (!picker || !time) {
        throw new Error("Focus has left the date picker");
      }
      // Wraps from the time field, the last control, to the first
      time.focus();
      await userEvent.tab();
      expect(deepFocusedElement()).toBe(
        within(picker).getByRole("button", { name: "Previous month" }),
      );
      // Back from next month, where the picked day is
      await userEvent.keyboard("{Enter}");
      expect(
        within(picker).getByText(
          DateTime.now().setLocale("en-US").toFormat("LLLL yyyy"),
        ),
      ).toBeInTheDocument();
    });

    await step("Escape closes it and returns to its date field", async () => {
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(deepFocusedElement()).toBe(dueDate));
      expect(dialog.isConnected).toBe(true);
    });
  },
};

export const MonthTogglesExposeState: Story = {
  args: {
    ...WithYearlyRecurrence.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("The rule's month is pressed", async () => {
      expect(canvas.getByRole("button", { name: "Dec" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(canvas.getByRole("button", { name: "Jan" })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
    });

    await step("Toggling a month updates its state", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Jan" }));
      expect(canvas.getByRole("button", { name: "Jan" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });
  },
};

const themedEditorStory = (theme: string): Story => ({
  args: {
    isOpen: true,
    task: taskBuilder.withRecurrence({
      title: `Editor in the ${theme} theme`,
      isRecurring: true,
      // Selected weekdays, and a part these settings can't show (COUNT)
      recurringInterval: "FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE;COUNT=5",
    }),
    onSave: fn(async () => {
      throw new Error("The vault is read-only");
    }),
    onClose: handleClose,
    availableCategories: ["Work"],
  },
  // Fail on any axe violation (the default only reports them)
  parameters: { theme, a11y: { test: "error" } },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await waitForEditorToOpen(canvasElement);

    await step("Secondary text meets WCAG AA (4.5:1)", async () => {
      for (const text of ["Task Dates", "Repeats automatically", "On days"]) {
        await expectReadable(canvas.getByText(text));
      }
    });

    await step("Selected weekdays meet AA", async () => {
      await expectReadable(
        canvas.getByRole("button", { name: "Monday", pressed: true }),
      );
    });

    await step("Selected months and days meet AA", async () => {
      await userEvent.selectOptions(
        canvas.getByLabelText("Recurrence frequency"),
        String(RRule.YEARLY),
      );
      await userEvent.click(canvas.getByRole("button", { name: "Jun" }));
      await userEvent.click(canvas.getByRole("button", { name: "15" }));
      await expectReadable(
        canvas.getByRole("button", { name: "Jun", pressed: true }),
      );
      await expectReadable(
        canvas.getByRole("button", { name: "15", pressed: true }),
      );
    });

    const warning = canvas.getByText(/^Saving replaces the stored rule/);
    await step("The warning about dropped rule parts meets AA", async () => {
      await expectReadable(warning);
    });

    await step("The save error meets AA", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /save/i }));
      await expectReadable(await canvas.findByRole("alert"));
    });

    // axe, which runs next, skips text scrolled out of view
    warning.scrollIntoView({ block: "nearest" });
  },
});

export const LightTheme: Story = themedEditorStory("light");
export const DarkTheme: Story = themedEditorStory("dark");
export const MidnightTheme: Story = themedEditorStory("midnight");
export const CoffeeTheme: Story = themedEditorStory("coffee");

// ========================================
// Status Variants
// ========================================

export const CompletedTask: Story = {
  args: {
    ...Default.args,
    task: taskBuilder.completed({
      title: "Completed task to edit",
    }),
  },
};

export const OverdueTask: Story = {
  args: {
    ...Default.args,
    task: taskBuilder.overdue({
      title: "Overdue task needs attention",
    }),
  },
};

export const ScheduledTask: Story = {
  args: {
    ...Default.args,
    task: taskBuilder.scheduled({
      title: "Scheduled for future",
    }),
  },
};

// ========================================
// Edge Cases
// ========================================

export const VeryLongTitle: Story = {
  args: {
    ...Default.args,
    task: taskBuilder.base({
      title: `${"A".repeat(200)} very long title that should wrap properly`,
    }),
  },
};

export const VeryLongDescription: Story = {
  args: {
    ...Default.args,
    task: taskBuilder.base({
      title: "Task with long description",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(50),
    }),
  },
};

export const ManyTags: Story = {
  args: {
    ...Default.args,
    task: taskBuilder.withTags(15, {
      title: "Task with many tags",
    }),
  },
};

export const ManyCategories: Story = {
  args: {
    ...Default.args,
    availableCategories: [
      "Work",
      "Personal",
      "Shopping",
      "Health",
      "Finance",
      "Education",
      "Home",
      "Travel",
      "Fitness",
      "Hobbies",
      "Social",
      "Family",
      "Career",
      "Projects",
      "Ideas",
    ],
  },
};

export const NoCategories: Story = {
  args: {
    ...Default.args,
    availableCategories: [],
  },
};

export const UnicodeContent: Story = {
  args: {
    ...Default.args,
    task: taskBuilder.base({
      title: "🎉 Unicode test: 日本語 中文 العربية 🚀",
      description:
        "Testing emoji and international characters: 你好世界 مرحبا بك ハロー・ワールド",
      category: "測試",
    }),
  },
};

// ========================================
// Interaction Testing
// ========================================

export const FormValidation: Story = {
  args: {
    ...Default.args,
    task: taskBuilder.base({ title: "" }),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Try to save without title", async () => {
      const saveButton = canvas.getByRole("button", { name: /save/i });
      await userEvent.click(saveButton);
      // Form should prevent submission or show error
      await delay(100);
    });
  },
};

export const EditTitle: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Find title input", async () => {
      const titleInput = canvas.getByDisplayValue(/Complete project setup/i);
      expect(titleInput).toBeInTheDocument();
    });

    await step("Clear and type new title", async () => {
      const titleInput = canvas.getByDisplayValue(/Complete project setup/i);
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, "New task title");
      await delay(100);
      expect(titleInput).toHaveValue("New task title");
    });
  },
};

export const ChangePriority: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Find priority selector", async () => {
      // Priority is typically a select or radio group
      const priorityElements = canvas.getAllByRole("radio");
      expect(priorityElements.length).toBeGreaterThan(0);
    });
  },
};

export const ToggleRecurrence: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Find recurrence switch", async () => {
      const recurrenceSwitch = canvas.getByRole("switch", {
        name: /recurrence/i,
      });
      expect(recurrenceSwitch).toHaveAttribute("aria-checked", "false");
    });

    await step("Toggle recurrence on", async () => {
      const recurrenceSwitch = canvas.getByRole("switch", {
        name: /recurrence/i,
      });
      await userEvent.click(recurrenceSwitch);
      await delay(200);
      expect(recurrenceSwitch).toHaveAttribute("aria-checked", "true");
      expect(canvas.getByLabelText("Recurrence interval")).toBeInTheDocument();
    });
  },
};

export const SelectCategory: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Find category input", async () => {
      const categoryInput = canvas.getByLabelText("Category");
      expect(categoryInput).toHaveValue("Work");
    });

    await step("Pick a suggested category", async () => {
      const categoryInput = canvas.getByLabelText("Category");
      await userEvent.clear(categoryInput);
      await userEvent.type(categoryInput, "Pers");
      await userEvent.click(canvas.getByRole("button", { name: "Personal" }));
      expect(categoryInput).toHaveValue("Personal");
    });
  },
};

export const CloseModal: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Find close button", async () => {
      const closeButtons = canvas.getAllByRole("button");
      // Should have at least one close button (X or Cancel)
      expect(closeButtons.length).toBeGreaterThan(0);
    });
  },
};

export const SaveTask: Story = {
  args: {
    ...Default.args,
    task: taskBuilder.base({
      title: "Task to save",
      description: "This task will be saved",
    }),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Modify title", async () => {
      const titleInput = canvas.getByDisplayValue(/Task to save/i);
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, "Modified task title");
    });

    await step("Click save button", async () => {
      const saveButton = canvas.getByRole("button", { name: /save/i });
      await userEvent.click(saveButton);
      await delay(100);
      // OnSave should be called
    });
  },
};

// Fixed March 2026 dates keep calendar day names unique
const clearDatesTask = taskBuilder.completed({
  id: "clear-dates",
  title: "Task with dates to clear",
  dueAt: DateTime.local(2026, 3, 10, 9, 30).toISO()!,
  startAt: DateTime.local(2026, 3, 5, 8, 0).toISO()!,
  completedAt: DateTime.local(2026, 3, 12, 18, 0).toISO()!,
});

export const ClearDates: Story = {
  args: {
    ...Default.args,
    task: clearDatesTask,
    onSave: fn(),
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement),
      // Without AppProvider, popovers portal to document.body
      page = within(canvasElement.ownerDocument.body),
      // DatePicker trigger text for a value, in the same format and locale
      pickerLabel = (iso: string) =>
        DateTime.fromISO(iso).toFormat("MMM dd, yyyy HH:mm"),
      clearDate = async (iso: string, dayName: string, placeholder: string) => {
        await userEvent.click(
          canvas.getByRole("button", { name: pickerLabel(iso) }),
        );
        await delay(200);
        // Clicking the selected day again deselects it
        const day = page.getByRole("gridcell", { name: dayName });
        expect(day).toHaveAttribute("aria-selected", "true");
        await userEvent.click(day);
        expect(day).not.toHaveAttribute("aria-selected");
        await userEvent.keyboard("{Escape}");
        await delay(200);
        expect(
          canvas.getByRole("button", { name: placeholder }),
        ).toBeInTheDocument();
      };

    await step("Clear the due date", async () => {
      await clearDate(
        clearDatesTask.dueAt!,
        "Tuesday, March 10, 2026",
        "Select due date",
      );
    });

    await step("Clear the start date", async () => {
      await clearDate(
        clearDatesTask.startAt!,
        "Thursday, March 5, 2026",
        "Select start date",
      );
    });

    await step("Clear the completed date", async () => {
      await clearDate(
        clearDatesTask.completedAt!,
        "Thursday, March 12, 2026",
        "Select completed date",
      );
    });

    await step("Save writes empty dates", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /save/i }));
      await delay(100);
      expect(args.onSave).toHaveBeenCalledWith(
        expect.objectContaining({ dueAt: "", startAt: "", completedAt: "" }),
      );
    });
  },
};
