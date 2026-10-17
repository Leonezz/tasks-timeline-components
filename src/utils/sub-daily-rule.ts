import { type Frequency, type Options, RRule } from "rrule";
import { DateTime } from "luxon";
import type { ParsedRecurrenceRule, TimesOfDay } from "./recurrence-rule";
import {
  floatingCalendarDay,
  floatingDay,
  floatingEndOfDay,
  localCalendarDay,
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
 * no day matches). A rule with a UTC start is stepped in UTC, as rrule steps
 * it, so its day filters and times of day are UTC ones; each date's day is
 * then read in the machine's zone.
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

const localEndOfDay = (day: string): number =>
  DateTime.fromISO(day).endOf("day").toMillis();

/**
 * Where a rule's steps are counted, as instants whose UTC fields are the
 * frame's wall-clock time: floating days, or real UTC for a UTC start.
 */
interface Frame {
  /** DTSTART, else the start day's midnight: no date comes before it. */
  start: number;
  until: number | null;
  /** Dates after this fall after `from`'s day. */
  after: number;
  /** The calendar day a date falls on. */
  dayOf: (date: number) => string;
}

function frameOf(rule: ParsedRecurrenceRule, from: string): Frame {
  if (rule.utcStartDateTime) {
    return {
      start: wallInstant(rule.utcStartDateTime),
      until: rule.utcEndDateTime
        ? wallInstant(rule.utcEndDateTime)
        : rule.end
          ? localEndOfDay(rule.end)
          : null,
      after: localEndOfDay(from),
      dayOf: (date) => localCalendarDay(new Date(date)),
    };
  }
  return {
    start: rule.startDateTime
      ? wallInstant(rule.startDateTime)
      : floatingDay(rule.start ?? from).getTime(),
    until: rule.endDateTime
      ? wallInstant(rule.endDateTime)
      : rule.end
        ? floatingEndOfDay(rule.end).getTime()
        : null,
    after: floatingEndOfDay(from).getTime(),
    dayOf: (date) => floatingCalendarDay(new Date(date)),
  };
}

/**
 * The steps on a frame's calendar day at or after `from`, from `start` and
 * up to `until`: how many, and the first.
 */
type DaySteps = (
  dayStart: number,
  from: number,
) => { count: number; first: number };

/** Every step counts: arithmetic over the steps that fall on the day. */
const allSteps =
  (start: number, step: number, until: number | null): DaySteps =>
  (dayStart, from) => {
    const low = Math.max(dayStart, start, from);
    const high = Math.min(dayStart + DAY_MS - 1, until ?? Infinity);
    const firstStep = Math.ceil((low - start) / step);
    return {
      count: high < low ? 0 : Math.floor((high - start) / step) - firstStep + 1,
      first: start + firstStep * step,
    };
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
): DaySteps | null {
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
  return (dayStart, from) => {
    const first = countBelow(offsets, Math.max(start, from) - dayStart);
    const end = countBelow(offsets, (until ?? Infinity) - dayStart + 1);
    return {
      count: Math.max(0, end - first),
      first: dayStart + offsets[first],
    };
  };
}

export type SubDailyResult =
  | { kind: "day"; day: string | null }
  | { kind: "never" };

const plusYears = (day: string): string =>
  floatingCalendarDay(
    DateTime.fromISO(day, { zone: "utc" })
      .plus({ years: SEARCH_YEARS })
      .toJSDate(),
  );

/** A rule's steps, each an hour, minute or second with dates. */
interface Steps {
  first: number;
  step: number;
  /** Where each step's dates fall, in ms from the step, sorted. */
  dates: number[];
}

/**
 * BYMINUTE or BYSECOND finer than the frequency put each hour's (or
 * minute's) dates at those minutes or seconds, which can fall on another
 * local day than the step where the UTC offset isn't whole hours; otherwise
 * a step is its one date. When all of the start's own hour or minute comes
 * before the start, its first date is a step later.
 */
