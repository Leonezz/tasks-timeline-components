import { type Options, RRule } from "rrule";
import { DateTime, IANAZone } from "luxon";
import {
  floatingCalendarDay,
  localCalendarDay,
  readRuleDates,
  type RawRuleDate,
} from "./recurrence-dates";

export {
  calendarDayOf,
  floatingCalendarDay,
  floatingDay,
  floatingEndOfDay,
} from "./recurrence-dates";

/**
 * Reading stored recurrence rules. A rule is either RRULE syntax
 * ("FREQ=WEEKLY;BYDAY=MO") or rrule's English text, which is what Obsidian
 * Tasks lines use ("every week", "every week when done").
 * Start and end dates are calendar days (YYYY-MM-DD).
 */

export const RECURRENCE_RULE_HELP =
  'Use RRULE syntax such as "FREQ=WEEKLY;BYDAY=MO" (end date: "UNTIL=20261231") or Obsidian Tasks text such as "every week" or "every week until December 31, 2026".';

export interface ParsedRecurrenceRule {
  source: "rrule" | "text";
  /** Repeat options, without start, end, time zone and time-of-day parts. */
  options: Partial<Options>;
  start?: string;
  end?: string;
  /** Obsidian Tasks "when done": the next date counts from completion. */
  whenDone: boolean;
}

const WHEN_DONE = /\s+when done\s*$/i;
// Tasks are day-granular: time-of-day parts would keep a rule on the same
// day, and a time zone would move its days depending on the machine's zone
const DROPPED_KEYS = new Set(["byhour", "byminute", "bysecond", "tzid"]);
/** What an Obsidian Tasks line can hold after 🔁 (its recurrence pattern). */
const TASKS_TEXT = /^[a-zA-Z0-9, !]+$/;
const RRULE_SYNTAX = /[=:;]/;

export const isRRuleSyntax = (rule: string): boolean => RRULE_SYNTAX.test(rule);

// rrule only reads basic-format dates (20261231); accept 2026-12-31 too
const DASHED_RULE_DATE =
  /(UNTIL=|DTSTART=|DTSTART(?:;[^:\n]*)?:)(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(Z?))?/gi;
// rrule ignores the start date in the standard "DTSTART;VALUE=DATE:20261016"
const VALUE_DATE_START = /DTSTART;VALUE=DATE:/gi;

const normalizeRuleDates = (rule: string): string =>
  rule
    .replace(
      DASHED_RULE_DATE,
      (
        _,
        prefix: string,
        y,
        m,
        d,
        hh?: string,
        mm?: string,
        ss?: string,
        z = "",
      ) => `${prefix}${y}${m}${d}${hh ? `T${hh}${mm}${ss}${z}` : ""}`,
    )
    .replace(VALUE_DATE_START, "DTSTART:");

const UNTIL_NUMERIC_DATE =
  /\buntil\s+(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}\/\d{1,2}\/\d{4}|\d{4}\/\d{1,2}\/\d{1,2})$/i;
const NUMERIC_DATE_FORMATS = ["yyyy-M-d", "M/d/yyyy", "yyyy/M/d"];

/** End dates in rule text are machine-read, so they are always English. */
export const formatRuleEndDate = (day: string): string =>
  DateTime.fromISO(day).toFormat("LLLL d, yyyy", { locale: "en-US" });

/**
 * Text as an Obsidian Tasks line can hold it: a numeric "until" date is
 * written out ("until December 31, 2026"), and anything left outside the
 * letters, digits, spaces, commas and "!" a Tasks line keeps is refused,
 * since rrule's text parser would quietly misread it ("Monday-Friday" reads
 * as "Monday"). Returns null when the text can't be normalized.
 */
export function normalizeTextRule(text: string): string | null {
  const whenDone = WHEN_DONE.test(text);
  const body = text.replace(WHEN_DONE, "").trim();
  const until = UNTIL_NUMERIC_DATE.exec(body);
  const day = until
    ? NUMERIC_DATE_FORMATS.map((format) =>
        DateTime.fromFormat(until[1], format),
      )
        .find((parsed) => parsed.isValid)
        ?.toISODate()
    : undefined;
  if (until && !day) {
    return null;
  }
  const normalized =
    until && day
      ? `${body.slice(0, until.index)}until ${formatRuleEndDate(day)}`
      : body;
  return TASKS_TEXT.test(normalized)
    ? `${normalized}${whenDone ? " when done" : ""}`
    : null;
}

const tryParse = (parse: () => RRule): RRule | null => {
  try {
    return parse();
  } catch {
    return null;
  }
};

/** The day of a TZID rule's UTC end: in that zone, earlier if before the start's time. */
const tzidEndDay = (end: Date, tzid: string, start: Date | undefined) => {
  const wall = DateTime.fromJSDate(end, { zone: tzid });
  const startTime = start
    ? DateTime.fromJSDate(start, { zone: "utc" }).toFormat("HH:mm:ss")
    : "00:00:00";
  // That day's occurrence would be at the start's time, after the end
  const last =
    wall.toFormat("HH:mm:ss") < startTime ? wall.minus({ days: 1 }) : wall;
  const day = last.toISODate();
  if (!day) {
    throw new Error(`Invalid end date in time zone ${tzid}`);
  }
  return day;
};

