import { DateTime } from "luxon";
import { RRule, type Frequency, type Options } from "rrule";
import type { RawRuleDate } from "./recurrence-dates";

/**
 * Reading an RRULE's start (DTSTART) and end (UNTIL) as calendar days and
 * wall-clock times. A rule's dates are read in one frame: as written (the
 * UTC fields rrule gives floating and TZID times), in its TZID zone, or in
 * the machine's zone for UTC times earlier versions wrote at local midnight.
 */

/** BYHOUR, BYMINUTE and BYSECOND of a rule, each sorted without duplicates. */
export interface TimesOfDay {
  byhour?: number[];
  byminute?: number[];
  bysecond?: number[];
}

export interface RuleBoundaries {
  start?: string;
  end?: string;
  startDateTime?: string;
  endDateTime?: string;
}

/** A zone to read an instant in, or null for its UTC fields as written. */
type Frame = string | null;

const TIME_LIMITS = { byhour: 23, byminute: 59, bysecond: 59 } as const;
const WALL_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";

const numbers = (value: unknown): number[] =>
  (Array.isArray(value) ? value : value == null ? [] : [value]).map(Number);

/**
 * The rule's times of day, or null when one is out of range (BYHOUR=24),
 * which rrule would roll over into the next day.
 */
export function readTimesOfDay(
  options: Partial<Options>,
): TimesOfDay | undefined | null {
  const parts = (["byhour", "byminute", "bysecond"] as const).map(
    (key) =>
      [key, [...new Set(numbers(options[key]))].sort((a, b) => a - b)] as const,
  );
  const outOfRange = parts.some(([key, values]) =>
    values.some((v) => !Number.isInteger(v) || v < 0 || v > TIME_LIMITS[key]),
  );
  if (outOfRange) {
    return null;
  }
  const set = parts.filter(([, values]) => values.length > 0);
  return set.length > 0 ? (Object.fromEntries(set) as TimesOfDay) : undefined;
}

/** The wall-clock time of `date` in `frame`, as a UTC DateTime. */
const wallTime = (date: Date, frame: Frame): DateTime => {
  const read = DateTime.fromJSDate(date, { zone: frame ?? "utc" });
  if (!read.isValid) {
    throw new Error(`Invalid date in time zone ${frame}`);
  }
  return read.setZone("utc", { keepLocalTime: true });
};

const utcTime = (date: Date): string => date.toISOString().slice(11, 19);

/**
 * Starts are read as written, except UTC times other than midnight, which
 * earlier versions wrote at local midnight: those are read in local time.
 */
const startFrame = (
  date: Date,
  raw: RawRuleDate | undefined,
  tzid: string | undefined,
): Frame =>
  (raw && (!raw.hasTime || !raw.utc)) || tzid || utcTime(date) === "00:00:00"
    ? null
    : "local";

/**
 * Ends are read as written when floating, in the TZID zone when UTC, else
 * in the start's frame; without a start, UTC midnight and 23:59:59 (this
 * library's encoding) as written and other times (earlier versions' local
 * end of day) in local time.
 */
function endFrame(
  date: Date,
  raw: RawRuleDate | undefined,
  tzid: string | undefined,
  start: Frame | undefined,
): Frame {
  if (raw && (!raw.hasTime || !raw.utc)) {
    return null;
  }
  if (tzid) {
    return tzid;
  }
  if (start !== undefined) {
    return start;
  }
  const time = utcTime(date);
  return time === "00:00:00" || time === "23:59:59" ? null : "local";
}

const SUB_DAILY = new Set<Frequency>([
  RRule.HOURLY,
  RRule.MINUTELY,
  RRule.SECONDLY,
]);

/**
 * Whether a rule's times of day change which days it has: on hourly and
 * shorter rules they pick steps, and on longer ones COUNT counts each and
 * BYSETPOS picks among them. Otherwise a date's time doesn't move its day.
 */
export const timesOfDayChangeDays = (rule: {
  options: Partial<Options>;
  timesOfDay?: TimesOfDay;
}): boolean => {
  const { freq, count, bysetpos } = rule.options;
  return (
    rule.timesOfDay !== undefined &&
    ((freq !== undefined && SUB_DAILY.has(freq)) ||
      Boolean(count) ||
      (Array.isArray(bysetpos) ? bysetpos.length > 0 : bysetpos != null))
  );
};

const secondsOfDay = (wall: DateTime): number =>
  wall.hour * 3600 + wall.minute * 60 + wall.second;

/** The first time of day a date of the rule can have, in seconds. */
const firstTimeOfDay = (
  start: DateTime | undefined,
  times: TimesOfDay | undefined,
): number => {
  const first = (values: number[] | undefined, fallback: number) =>
    values?.[0] ?? fallback;
  return (
    first(times?.byhour, start?.hour ?? 0) * 3600 +
    first(times?.byminute, start?.minute ?? 0) * 60 +
    first(times?.bysecond, start?.second ?? 0)
  );
};

const dayOf = (wall: DateTime): string => {
  const day = wall.toISODate();
  if (!day) {
    throw new Error("Invalid rule date");
  }
  return day;
};

interface BoundaryInput {
  dtstart?: Date | null;
  until?: Date | null;
  tzid?: string;
  raw: { start?: RawRuleDate; end?: RawRuleDate };
  freq: Frequency;
  times?: TimesOfDay;
}

/**
 * The start and end days of an RRULE, and their wall-clock times when they
 * have one. For daily and longer rules the end is the last day a date can
 * fall on: a day earlier when UNTIL's time comes before the first time of
 * day a date has (its start's time, or BYHOUR/BYMINUTE/BYSECOND). Hourly
 * and shorter rules end on UNTIL's own day; their dates are compared with
 * `endDateTime`.
 */
export function readRuleBoundaries(input: BoundaryInput): RuleBoundaries {
  const { dtstart, until, tzid, raw, freq, times } = input;
  const frame = dtstart ? startFrame(dtstart, raw.start, tzid) : undefined;
  const start = dtstart ? wallTime(dtstart, frame ?? null) : undefined;
  const boundaries: RuleBoundaries = {};
  if (start) {
    boundaries.start = dayOf(start);
    if (secondsOfDay(start) !== 0) {
      boundaries.startDateTime = start.toFormat(WALL_FORMAT);
    }
  }
  if (!until) {
    return boundaries;
  }
  const end = wallTime(until, endFrame(until, raw.end, tzid, frame));
  if (raw.end && !raw.end.hasTime) {
    return { ...boundaries, end: dayOf(end) };
  }
  const endsBeforeFirstTime =
    !SUB_DAILY.has(freq) && secondsOfDay(end) < firstTimeOfDay(start, times);
  return {
    ...boundaries,
    end: dayOf(endsBeforeFirstTime ? end.minus({ days: 1 }) : end),
    ...(secondsOfDay(end) !== 86_399
      ? { endDateTime: end.toFormat(WALL_FORMAT) }
      : {}),
  };
}
