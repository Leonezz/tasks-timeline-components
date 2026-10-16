import { DateTime } from "luxon";
import type { Task } from "../types";
import {
  calendarDayOf,
  parseRecurrenceRule,
  RECURRENCE_RULE_HELP,
} from "./recurrence-rule";
import { nextRuleDay } from "./next-rule-date";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const daysBetween = (from: string, to: string): number =>
  Math.round(
    DateTime.fromISO(to, { zone: "utc" })
      .diff(DateTime.fromISO(from, { zone: "utc" }), "days")
      .as("days"),
  );

/** Moves a date by whole days, keeping its format (date only, or time and offset). */
const shiftDate = (
  value: string | undefined,
  days: number,
): string | undefined => {
  if (!value) {
    return value;
  }
  const shifted = DateTime.fromISO(value, { setZone: true }).plus({ days });
  const formatted = DATE_ONLY.test(value)
    ? shifted.toISODate()
    : shifted.toISO();
  if (!shifted.isValid || !formatted) {
    throw new Error(`Invalid date "${value}"`);
  }
  return formatted;
};

/**
 * The next occurrence of a recurring task, following Obsidian Tasks: the rule
 * advances the due date (else the scheduled, else the start date) and the
 * other dates move by the same number of days. "when done" rules advance from
 * `today` (YYYY-MM-DD) instead. An undated task's next occurrence is undated.
 * Returns null when the rule has ended (UNTIL or COUNT); throws when the rule
 * cannot be read or has no later date.
 */
export function nextOccurrence(task: Task, today: string): Task | null {
  const ruleText = task.recurringInterval ?? "";
  const rule = parseRecurrenceRule(ruleText);
  if (!rule) {
    throw new Error(
      `Cannot read the recurrence rule "${ruleText}". ${RECURRENCE_RULE_HELP}`,
    );
  }

  const scheduledAt = task.extra?.scheduledAt;
  const anchor = task.dueAt || scheduledAt || task.startAt;
  if (!anchor) {
    return task;
  }

  const anchorDay = calendarDayOf(anchor);
  const from = rule.whenDone ? today : anchorDay;
  const nextDay = nextRuleDay(rule, from, ruleText);
  if (nextDay === null || (rule.end !== undefined && nextDay > rule.end)) {
    return null;
  }
  if (nextDay <= from) {
    throw new Error(
      `The recurrence rule "${ruleText}" did not move past ${from}.`,
    );
  }

  const days = daysBetween(anchorDay, nextDay);
  return {
    ...task,
    dueAt: shiftDate(task.dueAt, days),
    startAt: shiftDate(task.startAt, days),
    ...(scheduledAt
      ? { extra: { ...task.extra, scheduledAt: shiftDate(scheduledAt, days) } }
      : {}),
  };
}
