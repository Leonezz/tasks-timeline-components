import { type Options, RRule } from "rrule";
import { DateTime } from "luxon";
import {
  floatingCalendarDay,
  floatingDay,
  floatingEndOfDay,
  type ParsedRecurrenceRule,
} from "./recurrence-rule";
import {
  asYearly,
  hasFilters,
  isSet,
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

const wallDate = (wall: string): Date =>
  DateTime.fromISO(wall, { zone: "utc" }).toJSDate();

/** The day of a daily or longer rule's next date after `from`, or null. */
function nextDayLevelDay(
  rule: ParsedRecurrenceRule,
  from: string,
  ruleText: string,
): string | null {
  const withTimes = timesOfDayChangeDays(rule);
  const options = withDailySetPos(
    withTimes ? { ...rule.options, ...rule.timesOfDay } : rule.options,
    withTimes ? datesPerDay(rule) : 1,
  );
  if (!options) {
    return noLaterDate(rule, from, ruleText);
  }
  const startDay = floatingDay(rule.start ?? from);
  const endOfEndDay = rule.end ? floatingEndOfDay(rule.end) : null;
  // After the whole day, so a rule never lands on the day it starts from
  const after = floatingEndOfDay(from);

  // Cheap check first: a rule that skips periods, counts times of day or
  // picks positions can only match where the plain daily or weekly rule
  // does (whose COUNT would mean other dates)
  const exact = (options.interval ?? 1) === 1 && !withTimes;
  const yearly = asYearly(
    { ...options, interval: 1, ...(exact ? {} : { count: null }) },
    startDay,
  );
  if (yearly) {
    const candidate = new RRule({
      ...yearly,
      dtstart: startDay,
      until: endOfEndDay,
    }).after(after);
    if (!candidate) {
      return noLaterDate(rule, from, ruleText);
    }
    if (exact) {
      return floatingCalendarDay(candidate);
    }
  }
  const next = new RRule({
    ...options,
    dtstart:
      withTimes && rule.startDateTime ? wallDate(rule.startDateTime) : startDay,
    until:
      withTimes && rule.endDateTime ? wallDate(rule.endDateTime) : endOfEndDay,
  }).after(after);
  return next ? floatingCalendarDay(next) : noLaterDate(rule, from, ruleText);
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
