import { RRule, type Frequency, type Options, Weekday } from "rrule";
import { DateTime } from "luxon";
import type { ParsedRecurrenceRule } from "./recurrence-rule";

/**
 * Checking recurrence text written by the AI against what rrule's text parser
 * made of it. The parser reads abbreviations and ordinals ("Mon", "Sept",
 * "first") but quietly skips words it doesn't know, and everything after them
 * ("every day except Sunday" reads as "every day"). So each word is checked
 * for its meaning in the parsed rule.
 */

/**
 * Whole words rrule reads as a weekday. Its tokens match word starts, so it
 * also reads "Mondays" and "Thurs" (and stops after them), but "summer" as
 * Sunday too; only these forms count.
 */
const WEEKDAY_WORDS: [RegExp, number][] = [
  [/^(mo|mon|mondays?)$/, 0],
  [/^(tu|tue|tues|tuesdays?)$/, 1],
  [/^(we|wed|weds|wedn|wednesdays?)$/, 2],
  [/^(th|thu|thur|thurs|thursdays?)$/, 3],
  [/^(fr|fri|fridays?)$/, 4],
  [/^(sa|sat|saturdays?)$/, 5],
  [/^(su|sun|sundays?)$/, 6],
];

const MONTH_WORDS: [RegExp, number][] = [
  [/^jan(uary)?$/, 1],
  [/^feb(ruary)?$/, 2],
  [/^mar(ch)?$/, 3],
  [/^apr(il)?$/, 4],
  [/^may$/, 5],
  [/^june?$/, 6],
  [/^july?$/, 7],
  [/^aug(ust)?$/, 8],
  [/^sep(t(ember)?)?$/, 9],
  [/^oct(ober)?$/, 10],
  [/^nov(ember)?$/, 11],
  [/^dec(ember)?$/, 12],
];

const ORDINAL_WORDS: Record<string, number> = {
  first: 1,
  second: 2,
  third: 3,
  last: -1,
};
const NUMBERED_ORDINAL = /^([1-9]\d*)(st|nd|rd|th)$/;

const PERIOD_WORDS: Partial<Record<Frequency, string[]>> = {
  [RRule.YEARLY]: ["year", "years", "yearly"],
  [RRule.MONTHLY]: ["month", "months", "monthly"],
  [RRule.WEEKLY]: ["week", "weeks", "weekly"],
  [RRule.DAILY]: ["day", "days", "daily"],
  [RRule.HOURLY]: ["hour", "hours", "hourly"],
  [RRule.MINUTELY]: ["minute", "minutes", "minutely"],
};
const ALL_PERIOD_WORDS = new Set(Object.values(PERIOD_WORDS).flat());

/** Words the library's text can leave out without changing the rule. */
const FILLER = new Set(["on", "the", "in", "at", "and"]);
const WORKDAYS = [0, 1, 2, 3, 4];

const words = (text: string): string[] =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 0);

const matchWord = (table: [RegExp, number][], word: string | undefined) =>
  word === undefined
    ? undefined
    : table.find(([pattern]) => pattern.test(word))?.[1];

const ordinalOf = (word: string): number | undefined =>
  ORDINAL_WORDS[word] ??
  (NUMBERED_ORDINAL.test(word) ? Number.parseInt(word, 10) : undefined);

const toList = <T>(value: T | T[] | null | undefined): T[] =>
  value === undefined || value === null
    ? []
    : Array.isArray(value)
      ? value
      : [value];

/** The rule's weekdays as weekday number and ordinal (0 when plain). */
const weekdaysOf = (options: Partial<Options>): [number, number][] =>
  toList(options.byweekday).map((day) => {
    const weekday =
      typeof day === "number"
        ? new Weekday(day)
        : typeof day === "string"
          ? Weekday.fromStr(day)
          : day;
    return [weekday.weekday, weekday.n ?? 0];
  });

interface WordContext {
  given: string[];
  options: Partial<Options>;
  /** Words of the rule written back in the library's own text. */
  writtenBack: Set<string>;
}

/** How many words at `i` belong together, and whether the rule means them. */
type Reading = [count: number, meant: boolean];

/** Whether words[i] comes right after "every" or "every N". */
const followsEvery = (given: string[], i: number): boolean =>
  given[i - 1] === "every" ||
  (/^\d+$/.test(given[i - 1] ?? "") && given[i - 2] === "every");

const hasWeekday = (
  { options }: WordContext,
  weekday: number,
  n: number,
): boolean =>
  weekdaysOf(options).some(([day, nth]) => day === weekday && nth === n);

/**
 * Whether the rule's month days are days of the month it repeats in: monthly,
 * or yearly in given months. Otherwise rrule still reads "the last day" as a
 * month day, so a yearly or weekly rule would repeat every month.
 */
const repeatsInWholeMonths = ({ freq, bymonth }: Partial<Options>): boolean =>
  freq === RRule.MONTHLY ||
  (freq === RRule.YEARLY && toList(bymonth).length > 0);

