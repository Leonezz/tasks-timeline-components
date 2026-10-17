import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  subMonths,
  startOfDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";

import { cn } from "../../utils";
import { Button } from "./button";

export interface CalendarProps {
  mode?: "single";
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
  /**
   * Focuses the day Tab reaches as the calendar mounts. In a Radix popover,
   * pass `focusCalendarOnOpen` as the popover's `onOpenAutoFocus` instead.
   */
  initialFocus?: boolean;
  disabled?: (date: Date) => boolean;
}

/**
 * The day Tab reaches in `month` until a key moves it: the selected day if
 * the month has it, else today if the month has it, else the 1st.
 */
function defaultTabStop(month: Date, selected: Date | undefined): Date {
  if (selected && isSameMonth(selected, month)) {
    return startOfDay(selected);
  }
  const today = startOfDay(new Date());
  return isSameMonth(today, month) ? today : startOfMonth(month);
}

/**
 * The day a key moves focus to from `day`, as in the WAI-ARIA date picker
 * dialog pattern; undefined for keys that don't move it (Enter and Space
 * click the day).
 */
function dayForKey(day: Date, event: React.KeyboardEvent): Date | undefined {
  if (event.altKey || event.ctrlKey || event.metaKey) {
    return undefined;
  }
  switch (event.key) {
    case "ArrowLeft":
      return addDays(day, -1);
    case "ArrowRight":
      return addDays(day, 1);
    case "ArrowUp":
      return addWeeks(day, -1);
    case "ArrowDown":
      return addWeeks(day, 1);
    case "Home":
      return startOfWeek(day);
    case "End":
      return startOfDay(endOfWeek(day));
    // date-fns keeps the day, or takes the month's last when it is shorter
    case "PageUp":
      return event.shiftKey ? addYears(day, -1) : addMonths(day, -1);
    case "PageDown":
      return event.shiftKey ? addYears(day, 1) : addMonths(day, 1);
    default:
      return undefined;
  }
}

