import { DateTime } from "luxon";
import {
  formatRuleEndDate,
  isRRuleSyntax,
  normalizeTextRule,
  parseRecurrenceRule,
  RECURRENCE_RULE_HELP,
  type ParsedRecurrenceRule,
} from "./recurrence-rule";
import { recurrenceRuleToText } from "./recurrence-text";
import { splitRuleEnd, wordsTheRuleSkips } from "./recurrence-wording";

/**
 * Checking the `recurrence` argument of the task tools. rrule's text parser
 * quietly skips words it doesn't know ("every day except Sunday" reads as
 * "every day"), so text is only accepted when the parsed rule means every
 * word that was given, and it is stored in the library's own words.
 */

export type RecurrenceArgument =
  | { ok: true; rule: string | null; understoodAs?: string }
  | { ok: false; error: string };

const WHEN_DONE_AT_END = /\s+when\s+done\s*$/i;
const WHEN_DONE_ANYWHERE = /\bwhen\s+done\b/i;

const reject = (value: string, reason: string): RecurrenceArgument => ({
  ok: false,
  error: `Cannot use the recurrence rule "${value}": ${reason} ${RECURRENCE_RULE_HELP}`,
});

const endsTooEarly = (rule: ParsedRecurrenceRule, notBefore: string): boolean =>
  rule.end !== undefined && rule.end < notBefore;

/**
 * The text with its end date written out ("until December 31, 2026") and
 * "when done" spaced as Obsidian Tasks reads it, or why it can't be.
 */
function canonicalText(
  value: string,
):
  | { ok: true; text: string; body: string; end?: string }
  | { ok: false; reason: string } {
  const whenDone = WHEN_DONE_AT_END.test(value);
  const withoutWhenDone = value.replace(WHEN_DONE_AT_END, "");
  if (WHEN_DONE_ANYWHERE.test(withoutWhenDone)) {
    return { ok: false, reason: '"when done" can only come at the end.' };
  }
  const split = splitRuleEnd(withoutWhenDone);
  if (!split.ok) {
    return split;
  }
  const until = split.end ? ` until ${formatRuleEndDate(split.end)}` : "";
  return {
    ok: true,
    text: `${split.body}${until}${whenDone ? " when done" : ""}`,
    body: split.body,
    end: split.end,
  };
}

/** The given words the parsed rule doesn't mean, and its end if dropped. */
const skippedParts = (
  canonical: { body: string; end?: string },
  parsed: ParsedRecurrenceRule,
  understoodAs: string,
): string[] => [
  ...wordsTheRuleSkips(canonical.body, parsed, understoodAs),
  // rrule stops reading after some words ("Mondays"), dropping the end
  ...(canonical.end && parsed.end === undefined
    ? [`until ${formatRuleEndDate(canonical.end)}`]
    : []),
];

/** Text: normalized, fully understood, and stored in the library's words. */
function readTextArgument(
  value: string,
  notBefore: string,
): RecurrenceArgument {
  const canonical = canonicalText(value);
  if (!canonical.ok) {
    return reject(value, canonical.reason);
  }
  const normalized = normalizeTextRule(canonical.text);
  if (!normalized) {
    return reject(
      value,
      'an Obsidian Tasks line can only hold letters, digits, spaces, commas and "!".',
    );
  }
  const parsed = parseRecurrenceRule(normalized);
  if (!parsed) {
    return reject(value, "it isn't a rule the parser can read.");
  }
  if (parsed.options.count) {
    return reject(
      value,
      'a number of repetitions ("for 3 times") never ends here, because each completion counts again; use "until <date>".',
    );
  }
  if (parsed.end !== undefined && parsed.end !== canonical.end) {
    return reject(
      value,
      `the parser reads its end date as ${parsed.end}, not ${canonical.end ?? "none"}.`,
    );
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
  const skipped = skippedParts(canonical, parsed, understoodAs);
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
