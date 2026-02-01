import { DateTime } from "luxon";
import { RRule } from "rrule";

const safeDate = (dateStr: string): DateTime => {
  if (!dateStr) {
    return DateTime.invalid("No date");
  }
  const dt = DateTime.fromISO(dateStr);
  return dt.isValid ? dt : DateTime.invalid("Invalid ISO");
};

export const formatDateDisplay = (dateStr: string, format = "yyyy-MM-dd") => {
  const dt = safeDate(dateStr);
  if (!dt.isValid) {
    return "";
  }
  return dt.toFormat(format);
};

export const formatTime = (dateStr: string) => {
  const dt = safeDate(dateStr);
  if (!dt.isValid || !dateStr.includes("T")) {
    return null;
  }
  return dt.toFormat("HH:mm");
};

export const formatRelativeDate = (dateStr: string) => {
  const dt = safeDate(dateStr);
  if (!dt.isValid) {
    return "";
  }
  const now = DateTime.now().startOf("day"),
    target = dt.startOf("day"),
    diff = target.diff(now, "days").days;
  if (diff === 0) {
    return "Today";
  }
  if (diff === 1) {
    return "Tomorrow";
  }
  if (diff === -1) {
    return "Yesterday";
  }
  return dt.toFormat("MMM d");
};

export const formatSmartDate = (
  dateStr: string,
  useRelative: boolean,
  absoluteFormat: string,
) => {
  if (!useRelative) {
    return formatDateDisplay(dateStr, absoluteFormat);
  }
  const dt = safeDate(dateStr);
  if (!dt.isValid) {
    return "INVALID";
  }
  const now = DateTime.now().startOf("day"),
    target = dt.startOf("day"),
    diff = target.diff(now, "days").days;
  if (diff === 0) {
    return "Today";
  }
  if (diff === 1) {
    return "Tomorrow";
  }
  if (diff === -1) {
    return "Yesterday";
  }
  // Within 5 days: show day-based urgency ("in 2 days")
  // Beyond 5 days: let Luxon choose appropriate unit ("in 2 weeks", "in 1 month")
  // This fixes issue #14 where Feb 1 from Jan 30 showed "next month" instead of "in 2 days"
  if (Math.abs(diff) <= 5) {
    return target.toRelative({ base: now, unit: "days" }) || "INVALID";
  }
  return target.toRelative({ base: now }) || "INVALID";
};

export const formatRecurrence = (ruleStr: string): string => {
  if (!ruleStr) {
    return "";
  }
  try {
    const rule = RRule.fromString(ruleStr);
    return rule.toText();
  } catch {
    return ruleStr;
  }
};
