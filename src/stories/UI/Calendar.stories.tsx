import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { DateTime } from "luxon";
import { AppProvider } from "../../components/AppContext";
import { Calendar } from "../../components/ui/calendar";
import { contrastRatio, expectReadable } from "../test-utils";

const meta: Meta<typeof Calendar> = {
  title: "UI/Calendar",
  component: Calendar,
  parameters: {
    layout: "centered",
    // axe fails these stories if the grid's roles don't nest as they must
    // (grid, row, gridcell), or if a day's text fails contrast
    a11y: { test: "error" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Keeps the picked day selected, as DatePicker and DateBadge do. */
const SelectingCalendar = ({
  selected: initialSelected,
  onSelect,
  ...props
}: React.ComponentProps<typeof Calendar>) => {
  const [selected, setSelected] = useState(initialSelected);
  return (
    <Calendar
      {...props}
      selected={selected}
      onSelect={(date) => {
        setSelected(date);
        onSelect?.(date);
      }}
    />
  );
};

// The calendar names days and months with date-fns, in English
const dayName = (date: DateTime) =>
    date.setLocale("en-US").toFormat("cccc, LLLL d, yyyy"),
  monthName = (date: DateTime) => date.setLocale("en-US").toFormat("LLLL yyyy");

/** The days Tab reaches: one, the roving tab stop. */
const tabStops = (canvasElement: HTMLElement) =>
  within(canvasElement)
    .getAllByRole("gridcell")
    .filter((day) => day.tabIndex >= 0);

export const Default: Story = {
  render: (args) => <SelectingCalendar {...args} />,
  args: {
    mode: "single",
  },
};

// Fixed dates: March 2026 starts on a Sunday and ends on a Tuesday
export const KeyboardNavigation: Story = {
  render: (args) => <SelectingCalendar {...args} />,
  args: {
    mode: "single",
    selected: new Date(2026, 2, 10),
    initialFocus: true,
    onSelect: fn(),
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);
    /** Expects focus, and the only tab stop, on `date`, shown in its month. */
    const expectFocusOn = async (date: DateTime) => {
      const day = canvas.getByRole("gridcell", { name: dayName(date) });
      await waitFor(() => expect(day).toHaveFocus());
      expect(tabStops(canvasElement)).toEqual([day]);
      expect(
        canvas.getByRole("grid", { name: monthName(date) }),
      ).toBeInTheDocument();
    };
    const press = (keys: string) => userEvent.keyboard(keys);

    await step("The selected day is the only Tab stop", async () => {
      const selected = canvas.getByRole("gridcell", {
        name: "Tuesday, March 10, 2026",
      });
      expect(selected).toHaveAttribute("aria-selected", "true");
      expect(tabStops(canvasElement)).toEqual([selected]);
    });

    await step("initialFocus focuses it as the calendar opens", async () => {
      await expectFocusOn(DateTime.local(2026, 3, 10));
    });

    await step("Arrow keys move by a day and by a week", async () => {
      await press("{ArrowRight}");
      await expectFocusOn(DateTime.local(2026, 3, 11));
      await press("{ArrowDown}");
      await expectFocusOn(DateTime.local(2026, 3, 18));
      await press("{ArrowLeft}");
      await expectFocusOn(DateTime.local(2026, 3, 17));
      await press("{ArrowUp}");
      await expectFocusOn(DateTime.local(2026, 3, 10));
    });

    await step("Home and End go to the start and end of the week", async () => {
      await press("{Home}");
      await expectFocusOn(DateTime.local(2026, 3, 8));
      await press("{End}");
      await expectFocusOn(DateTime.local(2026, 3, 14));
    });

    await step("Page Up and Page Down change the month", async () => {
      await press("{PageDown}");
      await expectFocusOn(DateTime.local(2026, 4, 14));
      await press("{PageUp}");
      await expectFocusOn(DateTime.local(2026, 3, 14));
    });

    await step("With Shift they change the year", async () => {
      await press("{Shift>}{PageDown}{/Shift}");
      await expectFocusOn(DateTime.local(2027, 3, 14));
      await press("{Shift>}{PageUp}{/Shift}");
      await expectFocusOn(DateTime.local(2026, 3, 14));
    });

    await step("Arrow keys cross into the next month and back", async () => {
      await press("{ArrowDown}{ArrowDown}{ArrowRight}");
      await expectFocusOn(DateTime.local(2026, 3, 29));
      await press("{ArrowDown}");
      await expectFocusOn(DateTime.local(2026, 4, 5));
      await press("{ArrowUp}");
      await expectFocusOn(DateTime.local(2026, 3, 29));
    });

    await step("...and into the previous month", async () => {
      await press("{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}");
      await expectFocusOn(DateTime.local(2026, 3, 1));
      await press("{ArrowLeft}");
      await expectFocusOn(DateTime.local(2026, 2, 28));
    });

    await step("Enter picks the focused day", async () => {
      await press("{Enter}");
      expect(args.onSelect).toHaveBeenLastCalledWith(new Date(2026, 1, 28));
      expect(
        canvas.getByRole("gridcell", { name: "Saturday, February 28, 2026" }),
      ).toHaveAttribute("aria-selected", "true");
    });

    await step("So does Space", async () => {
      await press("{ArrowRight}");
      await expectFocusOn(DateTime.local(2026, 3, 1));
      await press(" ");
      expect(args.onSelect).toHaveBeenLastCalledWith(new Date(2026, 2, 1));
      expect(
        canvas.getByRole("gridcell", { name: "Sunday, March 1, 2026" }),
      ).toHaveAttribute("aria-selected", "true");
    });
  },
};

// Without a selected day in the month, Tab reaches today, or else the 1st
export const TabStopWithoutSelection: Story = {
  render: (args) => <SelectingCalendar {...args} />,
  args: {
    mode: "single",
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const today = DateTime.now();

    await step("Today, in the current month", async () => {
      expect(tabStops(canvasElement)).toEqual([
        canvas.getByRole("gridcell", { name: dayName(today) }),
      ]);
    });

    await step("The 1st, in another month", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Next month" }));
      const next = today.plus({ months: 1 }).startOf("month");
      expect(
        canvas.getByRole("grid", { name: monthName(next) }),
      ).toBeInTheDocument();
      expect(tabStops(canvasElement)).toEqual([
        canvas.getByRole("gridcell", { name: dayName(next) }),
      ]);
    });
  },
};

// A selected day in another month than today's: the 1st once it is not shown
export const TabStopWithSelectionInAnotherMonth: Story = {
  render: (args) => <SelectingCalendar {...args} />,
  args: {
    mode: "single",
    selected: new Date(2020, 2, 10),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Next month" }));
    expect(
      canvas.getByRole("grid", { name: "April 2020" }),
    ).toBeInTheDocument();
    expect(tabStops(canvasElement)).toEqual([
      canvas.getByRole("gridcell", { name: "Wednesday, April 1, 2020" }),
    ]);
  },
};

// The grid's structure: rows of seven days under named weekday headers
export const GridSemantics: Story = {
  render: (args) => <SelectingCalendar {...args} />,
  args: {
    mode: "single",
    selected: new Date(2026, 2, 10),
  },
  play: async ({ canvasElement }) => {
    const grid = within(canvasElement).getByRole("grid", {
      name: "March 2026",
    });
    const rows = within(grid).getAllByRole("row");
    const headers = within(rows[0]).getAllByRole("columnheader");

    expect(headers.map((header) => header.getAttribute("aria-label"))).toEqual([
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ]);
    // March 1 to April 4, 2026: five weeks
    expect(rows).toHaveLength(6);
    for (const week of rows.slice(1)) {
      expect(within(week).getAllByRole("gridcell")).toHaveLength(7);
    }
  },
};

/** The day a gridcell names. */
const dateOf = (day: HTMLElement) =>
  DateTime.fromFormat(
    day.getAttribute("aria-label") ?? "",
    "cccc, LLLL d, yyyy",
    { locale: "en-US" },
  );

/** A day of this month other than today. */
const notToday = () => {
  const today = DateTime.now().startOf("day");
  return today.set({ day: today.day === 1 ? 2 : 1 });
};

/**
 * This month in `theme`, with another day than today selected, so today
 * shows its own indicator.
 */
const themedCalendarStory = (theme: string): Story => ({
  render: (args) => (
    <SelectingCalendar {...args} selected={notToday().toJSDate()} />
  ),
  args: {
    mode: "single",
  },
  decorators: [
    (Story) => (
      <AppProvider theme={theme}>
        <Story />
      </AppProvider>
    ),
  ],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const today = DateTime.now();
    const days = () => canvas.getAllByRole("gridcell");
    const inThisMonth = (day: HTMLElement) =>
      dateOf(day).hasSame(today, "month");
    // A day of this month that is neither today nor selected
    const plainDay = days().find(
      (day) =>
        inThisMonth(day) &&
        !dateOf(day).hasSame(today, "day") &&
        day.getAttribute("aria-selected") !== "true",
    );
    if (!plainDay) {
      throw new Error("No day of the month is neither today nor selected");
    }
    const plainContrast = contrastRatio(plainDay);

    await step("Days of the month meet WCAG AA (4.5:1)", async () => {
      await expectReadable(plainDay);
    });

    await step("Today meets AA", async () => {
      await expectReadable(
        canvas.getByRole("gridcell", { name: dayName(today) }),
      );
    });

    await step("The selected day meets AA", async () => {
      const selected = canvas.getByRole("gridcell", {
        name: dayName(notToday()),
      });
      expect(selected).toHaveAttribute("aria-selected", "true");
      await expectReadable(selected);
    });

    await step("Days of other months are muted but meet AA", async () => {
      // Only a 28-day February that starts on a Sunday shows none: then
      // check the next month's
      const noneShown = days().every(inThisMonth);
      if (noneShown) {
        await userEvent.click(
          canvas.getByRole("button", { name: "Next month" }),
        );
      }
      const shown = noneShown ? today.plus({ months: 1 }) : today;
      const otherMonthDay = days().find(
        (day) => !dateOf(day).hasSame(shown, "month"),
      );
      if (!otherMonthDay) {
        throw new Error(`No day outside ${monthName(shown)} is shown`);
      }
      await expectReadable(otherMonthDay);
      // Muted: less contrast than a plain day of the month
      expect(contrastRatio(otherMonthDay)).toBeLessThan(plainContrast);
      if (noneShown) {
        // axe, which runs next, checks this month
        await userEvent.click(
          canvas.getByRole("button", { name: "Previous month" }),
        );
      }
    });

    await step("Weekday names and the Today button meet AA", async () => {
      for (const weekday of canvas.getAllByRole("columnheader")) {
        await expectReadable(weekday);
      }
      await expectReadable(canvas.getByRole("button", { name: "Today" }));
    });
  },
});

export const LightTheme: Story = themedCalendarStory("light");
export const DarkTheme: Story = themedCalendarStory("dark");
export const MidnightTheme: Story = themedCalendarStory("midnight");
export const CoffeeTheme: Story = themedCalendarStory("coffee");
