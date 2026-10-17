/**
 * The Obsidian Tasks fields of a task line: how each one is matched, read
 * into a Task and written from one.
 *
 * Pure module: no React, no DOM.
 */
import type { Priority, Task } from "../types";
import {
  PriorityToTasksSymbol,
  TasksPrioritySymbolToLabel,
  cancelledDateSymbol,
  createdDateSymbol,
  dependsOnSymbol,
  doneDateSymbol,
  dueDateSymbol,
  idSymbol,
  onCompletionSymbol,
  recurrenceSymbol,
  scheduledDateSymbol,
  startDateSymbol,
} from "./symbols";
import { RECURRENCE_VALUE, TASK_ID, TASK_ID_SEQUENCE } from "./regex";
import { toTasksRecurrenceText } from "../utils/recurrence-text";

export type TasksFieldKey =
  | "priority"
  | "due"
  | "start"
  | "scheduled"
  | "created"
  | "done"
  | "cancelled"
  | "recurrence"
  | "onCompletion"
  | "id"
  | "dependsOn";

/** A field as written: its symbol (with any U+FE0F), the spaces after it, its value. */
export interface FieldText {
  key: TasksFieldKey;
  symbol: string;
  gap: string;
  value: string;
}

export const fieldText = (field: FieldText): string =>
  field.symbol + field.gap + field.value;

type DateKey = "due" | "start" | "scheduled" | "created" | "done" | "cancelled";

/** The symbols each date field is read with (WRITE_SYMBOLS has the one written). */
const DATE_SYMBOLS: Record<DateKey, string> = {
  due: `${dueDateSymbol}📆🗓`,
  start: startDateSymbol,
  scheduled: `${scheduledDateSymbol}⌛`,
  created: createdDateSymbol,
  done: doneDateSymbol,
  cancelled: cancelledDateSymbol,
};

/** Whether the field holds a date, which ends where its value does. */
export const isDateField = (key: TasksFieldKey): key is DateKey =>
  key in DATE_SYMBOLS;

const PRIORITY_SYMBOLS = Object.keys(TasksPrioritySymbolToLabel).join("");

/** Sticky patterns: symbol (group 1), gap (group 2), value (group 3). */
const PATTERNS: Record<TasksFieldKey, RegExp> = {
  priority: new RegExp(`([${PRIORITY_SYMBOLS}]\\uFE0F?)()()`, "uy"),
  ...(Object.fromEntries(
    Object.entries(DATE_SYMBOLS).map(([key, symbols]) => [
      key,
      new RegExp(`([${symbols}]\\uFE0F?)( *)(\\d{4}-\\d{2}-\\d{2})`, "uy"),
    ]),
  ) as Record<DateKey, RegExp>),
  recurrence: new RegExp(
    `(${recurrenceSymbol}\\uFE0F?)( *)(${RECURRENCE_VALUE})`,
    "uy",
  ),
  onCompletion: new RegExp(
    `(${onCompletionSymbol}\\uFE0F?)( *)([a-zA-Z]+)`,
    "uy",
  ),
  id: new RegExp(`(${idSymbol}\\uFE0F?)( *)(${TASK_ID})`, "uy"),
  dependsOn: new RegExp(
    `(${dependsOnSymbol}\\uFE0F?)( *)(${TASK_ID_SEQUENCE})`,
    "uy",
  ),
};

/** Every symbol a field starts with, by code point. */
export const FIELD_START_CODE_POINTS: ReadonlySet<number> = new Set(
  [
    PRIORITY_SYMBOLS,
    ...Object.values(DATE_SYMBOLS),
    recurrenceSymbol,
    onCompletionSymbol,
    idSymbol,
    dependsOnSymbol,
  ]
    .flatMap((symbols) => [...symbols])
    .map((symbol) => symbol.codePointAt(0) as number),
);

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

/** A real calendar day in YYYY-MM-DD (checked without luxon, which is slow here). */
const isDate = (value: string): boolean => {
  const [year, month, day] = value.split("-").map(Number);
  if (month < 1 || month > 12) {
    return false;
  }
  const days = month === 2 && isLeapYear(year) ? 29 : DAYS_IN_MONTH[month - 1];
  return day >= 1 && day <= days;
};

/**
 * A rule ends at "when done", which Obsidian Tasks only reads at its end, so
 * words after it ("🔁 every week when done see [[Garden]]") are not part of it.
 */
const THROUGH_WHEN_DONE = /^.*?\bwhen done\b/i;

