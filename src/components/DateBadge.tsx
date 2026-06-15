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

  const dateLabel = {
    dueDate: "due",
    startAt: "start",
    createdAt: "created",
    completedAt: "completed",
  }[type];

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
    dueDate: "Change due date",
    startAt: "Change start date",
    createdAt: "Change created date",
    completedAt: "Change completed date",
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className={className} title={titleMap[type]}>
          <Icon name={icon} size={10} className="shrink-0 opacity-80" />
          <span className="truncate">
            {prefix}
            {label}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={4}
        className="z-9999 w-auto rounded-xl border border-slate-200/80 bg-white/95 p-1.5 shadow-xl shadow-slate-900/10 outline-none backdrop-blur"
      >
        <MotionDiv
          initial={{ opacity: 0, scale: 0.98, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -4 }}
          transition={{ duration: 0.12 }}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-2.5 pb-2 pt-1.5">
            <span className="text-xs font-semibold text-slate-700">
              {titleMap[type]}
            </span>
            <Icon name={icon} size={13} className="text-slate-400" />
          </div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
          />

          {showTime && (
            <div className="border-t border-slate-100 px-3 py-2">
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Time
              </label>
              <input
                type="time"
                value={timeValue}
                onChange={handleTimeChange}
                className={cn(
                  "w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-700",
                  "outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-500/15",
                )}
              />
            </div>
          )}

          <div className="border-t border-slate-100 p-2">
            <PopoverClose asChild>
              <button
                onClick={handleDateSave}
                className={cn(
                  "w-full rounded-lg bg-blue-50/70 py-2 text-xs font-semibold text-blue-700",
                  "transition-colors hover:bg-blue-100/70 focus-visible:ring-2 focus-visible:ring-blue-500/30",
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
