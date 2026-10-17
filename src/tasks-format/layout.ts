/**
 * The layout of a task line's text (after the checkbox): the description the
 * title is read from, the fields, tags and other text before and after it,
 * then the block id. Reading keeps every character, so an unchanged layout
 * renders the text it was read from byte for byte.
 *
 * Pure module: no React, no DOM.
 */
import {
  type FieldText,
  type TasksFieldKey,
  FIELD_START_CODE_POINTS,
  fieldText,
  matchFieldAt,
} from "./fields";

/** A part before or after the description, with the whitespace before it. */
export type TailPart =
  | { kind: "field"; lead: string; field: FieldText }
  | { kind: "tag"; lead: string; text: string }
  /** Anything else (notes, links, ⏰ reminders), kept as written. */
  | { kind: "text"; lead: string; text: string };

export interface TaskBodyLayout {
  /**
   * The fields, tags and ⏰ reminders written before the description, when
   * the text starts with them ("📅 2026-10-16 Water plants"); else empty.
   */
  head: TailPart[];
  /** The whitespace between the head and the description ("" without a head). */
  descriptionLead: string;
  /** The text the title is read from, as written (no trailing whitespace). */
  description: string;
  /** The fields, tags and other text after the description. */
  parts: TailPart[];
  /** The whitespace after the last part (or after the description). */
  trailing: string;
  /** The block id with the whitespace around it, as written, or "". */
  blockLink: string;
}

/** A block id ends the line (Obsidian Tasks: / \^[a-zA-Z0-9-]+$/). */
const BLOCK_LINK = /\s+\^[a-zA-Z0-9-]+\s*$/u;
/** An obsidian-reminder ⏰ date (and time). Not a Tasks field. */
const REMINDER_SOURCE =
  "⏰\\uFE0F? *\\d{4}-\\d{2}-\\d{2}(?: +\\d{1,2}:\\d{2})?";
const REMINDER = new RegExp(REMINDER_SOURCE, "uy");
const REMINDERS = new RegExp(REMINDER_SOURCE, "gu");
/** A reminder with the whitespace before it, to take it out of a title. */
const SPACED_REMINDERS = new RegExp(`\\s*${REMINDER_SOURCE}`, "gu");
const REMINDER_CODE_POINT = 0x23f0;
/** A tag, as the hashTags regex reads one (at least one character after #). */
const TAG = /#[^\s!@#$%^&*(),.?":{}|<>]+/uy;
const SPACE = /\s/u;

/**
 * Fields whose value is free words, and the priority, which has none: they
 * are fields only next to the other fields, so "Fix 🔺 bug" and "⛔ Don't
 * touch prod" stay title text.
 */
const RUN_ONLY_FIELDS: ReadonlySet<TasksFieldKey> = new Set<TasksFieldKey>([
  "priority",
  "onCompletion",
  "id",
  "dependsOn",
]);

const codePointLength = (text: string, index: number): number =>
  (text.codePointAt(index) ?? 0) > 0xffff ? 2 : 1;

const stickyMatch = (pattern: RegExp, text: string, index: number) => {
  pattern.lastIndex = index;
  return pattern.exec(text)?.[0] ?? null;
};

const skipSpace = (text: string, index: number): number => {
  let at = index;
  while (at < text.length && SPACE.test(text[at])) {
    at++;
  }
  return at;
};

/** The ⏰ reminders written in `text`. */
export const remindersIn = (text: string): string[] =>
  text.match(REMINDERS) ?? [];

/** `text` without its ⏰ reminders and the whitespace before each. */
export const withoutReminders = (text: string): string =>
  text.replace(SPACED_REMINDERS, "");

type Token =
  | { kind: "field"; field: FieldText; end: number }
  | { kind: "text"; text: string; end: number };

/**
 * The field or reminder written at `index`, or null. A reminder, and a
 * field in RUN_ONLY_FIELDS, counts only when the fields go on after it
 * ("Call mom ⏰ 2026-10-16 09:00 about her birthday" is one sentence). A 🔁
 * rule counts only when it stands apart from the text after it.
 */
function tokenAt(text: string, index: number): Token | null {
  const codePoint = text.codePointAt(index) ?? 0;
  if (codePoint === REMINDER_CODE_POINT) {
    const reminder = stickyMatch(REMINDER, text, index);
    const end = index + (reminder?.length ?? 0);
    return reminder && endsFieldRun(text, end)
      ? { kind: "text", text: reminder, end }
      : null;
  }
  if (!FIELD_START_CODE_POINTS.has(codePoint)) {
    return null;
  }
  const match = matchFieldAt(text, index);
  if (
    !match ||
    (RUN_ONLY_FIELDS.has(match.field.key) && !endsFieldRun(text, match.end)) ||
    (match.field.key === "recurrence" && !standsApart(text, match.readEnd))
  ) {
    return null;
  }
  return { kind: "field", field: match.field, end: match.end };
}

/**
 * Whether the rule characters that end at `end` stand apart from the text
 * after them: they end at whitespace, at the end of the text or at the next
 * field, where Obsidian Tasks reads a rule once it takes the fields after
 * it off the line. A 🔁 whose rule runs straight into other text ("🔁 every
 * day at 9:30", "🔁 every week—see notes") is text, and the task does not
 * recur, as in Obsidian Tasks.
 */
function standsApart(text: string, end: number): boolean {
  return (
    end >= text.length ||
    SPACE.test(text[end]) ||
    SPACE.test(text[end - 1]) ||
    tokenAt(text, end) !== null
  );
}

/**
 * Whether only tags follow `from` up to the end, or up to the next field or
 * reminder: a field in RUN_ONLY_FIELDS or a reminder there counts.
 */
