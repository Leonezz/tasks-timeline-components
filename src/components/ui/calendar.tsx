import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  addMonths,
  subMonths,
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
  initialFocus?: boolean;
  disabled?: (date: Date) => boolean;
}

function Calendar({ className, selected, onSelect, disabled }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(() =>
    selected ? startOfMonth(selected) : startOfMonth(new Date()),
  );

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDayClick = (day: Date) => {
    if (disabled?.(day)) return;
    onSelect?.(day);
  };

  return (
    <div
      data-slot="calendar"
      className={cn("bg-popover p-3 w-[280px] select-none", className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-accent rounded-full"
          onClick={handlePrevMonth}
          type="button"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold text-foreground">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-accent rounded-full"
          onClick={handleNextMonth}
          type="button"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selected && isSameDay(day, selected);
          const isDayToday = isToday(day);
          const isDisabled = disabled?.(day);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleDayClick(day)}
              disabled={isDisabled}
              className={cn(
                "h-8 w-8 mx-auto rounded-full text-sm font-normal transition-all duration-150",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                "active:scale-95",
                // Outside current month
                !isCurrentMonth && "text-muted-foreground/40",
                // Today indicator
                isDayToday &&
                  !isSelected &&
                  "bg-accent text-accent-foreground font-semibold ring-1 ring-primary/30",
                // Selected state
                isSelected &&
                  "bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90 hover:text-primary-foreground",
                // Disabled
                isDisabled && "pointer-events-none opacity-30",
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
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
