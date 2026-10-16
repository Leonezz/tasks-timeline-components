import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { AppProvider } from "../../components/AppContext";
import { TaskEditModal } from "../../components/TaskEditModal";
import type { Task } from "../../types";
import { taskBuilder } from "../fixtures";
import { delay } from "../test-utils";
import { RRule } from "rrule";

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
    // renders into, so it stays inside the story's canvas
    (Story, { parameters }) => {
      const app = (
        <AppProvider theme={parameters.theme as string | undefined}>
          <div className="w-full h-screen flex items-center justify-center bg-slate-50">
            <Story />
          </div>
        </AppProvider>
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
      expect(
        canvas.getByText(
          "Saving replaces the stored rule and drops the parts these settings can't show: repetition count (COUNT).",
        ),
      ).toBeInTheDocument();
    });
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

/** "rgb(r, g, b)" as channels; fails loudly on anything else. */
const rgbOf = (color: string): [number, number, number] => {
  const match = /^rgb\((\d+), (\d+), (\d+)\)$/.exec(color);
  if (!match) {
    throw new Error(`Expected an opaque rgb() colour, got "${color}"`);
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])];
};

const contrastRatio = (text: string, background: string): number => {
  const luminance = (color: string) => {
    const [r, g, b] = rgbOf(color).map((value) => {
      const c = value / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [light, dark] = [luminance(text), luminance(background)].sort(
    (a, b) => b - a,
  );
  return (light + 0.05) / (dark + 0.05);
};

/** The colour behind an element: its nearest ancestor with a background. */
const backgroundBehind = (element: Element): string => {
  for (let node: Element | null = element; node; node = node.parentElement) {
    const { backgroundColor } = getComputedStyle(node);
    if (backgroundColor !== "rgba(0, 0, 0, 0)") {
      return backgroundColor;
    }
  }
  throw new Error("No background behind the element");
};

const themedEditorStory = (theme: string): Story => ({
  args: {
    isOpen: true,
    task: taskBuilder.withRecurrence({
      title: `Editor in the ${theme} theme`,
      isRecurring: true,
      recurringInterval: "FREQ=WEEKLY;INTERVAL=2",
    }),
    onSave: handleSave,
    onClose: handleClose,
    availableCategories: ["Work"],
  },
  // Fail on any axe violation (the default only reports them)
  parameters: { theme, a11y: { test: "error" } },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const dialog = await canvas.findByRole("dialog", { name: "Edit Task" });
    // The accessibility checks run after this; mid-animation, the dialog's
    // opacity blends every colour
    await waitFor(() => expect(getComputedStyle(dialog).opacity).toBe("1"));

    await step("Secondary text meets WCAG AA (4.5:1)", async () => {
      for (const text of ["Task Dates", "Repeats automatically", "On days"]) {
        const element = canvas.getByText(text);
        expect(
          contrastRatio(
            getComputedStyle(element).color,
            backgroundBehind(element),
          ),
        ).toBeGreaterThanOrEqual(4.5);
      }
    });
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

    await step("Find recurrence checkbox", async () => {
      const recurrenceCheckbox = canvas.getByRole("checkbox", {
        name: /recurring/i,
      });
      expect(recurrenceCheckbox).toBeInTheDocument();
    });

    await step("Toggle recurrence on", async () => {
      const recurrenceCheckbox = canvas.getByRole("checkbox", {
        name: /recurring/i,
      });
      await userEvent.click(recurrenceCheckbox);
      await delay(200);
    });
  },
};

export const SelectCategory: Story = {
  args: {
    ...Default.args,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Find category selector", async () => {
      // Category is typically a select or button that opens popover
      const categoryButton = canvas.getByText(/Work/i);
      expect(categoryButton).toBeInTheDocument();
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
