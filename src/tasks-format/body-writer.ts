/**
 * Writes a task onto the layout of its line: each part the task changed is
 * replaced in place, parts it dropped are removed with the space before them,
 * new fields go after the last field, and everything else stays as written.
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
import { type TailPart, type TaskBodyLayout, renderTaskBody } from "./layout";
import { TaskRegularExpressions } from "./regex";

type FieldPart = Extract<TailPart, { kind: "field" }>;

/** What happens to the first field of a kind: kept, given a new value, or removed. */
type FieldEdit = { keep: true } | { value: string } | { remove: true };

function fieldEdit(part: FieldPart, task: Task): FieldEdit {
  if (sameValue(part.field, task)) {
    return { keep: true };
  }
  const value = writtenValue(part.field.key, task);
  return value === undefined ? { remove: true } : { value };
}

const isField = (part: TailPart): part is FieldPart => part.kind === "field";

/**
 * The parts with the task's fields written in. A field written twice is
 * edited at its first place; the later ones stay unless the field is removed.
 */
function editFields(parts: readonly TailPart[], task: Task): TailPart[] {
  const fields = parts.filter(isField);
  const firsts = fields.filter(
    (part, index) =>
      fields.findIndex((other) => other.field.key === part.field.key) === index,
  );
  const edits = new Map<TasksFieldKey, FieldEdit>(
    firsts.map((part) => [part.field.key, fieldEdit(part, task)]),
  );
  const edited = parts.flatMap((part): TailPart[] => {
    const edit = isField(part) ? edits.get(part.field.key) : undefined;
    if (!isField(part) || !edit || "keep" in edit) {
      return [part];
    }
    if ("remove" in edit) {
      return [];
    }
    return firsts.includes(part)
      ? [{ ...part, field: withValue(part.field, edit.value) }]
      : [part];
  });

  const added: TailPart[] = taskFields(task)
    .filter((field) => !edits.has(field.key))
    .map((field) => ({ kind: "field", lead: " ", field }));
  const lastField = edited.map(isField).lastIndexOf(true);
  return [
    ...edited.slice(0, lastField + 1),
    ...added,
    ...edited.slice(lastField + 1),
  ];
}

const hashtagsIn = (text: string): string[] =>
  [...text.matchAll(TaskRegularExpressions.hashTags)].map((match) =>
    match[0].trim(),
  );

const withoutHashtags = (text: string): string =>
  text
    .replace(TaskRegularExpressions.hashTags, " ")
    .split(/\s+/)
    .filter((word) => word !== "")
    .join(" ");

/** Same words in the same order, and the same tags anywhere among them. */
const sameDescription = (a: string, b: string): boolean =>
  withoutHashtags(a) === withoutHashtags(b) &&
  hashtagsIn(a).sort().join(" ") === hashtagsIn(b).sort().join(" ");

const TRAILING_TAG = /(?:^|\s+)(#[^\s!@#$%^&*(),.?":{}|<>]+)$/u;

/** The title without the tags at its end that stay after the fields. */
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

/**
 * The description and tail parts for the task's title and tags. Tags after
 * the fields stay there while the task has them; the description is rewritten
 * only when its words or tags changed.
 */
function editDescription(
  layout: TaskBodyLayout,
  parts: readonly TailPart[],
  task: Task,
  inlineTags: readonly string[],
): { description: string; parts: TailPart[] } {
  const wanted = new Set([...hashtagsIn(task.title), ...inlineTags]);
  const keptParts = parts.filter(
    (part) => part.kind !== "tag" || wanted.has(part.text),
  );
  const tailTags = keptParts.flatMap((part) =>
    part.kind === "tag" ? [part.text] : [],
  );
  const title = withoutTailTags(task.title.trim(), tailTags);
  const titleTags = new Set([...hashtagsIn(title), ...tailTags]);
  const description = [
    title,
    ...[...new Set(inlineTags)].filter((tag) => !titleTags.has(tag)),
  ]
    .filter((text) => text !== "")
    .join(" ");
  return {
    description: sameDescription(description, layout.description)
      ? layout.description
      : description,
    parts: keptParts,
  };
}

/**
 * Keeps the description and the first part apart when either changed, and
 * the text from starting with whitespace.
 */
function spaced(
  layout: TaskBodyLayout,
  description: string,
  parts: TailPart[],
): TailPart[] {
  const [first, ...rest] = parts;
  const unchanged =
    description === layout.description && first?.lead === layout.parts[0]?.lead;
  if (!first || unchanged) {
    return parts;
  }
  if (description === "") {
    return [{ ...first, lead: "" }, ...rest];
  }
  return first.lead === "" ? [{ ...first, lead: " " }, ...rest] : parts;
}

/**
 * The text after the checkbox for `task`, written onto the layout of its
 * original line. `inlineTags` are the task's tags that belong on the line.
 */
export function writeTaskBody(
  layout: TaskBodyLayout,
  task: Task,
  inlineTags: readonly string[],
): string {
  const { description, parts } = editDescription(
    layout,
    editFields(layout.parts, task),
    task,
    inlineTags,
  );
  return renderTaskBody({
    ...layout,
    description,
    parts: spaced(layout, description, parts),
  });
}
