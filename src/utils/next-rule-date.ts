import { type Options, RRule } from "rrule";
import { DateTime } from "luxon";
import {
  floatingCalendarDay,
  floatingDay,
  floatingEndOfDay,
  type ParsedRecurrenceRule,
} from "./recurrence-rule";
import { localCalendarDay } from "./recurrence-dates";
import {
  asYearly,
  asYearlySuperset,
  hasFilters,
  isSet,
  maxDaysPerWeek,
  noLaterDate,
  toList,
} from "./day-rule-search";
import { isSubDaily, nextSubDailyDay } from "./sub-daily-rule";
import { timesOfDayChangeDays } from "./rule-boundaries";

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

/** How many dates a rule's times of day give each day. */
const datesPerDay = (rule: ParsedRecurrenceRule): number =>
  (["byhour", "byminute", "bysecond"] as const).reduce(
    (product, key) => product * (rule.timesOfDay?.[key]?.length || 1),
    1,
  );

/**
 * BYSETPOS picks from each period's dates. A daily period has one date per
 * time of day, so a position past those picks nothing; rrule would otherwise
 * scan to year 9999 to find that out. With one date a day, position 1 or -1
 * picks every day. Returns null when the rule can never match.
 */
const withDailySetPos = (
  options: Partial<Options>,
  perDay: number,
): Partial<Options> | null => {
  if (options.freq !== RRule.DAILY || !isSet(options.bysetpos)) {
    return options;
  }
  const positions = toList(options.bysetpos);
  if (!positions.some((position) => Math.abs(position) <= perDay)) {
    return null;
  }
  return perDay === 1 ? { ...options, bysetpos: null } : options;
};

/**
 * Whether BYSETPOS never picks a date of a weekly rule: every position is
 * past the most dates a week can have, its days times its times of day.
 * rrule picks a week's first date for a negative position past its dates,
 * so only positive ones are ruled out. rrule makes a rule with BYEASTER
 * yearly.
 */
const weeklySetPosNeverPicks = (
  options: Partial<Options>,
  perDay: number,
): boolean => {
  if (
    options.freq !== RRule.WEEKLY ||
    !isSet(options.bysetpos) ||
    isSet(options.byeaster)
  ) {
    return false;
  }
  const most = maxDaysPerWeek(options) * perDay;
  return toList(options.bysetpos).every((position) => position > most);
};

const wallDate = (wall: string): Date =>
  DateTime.fromISO(wall, { zone: "utc" }).toJSDate();

const localEndOfDay = (day: string): Date =>
  DateTime.fromISO(day).endOf("day").toJSDate();

/**
 * Where a daily or longer rule's dates are computed: on floating days, or,
 * for a UTC start whose times of day change the rule's days, in UTC as rrule
 * steps it, with each date's day read in the machine's zone.
 */
interface DayLevelFrame {
  /** The start day's midnight and the end day's last moment, as days. */
  startDay: Date;
  endOfEndDay: Date | null;
  /** Days after this can hold a date after `from`'s day. */
  daysAfter: Date;
  dtstart: Date;
  until: Date | null;
  /** Dates after this fall after `from`'s day. */
  after: Date;
  dayOf: (date: Date) => string;
}

function floatingFrame(
  rule: ParsedRecurrenceRule,
  from: string,
  withTimes: boolean,
): DayLevelFrame {
  const startDay = floatingDay(rule.start ?? from);
  const endOfEndDay = rule.end ? floatingEndOfDay(rule.end) : null;
  // After the whole day, so a rule never lands on the day it starts from
  const after = floatingEndOfDay(from);
  return {
    startDay,
    endOfEndDay,
    daysAfter: after,
    dtstart:
      withTimes && rule.startDateTime ? wallDate(rule.startDateTime) : startDay,
    until:
      withTimes && rule.endDateTime ? wallDate(rule.endDateTime) : endOfEndDay,
    after,
    dayOf: floatingCalendarDay,
  };
}

function utcFrame(
  rule: ParsedRecurrenceRule,
  utcStart: string,
  from: string,
): DayLevelFrame {
  const dtstart = wallDate(utcStart);
  const until = rule.utcEndDateTime
    ? wallDate(rule.utcEndDateTime)
    : rule.end
      ? localEndOfDay(rule.end)
      : null;
  const after = localEndOfDay(from);
  const utcDay = (date: Date) => floatingDay(floatingCalendarDay(date));
  return {
    startDay: utcDay(dtstart),
    endOfEndDay: until ? floatingEndOfDay(floatingCalendarDay(until)) : null,
    // A date after `after` falls on its UTC day or later
    daysAfter: new Date(utcDay(after).getTime() - 1),
    dtstart,
    until,
    after,
    dayOf: localCalendarDay,
  };
}

/** The day of a daily or longer rule's next date after `from`, or null. */
function nextDayLevelDay(
  rule: ParsedRecurrenceRule,
  from: string,
  ruleText: string,
): string | null {
  const withTimes = timesOfDayChangeDays(rule);
  const perDay = withTimes ? datesPerDay(rule) : 1;
  const options = withDailySetPos(
    withTimes ? { ...rule.options, ...rule.timesOfDay } : rule.options,
    perDay,
  );
  if (!options || weeklySetPosNeverPicks(options, perDay)) {
    return noLaterDate(rule, from, ruleText);
  }
  const frame =
    withTimes && rule.utcStartDateTime
      ? utcFrame(rule, rule.utcStartDateTime, from)
      : floatingFrame(rule, from, withTimes);

  // The rule's own days, when a yearly rule has the same dates
  const same = withTimes ? null : asYearly(options, frame.startDay);
  // Else a cheap check first: a rule that skips periods, counts times of day
  // or picks positions can only match on the plain daily or weekly rule's
  // days. Without it, rrule scans a rule whose day filters never match to
  // the year 9999, past any UNTIL.
  const yearly = same ?? asYearlySuperset(options, frame.startDay);
  if (yearly) {
    const candidate = new RRule({
      ...yearly,
      dtstart: frame.startDay,
      until: frame.endOfEndDay,
    }).after(frame.daysAfter);
    if (!candidate) {
      return noLaterDate(rule, from, ruleText);
    }
    if (same) {
      return floatingCalendarDay(candidate);
    }
  }
  const next = new RRule({
    ...options,
    dtstart: frame.dtstart,
    until: frame.until,
  }).after(frame.after);
  return next ? frame.dayOf(next) : noLaterDate(rule, from, ruleText);
}

/**
 * The calendar day of a rule's next date after `from` (YYYY-MM-DD), or null
 * when the rule has ended by its UNTIL or COUNT. Throws when a rule without an
 * end has no later date at all, or when it isn't supported (some hourly,
 * minutely and secondly rules; see unsupportedSubDailyReason).
 */
export function nextRuleDay(
  rule: ParsedRecurrenceRule,
  from: string,
  ruleText: string,
): string | null {
  if (isPlainPeriodTextRule(rule)) {
    return nextPlainPeriodDay(rule, from);
  }
  if (!isSubDaily(rule.options.freq)) {
    return nextDayLevelDay(rule, from, ruleText);
  }
  const next = nextSubDailyDay(rule, from, ruleText);
  return next.kind === "day" ? next.day : noLaterDate(rule, from, ruleText);
}
