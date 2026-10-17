import { type Options, RRule, Weekday } from "rrule";
import type { ParsedRecurrenceRule } from "./recurrence-rule";
import {
  floatingCalendarDay,
  floatingDay,
  floatingEndOfDay,
} from "./recurrence-dates";

/** Shared helpers for finding the days a rule's day filters pick. */

export const isSet = (value: unknown): boolean =>
  value !== undefined &&
  value !== null &&
  !(Array.isArray(value) && value.length === 0);

export const toList = <T>(value: T | T[] | null | undefined): T[] =>
  value === undefined || value === null
    ? []
    : Array.isArray(value)
      ? value
      : [value];

export const DAY_FILTERS = [
  "bymonth",
  "bymonthday",
  "byweekday",
  "bysetpos",
  "byyearday",
  "byweekno",
  "byeaster",
] as const;

const DATE_FILTERS = [
  "bymonth",
  "bymonthday",
  "byyearday",
  "byweekno",
  "byeaster",
] as const;

export const hasFilters = (options: Partial<Options>): boolean =>
  DAY_FILTERS.some((key) => isSet(options[key]));

const ALL_WEEKDAYS = [
  RRule.MO,
  RRule.TU,
  RRule.WE,
  RRule.TH,
  RRule.FR,
  RRule.SA,
  RRule.SU,
];

/** rrule reads ordinal weekdays (+2MO) as plain ones in daily and weekly rules. */
const plainWeekdays = (value: Options["byweekday"] | undefined): Weekday[] =>
  toList(value).map((day) =>
    typeof day === "number"
      ? ALL_WEEKDAYS[day]
      : typeof day === "string"
        ? Weekday.fromStr(day)
        : new Weekday(day.weekday),
  );

/**
 * As rrule's own defaults: a weekly rule without days repeats on its start's
 * weekday, unless a day of the month or year, a week number or Easter picks
 * the days.
 */
const repeatsOnStartWeekday = (options: Partial<Options>): boolean =>
  options.freq === RRule.WEEKLY &&
  !isSet(options.byweekday) &&
  !isSet(options.bymonthday) &&
  !isSet(options.byyearday) &&
  !isSet(options.byweekno) &&
  !isSet(options.byeaster);

/**
 * The most days a week of a weekly rule can have: its weekdays (its start's
 * without any), and no more than the days of the month or year it names,
 * since each of those falls at most once a week.
 */
export function maxDaysPerWeek(options: Partial<Options>): number {
  const weekdays = isSet(options.byweekday)
    ? new Set(plainWeekdays(options.byweekday).map((day) => day.weekday)).size
    : repeatsOnStartWeekday(options)
      ? 1
      : ALL_WEEKDAYS.length;
  return Math.min(
    weekdays,
    ...(["bymonthday", "byyearday"] as const)
      .filter((key) => isSet(options[key]))
      .map((key) => new Set(toList(options[key])).size),
  );
}

/**
 * A daily or weekly rule limited by month or day of month produces the same
 * dates as a yearly rule with those filters, which rrule steps through a year
 * at a time instead of a day at a time. That keeps a rule that never matches
 * (February 30th) from taking seconds to rule out.
 */
export function asYearly(
  options: Partial<Options>,
  dtstart: Date,
): Partial<Options> | null {
  if (
    (options.interval ?? 1) !== 1 ||
    isSet(options.bysetpos) ||
    !DATE_FILTERS.some((key) => isSet(options[key])) ||
    (options.freq !== RRule.DAILY && options.freq !== RRule.WEEKLY)
  ) {
    return null;
  }
  const weekdays = isSet(options.byweekday)
    ? plainWeekdays(options.byweekday)
    : null;
  const startWeekday = ALL_WEEKDAYS[(dtstart.getUTCDay() + 6) % 7];
  return {
    ...options,
    freq: RRule.YEARLY,
    byweekday:
      weekdays ??
      (repeatsOnStartWeekday(options) ? [startWeekday] : ALL_WEEKDAYS),
  };
}

/**
 * Visits the days from `first` to `last` (YYYY-MM-DD, inclusive) that a
 * rule's day filters pick, as a daily rule would, in order, and returns the
 * first value `visit` returns. Date filters are stepped through a year at a
 * time, so ones that never match are ruled out quickly.
 */
export function findInMatchingDays<T>(
  options: Partial<Options>,
  first: string,
  last: string,
  visit: (day: string) => T | undefined,
): T | undefined {
  // Only the parts that are set: rrule reads `byeaster: undefined` as a filter
  const daily: Partial<Options> = {
    ...Object.fromEntries(
      [...DAY_FILTERS, "wkst" as const]
        .filter((key) => key !== "bysetpos" && isSet(options[key]))
        .map((key) => [key, options[key]]),
    ),
    freq: RRule.DAILY,
    interval: 1,
  };
  const dtstart = floatingDay(first);
  let found: T | undefined;
  new RRule({
    ...(asYearly(daily, dtstart) ?? daily),
    dtstart,
    until: floatingEndOfDay(last),
  }).all((date) => {
    found = visit(floatingCalendarDay(date));
    return found === undefined;
  });
  return found;
}

/**
 * When a rule has no date after `from`: null when it has ended (its UNTIL
 * or COUNT), else an error, since a rule without an end always has another.
 */
export function noLaterDate(
  rule: ParsedRecurrenceRule,
  from: string,
  ruleText: string,
): null {
  if (rule.end !== undefined || rule.options.count) {
    return null;
  }
  throw new Error(
    `The recurrence rule "${ruleText}" has no date after ${from}.`,
  );
}
