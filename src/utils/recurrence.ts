import { type ByWeekday, Frequency, type Options, RRule, Weekday } from "rrule";
import { DateTime } from "luxon";
import type { Task } from "../types";
import { isTaskRecurring } from "./task";
import {
  floatingDay,
  floatingEndOfDay,
  parseRecurrenceRule,
  type ParsedRecurrenceRule,
} from "./recurrence-rule";
import { recurrenceRuleToText } from "./recurrence-text";

type TaskRecurrence = Pick<Task, "isRecurring" | "recurringInterval">;

/** The recurrence controls in the task editor. Dates are YYYY-MM-DD or "". */
export interface RecurrenceFormState {
  freq: Frequency;
  interval: number;
  byWeekDay: Weekday[];
  byMonth: number[];
  byMonthDay: number[];
  start: string;
  end: string;
}

export const DEFAULT_RECURRENCE_FORM_STATE: RecurrenceFormState = {
  freq: RRule.WEEKLY,
  interval: 1,
  byWeekDay: [],
  byMonth: [],
  byMonthDay: [],
  start: "",
  end: "",
};

/**
 * How a stored rule was read: RRULE syntax, rrule's English text (the
 * Obsidian Tasks format, e.g. "every week"), not at all, or no rule.
 */
export type RecurrenceRuleSource = "none" | "rrule" | "text" | "unparsed";

export interface ReadRecurrenceRule {
  source: RecurrenceRuleSource;
  state: RecurrenceFormState;
  /** Obsidian Tasks "when done", kept when the rule is saved as text. */
  whenDone: boolean;
  /**
   * Parts of the rule the editor's controls can't show, such as "the 2nd
   * Monday". The rule is kept as written unless the controls change, which
   * replaces it, so the editor must say so.
   */
  unsupportedParts: string[];
}

const toArray = <T>(value: T | T[] | null | undefined): T[] =>
  value === null || value === undefined
    ? []
    : Array.isArray(value)
      ? value
      : [value];

const toWeekday = (day: ByWeekday): Weekday =>
  typeof day === "number"
    ? new Weekday(day)
    : typeof day === "string"
      ? Weekday.fromStr(day)
      : day;

const EDITOR_FREQUENCIES = new Set<Frequency>([
  RRule.DAILY,
  RRule.WEEKLY,
  RRule.MONTHLY,
  RRule.YEARLY,
]);

const isSet = (value: unknown): boolean => toArray(value).length > 0;

/** The parts of a rule the controls (frequency, interval, days, months, dates) can't show. */
function unsupportedRuleParts(
  options: Partial<Options>,
  hasTimesOfDay: boolean,
): string[] {
  const { freq, byweekday, bymonth, bymonthday, wkst } = options;
  const weekdays = toArray(byweekday).map(toWeekday);
  const parts: [boolean, string][] = [
    [
      freq !== undefined && !EDITOR_FREQUENCIES.has(freq),
      "an hourly or shorter frequency",
    ],
    [hasTimesOfDay, "times of day (BYHOUR, BYMINUTE, BYSECOND)"],
    [isSet(options.count), "a number of repetitions (COUNT)"],
    [isSet(options.bysetpos), "a position within the period (BYSETPOS)"],
    [isSet(options.byyearday), "days of the year"],
    [isSet(options.byweekno), "week numbers"],
    [isSet(options.byeaster), "an Easter offset"],
    [
      wkst !== undefined &&
        wkst !== null &&
        toWeekday(wkst as ByWeekday).weekday !== 0,
      "a week start other than Monday",
    ],
    [
      weekdays.some((day) => day.n !== undefined && day.n !== 0),
      "ordinal weekdays (like the 2nd Monday)",
    ],
    [weekdays.length > 0 && freq !== RRule.WEEKLY, "weekdays"],
    [isSet(bymonth) && freq !== RRule.YEARLY, "months"],
    [
      isSet(bymonthday) && freq !== RRule.MONTHLY && freq !== RRule.YEARLY,
      "days of the month",
    ],
    // The day buttons go up to 31 plus "Last day" (-1)
    [
      toArray(bymonthday).some((day) => day < -1),
      "days counted from the month's end",
    ],
  ];
  return parts.filter(([applies]) => applies).map(([, part]) => part);
}

/** "every day on Monday" is "every week on Monday", which the weekday buttons show. */
const asEditorOptions = (options: Partial<Options>): Partial<Options> =>
  options.freq === RRule.DAILY &&
  (options.interval ?? 1) === 1 &&
  toArray(options.byweekday).length > 0
    ? { ...options, freq: RRule.WEEKLY }
    : options;

/**
 * Reads a stored rule into form state. Uses the rule's own options rather than
 * rrule's computed ones, which add defaults such as today's weekday.
 */
