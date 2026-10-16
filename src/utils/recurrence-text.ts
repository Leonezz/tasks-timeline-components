import { type Options, RRule, Weekday, type WeekdayStr } from "rrule";
import {
  formatRuleEndDate,
  isRRuleSyntax,
  normalizeTextRule,
  parseRecurrenceRule,
  RECURRENCE_RULE_HELP,
  type ParsedRecurrenceRule,
  unreadableRuleError,
} from "./recurrence-rule";
import { timesOfDayChangeDays } from "./rule-boundaries";
import { isSet } from "./day-rule-search";
import { isSubDaily } from "./sub-daily-rule";

/**
 * Writing rules as rrule's English text, the form Obsidian Tasks lines hold
 * ("every 2 weeks on Monday until December 31, 2026 when done").
 */

/** Options that change which dates a rule produces, compared after read-back. */
const COMPARED_KEYS = [
  "freq",
  "interval",
  "count",
  "bymonth",
  "bymonthday",
  "byweekday",
  "bysetpos",
  "byyearday",
  "byweekno",
  "byeaster",
  "wkst",
] as const;

type ComparedKey = (typeof COMPARED_KEYS)[number];

const toList = (value: unknown): unknown[] =>
  value === undefined || value === null
    ? []
    : Array.isArray(value)
      ? value
      : [value];

const weekdayKey = (day: unknown): string => {
  if (typeof day === "number") {
    return `${day}:0`;
  }
  if (typeof day === "string") {
    return `${Weekday.fromStr(day as WeekdayStr).weekday}:0`;
  }
  const { weekday, n } = day as { weekday: number; n?: number };
  return `${weekday}:${n ?? 0}`;
};

/** A comparable form of an option: sorted and without duplicates, as rrule reads it. */
const comparable = (key: ComparedKey, value: unknown): string => {
  if (key === "wkst") {
    // Monday is the default week start
    return value === undefined || value === null ? "0:0" : weekdayKey(value);
  }
  const items =
    key === "byweekday"
      ? [...new Set(toList(value).map(weekdayKey))].sort()
      : [...new Set(toList(value).map(Number))].sort((a, b) => a - b);
  return JSON.stringify(items);
};

const sameRule = (a: Partial<Options>, b: Partial<Options>): boolean =>
  COMPARED_KEYS.every(
    (key) => comparable(key, a[key]) === comparable(key, b[key]),
  );

const sortedNumbers = (value: number | number[] | null | undefined) =>
  Array.isArray(value) ? [...new Set(value)].sort((a, b) => a - b) : value;

/** Weekdays without duplicates, Monday first. */
const sortedWeekdays = (value: Options["byweekday"] | undefined) => {
  const unique = new Map(
    toList(value).map((day) => {
      const key = weekdayKey(day);
      const [weekday, n] = key.split(":").map(Number);
      return [key, new Weekday(weekday, n === 0 ? undefined : n)];
    }),
  );
  return unique.size === 0
    ? null
    : [...unique.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, day]) => day);
};

const OTHER_FILTERS = [
  "bymonth",
  "bymonthday",
  "bysetpos",
  "byyearday",
  "byweekno",
  "byeaster",
] as const;

/**
 * Options in the order people read them ("June and December"), without
 * duplicates. A daily or weekly rule on all seven days is "every day"; a
 * daily rule limited to some weekdays is the same as a weekly one, which has
 * a text form ("every day on Monday" has none).
 */
function toTextFriendly(options: Partial<Options>): Partial<Options> {
  const byweekday = sortedWeekdays(options.byweekday);
  const sorted: Partial<Options> = {
    ...options,
    byweekday,
    bymonth: sortedNumbers(options.bymonth),
    bymonthday: sortedNumbers(options.bymonthday),
  };
  const plainDays =
    byweekday !== null && byweekday.every((day) => day.n === undefined);
  const onlyWeekdays = OTHER_FILTERS.every(
    (key) => toList(sorted[key]).length === 0,
  );
  const dailyOrWeekly =
    sorted.freq === RRule.DAILY || sorted.freq === RRule.WEEKLY;
  if (
    dailyOrWeekly &&
    plainDays &&
    onlyWeekdays &&
    (sorted.interval ?? 1) === 1
  ) {
    return byweekday.length === 7
      ? { ...sorted, freq: RRule.DAILY, byweekday: null }
      : { ...sorted, freq: RRule.WEEKLY };
  }
  return sorted;
}

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/**
 * Candidate texts for a rule: rrule's own, then for weekly rules on plain
 * weekdays the days written out, since rrule shortens some day sets into
 * text it can't read back ("every 2 weeks days").
 */
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** "1st and 15th", "1st, 10th and last" */
const listOf = (items: string[]): string =>
  items.length > 1
    ? `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`
    : items.join("");

const ordinal = (day: number): string => {
  if (day === -1) {
    return "last";
  }
  const teen = day % 100 >= 11 && day % 100 <= 13;
  const suffix = teen
    ? "th"
    : ({ 1: "st", 2: "nd", 3: "rd" }[day % 10] ?? "th");
  return `${day}${suffix}`;
};