function Calendar({
  className,
  selected,
  onSelect,
  initialFocus,
  disabled,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(() =>
    selected ? startOfMonth(selected) : startOfMonth(new Date()),
  );
  // The day a key moved focus to, or the last one clicked
  const [focusedDay, setFocusedDay] = React.useState<Date>();
  // Roving tab stop: Tab reaches one day only, and arrow keys move it
  const tabStop =
    focusedDay && isSameMonth(focusedDay, currentMonth)
      ? focusedDay
      : defaultTabStop(currentMonth, selected);
  const tabStopRef = React.useRef<HTMLButtonElement>(null);
  // Whether to focus the tab stop once rendered: as the calendar mounts with
  // initialFocus, and after a key moves it
  const focusTabStop = React.useRef(initialFocus ?? false);
  const headingId = React.useId();

  React.useEffect(() => {
    if (focusTabStop.current) {
      focusTabStop.current = false;
      tabStopRef.current?.focus();
    }
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weeks = Array.from({ length: days.length / 7 }, (_, week) =>
    days.slice(week * 7, week * 7 + 7),
  );

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  /**
   * Makes `day` the tab stop and focuses it once rendered. Past the month's
   * edge it shows the day's month, where its button is.
   */
  const moveTabStop = (day: Date) => {
    setFocusedDay(day);
    if (!isSameMonth(day, currentMonth)) {
      setCurrentMonth(startOfMonth(day));
    }
    focusTabStop.current = true;
  };

  const handleDayClick = (day: Date) => {
    if (disabled?.(day)) return;
    moveTabStop(day);
    // Like react-day-picker's single mode: clicking the selected day clears it
    onSelect?.(selected && isSameDay(day, selected) ? undefined : day);
  };

  const handleDayKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    day: Date,
  ) => {
    const next = dayForKey(day, event);
    if (next) {
      event.preventDefault();
      moveTabStop(next);
      return;
    }
    if (event.altKey || event.ctrlKey || event.metaKey || disabled?.(day)) {
      return;
    }
    // As in the WAI-ARIA pattern, Enter and Space pick the day and, unlike a
    // click, never clear it: the calendar opens on the selected day. Delete
    // and Backspace clear it instead.
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect?.(day);
    } else if (
      (event.key === "Delete" || event.key === "Backspace") &&
      selected &&
      isSameDay(day, selected)
    ) {
      event.preventDefault();
      onSelect?.(undefined);
    }
  };

  return (
    <div
      data-slot="calendar"
      className={cn(
        "bg-popover text-popover-foreground p-3 w-[280px] select-none",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-accent rounded-full"
          onClick={handlePrevMonth}
          type="button"
          aria-label="Previous month"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <span
          id={headingId}
          aria-live="polite"
          className="text-sm font-semibold text-foreground"
        >
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-accent rounded-full"
          onClick={handleNextMonth}
          type="button"
          aria-label="Next month"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Days: a grid named by the month, as in the WAI-ARIA date picker */}
      <div role="grid" aria-labelledby={headingId}>
        {/* Weekday headers */}
        <div role="rowgroup">
          <div role="row" className="grid grid-cols-7 mb-2">
            {weeks[0].map((day) => (
              <div
                key={day.getDay()}
                role="columnheader"
                aria-label={format(day, "EEEE")}
                className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
              >
                {format(day, "EEEEEE")}
              </div>
            ))}
          </div>
        </div>

        {/* Index keys keep the focused day's button mounted as the month
            changes, until focus moves to the new day */}
        <div role="rowgroup" className="flex flex-col gap-0.5">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} role="row" className="grid grid-cols-7 gap-0.5">
              {week.map((day, dayIdx) => {
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = !!selected && isSameDay(day, selected);
                const isDayToday = isToday(day);
                const isDisabled = disabled?.(day);
                const isTabStop = isSameDay(day, tabStop);

                return (
                  <button
                    key={dayIdx}
                    ref={isTabStop ? tabStopRef : undefined}
                    type="button"
                    role="gridcell"
                    tabIndex={isTabStop ? 0 : -1}
                    onClick={() => handleDayClick(day)}
                    onKeyDown={(event) => handleDayKeyDown(event, day)}
                    // Space clicks a button on keyup, after its keydown
                    // picked the day: that click would clear it
                    onKeyUp={(event) => {
                      if (event.key === " ") event.preventDefault();
                    }}
                    aria-selected={isSelected || undefined}
                    // Still focusable, so arrow keys can pass over it
                    aria-disabled={isDisabled || undefined}
                    aria-label={format(day, "EEEE, MMMM d, yyyy")}
                    // Text meets WCAG AA (4.5:1) in every theme. The blue
                    // tokens are themed, and white is --background, so it is
                    // dark where the dark themes make blue-600 light.
                    className={cn(
                      "h-8 w-8 mx-auto rounded-full text-sm font-normal transition-all duration-150",
                      "hover:bg-blue-50 hover:text-blue-600",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                      "active:scale-95",
                      // Outside current month: muted, but readable
                      !isCurrentMonth && "text-muted-foreground",
                      // Today indicator
                      isDayToday &&
                        !isSelected &&
                        "bg-blue-50 text-blue-600 font-semibold ring-1 ring-blue-600/30",
                      // Selected state: it keeps its colours on hover, since
                      // white fails AA on a lighter blue
                      isSelected &&
                        "bg-blue-600 text-white font-semibold shadow-sm hover:bg-blue-600 hover:text-white",
                      // Disabled
                      isDisabled && "pointer-events-none opacity-30",
                    )}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Today button */}
      <div className="mt-3 pt-3 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className="w-full text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={() => {
            const today = new Date();
            setCurrentMonth(startOfMonth(today));
            setFocusedDay(startOfDay(today));
            onSelect?.(today);
          }}
        >
          Today
        </Button>
      </div>
    </div>
  );
}

export { Calendar };