export function readRecurrenceRule(
  rule: string | undefined,
): ReadRecurrenceRule {
  if (!rule) {
    return {
      source: "none",
      state: DEFAULT_RECURRENCE_FORM_STATE,
      whenDone: false,
      unsupportedParts: [],
    };
  }
  const parsed = parseRecurrenceRule(rule);
  if (!parsed) {
    return {
      source: "unparsed",
      state: DEFAULT_RECURRENCE_FORM_STATE,
      whenDone: false,
      unsupportedParts: [],
    };
  }
  const options = asEditorOptions(parsed.options);
  const { freq, interval, byweekday, bymonth, bymonthday } = options;
  return {
    source: parsed.source,
    state: {
      freq:
        freq !== undefined && EDITOR_FREQUENCIES.has(freq)
          ? freq
          : DEFAULT_RECURRENCE_FORM_STATE.freq,
      interval: interval ?? DEFAULT_RECURRENCE_FORM_STATE.interval,
      byWeekDay: toArray(byweekday).map(toWeekday),
      byMonth: toArray(bymonth),
      byMonthDay: toArray(bymonthday),
      start: parsed.start ?? "",
      end: parsed.end ?? "",
    },
    whenDone: parsed.whenDone,
    unsupportedParts: unsupportedRuleParts(
      options,
      parsed.timesOfDay !== undefined,
    ),
  };
}

const toRepeatOptions = (state: RecurrenceFormState) => {
  const { freq, interval, byWeekDay, byMonth, byMonthDay } = state;
  // The day buttons are 1-31 and "Last day" (-1); other days counted from the
  // month's end are dropped, as the editor warns
  const monthDays = byMonthDay.filter(
    (day) => (day >= 1 && day <= 31) || day === -1,
  );
  return {
    freq,
    interval,
    byweekday: freq === RRule.WEEKLY && byWeekDay.length > 0 ? byWeekDay : null,
    bymonth: freq === RRule.YEARLY && byMonth.length > 0 ? byMonth : null,
    bymonthday:
      (freq === RRule.MONTHLY || freq === RRule.YEARLY) && monthDays.length > 0
        ? monthDays
        : null,
  };
};

/** RRULE syntax; start and end are written as floating calendar dates. */
const toRRuleString = (state: RecurrenceFormState): string =>
  new RRule({
    ...toRepeatOptions(state),
    dtstart: state.start ? floatingDay(state.start) : undefined,
    until: state.end ? floatingEndOfDay(state.end) : undefined,
  }).toString();

const toParsedRule = (
  state: RecurrenceFormState,
  whenDone: boolean,
): ParsedRecurrenceRule => ({
  source: "text",
  options: toRepeatOptions(state),
  ...(state.start ? { start: state.start } : {}),
  ...(state.end ? { end: state.end } : {}),
  whenDone,
});

/** The form state in words, e.g. "every week on Monday until December 31, 2026". */
export const describeRecurrence = (state: RecurrenceFormState): string => {
  const repeat = new RRule(toRepeatOptions(state)).toText();
  const from = state.start
    ? `, from ${DateTime.fromISO(state.start).toFormat("LLLL d, yyyy")}`
    : "";
  const until = state.end
    ? ` until ${DateTime.fromISO(state.end).toFormat("LLLL d, yyyy")}`
    : "";
  return `${repeat}${from}${until}`;
};

/**
 * How the editor writes an edited rule: Obsidian Tasks text when the host
 * says it stores Obsidian Tasks lines, when the stored rule is text, or when
 * the Obsidian Tasks parser read the task (it sets `extra.isTasksTask` on
 * every task it reads); RRULE syntax otherwise.
 */
export const recurrenceSaveFormat = (
  declared: "auto" | "text",
  storedSource: RecurrenceRuleSource,
  task: Pick<Task, "extra">,
): "rrule" | "text" =>
  declared === "text" ||
  storedSource === "text" ||
  task.extra?.isTasksTask !== undefined
    ? "text"
    : "rrule";

export interface RecurrenceEdit {
  /** The recurrence switch as the user left it. */
  isRecurring: boolean;
  /** Whether the user changed any control other than the switch. */
  controlsTouched: boolean;
  state: RecurrenceFormState;
  /**
   * "text" writes Obsidian Tasks text ("every 2 weeks on Monday"), for tasks
   * whose rule is stored that way; "rrule" writes RRULE syntax.
   */
  format: "rrule" | "text";
  /** Keep Obsidian Tasks "when done" on text rules. */
  whenDone?: boolean;
}

/**
 * The recurrence fields to save. Unless the user edited the controls, the
 * original rule is kept verbatim, so rules the controls cannot represent
 * (such as "every week when done") survive a save. Throws when the edited
 * rule cannot be written in the requested format.
 */
export function resolveRecurrenceOnSave(
  original: TaskRecurrence,
  edit: RecurrenceEdit,
): TaskRecurrence {
  const unchanged = {
    isRecurring: original.isRecurring,
    recurringInterval: original.recurringInterval,
  };
  const wasRecurring = isTaskRecurring(original);

  if (!edit.isRecurring) {
    return wasRecurring
      ? { isRecurring: false, recurringInterval: undefined }
      : unchanged;
  }
  if (!edit.controlsTouched && original.recurringInterval) {
    return wasRecurring ? unchanged : { ...unchanged, isRecurring: true };
  }
  return {
    isRecurring: true,
    recurringInterval:
      edit.format === "text"
        ? recurrenceRuleToText(toParsedRule(edit.state, edit.whenDone ?? false))
        : toRRuleString(edit.state),
  };
}