/** "first Monday", "second last Friday", "1st", "last day". */
function readOrdinal(ctx: WordContext, i: number, nth: number): Reading {
  const { given, options } = ctx;
  let next = i + 1;
  let n = nth;
  if (given[next] === "last" && given[i] !== "last") {
    n = -nth;
    next += 1;
  }
  const weekday = matchWord(WEEKDAY_WORDS, given[next]);
  if (weekday !== undefined) {
    return [next + 1 - i, hasWeekday(ctx, weekday, n)];
  }
  const meant = toList(options.bymonthday).map(Number).includes(n);
  if (given[next] === "day" || given[next] === "days") {
    // "the last day" is the last day of the month, not of a year or week
    return [next + 1 - i, meant && repeatsInWholeMonths(options)];
  }
  return [next - i, meant];
}

function readWord(ctx: WordContext, i: number): Reading {
  const { given, options } = ctx;
  const word = given[i];
  if (word === "every") {
    return [1, i === 0];
  }
  if (/^\d+$/.test(word) && i === 1 && given[0] === "every") {
    return [1, Number(word) === (options.interval ?? 1)];
  }
  if (word === "weekday" || word === "weekdays") {
    return [1, WORKDAYS.every((day) => hasWeekday(ctx, day, 0))];
  }
  if (ALL_PERIOD_WORDS.has(word) && followsEvery(given, i)) {
    const periodWords =
      options.freq === undefined ? undefined : PERIOD_WORDS[options.freq];
    return [1, periodWords?.includes(word) ?? false];
  }
  const nth = ordinalOf(word);
  if (nth !== undefined) {
    return readOrdinal(ctx, i, nth);
  }
  const weekday = matchWord(WEEKDAY_WORDS, word);
  if (weekday !== undefined) {
    return [1, hasWeekday(ctx, weekday, 0)];
  }
  const month = matchWord(MONTH_WORDS, word);
  if (month !== undefined) {
    return [1, toList(options.bymonth).map(Number).includes(month)];
  }
  // Anything else (hours, week numbers) counts when the rule says it too
  return [1, FILLER.has(word) || ctx.writtenBack.has(word)];
}

/**
 * The words of `text` (rule text without its end date and "when done") that
 * the parsed rule doesn't mean: abbreviations ("Mon", "Sept"), ordinals
 * ("first Monday", "the last day"), "weekdays" (Monday to Friday) and an
 * interval of 1 count as meant when the rule has them.
 */
export function wordsTheRuleSkips(
  text: string,
  rule: ParsedRecurrenceRule,
  understoodAs: string,
): string[] {
  const ctx: WordContext = {
    given: words(text),
    options: rule.options,
    writtenBack: new Set(words(understoodAs)),
  };
  const skipped: string[] = [];
  for (let i = 0; i < ctx.given.length; ) {
    const [count, meant] = readWord(ctx, i);
    if (!meant) {
      skipped.push(...ctx.given.slice(i, i + count));
    }
    i += count;
  }
  return skipped;
}

// rrule reads "til" too; "till" is written out the same way
const UNTIL = /\b(?:until|till?)\b/i;
const END_DATE_FORMATS = [
  "LLLL d, yyyy",
  "LLL d, yyyy",
  // rrule reads a worded date without its comma too
  "LLLL d yyyy",
  "LLL d yyyy",
  "yyyy-M-d",
  "M/d/yyyy",
  "yyyy/M/d",
];

export type RuleEnd =
  | { ok: true; body: string; end?: string }
  | { ok: false; reason: string };

/**
 * Splits the "until" clause off rule text and reads its date (YYYY-MM-DD):
 * "December 31, 2026" in any case and spacing, with or without its comma,
 * "Dec 31, 2026", "Sept 30, 2027", 2026-12-31, 12/31/2026 or 2026/12/31. A
 * date that doesn't exist (February 30) is refused rather than rolled over
 * to a later day.
 */
export function splitRuleEnd(text: string): RuleEnd {
  const match = UNTIL.exec(text);
  if (!match) {
    return { ok: true, body: text.trim() };
  }
  const written = text.slice(match.index + match[0].length).trim();
  const date = written
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s+/g, " ")
    // luxon only reads "Sep"
    .replace(/\bsept\b/i, "Sep");
  const attempts = END_DATE_FORMATS.map((format) =>
    DateTime.fromFormat(date, format, { locale: "en-US", zone: "utc" }),
  );
  const day = attempts.find((attempt) => attempt.isValid)?.toISODate();
  if (day) {
    return { ok: true, body: text.slice(0, match.index).trim(), end: day };
  }
  return {
    ok: false,
    reason: attempts.some(
      (attempt) => attempt.invalidReason === "unit out of range",
    )
      ? `"${written}" is not a date.`
      : 'the end date needs a month, day and year, like "until December 31, 2026".',
  };
}
