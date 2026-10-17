import { type Frequency, type Options, RRule } from "rrule";
import { DateTime } from "luxon";
import type { ParsedRecurrenceRule, TimesOfDay } from "./recurrence-rule";
import {
  floatingCalendarDay,
  floatingDay,
  floatingEndOfDay,
} from "./recurrence-dates";
import {
  hasFilters,
  isSet,
  toList,
  findInMatchingDays,
} from "./day-rule-search";

/**
 * Hourly, minutely and secondly rules, day by day. Their dates are steps
 * from the start (DTSTART's time, else the start day's midnight); day
 * filters keep the steps on matching days and BYHOUR, BYMINUTE or BYSECOND
 * at or finer than the frequency keep the steps at those times. Each
 * matching day's steps are counted with arithmetic, so the answer is exact
 * without stepping through every hour or second as rrule does (which never
 * returns when the times can't be reached, and scans to the year 9999 when
 * no day matches).
 */

const STEP_MS: Partial<Record<Frequency, number>> = {
  [RRule.HOURLY]: 3_600_000,
  [RRule.MINUTELY]: 60_000,
  [RRule.SECONDLY]: 1_000,
};
const DAY_MS = 86_400_000;
/** How far after `from` (or the start) a date is searched for. */
const SEARCH_YEARS = 10;

/** Time parts that choose which steps count, per frequency. */
const FILTERING_TIMES: Partial<Record<Frequency, (keyof TimesOfDay)[]>> = {
  [RRule.HOURLY]: ["byhour"],
  [RRule.MINUTELY]: ["byhour", "byminute"],
  [RRule.SECONDLY]: ["byhour", "byminute", "bysecond"],
};

export const isSubDaily = (freq: Frequency | undefined): boolean =>
  freq !== undefined && STEP_MS[freq] !== undefined;

const stepOf = (rule: ParsedRecurrenceRule): number =>
  (STEP_MS[rule.options.freq as Frequency] ?? 0) * (rule.options.interval ?? 1);

const partsOf = (rule: ParsedRecurrenceRule) => {
  const filtering = FILTERING_TIMES[rule.options.freq as Frequency] ?? [];
  const set = (key: keyof TimesOfDay) =>
    (rule.timesOfDay?.[key]?.length ?? 0) > 0;
  const keys = ["byhour", "byminute", "bysecond"] as const;
  return {
    filters: keys.some((key) => filtering.includes(key) && set(key)),
    expansions: keys.some((key) => !filtering.includes(key) && set(key)),
  };
};

/**
 * Why an hourly, minutely or secondly rule can't be computed by day, or null
 * when it can (or isn't one).
 */
export function unsupportedSubDailyReason(
  rule: ParsedRecurrenceRule,
): string | null {
  if (!isSubDaily(rule.options.freq)) {
    return null;
  }
  const { filters, expansions } = partsOf(rule);
  const step = stepOf(rule);
  if (filters && DAY_MS % step !== 0 && step % DAY_MS !== 0) {
    return "BYHOUR, BYMINUTE or BYSECOND on an hourly, minutely or secondly rule whose step neither divides a day nor is whole days pick different times each day";
  }
  if (
    expansions &&
    (rule.options.count || isSet(rule.options.bysetpos) || rule.endDateTime)
  ) {
    return "BYMINUTE or BYSECOND within each hour or minute, with COUNT, BYSETPOS or an UNTIL time, change which days it has";
  }
  return null;
}

const wallInstant = (wall: string): number =>
  DateTime.fromISO(wall, { zone: "utc" }).toMillis();

/** The steps on a calendar day, from `start` and up to `until`. */
type DayCounter = (dayStart: number) => number;

/** Every step counts: arithmetic over the steps that fall on the day. */
const allSteps =
  (start: number, step: number, until: number | null): DayCounter =>
  (dayStart) => {
    const low = Math.max(dayStart, start);
    const high = Math.min(dayStart + DAY_MS - 1, until ?? Infinity);
    if (high < low) {
      return 0;
    }
    return (
      Math.floor((high - start) / step) - Math.ceil((low - start) / step) + 1
    );
  };

const passes = (times: TimesOfDay, filtering: (keyof TimesOfDay)[]) => {
  const parts: Record<keyof TimesOfDay, (second: number) => number> = {
    byhour: (s) => Math.floor(s / 3600),
    byminute: (s) => Math.floor(s / 60) % 60,
    bysecond: (s) => s % 60,
  };
  return (second: number) =>
    filtering.every((key) => {
      const allowed = times[key];
      return !allowed?.length || allowed.includes(parts[key](second));
    });
};

/** How many of the sorted `values` are below `limit`. */
const countBelow = (values: number[], limit: number): number => {
  let low = 0;
  let high = values.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (values[middle] < limit) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }
  return low;
};

/**
 * Steps of whole days keep the start's time of day, and steps that divide a
 * day land at the same times every day; only the times the time filters
 * allow count. Returns null when no time is allowed.
 */
function filteredSteps(
  rule: ParsedRecurrenceRule,
  start: number,
  step: number,
  until: number | null,
): DayCounter | null {
  const filtering = FILTERING_TIMES[rule.options.freq as Frequency] ?? [];
  const allows = passes(rule.timesOfDay ?? {}, filtering);
  const startOffset = ((start % DAY_MS) + DAY_MS) % DAY_MS;
  if (step % DAY_MS === 0) {
    return allows(Math.floor(startOffset / 1000))
      ? allSteps(start, step, until)
      : null;
  }
  const offsets: number[] = [];
  for (let at = startOffset % step; at < DAY_MS; at += step) {
    if (allows(Math.floor(at / 1000))) {
      offsets.push(at);
    }
  }
  if (offsets.length === 0) {
    return null;
  }
  return (dayStart) =>
    Math.max(
      0,
      countBelow(offsets, (until ?? Infinity) - dayStart + 1) -
        countBelow(offsets, start - dayStart),
    );
}

