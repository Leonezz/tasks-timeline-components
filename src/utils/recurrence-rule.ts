import { type Options, RRule } from "rrule";
import { DateTime, IANAZone } from "luxon";
import {
  localCalendarDay,
  readRuleDates,
  type RawRuleDate,
} from "./recurrence-dates";
import {
  readRuleBoundaries,
  readTimesOfDay,
  type TimesOfDay,
} from "./rule-boundaries";

export {
  calendarDayOf,
  floatingCalendarDay,
  floatingDay,
  floatingEndOfDay,
} from "./recurrence-dates";
export type { TimesOfDay } from "./rule-boundaries";

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
  /**
   * The last day a date can fall on. For daily and longer rules whose UNTIL
   * has a time before the day's first date, the day before UNTIL's.
   */
  end?: string;
  /** DTSTART's wall-clock time (YYYY-MM-DDTHH:mm:ss) when not midnight. */
  startDateTime?: string;
  /** UNTIL's wall-clock time when it has one other than 23:59:59. */
  endDateTime?: string;
  /** BYHOUR, BYMINUTE and BYSECOND, which `options` leaves out. */
  timesOfDay?: TimesOfDay;
  /** Obsidian Tasks "when done": the next date counts from completion. */
  whenDone: boolean;
}

const WHEN_DONE = /\s+when done\s*$/i;
// Tasks are day-granular: time-of-day parts only matter where they change
// days (kept in `timesOfDay`), and a time zone would move a rule's days
// depending on the machine's zone
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
  const timesOfDay = readTimesOfDay(rest);
  // Without FREQ rrule silently assumes yearly; interval 0 or below never
  // ends; BYHOUR=24 would roll over to the next day
  if (options.freq === undefined || interval === null || timesOfDay === null) {
    return null;
  }
  // rrule's text parser makes local dates, without times
  const boundaries =
    source === "rrule"
      ? readRuleBoundaries({
          dtstart,
          until,
          tzid: tzid ?? undefined,
          raw: rawDates,
          freq: options.freq,
          times: timesOfDay,
        })
      : {
          ...(dtstart ? { start: localCalendarDay(dtstart) } : {}),
          ...(until ? { end: localCalendarDay(until) } : {}),
        };
  return {
    source,
    options: { ...options, interval },
    ...boundaries,
    ...(timesOfDay ? { timesOfDay } : {}),
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