function endsFieldRun(text: string, from: number): boolean {
  let end = from;
  for (;;) {
    const next = skipSpace(text, end);
    if (next >= text.length || tokenAt(text, next)) {
      return true;
    }
    const tag = next > end ? stickyMatch(TAG, text, next) : null;
    if (!tag) {
      return false;
    }
    end = next + tag.length;
  }
}

/** Where a field or reminder may start: one of their symbols. */
const TOKEN_START = new RegExp(
  `[${[...FIELD_START_CODE_POINTS, REMINDER_CODE_POINT]
    .map((codePoint) => String.fromCodePoint(codePoint))
    .join("")}]`,
  "gu",
);

function firstTokenIndex(text: string, from: number): number {
  for (const candidate of text.matchAll(TOKEN_START)) {
    if (candidate.index >= from && tokenAt(text, candidate.index)) {
      return candidate.index;
    }
  }
  return -1;
}

/**
 * The end of the fields, reminders and tags the text starts with, when at
 * least one field or reminder is among them; else 0.
 */
function headEnd(text: string): number {
  let end = 0;
  let hasToken = false;
  for (;;) {
    const start = skipSpace(text, end);
    const token = start < text.length ? tokenAt(text, start) : null;
    const tag =
      token || (start === end && start > 0)
        ? null
        : stickyMatch(TAG, text, start);
    if (token) {
      end = token.end;
      hasToken = true;
    } else if (tag) {
      end = start + tag.length;
    } else {
      return hasToken ? end : 0;
    }
  }
}

/** The end of the word of other text starting at `index`. */
function textEnd(text: string, index: number): number {
  let end = index + codePointLength(text, index);
  while (end < text.length && !SPACE.test(text[end]) && !tokenAt(text, end)) {
    end += codePointLength(text, end);
  }
  return end;
}

/** Adds text, joining it to other text right before it. */
const withText = (
  parts: TailPart[],
  lead: string,
  text: string,
): TailPart[] => {
  const last = parts[parts.length - 1];
  return last?.kind === "text"
    ? [...parts.slice(0, -1), { ...last, text: last.text + lead + text }]
    : [...parts, { kind: "text", lead, text }];
};

/** The parts written from `from` up to `to`, and the whitespace after them. */
function readParts(
  text: string,
  from: number,
  to: number,
): { parts: TailPart[]; trailing: string } {
  let parts: TailPart[] = [];
  let index = from;
  for (;;) {
    const start = skipSpace(text, index);
    if (start >= to) {
      return { parts, trailing: text.slice(index, to) };
    }
    const lead = text.slice(index, start);
    const token = tokenAt(text, start);
    const tag =
      token || (lead === "" && start > 0)
        ? null
        : stickyMatch(TAG, text, start);
    if (token?.kind === "field") {
      parts = [...parts, { kind: "field", lead, field: token.field }];
      index = token.end;
    } else if (token) {
      parts = withText(parts, lead, token.text);
      index = token.end;
    } else if (tag) {
      parts = [...parts, { kind: "tag", lead, text: tag }];
      index = start + tag.length;
    } else {
      index = textEnd(text, start);
      parts = withText(parts, lead, text.slice(start, index));
    }
  }
}

/** Reads the text after a task's checkbox. */
export function readTaskBody(body: string): TaskBodyLayout {
  const block = BLOCK_LINK.exec(body);
  const blockLink = block ? block[0] : "";
  const rest = block ? body.slice(0, block.index) : body;
  // Fields before the title: the description is the text after them
  const end = headEnd(rest);
  const wordsAt = skipSpace(rest, end);
  const hasHead = end > 0 && wordsAt < rest.length;
  const descriptionStart = hasHead ? wordsAt : 0;
  const first = firstTokenIndex(rest, descriptionStart);
  const description = rest
    .slice(descriptionStart, first < 0 ? rest.length : first)
    .trimEnd();
  return {
    head: hasHead ? readParts(rest, 0, end).parts : [],
    descriptionLead: hasHead ? rest.slice(end, wordsAt) : "",
    description,
    ...readParts(rest, descriptionStart + description.length, rest.length),
    blockLink,
  };
}

const partText = (part: TailPart): string =>
  part.kind === "field" ? fieldText(part.field) : part.text;

const renderParts = (parts: readonly TailPart[]): string =>
  parts.map((part) => part.lead + partText(part)).join("");

export const renderTaskBody = (layout: TaskBodyLayout): string =>
  renderParts(layout.head) +
  layout.descriptionLead +
  layout.description +
  renderParts(layout.parts) +
  layout.trailing +
  layout.blockLink;

export const tagsOf = (parts: readonly TailPart[]): string[] =>
  parts.flatMap((part) => (part.kind === "tag" ? [part.text] : []));

/**
 * The title Obsidian Tasks reads: the description without ⏰ reminders, with
 * the tags written before and after the fields added back in line order
 * ("Pay rent 📅 2026-10-01 #home" is "Pay rent #home").
 */
export const titleOf = (layout: TaskBodyLayout): string =>
  [
    ...tagsOf(layout.head),
    withoutReminders(layout.description).trim(),
    ...tagsOf(layout.parts),
  ]
    .filter((text) => text !== "")
    .join(" ");

/**
 * The text after the description that is not a field, tag or ⏰ reminder:
 * notes and links ("📅 2026-10-16 see [[Garden]]" has "see [[Garden]]").
 */
export const notesOf = (layout: TaskBodyLayout): string =>
  layout.parts
    .flatMap((part) =>
      part.kind === "text" ? [withoutReminders(part.text).trim()] : [],
    )
    .filter((text) => text !== "")
    .join(" ");