/** Weekly rules on plain weekdays, with every day named. */
function weeklyText(options: Partial<Options>): string | null {
  const days = sortedWeekdays(options.byweekday);
  if (
    options.freq !== RRule.WEEKLY ||
    days === null ||
    days.some((day) => day.n !== undefined)
  ) {
    return null;
  }
  const interval = options.interval ?? 1;
  const every = interval === 1 ? "week" : `${interval} weeks`;
  const listed = days.map((day) => DAY_NAMES[day.weekday]).join(", ");
  return `every ${every} on ${listed}`;
}

/** "every 2 years on the 1st and 15th in June and December" */
function yearlyText(options: Partial<Options>): string | null {
  const months = toList(options.bymonth).map(Number);
  const monthDays = toList(options.bymonthday).map(Number);
  const otherFilters = [
    "byweekday",
    "bysetpos",
    "byyearday",
    "byweekno",
    "byeaster",
  ] as const;
  if (
    options.freq !== RRule.YEARLY ||
    months.length === 0 ||
    otherFilters.some((key) => toList(options[key]).length > 0)
  ) {
    return null;
  }
  const interval = options.interval ?? 1;
  const every = interval === 1 ? "year" : `${interval} years`;
  const on =
    monthDays.length > 0 ? ` on the ${listOf(monthDays.map(ordinal))}` : "";
  return `every ${every}${on} in ${listOf(months.map((month) => MONTH_NAMES[month - 1]))}`;
}

/**
 * Candidate texts for a rule: rrule's own, then forms rrule doesn't write but
 * reads ("every 2 weeks days" and "every 2 years June" don't read back).
 */
function textCandidates(options: Partial<Options>, until: string): string[] {
  const own = new RRule(options).toText();
  return [own, weeklyText(options), yearlyText(options)]
    .filter((text): text is string => text !== null)
    .map((text) => `${text}${until}`);
}

/**
 * Whether a rule without a start date has its days changed by its times of
 * day. One time a day on a daily or longer rule without BYSETPOS puts a date
 * on each of its days (from the first day's midnight), so COUNT counts days.
 */
const timesChangeDaysWithoutStart = (rule: ParsedRecurrenceRule): boolean =>
  timesOfDayChangeDays(rule) &&
  (isSubDaily(rule.options.freq) ||
    isSet(rule.options.bysetpos) ||
    Object.values(rule.timesOfDay ?? {}).some((values) => values.length > 1));

/**
 * Writes a rule as Obsidian Tasks text. Throws when no text reads back as
 * the same rule, or when the rule has a start date, which Obsidian Tasks
 * text can't hold.
 */
export function recurrenceRuleToText(rule: ParsedRecurrenceRule): string {
  if (rule.start) {
    throw new Error(
      "Obsidian Tasks recurrence rules can't store a start date. Clear Start Recurrence (the task's own start date still works) to save this rule.",
    );
  }
  if (timesChangeDaysWithoutStart(rule)) {
    throw new Error(
      "This recurrence can't be written as Obsidian Tasks text: its times of day (BYHOUR, BYMINUTE, BYSECOND) change which days it has, and a Tasks line can't hold them.",
    );
  }
  const options = toTextFriendly(rule.options);
  const until = rule.end ? ` until ${formatRuleEndDate(rule.end)}` : "";
  const candidates = textCandidates(options, until);
  const text = candidates.find((candidate) => {
    const readBack = parseRecurrenceRule(candidate);
    return (
      readBack !== null &&
      readBack.end === rule.end &&
      sameRule(readBack.options, options)
    );
  });
  if (!text) {
    throw new Error(
      `This recurrence can't be written as Obsidian Tasks text ("${candidates[0]}" reads back differently).`,
    );
  }
  return `${text}${rule.whenDone ? " when done" : ""}`;
}

/** Text a Tasks line holds as written, so unchanged lines stay byte for byte. */
const TASKS_LINE_TEXT = /^[a-zA-Z0-9, !]+$/;

/**
 * The rule as written on an Obsidian Tasks line: text the line can hold is
 * unchanged, other text is normalized ("until 2026-12-31" becomes "until
 * December 31, 2026"), and RRULE syntax is converted to text. Throws when
 * neither works, since writing it verbatim would corrupt the line.
 */
export function toTasksRecurrenceText(rule: string): string {
  if (!isRRuleSyntax(rule)) {
    if (TASKS_LINE_TEXT.test(rule)) {
      return rule;
    }
    const normalized = normalizeTextRule(rule);
    if (normalized && parseRecurrenceRule(normalized)) {
      return normalized;
    }
    throw new Error(
      `Cannot write the recurrence rule "${rule}" on an Obsidian Tasks line, which only holds letters, digits, spaces, commas and "!". ${RECURRENCE_RULE_HELP}`,
    );
  }
  const parsed = parseRecurrenceRule(rule);
  if (!parsed) {
    throw new Error(unreadableRuleError(rule));
  }
  return recurrenceRuleToText(parsed);
}
