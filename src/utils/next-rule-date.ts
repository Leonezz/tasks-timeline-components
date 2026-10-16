import { type Frequency, type Options, RRule, Weekday } from "rrule";
import { DateTime } from "luxon";
import {
  floatingCalendarDay,
  floatingDay,
  floatingEndOfDay,
  type ParsedRecurrenceRule,
} from "./recurrence-rule";

const isSet = (value: unknown): boolean =>
  value !== undefined &&
  value !== null &&
  !(Array.isArray(value) && value.length === 0);

const DAY_FILTERS = [
  "bymonth",
  "bymonthday",
  "byweekday",
  "bysetpos",
  "byyearday",
  "byweekno",
  "byeaster",
] as const;

const hasFilters = (options: Partial<Options>): boolean =>
  DAY_FILTERS.some((key) => isSet(options[key]));

/**
 * "every month" / "every 2 years" text rules with no day selectors. Obsidian
 * Tasks moves these to the same day of month, or the month's last day when the
 * month is shorter (Jan 31 -> Feb 28), instead of skipping to a month that has
 * the day as RFC 5545 does.
 */
const isPlainPeriodTextRule = (rule: ParsedRecurrenceRule): boolean =>
  rule.source === "text" &&
  (rule.options.freq === RRule.MONTHLY || rule.options.freq === RRule.YEARLY) &&
  !hasFilters(rule.options);

const nextPlainPeriodDay = (
  rule: ParsedRecurrenceRule,
  from: string,
): string => {
  const step = rule.options.interval ?? 1;
  const next = DateTime.fromISO(from, { zone: "utc" }).plus(
    rule.options.freq === RRule.MONTHLY ? { months: step } : { years: step },
  );
  return floatingCalendarDay(next.toJSDate());
};

const SUB_DAILY_MS: Partial<Record<Frequency, number>> = {
  [RRule.HOURLY]: 3_600_000,
  [RRule.MINUTELY]: 60_000,
  [RRule.SECONDLY]: 1_000,
};

/**
 * Hourly, minutely and secondly rules without filters, by arithmetic: the
 * first step after the end of `from`. rrule would step through every minute
 * since the start date, which can take seconds. "every 48 hours" moves two
 * days; "every hour" moves one.
 */
const nextSubDailyDay = (
  rule: ParsedRecurrenceRule,
  from: string,
  stepMs: number,
): string | null => {
  const step = stepMs * (rule.options.interval ?? 1);
  const start = floatingDay(rule.start ?? from).getTime();
  const after = floatingEndOfDay(from).getTime();
  const steps = after < start ? 0 : Math.floor((after - start) / step) + 1;
  if (rule.options.count && steps >= rule.options.count) {
    return null;
  }
  return floatingCalendarDay(new Date(start + steps * step));
};

const ALL_WEEKDAYS = [
  RRule.MO,
  RRule.TU,
  RRule.WE,
  RRule.TH,
  RRule.FR,
  RRule.SA,
  RRule.SU,
];
const DATE_FILTERS = [
  "bymonth",
  "bymonthday",
  "byyearday",
  "byweekno",
  "byeaster",
] as const;

const toList = <T>(value: T | T[] | null | undefined): T[] =>
  value === undefined || value === null
    ? []
    : Array.isArray(value)
      ? value
      : [value];

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
 * A daily or weekly rule limited by month or day of month produces the same
 * dates as a yearly rule with those filters, which rrule steps through a year
 * at a time instead of a day at a time. That keeps a rule that never matches
 * (February 30th) from taking seconds to rule out.
 */
function asYearly(
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
  // As rrule's own defaults: a weekly rule without days repeats on its
  // start's weekday, unless a day of the month or year, a week number or
  // Easter picks the days
  const onStartWeekday =
    options.freq === RRule.WEEKLY &&
    !isSet(options.bymonthday) &&
    !isSet(options.byyearday) &&
    !isSet(options.byweekno) &&
    !isSet(options.byeaster);
  const startWeekday = ALL_WEEKDAYS[(dtstart.getUTCDay() + 6) % 7];
  return {
    ...options,
    freq: RRule.YEARLY,
    byweekday: weekdays ?? (onStartWeekday ? [startWeekday] : ALL_WEEKDAYS),
  };
}

const DAY_MS = 86_400_000;

/**
 * An hourly rule with day filters can land on any hour of a matching day, so
 * it is computed as daily, keeping its interval when that is whole days
 * ("every 48 hours" is every 2 days).
 */
const asDaily = (
  options: Partial<Options>,
  stepMs: number,
): Partial<Options> => {
  const days = ((options.interval ?? 1) * stepMs) / DAY_MS;
  return {
    ...options,
    freq: RRule.DAILY,
    interval: Number.isInteger(days) ? days : 1,
  };
};

/**
 * BYSETPOS picks from each period's dates. A daily period has one date, so
 * position 1 or -1 picks it and any other position picks nothing; rrule
 * would otherwise scan to year 9999 to find that out. Returns null when the
 * rule can never match.
 */
const withDailySetPos = (
  options: Partial<Options>,
): Partial<Options> | null => {
  if (options.freq !== RRule.DAILY || !isSet(options.bysetpos)) {
    return options;
  }
  const positions = toList(options.bysetpos);
  return positions.includes(1) || positions.includes(-1)
    ? { ...options, bysetpos: null }
    : null;
};

/**
 * The calendar day of a rule's next date after `from` (YYYY-MM-DD), or null
 * when the rule has ended by its UNTIL or COUNT. Throws when a rule without an
 * end has no later date at all.
 */
export function nextRuleDay(
  rule: ParsedRecurrenceRule,
  from: string,
  ruleText: string,
): string | null {
  if (isPlainPeriodTextRule(rule)) {
    return nextPlainPeriodDay(rule, from);
  }
  const subDailyStep =
    rule.options.freq === undefined
      ? undefined
      : SUB_DAILY_MS[rule.options.freq];
  if (subDailyStep !== undefined && !hasFilters(rule.options)) {
    return nextSubDailyDay(rule, from, subDailyStep);
  }
  const options = withDailySetPos(
    subDailyStep === undefined
      ? rule.options
      : asDaily(rule.options, subDailyStep),
  );
  const dtstart = floatingDay(rule.start ?? from);
  const until = rule.end ? floatingEndOfDay(rule.end) : null;
  // After the whole day, so a rule never lands on the day it starts from
  const after = floatingEndOfDay(from);
  const noLaterDate = (): null => {
    if (rule.end !== undefined || rule.options.count) {
      return null;
    }
    throw new Error(
      `The recurrence rule "${ruleText}" has no date after ${from}.`,
    );
  };

  if (!options) {
    return noLaterDate();
  }

  // Cheap check first: a rule that skips periods can only match where the
  // same rule without skipping does (whose COUNT would mean other dates)
  const skipsPeriods = (options.interval ?? 1) !== 1;
  const yearly = asYearly(
    { ...options, interval: 1, ...(skipsPeriods ? { count: null } : {}) },
    dtstart,
  );
  if (yearly) {
    const candidate = new RRule({ ...yearly, dtstart, until }).after(after);
    if (!candidate) {
      return noLaterDate();
    }
    if (!skipsPeriods) {
      return floatingCalendarDay(candidate);
    }
  }
  const next = new RRule({ ...options, dtstart, until }).after(after);
  return next ? floatingCalendarDay(next) : noLaterDate();
}