function stepsOf(rule: ParsedRecurrenceRule, start: number): Steps {
  const step = stepOf(rule);
  if (!partsOf(rule).expansions) {
    return { first: start, step, dates: [0] };
  }
  const wall = DateTime.fromMillis(start, { zone: "utc" });
  const times = rule.timesOfDay ?? {};
  const minutes =
    rule.options.freq === RRule.HOURLY && times.byminute
      ? times.byminute
      : [wall.minute];
  const seconds = times.bysecond ?? [wall.second];
  const dates = minutes.flatMap((minute) =>
    seconds.map(
      (second) => ((minute - wall.minute) * 60 + second - wall.second) * 1000,
    ),
  );
  return {
    first: dates[dates.length - 1] < 0 ? start + step : start,
    step,
    dates,
  };
}

/**
 * The first of the dates of the step `at` that is at or after `limit`;
 * callers pick a step whose last date is.
 */
function firstDateOf(at: number, dates: number[], limit: number): number {
  const date = dates.find((offset) => at + offset >= limit);
  if (date === undefined) {
    throw new Error(
      `No date of the step at ${new Date(at).toISOString()} is at or after ${new Date(limit).toISOString()}`,
    );
  }
  return at + date;
}

/** The first date after `from`'s day when no day or time filter applies. */
function nextStep(
  rule: ParsedRecurrenceRule,
  { start, until, after, dayOf }: Frame,
  { first, step, dates }: Steps,
): SubDailyResult {
  // The first step with a date after `after`
  const before = after - dates[dates.length - 1];
  const steps = before < first ? 0 : Math.floor((before - first) / step) + 1;
  const next = firstDateOf(
    first + steps * step,
    dates,
    Math.max(after + 1, start),
  );
  const ended =
    (rule.options.count && steps >= rule.options.count) ||
    (until !== null && next > until);
  return { kind: "day", day: ended ? null : dayOf(next) };
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
  const frame = frameOf(rule, from);
  const steps = stepsOf(rule, frame.start);
  // A period of one step has one date, which position 1 or -1 picks
  const positions = toList(rule.options.bysetpos);
  if (positions.length > 0 && !positions.some((p) => p === 1 || p === -1)) {
    return { kind: "never" };
  }
  const options: Partial<Options> = { ...rule.options, bysetpos: null };
  const { filters } = partsOf(rule);
  if (!filters && !hasFilters(options)) {
    return nextStep(rule, frame, steps);
  }
  // Steps whose first date is within the end
  const until = frame.until === null ? null : frame.until - steps.dates[0];
  const counter = filters
    ? filteredSteps(rule, steps.first, steps.step, until)
    : allSteps(steps.first, steps.step, until);
  return counter
    ? searchDays(rule, options, counter, { from, frame, steps, ruleText })
    : { kind: "never" };
}

interface Search {
  from: string;
  frame: Frame;
  steps: Steps;
  ruleText: string;
}

/**
 * Walks the frame's matching days, counting their steps toward COUNT, and
 * returns the day of the first date after `from`'s day.
 */
function searchDays(
  rule: ParsedRecurrenceRule,
  options: Partial<Options>,
  stepsOn: DaySteps,
  { from, frame, steps: { first: firstStep, dates }, ruleText }: Search,
): SubDailyResult {
  const { start, until, after, dayOf } = frame;
  const startDay = floatingCalendarDay(new Date(firstStep));
  const afterDay = floatingCalendarDay(new Date(after + 1));
  const count = rule.options.count ?? 0;
  const searchFrom = startDay > from ? startDay : from;
  // COUNT counts from the start; otherwise only days with a later step matter
  const first = count || startDay > afterDay ? startDay : afterDay;
  const horizon = plusYears(searchFrom);
  const untilDay = until === null ? null : floatingCalendarDay(new Date(until));
  const last = untilDay !== null && untilDay < horizon ? untilDay : horizon;
  let seen = 0;
  const found =
    first <= last
      ? findInMatchingDays<SubDailyResult>(options, first, last, (day) => {
          const dayStart = floatingDay(day).getTime();
          const steps = stepsOn(dayStart, dayStart).count;
          // Steps with a date after `after`
          const later = stepsOn(dayStart, after + 1 - dates[dates.length - 1]);
          // Within COUNT when fewer steps came before the first later one
          if (
            later.count > 0 &&
            (!count || seen + steps - later.count < count)
          ) {
            const next = firstDateOf(
              later.first,
              dates,
              Math.max(after + 1, start),
            );
            return {
              kind: "day",
              day: until !== null && next > until ? null : dayOf(next),
            };
          }
          seen += steps;
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