/**
 * The calendar day of an RRULE start or end date:
 * - date-only and floating (no Z) values, including TZID starts: as written
 * - a TZID rule's UTC end: the day in that zone (see tzidEndDay)
 * - UTC values in this library's encoding (start 00:00:00Z, end 23:59:59Z):
 *   as written
 * - other UTC values, which earlier versions wrote at local midnight or local
 *   end of day: the day in the local zone
 */
function rruleDay(
  date: Date,
  raw: RawRuleDate | undefined,
  kind: "start" | "end",
  tzid: string | undefined,
  start: Date | undefined,
): string {
  if (raw && (!raw.hasTime || !raw.utc)) {
    return floatingCalendarDay(date);
  }
  if (tzid && kind === "end") {
    return tzidEndDay(date, tzid, start);
  }
  if (tzid) {
    return floatingCalendarDay(date);
  }
  const time = date.toISOString().slice(11, 19);
  return time === "00:00:00" || (kind === "end" && time === "23:59:59")
    ? floatingCalendarDay(date)
    : localCalendarDay(date);
}

const usableInterval = (interval: unknown): number | null => {
  if (interval === undefined) {
    return 1;
  }
  const value = Number(interval);
  return Number.isInteger(value) && value >= 1 ? value : null;
};

function toParsedRule(
  source: ParsedRecurrenceRule["source"],
  rule: RRule,
  whenDone: boolean,
  rawDates: { start?: RawRuleDate; end?: RawRuleDate },
): ParsedRecurrenceRule | null {
  const { dtstart, until, tzid, ...rest } = rule.origOptions;
  if (tzid && !IANAZone.isValidZone(tzid)) {
    return null;
  }
  const options: Partial<Options> = Object.fromEntries(
    Object.entries(rest).filter(([key]) => !DROPPED_KEYS.has(key)),
  );
  const interval = usableInterval(options.interval);
  // Without FREQ rrule silently assumes yearly; interval 0 or below never ends
  if (options.freq === undefined || interval === null) {
    return null;
  }
  // rrule's text parser makes local dates
  const dayOf = (date: Date, kind: "start" | "end"): string =>
    source === "rrule"
      ? rruleDay(
          date,
          rawDates[kind],
          kind,
          tzid ?? undefined,
          dtstart ?? undefined,
        )
      : localCalendarDay(date);
  return {
    source,
    options: { ...options, interval },
    ...(dtstart ? { start: dayOf(dtstart, "start") } : {}),
    ...(until ? { end: dayOf(until, "end") } : {}),
    whenDone,
  };
}

function parseRRuleSyntax(
  body: string,
  whenDone: boolean,
): ParsedRecurrenceRule | null {
  const normalized = normalizeRuleDates(body);
  const rawDates = readRuleDates(normalized);
  if (rawDates.impossible) {
    return null;
  }
  const parsed = tryParse(() => RRule.fromString(normalized));
  // A start rrule could not read means a malformed rule, not "no start"
  if (
    !parsed ||
    (rawDates.start !== undefined) !== Boolean(parsed.origOptions.dtstart)
  ) {
    return null;
  }
  return toParsedRule("rrule", parsed, whenDone, rawDates);
}

function parseTextRule(
  body: string,
  whenDone: boolean,
): ParsedRecurrenceRule | null {
  const text = normalizeTextRule(body);
  const parsed = text ? tryParse(() => RRule.fromText(text)) : null;
  return parsed ? toParsedRule("text", parsed, whenDone, {}) : null;
}

/** Reads a stored rule, or returns null when it is not a usable rule. */
export function parseRecurrenceRule(rule: string): ParsedRecurrenceRule | null {
  const whenDone = WHEN_DONE.test(rule);
  const body = rule.replace(WHEN_DONE, "").trim();
  if (!body) {
    return null;
  }
  try {
    return isRRuleSyntax(body)
      ? parseRRuleSyntax(body, whenDone)
      : parseTextRule(body, whenDone);
  } catch {
    // Dates rrule produced but can't be placed on a calendar day
    return null;
  }
}

export const isReadableRecurrenceRule = (rule: string): boolean =>
  parseRecurrenceRule(rule) !== null;

/**
 * A start date and nothing else: what is left on an Obsidian Tasks line of a
 * rule v0.8.0 wrote as "DTSTART:…" and "RRULE:…" on two lines.
 */
const START_ONLY = /^DTSTART[;:=][^\n]*$/i;
const isStartOnlyRule = (rule: string): boolean =>
  START_ONLY.test(rule.trim()) && !/\bFREQ=/i.test(rule);

/**
 * Why a rule can't be read. A start date alone gets the manual repair for
 * lines v0.8.0 split in two, which can't be joined back automatically.
 */
export const unreadableRuleError = (rule: string): string =>
  isStartOnlyRule(rule)
    ? `Cannot read the recurrence rule "${rule}": it is only a start date. ` +
      'Rules with a start date were written by v0.8.0 on two lines, so the rest of this rule ("RRULE:FREQ=…") is on the line below the task in the note. ' +
      'To repair the task, edit the note: delete the "RRULE:" line below the task, and replace ' +
      `"🔁 ${rule.trim()}" with the rule as Obsidian Tasks text, such as "🔁 every week" ` +
      "(set the task's start date with 🛫 instead)."
    : `Cannot read the recurrence rule "${rule}". ${RECURRENCE_RULE_HELP}`;

/** The error for a rule that can't be stored, or null when it is readable. */
export const recurrenceRuleError = (rule: string): string | null =>
  isReadableRecurrenceRule(rule) ? null : unreadableRuleError(rule);
