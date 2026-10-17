import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { AppProvider } from "../../components/AppContext";
import { DatePicker } from "../../components/ui/date-picker";
import { DateTime } from "luxon";
import { expectReadable, waitForOpaque } from "../test-utils";

const meta: Meta<typeof DatePicker> = {
  title: "UI/DatePicker",
  component: DatePicker,
  parameters: {
    layout: "centered",
    // Fail on any axe violation (the default only reports them), such as
    // text below WCAG AA contrast or an unnamed popover
    a11y: { test: "error" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * DatePicker wrapper component for interactive stories
 */
function DatePickerDemo({
  showTime = false,
  initialValue,
}: {
  showTime?: boolean;
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue || "");

  return (
    <div className="space-y-4 w-[400px]">
      <DatePicker
        value={value}
        onChange={setValue}
        showTime={showTime}
        placeholder={showTime ? "Pick date and time" : "Pick a date"}
      />
      <div className="p-4 bg-slate-100 rounded-lg space-y-2 text-sm">
        <div>
          <strong>Selected value:</strong>{" "}
          <code className="bg-white px-2 py-1 rounded">
            {value || "(none)"}
          </code>
        </div>
        {value && (
          <>
            <div>
              <strong>Format:</strong>{" "}
              {value.includes("T") ? "ISO DateTime" : "ISO Date (YYYY-MM-DD)"}
            </div>
            <div>
              <strong>Parsed:</strong>{" "}
              {DateTime.fromISO(value).toLocaleString(
                showTime ? DateTime.DATETIME_MED : DateTime.DATE_MED,
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Date-only picker (no time component)
 *
 * This is the default mode and the one that had the timezone bug.
 * When showTime is false, the picker should use toISODate() to return
 * a date string in YYYY-MM-DD format without timezone conversion.
 */
export const DateOnly: Story = {
  render: () => <DatePickerDemo showTime={false} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      // Without AppProvider, popovers portal to document.body
      page = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "Pick a date" }));

    // Without a date, the calendar opens on today
    const today = await page.findByRole("gridcell", {
      name: DateTime.now().setLocale("en-US").toFormat("cccc, LLLL d, yyyy"),
    });
    await waitFor(() => expect(today).toHaveFocus());
  },
};

/**
 * Date and time picker
 *
 * When showTime is true, the picker includes a time input and returns
 * a full ISO timestamp with timezone information.
 */
export const DateAndTime: Story = {
  render: () => <DatePickerDemo showTime={true} />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement),
      // Without AppProvider, popovers portal to document.body
      page = within(canvasElement.ownerDocument.body);

    await step("Open the picker", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Pick date and time" }),
      );
    });

    await step("Time field is labelled", async () => {
      const timeInput = await page.findByLabelText("Time");
      expect(timeInput).toHaveAttribute("type", "time");
      expect(timeInput).toHaveValue("00:00");
    });
  },
};

/**
 * Pre-populated date-only value
 *
 * Test that existing date values are displayed correctly.
 */
export const PrePopulatedDate: Story = {
  render: () => <DatePickerDemo showTime={false} initialValue="2026-02-05" />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement),
      // Without AppProvider, popovers portal to document.body
      page = within(canvasElement.ownerDocument.body);

    await step("Open the picker", async () => {
      await userEvent.click(
        canvas.getByRole("button", {
          name: DateTime.fromISO("2026-02-05").toFormat("MMM dd, yyyy"),
        }),
      );
    });

    await step("Days are named by full date and expose selection", async () => {
      const selected = await page.findByRole("gridcell", {
        name: "Thursday, February 5, 2026",
      });
      expect(selected).toHaveAttribute("aria-selected", "true");
      expect(
        page.getByRole("gridcell", { name: "Friday, February 6, 2026" }),
      ).not.toHaveAttribute("aria-selected");
    });
  },
};

/**
 * Keyboard use
 *
 * The calendar opens with focus on the selected day. Arrow keys move through
 * the days, into other months too, and Enter picks one.
 */
