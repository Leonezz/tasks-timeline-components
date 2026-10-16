import { RRule, type Frequency } from "rrule";
import { DateTime } from "luxon";
import {
  isRRuleSyntax,
  normalizeTextRule,
  parseRecurrenceRule,
  RECURRENCE_RULE_HELP,
  type ParsedRecurrenceRule,
} from "./recurrence-rule";
import { recurrenceRuleToText } from "./recurrence-text";

/**
 * Checking the `recurrence` argument of the task tools. rrule's text parser
 * quietly skips words it doesn't know ("every day except Sunday" reads as
 * "every day"), so text is only accepted when the rule written back in the
 * library's own words covers every word that was given, and it is stored in
 * those words.
 */

export type RecurrenceArgument =
  | { ok: true; rule: string | null; understoodAs?: string }
  | { ok: false; error: string };

const WHEN_DONE_AT_END = /\s+when done\s*$/i;
const WHEN_DONE_ANYWHERE = /\bwhen done\b/i;
const UNTIL = /\buntil\b/i;
const FULL_END_DATE =
  /\buntil (January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, \d{4}$/;
/** Words the library's text can leave out without changing the rule. */
const FILLER = new Set(["on", "the", "in", "at", "and"]);
const PERIOD_WORDS: Partial<Record<Frequency, string[]>> = {
  [RRule.YEARLY]: ["year", "years", "yearly"],
  [RRule.MONTHLY]: ["month", "months", "monthly"],
  [RRule.WEEKLY]: ["week", "weeks", "weekly"],
  [RRule.DAILY]: ["day", "days", "daily"],
};

const words = (text: string): string[] =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 0);

/** Whether words[i] comes right after "every" or "every N". */
const followsEvery = (given: string[], i: number): boolean =>
  given[i - 1] === "every" ||
  (/^\d+$/.test(given[i - 1] ?? "") && given[i - 2] === "every");

const reject = (value: string, reason: string): RecurrenceArgument => ({
  ok: false,
  error: `Cannot use the recurrence rule "${value}": ${reason} ${RECURRENCE_RULE_HELP}`,
});

const endsTooEarly = (rule: ParsedRecurrenceRule, notBefore: string): boolean =>
  rule.end !== undefined && rule.end < notBefore;

/** Text: normalized, fully understood, and stored in the library's words. */
function readTextArgument(
  value: string,
  notBefore: string,
): RecurrenceArgument {
  const body = value.replace(WHEN_DONE_AT_END, "");
  if (WHEN_DONE_ANYWHERE.test(body)) {
    return reject(value, '"when done" can only come at the end.');
  }
  const normalized = normalizeTextRule(value);
  if (!normalized) {
    return reject(
      value,
      'an Obsidian Tasks line can only hold letters, digits, spaces, commas and "!".',
    );
  }
  const normalizedBody = normalized.replace(WHEN_DONE_AT_END, "");
  if (UNTIL.test(normalizedBody) && !FULL_END_DATE.test(normalizedBody)) {
    return reject(
      value,
      'the end date needs a month, day and year, like "until December 31, 2026".',
    );
  }
  const parsed = parseRecurrenceRule(normalized);
  if (!parsed) {
    return reject(value, "it isn't a rule the parser can read.");
  }
  let understoodAs: string;
  try {
    understoodAs = recurrenceRuleToText(parsed);
  } catch (error) {
    return reject(
      value,
      error instanceof Error ? error.message : String(error),
    );
  }
  if (parsed.options.count) {
    return reject(
      value,
      'a number of repetitions ("for 3 times") never ends here, because each completion counts again; use "until <date>".',
    );
  }
  const known = new Set([...words(understoodAs), ...FILLER]);
  const periodWords = new Set(
    PERIOD_WORDS[parsed.options.freq ?? RRule.YEARLY] ?? [],
  );
  const given = words(normalizedBody);
  const skipped = given.filter(
    (word, i) =>
      !known.has(word) &&
      // "year" in "every year in December", which reads as "every December"
      !(periodWords.has(word) && followsEvery(given, i)),
  );
  if (skipped.length > 0) {
    return reject(
      value,
      `the parser would skip "${skipped.join(" ")}" and read it as "${understoodAs}".`,
    );
  }
  if (endsTooEarly(parsed, notBefore)) {
    return reject(value, `it ends on ${parsed.end}, before ${notBefore}.`);
  }
  return { ok: true, rule: understoodAs, understoodAs };
}

/** RRULE syntax: stored as given when readable and not already ended. */
function readRRuleArgument(
  value: string,
  notBefore: string,
): RecurrenceArgument {
  const parsed = parseRecurrenceRule(value);
  if (!parsed) {
    return reject(value, "it isn't a rule the parser can read.");
  }
  if (endsTooEarly(parsed, notBefore)) {
    return reject(value, `it ends on ${parsed.end}, before ${notBefore}.`);
  }
  try {
    return {
      ok: true,
      rule: value,
      understoodAs: recurrenceRuleToText(parsed),
    };
  } catch {
    // Rules with a start date have no text form; they are still usable
    return { ok: true, rule: value };
  }
}

/**
 * Checks a tool's `recurrence` argument and returns the rule to store: null
 * for missing, null or "" (no rule, or clear it), RRULE syntax as given, and
 * text in the library's own words. `notBefore` (YYYY-MM-DD) is the earliest
 * acceptable end date: the later of today and the task's own date.
 */
export function readRecurrenceArgument(
  value: unknown,
  notBefore: string,
): RecurrenceArgument {
  if (value === undefined || value === null || value === "") {
    return { ok: true, rule: null };
  }
  if (typeof value !== "string") {
    return {
      ok: false,
      error: `recurrence must be a string, or "" to clear it. ${RECURRENCE_RULE_HELP}`,
    };
  }
  return isRRuleSyntax(value)
    ? readRRuleArgument(value, notBefore)
    : readTextArgument(value, notBefore);
}

/** The later of `today` and the calendar day of the task's own date, if any. */
export function earliestEndDate(
  today: string,
  taskDate: string | undefined,
): string {
  if (!taskDate) {
    return today;
  }
  const day = DateTime.fromISO(taskDate, { setZone: true }).toISODate();
  return day && day > today ? day : today;
}
