/**
 * The layout of a task line's text (after the checkbox): the description,
 * then the fields, tags and other text after it, then the block id. Reading
 * keeps every character, so an unchanged layout renders the text it was
 * read from byte for byte.
 *
 * Pure module: no React, no DOM.
 */
import {
  type FieldText,
  FIELD_START_CODE_POINTS,
  fieldText,
  matchFieldAt,
} from "./fields";

/** A part after the description, with the whitespace before it. */
export type TailPart =
  | { kind: "field"; lead: string; field: FieldText }
  | { kind: "tag"; lead: string; text: string }
  /** Anything else (notes, links, ⏰ reminders), kept as written. */
  | { kind: "text"; lead: string; text: string };

export interface TaskBodyLayout {
  /** The text before the first field, as written (no trailing whitespace). */
  description: string;
  parts: TailPart[];
  /** The whitespace after the last part (or after the description). */
  trailing: string;
  /** The block id with the whitespace around it, as written, or "". */
  blockLink: string;
}

/** A block id ends the line (Obsidian Tasks: / \^[a-zA-Z0-9-]+$/). */
const BLOCK_LINK = /\s+\^[a-zA-Z0-9-]+\s*$/u;
/** An obsidian-reminder ⏰ date (and time): not a Tasks field, ends the description. */
const REMINDER = /⏰\uFE0F? *\d{4}-\d{2}-\d{2}(?: +\d{1,2}:\d{2})?/uy;
const REMINDER_CODE_POINT = 0x23f0;
/** A tag, as the hashTags regex reads one (at least one character after #). */
const TAG = /#[^\s!@#$%^&*(),.?":{}|<>]+/uy;
const SPACE = /\s/u;

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

type Token =
  | { kind: "field"; field: FieldText; end: number }
  | { kind: "text"; text: string; end: number };

/** The field or reminder written at `index`, or null. */
function tokenAt(text: string, index: number): Token | null {
  const codePoint = text.codePointAt(index) ?? 0;
  if (codePoint === REMINDER_CODE_POINT) {
    const reminder = stickyMatch(REMINDER, text, index);
    return reminder
      ? { kind: "text", text: reminder, end: index + reminder.length }
      : null;
  }
  if (!FIELD_START_CODE_POINTS.has(codePoint)) {
    return null;
  }
  const match = matchFieldAt(text, index);
  if (!match) {
    return null;
  }
  // A priority emoji inside the description ("Fix 🔺 bug") is not a field
  if (match.field.key === "priority" && !endsFieldRun(text, match.end)) {
    return null;
  }
  return { kind: "field", ...match };
}

/**
 * Whether only fields, reminders and tags follow `from` up to the end, or
 * up to the next field: a priority emoji there is a field.
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

function firstTokenIndex(text: string): number {
  for (const candidate of text.matchAll(TOKEN_START)) {
    if (tokenAt(text, candidate.index)) {
      return candidate.index;
    }
  }
  return -1;
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

function readTail(
  text: string,
  from: number,
): { parts: TailPart[]; trailing: string } {
  let parts: TailPart[] = [];
  let index = from;
  for (;;) {
    const start = skipSpace(text, index);
    if (start >= text.length) {
      return { parts, trailing: text.slice(index) };
    }
    const lead = text.slice(index, start);
    const token = tokenAt(text, start);
    const tag = token || lead === "" ? null : stickyMatch(TAG, text, start);
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
  const first = firstTokenIndex(rest);
  const description = (first < 0 ? rest : rest.slice(0, first)).trimEnd();
  if (first < 0) {
    return {
      description,
      parts: [],
      trailing: rest.slice(description.length),
      blockLink,
    };
  }
  return { description, ...readTail(rest, description.length), blockLink };
}

const partText = (part: TailPart): string =>
  part.kind === "field" ? fieldText(part.field) : part.text;

export const renderTaskBody = (layout: TaskBodyLayout): string =>
  layout.description +
  layout.parts.map((part) => part.lead + partText(part)).join("") +
  layout.trailing +
  layout.blockLink;

/**
 * The title Obsidian Tasks reads: the description, with the tags after the
 * fields added back ("Pay rent 📅 2026-10-01 #home" is "Pay rent #home").
 */
export const titleOf = (layout: TaskBodyLayout): string =>
  [
    layout.description.trim(),
    ...layout.parts.flatMap((part) => (part.kind === "tag" ? [part.text] : [])),
  ]
    .filter((text) => text !== "")
    .join(" ");
