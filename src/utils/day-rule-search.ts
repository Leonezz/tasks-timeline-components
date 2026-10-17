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
function withYearlySteps(
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
 * Whether a weekly rule's BYWEEKNO can pick other days than a yearly rule's.
 * rrule numbers a weekly rule's weeks in the year each week starts in, and a
 * yearly rule's days in their own year, where the days of last year's last
 * week get 52 or 53, sometimes the wrong one (January 1 2022 is in week 52
 * of a weekly rule only), and a negative number can count from the end of
 * either year.
 */
const weekNumbersDiffer = (options: Partial<Options>): boolean =>
  options.freq === RRule.WEEKLY && isSet(options.byweekno);

const DAY_MS = 86_400_000;

/** The week numbers rrule can give a week that starts in its own year. */
const startsInItsYear = (week: number): boolean =>
  (week >= 1 && week <= 53) || (week >= -52 && week <= -1);

const weekStartDay = (wkst: Options["wkst"] | undefined): number =>
  wkst === undefined || wkst === null
    ? RRule.MO.weekday
    : typeof wkst === "number"
      ? wkst
      : wkst.weekday;

/**
 * The last day of week -53 in a weekly rule's first week, or null. That
 * week starts at the rule's start and is numbered in its year. As rrule
 * counts, a year has 53 weeks when its first week start day is its 5th day
 * (a leap year's 5th or 6th), and the days before it are week 1, or -53.
 */
function lastWeek53DayOfFirstWeek(
  options: Partial<Options>,
  startDay: Date,
): number | null {
  const year = startDay.getUTCFullYear();
  const january1 = Date.UTC(year, 0, 1);
  const january1Weekday = (new Date(january1).getUTCDay() + 6) % 7;
  const firstWeekStart = (7 - january1Weekday + weekStartDay(options.wkst)) % 7;
  const leap = new Date(Date.UTC(year, 1, 29)).getUTCMonth() === 1;
  const has53Weeks = firstWeekStart === 4 || (leap && firstWeekStart === 5);
  const lastDay = january1 + (firstWeekStart - 1) * DAY_MS;
  return has53Weeks && startDay.getTime() <= lastDay ? lastDay : null;
}

/**
 * Whether a weekly rule's week numbers pick no day after `daysAfter`. Its
 * weeks are numbered in the year they start in (see weekNumbersDiffer), and
 * week -53 is week 1 of a 53-week year, which starts the year before, so it
 * never matches, nor does a week past 53, except in the first week, which
 * starts at the rule's start instead. rrule makes a rule with BYEASTER
 * yearly.
 */
export function weekNumbersNeverMatch(
  options: Partial<Options>,
  startDay: Date,
  daysAfter: Date,
): boolean {
  if (
    options.freq !== RRule.WEEKLY ||
    !isSet(options.byweekno) ||
    isSet(options.byeaster) ||
    toList(options.byweekno).some(startsInItsYear)
  ) {
    return false;
  }
  const lastDay = lastWeek53DayOfFirstWeek(options, startDay);
  return lastDay === null || lastDay <= daysAfter.getTime();
}

/** A yearly rule with the same dates as a daily or weekly rule, or null. */
export const asYearly = (
  options: Partial<Options>,
  dtstart: Date,
): Partial<Options> | null =>
  weekNumbersDiffer(options) ? null : withYearlySteps(options, dtstart);

/**
 * A yearly rule whose days include every day a daily or weekly rule's dates
 * fall on, to rule such a rule out quickly, or null when it has no date
 * filter. It leaves out what only picks among those days (INTERVAL, COUNT,
 * BYSETPOS, and times of day, for which rrule would make every time of each
 * day). A weekly rule with week 52 or 53 gets both, since a yearly rule can
 * give last year's last week the other number (see weekNumbersDiffer); its
 * other week numbers pick the weekly rule's days and maybe more.
 */
export function asYearlySuperset(
  options: Partial<Options>,
  dtstart: Date,
): Partial<Options> | null {
  const weeks = toList(options.byweekno);
  const lastWeeks =
    weekNumbersDiffer(options) &&
    weeks.some((week) => week === 52 || week === 53);
  return withYearlySteps(
    {
      ...options,
      interval: 1,
      count: null,
      bysetpos: null,
      byhour: null,
      byminute: null,
      bysecond: null,
      ...(lastWeeks ? { byweekno: [...new Set([...weeks, 52, 53])] } : {}),
    },
    dtstart,
  );
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
