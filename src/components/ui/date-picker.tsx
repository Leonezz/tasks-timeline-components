import * as React from "react";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { CalendarIcon } from "lucide-react";
import { cn } from "../../utils";
import { DateTime } from "luxon";

interface DatePickerProps {
  value?: string; // ISO string or date string
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showTime?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled,
  showTime = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [timeValue, setTimeValue] = React.useState("00:00");

  // Parse the incoming value to get date and time
  const dateTime = value ? DateTime.fromISO(value) : null;
  const selectedDate = dateTime?.isValid ? dateTime.toJSDate() : undefined;

  // Update time value when value changes
  React.useEffect(() => {
    if (dateTime?.isValid && showTime) {
      setTimeValue(dateTime.toFormat("HH:mm"));
    }
  }, [value, dateTime, showTime]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onChange("");
      return;
    }

    let dt = DateTime.fromJSDate(date);

    if (showTime && timeValue) {
      const [hours, minutes] = timeValue.split(":").map(Number);
      dt = dt.set({ hour: hours, minute: minutes });
    }

    // Use toISODate() for date-only mode to avoid timezone conversion issues
    const newValue = showTime ? dt.toISO() || "" : dt.toISODate() || "";
    onChange(newValue);
    if (!showTime) {
      setOpen(false);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);

    if (selectedDate) {
      const [hours, minutes] = newTime.split(":").map(Number);
      const dt = DateTime.fromJSDate(selectedDate).set({
        hour: hours,
        minute: minutes,
      });
      // When time is being edited, we always want the full ISO timestamp
      onChange(dt.toISO() || "");
    }
  };

  const displayValue = React.useMemo(() => {
    if (!dateTime?.isValid) return placeholder;
    if (showTime) {
      return dateTime.toFormat("MMM dd, yyyy HH:mm");
    }
    return dateTime.toFormat("MMM dd, yyyy");
  }, [dateTime, placeholder, showTime]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          initialFocus
        />
        {showTime && (
          <div className="border-t border-border p-3">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Time
            </label>
            <input
              type="time"
              value={timeValue}
              onChange={handleTimeChange}
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:ring-2 focus:ring-ring focus:border-ring outline-none"
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