export type SubDailyResult =
  | { kind: "day"; day: string | null }
  | { kind: "never" };

const nextDayOf = (day: string): string =>
  floatingCalendarDay(new Date(floatingDay(day).getTime() + DAY_MS));

const plusYears = (day: string): string =>
  floatingCalendarDay(
    DateTime.fromISO(day, { zone: "utc" })
      .plus({ years: SEARCH_YEARS })
      .toJSDate(),
  );

/**
 * BYMINUTE or BYSECOND finer than the frequency put each hour's (or
 * minute's) dates at those minutes or seconds. When all of the start's own
 * period come before the start, its first date is a step later.
 */
function firstPeriodWithDates(
  rule: ParsedRecurrenceRule,
  start: number,
  step: number,
): number {
  if (!partsOf(rule).expansions) {
    return start;
  }
  const wall = DateTime.fromMillis(start, { zone: "utc" });
  const latest = (values: number[] | undefined, fallback: number) =>
    values?.length ? values[values.length - 1] : fallback;
  const times = rule.timesOfDay ?? {};
  const lastDate = wall.set({
    ...(rule.options.freq === RRule.HOURLY
      ? { minute: latest(times.byminute, wall.minute) }
      : {}),
    second: latest(times.bysecond, wall.second),
  });
  return lastDate.toMillis() < start ? start + step : start;
}

/** The first step after `after` when no day or time filter applies. */
function nextStep(
  rule: ParsedRecurrenceRule,
  start: number,
  step: number,
  until: number | null,
  after: number,
): SubDailyResult {
  const steps = after < start ? 0 : Math.floor((after - start) / step) + 1;
  const next = start + steps * step;
  const ended =
    (rule.options.count && steps >= rule.options.count) ||
    (until !== null && next > until);
  return {
    kind: "day",
    day: ended ? null : floatingCalendarDay(new Date(next)),
  };
}

/**
 * The calendar day of an hourly, minutely or secondly rule's next date after
 * `from`, null when it has ended, or "never" when its filters are never met.
 * Throws when the rule isn't supported (see unsupportedSubDailyReason) or
 * has no date within ten years.
 */
export function nextSubDailyDay(
  rule: ParsedRecurrenceRule,
  from: string,
  ruleText: string,
): SubDailyResult {
  const reason = unsupportedSubDailyReason(rule);
  if (reason) {
    throw new Error(unsupportedMessage(ruleText, reason));
  }
  const step = stepOf(rule);
  const start = firstPeriodWithDates(
    rule,
    rule.startDateTime
      ? wallInstant(rule.startDateTime)
      : floatingDay(rule.start ?? from).getTime(),
    step,
  );
  const until = rule.endDateTime
    ? wallInstant(rule.endDateTime)
    : rule.end
      ? floatingEndOfDay(rule.end).getTime()
      : null;
  // A period of one step has one date, which position 1 or -1 picks
  const positions = toList(rule.options.bysetpos);
  if (positions.length > 0 && !positions.some((p) => p === 1 || p === -1)) {
    return { kind: "never" };
  }
  const options: Partial<Options> = { ...rule.options, bysetpos: null };
  const { filters } = partsOf(rule);
  if (!filters && !hasFilters(options)) {
    return nextStep(rule, start, step, until, floatingEndOfDay(from).getTime());
  }
  const counter = filters
    ? filteredSteps(rule, start, step, until)
    : allSteps(start, step, until);
  return counter
    ? searchDays(rule, options, counter, { from, start, until, ruleText })
    : { kind: "never" };
}

interface Search {
  from: string;
  start: number;
  until: number | null;
  ruleText: string;
}

/**
 * Walks the matching days, counting their steps toward COUNT, and returns
 * the first day after `from` that has a step.
 */
function searchDays(
  rule: ParsedRecurrenceRule,
  options: Partial<Options>,
  stepsOn: DayCounter,
  { from, start, until, ruleText }: Search,
): SubDailyResult {
  const startDay = floatingCalendarDay(new Date(start));
  const count = rule.options.count ?? 0;
  const searchFrom = startDay > from ? startDay : from;
  // COUNT counts from the start; otherwise only later days matter
  const first = count || startDay > from ? startDay : nextDayOf(from);
  const horizon = plusYears(searchFrom);
  const untilDay = until === null ? null : floatingCalendarDay(new Date(until));
  const last = untilDay !== null && untilDay < horizon ? untilDay : horizon;
  let seen = 0;
  const found =
    first <= last
      ? findInMatchingDays<SubDailyResult>(options, first, last, (day) => {
          const steps = stepsOn(floatingDay(day).getTime());
          seen += steps;
          if (steps > 0 && day > from) {
            return { kind: "day", day };
          }
          return count && seen >= count
            ? { kind: "day", day: null }
            : undefined;
        })
      : undefined;
  if (found) {
    return found;
  }
  if (last === untilDay) {
    return { kind: "day", day: null };
  }
  throw new Error(
    `The recurrence rule "${ruleText}" has no date within ${SEARCH_YEARS} years after ${searchFrom}; hourly, minutely and secondly rules with filters are only searched that far.`,
  );
}

/** What to use instead of an unsupported rule. */
export const DAY_BASED_ADVICE =
  "Tasks are day-based; use FREQ=DAILY (with BYDAY, BYMONTHDAY and the like to pick days) instead.";

const unsupportedMessage = (ruleText: string, reason: string): string =>
  `The recurrence rule "${ruleText}" isn't supported: ${reason}. ${DAY_BASED_ADVICE}`;
