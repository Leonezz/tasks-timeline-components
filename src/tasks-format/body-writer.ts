/**
 * Writes a task onto the layout of its line: each field the task changed is
 * replaced in place, fields it dropped are removed with the space before
 * them, and everything else stays as written. New fields, and fields that no
 * longer read back where they are, are placed by `placeFields`.
 *
 * Pure module: no React, no DOM.
 */
import type { Task } from "../types";
import {
  type TasksFieldKey,
  sameValue,
  taskFields,
  withValue,
  writtenValue,
} from "./fields";
import {
  type TailPart,
  type TaskBodyLayout,
  notesOf,
  remindersIn,
  renderTaskBody,
  tagsOf,
  withoutReminders,
} from "./layout";
import {
  type FieldPart,
  editedPart,
  firstFields,
  isField,
  placeFields,
} from "./field-placement";
import { TaskRegularExpressions } from "./regex";

/** What happens to the first field of a kind: kept, given a new value, or removed. */
type FieldEdit = { keep: true } | { value: string } | { remove: true };

function fieldEdit(part: FieldPart, task: Task): FieldEdit {
  if (sameValue(part.field, task)) {
    return { keep: true };
  }
  const value = writtenValue(part.field.key, task);
  return value === undefined ? { remove: true } : { value };
}

/**
 * The parts with the task's fields written in. A field written twice is
 * edited at its first place; the later ones stay unless the field is removed.
 */
function editInPlace(
  parts: readonly TailPart[],
  edits: ReadonlyMap<TasksFieldKey, FieldEdit>,
  firsts: readonly FieldPart[],
): TailPart[] {
  return parts.flatMap((part): TailPart[] => {
    const edit = isField(part) ? edits.get(part.field.key) : undefined;
    if (!isField(part) || !edit || "keep" in edit) {
      return [part];
    }
    if ("remove" in edit) {
      return [];
    }
    return firsts.includes(part)
      ? [editedPart(part, { field: withValue(part.field, edit.value) })]
      : [part];
  });
}

const hashtagsIn = (text: string): string[] =>
  [...text.matchAll(TaskRegularExpressions.hashTags)].map((match) =>
    match[0].trim(),
  );

/**
 * The words of a description without its tags (and the space before each,
 * as the Obsidian plugin takes them out) and ⏰ reminders.
 */
const withoutHashtags = (text: string): string =>
  withoutReminders(text)
    .replace(TaskRegularExpressions.hashTags, "")
    .split(/\s+/)
    .filter((word) => word !== "")
    .join(" ");

/** Same words in the same order, and the same tags anywhere among them. */
const sameDescription = (a: string, b: string): boolean =>
  withoutHashtags(a) === withoutHashtags(b) &&
  hashtagsIn(a).sort().join(" ") === hashtagsIn(b).sort().join(" ");

const TAG_TEXT = '#[^\\s!@#$%^&*(),.?":{}|<>]+';
const TRAILING_TAG = new RegExp(`(?:^|\\s+)(${TAG_TEXT})$`, "u");
const LEADING_TAG = new RegExp(`^(${TAG_TEXT})(?:\\s+|$)`, "u");

/** The title without the tags at its end that stay after the description. */
function withoutTailTags(title: string, tailTags: readonly string[]): string {
  const match = TRAILING_TAG.exec(title);
  const at = match ? tailTags.lastIndexOf(match[1]) : -1;
  return match && at >= 0
    ? withoutTailTags(title.slice(0, match.index), [
        ...tailTags.slice(0, at),
        ...tailTags.slice(at + 1),
      ])
    : title;
}

/** The title without the tags at its start that stay before the description. */
function withoutHeadTags(title: string, headTags: readonly string[]): string {
  const match = LEADING_TAG.exec(title);
  const at = match ? headTags.indexOf(match[1]) : -1;
  return match && at >= 0
    ? withoutHeadTags(title.slice(match[0].length), [
        ...headTags.slice(0, at),
        ...headTags.slice(at + 1),
      ])
    : title;
}

/** New description words, with the ⏰ reminders of the old description kept. */
const withReminders = (words: string, description: string): string =>
  [
    words,
    ...remindersIn(description).filter((reminder) => !words.includes(reminder)),
  ]
    .filter((text) => text !== "")
    .join(" ");

/**
 * The layout with the task's title and tags. Tags before and after the
 * description stay there while the task has them; the description is
 * rewritten only when its words or tags changed, keeping its ⏰ reminders.
 */
function editDescription(
  layout: TaskBodyLayout,
  task: Task,
  inlineTags: readonly string[],
): TaskBodyLayout {
  const wanted = new Set([...hashtagsIn(task.title), ...inlineTags]);
  const kept = (part: TailPart) => part.kind !== "tag" || wanted.has(part.text);
  const head = layout.head.filter(kept);
  const parts = layout.parts.filter(kept);
  const title = withoutTailTags(
    withoutHeadTags(task.title.trim(), tagsOf(head)),
    tagsOf(parts),
  );
  const titleTags = new Set([
    ...hashtagsIn(title),
    ...tagsOf(head),
    ...tagsOf(parts),
  ]);
  const words = [
    title,
    ...[...new Set(inlineTags)].filter((tag) => !titleTags.has(tag)),
  ]
    .filter((text) => text !== "")
    .join(" ");
  return {
    ...layout,
    head,
    parts,
    description: sameDescription(words, layout.description)
      ? layout.description
      : withReminders(words, layout.description),
  };
}

/**
 * The layout with the task's notes (`extra.lineNotes`) after the fields,
 * when the line has none: a new line written for a task read from another,
 * such as the next occurrence of a recurring task.
 */
function withNotes(
  layout: TaskBodyLayout,
  original: TaskBodyLayout,
  task: Task,
): TaskBodyLayout {
  const notes = task.extra?.lineNotes?.trim();
  return notes && notesOf(original) === ""
    ? {
        ...layout,
        parts: [...layout.parts, { kind: "text", lead: " ", text: notes }],
      }
    : layout;
}

/**
 * The text after the checkbox for `task`, written onto the layout of its
 * original line. `inlineTags` are the task's tags that belong on the line.
 *
 * @throws When the line can't be read back as the task (see placeFields).
 */
export function writeTaskBody(
  layout: TaskBodyLayout,
  task: Task,
  inlineTags: readonly string[],
): string {
  const firsts = firstFields([...layout.head, ...layout.parts]);
  const edits = new Map(
    firsts.map((part) => [part.field.key, fieldEdit(part, task)] as const),
  );
  const edited = editDescription(
    {
      ...layout,
      head: editInPlace(layout.head, edits, firsts),
      parts: editInPlace(layout.parts, edits, firsts),
    },
    task,
    inlineTags,
  );
  const added = taskFields(task).filter((field) => !edits.has(field.key));
  return renderTaskBody(
    placeFields(layout, withNotes(edited, layout, task), added, task),
  );
}