export const KeyboardPicksADay: Story = {
  render: () => <DatePickerDemo showTime={false} initialValue="2026-02-05" />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement),
      // Without AppProvider, popovers portal to document.body
      page = within(canvasElement.ownerDocument.body),
      trigger = canvas.getByRole("button", {
        name: DateTime.fromISO("2026-02-05").toFormat("MMM dd, yyyy"),
      });

    await step("Enter opens the calendar on the selected day", async () => {
      trigger.focus();
      await userEvent.keyboard("{Enter}");
      const selected = await page.findByRole("gridcell", {
        name: "Thursday, February 5, 2026",
      });
      await waitFor(() => expect(selected).toHaveFocus());
    });

    await step("Arrow keys move into the previous month", async () => {
      await userEvent.keyboard("{ArrowUp}");
      expect(
        page.getByRole("gridcell", { name: "Thursday, January 29, 2026" }),
      ).toHaveFocus();
      expect(
        page.getByRole("grid", { name: "January 2026" }),
      ).toBeInTheDocument();
      await userEvent.keyboard("{ArrowRight}");
      expect(
        page.getByRole("gridcell", { name: "Friday, January 30, 2026" }),
      ).toHaveFocus();
    });

    await step("Enter picks the day and closes the calendar", async () => {
      await userEvent.keyboard("{Enter}");
      expect(canvas.getByText("2026-01-30")).toBeInTheDocument();
      await waitFor(() => expect(page.queryByRole("grid")).toBeNull());
      await waitFor(() => expect(trigger).toHaveFocus());
      expect(trigger).toHaveTextContent(
        DateTime.fromISO("2026-01-30").toFormat("MMM dd, yyyy"),
      );
    });
  },
};

/**
 * Pre-populated datetime value
 *
 * Test that existing datetime values are displayed correctly.
 */
export const PrePopulatedDateAndTime: Story = {
  render: () => (
    <DatePickerDemo showTime={true} initialValue="2026-02-05T14:30:00.000Z" />
  ),
};

/**
 * Timezone consistency test
 *
 * This story helps verify the fix for issue #13 where selecting Feb 5
 * would sometimes save as Jan 5 due to timezone conversion issues.
 *
 * The bug was in date-picker.tsx always using toISO() which includes
 * timezone conversion, even when showTime was false. The fix uses
 * toISODate() for date-only mode, which returns YYYY-MM-DD without
 * timezone conversion.
 */
export const TimezoneConsistencyTest: Story = {
  render: () => (
    <div className="space-y-6 w-[600px]">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-bold text-blue-900 mb-2">Test Instructions:</h3>
        <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
          <li>Select February 5, 2026 in the date-only picker below</li>
          <li>Verify the selected value shows as "2026-02-05" (not Jan)</li>
          <li>
            The format should be "ISO Date (YYYY-MM-DD)", not "ISO DateTime"
          </li>
          <li>Try dates near month boundaries (e.g., Jan 31, Mar 1)</li>
        </ol>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Date-only picker (fixed):</h4>
        <DatePickerDemo showTime={false} />
      </div>

      <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
        <strong>Expected behavior:</strong> The selected value should always be
        in YYYY-MM-DD format without timezone offset. Selecting Feb 5 should
        save as "2026-02-05", regardless of your system timezone.
      </div>
    </div>
  ),
};

/**
 * The date and time picker in `theme`, opened, so axe checks the trigger's
 * placeholder and the popover together.
 */
const themedPickerStory = (theme: string): Story => ({
  render: () => <DatePickerDemo showTime={true} />,
  decorators: [
    (Story) => (
      <AppProvider theme={theme}>
        <div className="p-4">
          <Story />
        </div>
      </AppProvider>
    ),
  ],
  play: async ({ canvasElement, step }) => {
    // AppProvider's portal container keeps the popover inside the canvas
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Pick date and time" });

    await step("The placeholder meets WCAG AA (4.5:1)", async () => {
      await expectReadable(trigger);
    });

    await step("The popover is named by the field it sets", async () => {
      await userEvent.click(trigger);
      const popover = await canvas.findByRole("dialog", {
        name: "Pick date and time",
      });
      // Let it finish fading in before axe checks its colours
      await waitForOpaque(within(popover).getByText("Time"));
    });

    await step("Its Time label meets AA", async () => {
      await expectReadable(
        within(canvas.getByRole("dialog")).getByText("Time"),
      );
    });
  },
});

export const LightTheme: Story = themedPickerStory("light");
export const DarkTheme: Story = themedPickerStory("dark");
export const MidnightTheme: Story = themedPickerStory("midnight");
export const CoffeeTheme: Story = themedPickerStory("coffee");
