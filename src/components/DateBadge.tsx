import type { Task } from "@/types";
import * as Lucide from "lucide-react";
import { DateTime } from "luxon";
import { useState } from "react";
import { Icon } from "./Icon";
import { useAppContext } from "./AppContext";
import { MotionDiv } from "./Motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "./ui/popover";

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
  const [val, setVal] = useState(() => {
    if (!date) return "";
    const dt = DateTime.fromISO(date);
    return dt.isValid
      ? type === "startAt" || type === "createdAt" || type === "completedAt"
        ? dt.toFormat("yyyy-MM-dd'T'HH:mm")
        : dt.toISODate()
      : "";
  });
  const dateLabel = type.endsWith("At")
    ? type.slice(0, type.length - 2).toUpperCase()
    : "";

  const handleDateSave = () => {
    let newDate = "";
    if (val) {
      newDate =
        type === "startAt" || type === "createdAt" || type === "completedAt"
          ? DateTime.fromFormat(val, "yyyy-MM-dd'T'HH:mm").toISO() || ""
          : DateTime.fromISO(val).toISODate() || "";
    }
    onUpdate({ ...task, [type]: newDate });
  };

  const inputType =
    type === "startAt" || type === "createdAt" || type === "completedAt"
      ? "datetime-local"
      : "date";
  const titleMap = {
    dueDate: "Change Due Date",
    startAt: "Change Start Date",
    createdAt: "Change Created Date",
    completedAt: "Change Completed Date",
  };
  const { portalContainer } = useAppContext();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={className} title={titleMap[type]}>
          <Icon name={icon} size={10} />
          <span className="font-mono">
            {prefix}
            {label}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={4}
        className="z-9999 outline-none w-auto p-2.5"
        container={portalContainer}
      >
        <MotionDiv
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <input
            type={inputType}
            value={val || ""}
            onChange={(e) => setVal(e.target.value)}
            className="border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-blue-500 mb-3 block w-full"
          />
          <PopoverClose asChild>
            <button
              onClick={handleDateSave}
              className="w-full text-blue-600! text-xs font-bold py-1.5 rounded shadow-sm transition-all"
            >
              Save {dateLabel} date
            </button>
          </PopoverClose>
        </MotionDiv>
      </PopoverContent>
    </Popover>
  );
};