/**
 * Text that carries on the word before it: a letter, digit or mark, or one
 * after punctuation used inside words (the "://" of "https://…", the ":" of
 * "9:30", the "'" of "don't"). Spaces, separators (— ; … / # %%), brackets,
 * symbols such as the next field's, and CJK and Hangul characters, which
 * need no space before them, end the word.
 */
const WORD_GOES_ON =
  /(?:['’:.\-‐_@&]['’:.\-‐_@&/]*)?(?![\p{sc=Han}\p{sc=Hiragana}\p{sc=Katakana}\p{sc=Hangul}])[\p{L}\p{N}\p{M}]/uy;

/**
 * The words rules are written with, in any case: rrule's English, which
 * Obsidian Tasks reads rules with, and "when done". A rule keeps them when
 * text is glued to them ("every week's chores", "every week-ish").
 */
const RULE_WORD = new RegExp(
  `^(?:${[
    "every|(?:week)?days?|weeks?|months?|years?|hours?|minutes?|times?",
    "on|in|at|the|and|or|for|(?:un)?til|till|when|done",
    "first|second|third|last|one|two|three|\\d+(?:st|nd|rd|th)?",
    "(?:mon|tues?|wed(?:nes)?|thu(?:rs?)?|fri|sat(?:ur)?|sun)(?:day)?s?",
    "jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?",
    "aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?",
  ].join("|")})$`,
  "i",
);

/** A number the text after it carries on as a time or decimal ("9:30"). */
const NUMBER_GOES_ON = /[:.]\d/y;

const isRuleWord = (word: string, text: string, end: number): boolean => {
  NUMBER_GOES_ON.lastIndex = end;
  return (
    RULE_WORD.test(word) && !(/^\d+$/.test(word) && NUMBER_GOES_ON.test(text))
  );
};

/** The letters and digits the rule characters end with. */
const LAST_WORD = /[a-zA-Z0-9]+$/;

/**
 * The rule written at `start` of `text`, from what the rule characters
 * matched there. They can stop inside a word ("🔁 every month https://…"):
 * unless that word is a rule word, its start is then not part of the rule,
 * so the word stays whole in the text after it.
 */
const ruleValue = (matched: string, text: string, start: number): string => {
  const end = start + matched.length;
  const word = LAST_WORD.exec(matched)?.[0] ?? "";
  WORD_GOES_ON.lastIndex = end;
  const cut =
    word !== "" && WORD_GOES_ON.test(text) && !isRuleWord(word, text, end);
  const rule = (cut ? matched.slice(0, -word.length) : matched).trimEnd();
  return THROUGH_WHEN_DONE.exec(rule)?.[0] ?? rule;
};

/** The field written at `index` of `text`, or null. */
export function matchFieldAt(
  text: string,
  index: number,
): { field: FieldText; end: number } | null {
  for (const [key, pattern] of Object.entries(PATTERNS)) {
    pattern.lastIndex = index;
    const match = pattern.exec(text);
    if (!match) {
      continue;
    }
    const [, symbol, gap, raw] = match;
    const value =
      key === "recurrence"
        ? ruleValue(raw, text, index + symbol.length + gap.length)
        : raw;
    if (
      (key === "recurrence" && value === "") ||
      (isDateField(key as TasksFieldKey) && !isDate(value))
    ) {
      return null;
    }
    const field = { key: key as TasksFieldKey, symbol, gap, value };
    return { field, end: index + fieldText(field).length };
  }
  return null;
}

const dateOnly = (iso: string): string => iso.slice(0, 10);

/** The ids of a ⛔ value, as Obsidian Tasks reads them. */
const dependencyIds = (value: string): string[] =>
  value
    .replace(/ /g, "")
    .split(",")
    .filter((id) => id !== "");

const TASK_ID_TEXT = new RegExp(`^${TASK_ID}$`);
const ON_COMPLETION_TEXT = /^[a-zA-Z]+$/;

/** A value a line can hold, or an error naming what it can hold. */
function lineValue(
  value: string,
  pattern: RegExp,
  field: string,
  holds: string,
): string {
  if (!pattern.test(value)) {
    throw new Error(
      `Cannot write the ${field} "${value}" on an Obsidian Tasks line, which only holds ${holds} there.`,
    );
  }
  return value;
}

const taskDate = (key: DateKey, task: Task): string | undefined => {
  const value = {
    due: task.dueAt,
    start: task.startAt,
    scheduled: task.extra?.["scheduledAt"],
    created: task.createdAt,
    done: task.completedAt,
    cancelled: task.cancelledAt,
  }[key];
  return value ? dateOnly(value) : undefined;
};

/**
 * The value of `key` the task holds, as it is written on a line (the symbol
 * itself for the priority), or undefined when the line should not have the
 * field. Throws for a value a line can't hold.
 */
