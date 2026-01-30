import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DatePicker } from "../../components/ui/date-picker";
import { DateTime } from "luxon";

const meta: Meta<typeof DatePicker> = {
  title: "UI/DatePicker",
  component: DatePicker,
  parameters: {
    layout: "centered",
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
};

/**
 * Date and time picker
 *
 * When showTime is true, the picker includes a time input and returns
 * a full ISO timestamp with timezone information.
 */
export const DateAndTime: Story = {
  render: () => <DatePickerDemo showTime={true} />,
};

/**
 * Pre-populated date-only value
 *
 * Test that existing date values are displayed correctly.
 */
export const PrePopulatedDate: Story = {
  render: () => <DatePickerDemo showTime={false} initialValue="2026-02-05" />,
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
