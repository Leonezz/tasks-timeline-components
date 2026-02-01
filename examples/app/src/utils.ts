import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { DateTime } from "luxon";
import { RRule } from "rrule";
import type { Task, TaskStatus } from "@tasks-timeline/components";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function logger() {
  return {
    info: (context: string, message: string, data?: unknown) => {
      console.log(`[${context}] ${message}`, data || "");
    },
    warn: (context: string, message: string, data?: unknown) => {
      console.warn(`[${context}] ${message}`, data || "");
    },
    error: (context: string, message: string, data?: unknown) => {
      console.error(`[${context}] ${message}`, data || "");
    },
    debug: (context: string, message: string, data?: unknown) => {
      console.debug(`[${context}] ${message}`, data || "");
    },
  };
}

const safeDate = (dateStr: string): DateTime => {
  if (!dateStr) return DateTime.invalid("No date");
  const dt = DateTime.fromISO(dateStr);
  return dt.isValid ? dt : DateTime.invalid("Invalid ISO");
};

export const formatDateDisplay = (dateStr: string, format = "yyyy-MM-dd") => {
  const dt = safeDate(dateStr);
  if (!dt.isValid) return "";
  return dt.toFormat(format);
};

export const formatTime = (dateStr: string) => {
  const dt = safeDate(dateStr);
  if (!dt.isValid || !dateStr.includes("T")) return null;
  return dt.toFormat("HH:mm");
};

export const formatRelativeDate = (dateStr: string) => {
  const dt = safeDate(dateStr);
  if (!dt.isValid) return "";
  const now = DateTime.now().startOf("day");
  const target = dt.startOf("day");
  const diff = target.diff(now, "days").days;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return dt.toFormat("MMM d");
};

export const formatSmartDate = (
  dateStr: string,
  useRelative: boolean,
  absoluteFormat: string
) => {
  if (!useRelative) return formatDateDisplay(dateStr, absoluteFormat);
  const dt = safeDate(dateStr);
  if (!dt.isValid) return "";
  const now = DateTime.now().startOf("day");
  const target = dt.startOf("day");
  const diff = target.diff(now, "days").days;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  // Within 5 days: show day-based urgency ("in 2 days")
  // Beyond 5 days: let Luxon choose appropriate unit ("in 2 weeks", "in 1 month")
  // This fixes issue #14 where Feb 1 from Jan 30 showed "next month" instead of "in 2 days"
  if (Math.abs(diff) <= 5) {
    return target.toRelative({ base: now, unit: "days" }) || "";
  }
  return target.toRelative({ base: now }) || "";
};

export const formatRecurrence = (ruleStr: string): string => {
  if (!ruleStr) return "";
  try {
    const rule = RRule.fromString(ruleStr);
    return rule.toText();
  } catch {
    return ruleStr;
  }
};

export const deriveTaskStatus = (task: Task): TaskStatus => {
  // 1. If explicitly Done or Cancelled, preserve status
  if (task.status === "done" || task.status === "cancelled") {
    return task.status;
  }

  const now = DateTime.now();
  const today = now.toISODate() || "";
  const tomorrow = now.plus({ days: 1 }).toISODate();

  // 2. Overdue: Due date is strictly in the past
  if (task.dueAt && task.dueAt < today) {
    return "overdue";
  }

  // 3. Due: Due date is Today or Tomorrow
  if (task.dueAt && (task.dueAt === today || task.dueAt === tomorrow)) {
    return "due";
  }

  // 4. Scheduled: Has a generic future Start Date
  if (task.startAt && task.startAt > (now.toISO() || "")) {
    return "scheduled";
  }

  // 5. Fallbacks
  if (["due", "overdue", "scheduled"].includes(task.status)) {
    return "todo";
  }

  return task.status;
};

export const parseDate = (dateStr: string): DateTime => {
  return safeDate(dateStr);
};

export const formatDate = (dateStr: string): string => {
  return formatDateDisplay(dateStr);
};

export const getDayName = (dateStr: string): string => {
  const dt = safeDate(dateStr);
  if (!dt.isValid) return "";
  return dt.toFormat("cccc");
};