export function writtenValue(
  key: TasksFieldKey,
  task: Task,
): string | undefined {
  switch (key) {
    case "priority":
      return PriorityToTasksSymbol[task.priority] || undefined;
    case "recurrence":
      return task.recurringInterval
        ? toTasksRecurrenceText(task.recurringInterval)
        : undefined;
    case "onCompletion":
      return task.onCompletion?.trim()
        ? lineValue(
            task.onCompletion.trim(),
            ON_COMPLETION_TEXT,
            "on-completion action",
            "letters",
          )
        : undefined;
    case "id":
      return task.taskId?.trim()
        ? lineValue(
            task.taskId.trim(),
            TASK_ID_TEXT,
            "task id",
            'letters, digits, "-" and "_"',
          )
        : undefined;
    case "dependsOn":
      return task.dependsOn && task.dependsOn.length > 0
        ? task.dependsOn
            .map((id) =>
              lineValue(
                id.trim(),
                TASK_ID_TEXT,
                "task id",
                'letters, digits, "-" and "_"',
              ),
            )
            .join(",")
        : undefined;
    default:
      return taskDate(key, task);
  }
}

const samePriority = (symbol: string, priority: Priority): boolean =>
  TasksPrioritySymbolToLabel[symbol.replace("\uFE0F", "")] === priority;

const sameIds = (value: string, ids: string[] | undefined): boolean =>
  dependencyIds(value).join(",") ===
  (ids ?? []).map((id) => id.trim()).join(",");

/** Whether the field as written on the line means what the task holds. */
export function sameValue(field: FieldText, task: Task): boolean {
  switch (field.key) {
    case "priority":
      return samePriority(field.symbol, task.priority);
    case "dependsOn":
      return sameIds(field.value, task.dependsOn);
    default:
      return field.value === writtenValue(field.key, task);
  }
}

/** The field with the task's value written in place of the line's. */
export const withValue = (field: FieldText, value: string): FieldText =>
  field.key === "priority" ? { ...field, symbol: value } : { ...field, value };

/** Task values read from a line's fields (the first of each kind counts). */
export interface FieldValues {
  priority?: Priority;
  dueAt?: string;
  startAt?: string;
  scheduledAt?: string;
  createdAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  recurringInterval?: string;
  onCompletion?: string;
  taskId?: string;
  dependsOn?: string[];
}

const valueOf = (field: FieldText): FieldValues => {
  switch (field.key) {
    case "priority":
      return {
        priority:
          TasksPrioritySymbolToLabel[field.symbol.replace("\uFE0F", "")],
      };
    case "due":
      return { dueAt: field.value };
    case "start":
      return { startAt: field.value };
    case "scheduled":
      return { scheduledAt: field.value };
    case "created":
      return { createdAt: field.value };
    case "done":
      return { completedAt: field.value };
    case "cancelled":
      return { cancelledAt: field.value };
    case "recurrence":
      return { recurringInterval: field.value };
    case "onCompletion":
      return { onCompletion: field.value };
    case "id":
      return { taskId: field.value };
    case "dependsOn":
      return { dependsOn: dependencyIds(field.value) };
  }
};

export const readFieldValues = (fields: readonly FieldText[]): FieldValues =>
  [...fields]
    .reverse()
    .reduce<FieldValues>(
      (values, field) => ({ ...values, ...valueOf(field) }),
      {},
    );

/** The order fields are added to a line in. */
export const WRITE_ORDER: readonly TasksFieldKey[] = [
  "priority",
  "due",
  "start",
  "scheduled",
  "created",
  "done",
  "cancelled",
  "recurrence",
  "onCompletion",
  "id",
  "dependsOn",
];

const WRITE_SYMBOLS: Record<Exclude<TasksFieldKey, "priority">, string> = {
  due: dueDateSymbol,
  start: startDateSymbol,
  scheduled: scheduledDateSymbol,
  created: createdDateSymbol,
  done: doneDateSymbol,
  cancelled: cancelledDateSymbol,
  recurrence: recurrenceSymbol,
  onCompletion: onCompletionSymbol,
  id: idSymbol,
  dependsOn: dependsOnSymbol,
};

/** The fields the task holds, in the order they are added to a line. */
export function taskFields(task: Task): FieldText[] {
  return WRITE_ORDER.flatMap((key): FieldText[] => {
    const value = writtenValue(key, task);
    if (value === undefined) {
      return [];
    }
    return key === "priority"
      ? [{ key, symbol: value, gap: "", value: "" }]
      : [{ key, symbol: WRITE_SYMBOLS[key], gap: " ", value }];
  });
}
