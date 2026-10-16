import { DateTime } from "luxon";

/**
 * Calendar days for recurrence. rrule computes with Dates, so a calendar day
 * is represented as its midnight in UTC ("floating"), which gives the same
 * result in every time zone.
 */

const requireDay = (date: DateTime, from: string): string => {
  const day = date.toISODate();
  if (!date.isValid || !day) {
    throw new Error(`Invalid date "${from}"`);
  }
  return day;
};

/** The floating Date for a calendar day: its midnight in UTC. */
export const floatingDay = (day: string): Date =>
  DateTime.fromISO(day, { zone: "utc" }).toJSDate();

/** The last second of a calendar day, floating, for inclusive end dates. */
export const floatingEndOfDay = (day: string): Date =>
  DateTime.fromISO(day, { zone: "utc" }).endOf("day").toJSDate();

/** The calendar day of a floating Date. */
export const floatingCalendarDay = (date: Date): string =>
  requireDay(DateTime.fromJSDate(date, { zone: "utc" }), date.toISOString());

/** The calendar day of a Date in the machine's zone. */
export const localCalendarDay = (date: Date): string =>
  requireDay(DateTime.fromJSDate(date), date.toISOString());

/** The calendar day an ISO date or datetime falls on, in its own offset. */
export const calendarDayOf = (iso: string): string =>
  requireDay(DateTime.fromISO(iso, { setZone: true }), iso);

/** How a DTSTART or UNTIL value was written in the rule. */
export interface RawRuleDate {
  hasTime: boolean;
  /** Ends in Z: a real UTC instant rather than a floating wall-clock time. */
  utc: boolean;
}

const RULE_DATE =
  /(UNTIL=|DTSTART=|DTSTART(?:;[^:\n]*)?:)(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z?))?/gi;

const isPossible = ([y, m, d]: number[], [hh, mm, ss]: number[]): boolean =>
  DateTime.fromObject({ year: y, month: m, day: d }, { zone: "utc" }).isValid &&
  hh <= 23 &&
  mm <= 59 &&
  ss <= 59;

/**
 * The start and end values written in an RRULE string, and whether any is
 * impossible (2027-02-29, month 13, hour 24), which rrule would roll over.
 */
export function readRuleDates(rule: string): {
  start?: RawRuleDate;
  end?: RawRuleDate;
  impossible: boolean;
} {
  const dates: { start?: RawRuleDate; end?: RawRuleDate } = {};
  let impossible = false;
  for (const [, prefix, y, m, d, hh, mm, ss, z] of rule.matchAll(RULE_DATE)) {
    const kind = prefix.toUpperCase() === "UNTIL=" ? "end" : "start";
    dates[kind] = { hasTime: hh !== undefined, utc: z === "Z" };
    impossible ||= !isPossible(
      [Number(y), Number(m), Number(d)],
      [Number(hh ?? 0), Number(mm ?? 0), Number(ss ?? 0)],
    );
  }
  return { ...dates, impossible };
}
