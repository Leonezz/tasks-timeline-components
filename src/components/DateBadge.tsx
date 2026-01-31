import type { Task } from "@/types";
import * as Lucide from "lucide-react";
import { DateTime } from "luxon";
import { useState } from "react";
import { Icon } from "./Icon";
import { MotionDiv } from "./Motion";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { cn } from "../utils";

interface DateBadgeProps {
  task: Task;
  onUpdate: (task: Task) => void;
  type: "dueDate" | "startAt" | "createdAt" | "completedAt";
  date?: string;
  label: string;
  icon: keyof typeof Lucide;
  className: string;
  prefix?: string;
}

export const DateBadge = ({
  type,
  date,
  label,
  icon,
  className,
  prefix = "",
  onUpdate,
  task,
}: DateBadgeProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    if (!date) return undefined;
    const dt = DateTime.fromISO(date);
    return dt.isValid ? dt.toJSDate() : undefined;
  });

  const [timeValue, setTimeValue] = useState(() => {
    if (!date) return "00:00";
    const dt = DateTime.fromISO(date);
    return dt.isValid ? dt.toFormat("HH:mm") : "00:00";
  });

  const showTime =
    type === "startAt" || type === "createdAt" || type === "completedAt";

  const dateLabel = type.endsWith("At")
    ? type.slice(0, type.length - 2).toUpperCase()
    : "";

  const handleDateSelect = (newDate: Date | undefined) => {
    setSelectedDate(newDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeValue(e.target.value);
  };

  const handleDateSave = () => {
    let newDate = "";
    if (selectedDate) {
      let dt = DateTime.fromJSDate(selectedDate);

      if (showTime && timeValue) {
        const [hours, minutes] = timeValue.split(":").map(Number);
        dt = dt.set({ hour: hours, minute: minutes });
      }

      newDate = showTime ? dt.toISO() || "" : dt.toISODate() || "";
    }

    const fieldKey = type === "dueDate" ? "dueAt" : type;
    onUpdate({ ...task, [fieldKey]: newDate });
  };

  const titleMap = {
    dueDate: "Change Due Date",
    startAt: "Change Start Date",
    createdAt: "Change Created Date",
    completedAt: "Change Completed Date",
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={className} title={titleMap[type]}>
          <Icon name={icon} size={10} className="shrink-0" />
          <span className="font-mono truncate">
            {prefix}
            {label}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={4}
        className="z-9999 outline-none w-auto p-0"
      >
        <MotionDiv
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
          />

          {showTime && (
            <div className="border-t border-border px-3 py-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Time
              </label>
              <input
                type="time"
                value={timeValue}
                onChange={handleTimeChange}
                className={cn(
                  "w-full px-3 py-2 bg-background border border-input rounded-md text-sm",
                  "focus:ring-2 focus:ring-ring focus:border-ring outline-none",
                )}
              />
            </div>
          )}

          <div className="border-t border-border p-2">
            <PopoverClose asChild>
              <button
                onClick={handleDateSave}
                className={cn(
                  "w-full text-primary text-xs font-semibold py-2 rounded-md",
                  "hover:bg-accent transition-colors",
                )}
              >
                Save {dateLabel} date
              </button>
            </PopoverClose>
          </div>
        </MotionDiv>
      </PopoverContent>
    </Popover>
  );
};
