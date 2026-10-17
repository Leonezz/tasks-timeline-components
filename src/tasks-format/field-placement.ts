/**
 * Where fields go on a written task line, so that the line reads back as the
 * task: new fields, and fields that no longer read back where they are (a 🔁
 * rule now followed by notes, a priority no longer next to a field), go
 * where the fields go on after them. The whitespace around the parts that
 * changed is fixed here too.
 *
 * Pure module: no React, no DOM.
 */
import type { Task } from "../types";
import {
  type FieldText,
  type TasksFieldKey,
  WRITE_ORDER,
  isDateField,
  sameValue,
  writtenValue,
} from "./fields";
import {
  type TailPart,
  type TaskBodyLayout,
  readTaskBody,
  renderTaskBody,
  titleOf,
} from "./layout";

export type FieldPart = Extract<TailPart, { kind: "field" }>;

export const isField = (part: TailPart): part is FieldPart =>
  part.kind === "field";

/** The first field of each kind: the one Obsidian Tasks reads. */
export const firstFields = (parts: readonly TailPart[]): FieldPart[] => {
  const fields = parts.filter(isField);
  return fields.filter(
    (part, index) =>
      fields.findIndex((other) => other.field.key === part.field.key) === index,
  );
};

/** The part of the line each edited part was made from. */
const ORIGINS = new WeakMap<object, object>();

const originOf = (part: object): object => ORIGINS.get(part) ?? part;

/**
 * `part` with `changes`, remembered as the same part of the line, so it
 * keeps its place among the others and the whitespace around it.
 */
export const editedPart = <P extends TailPart>(
  part: P,
  changes: Partial<P>,
): P => {
  const edited = { ...part, ...changes };
  ORIGINS.set(edited, originOf(part));
  return edited;
};

const allParts = (layout: TaskBodyLayout): TailPart[] => [
  ...layout.head,
  ...layout.parts,
];

/** The description as a part, to space it like the others. */
type Segment = TailPart | { kind: "description"; lead: string; text: string };

const descriptionSegment = (layout: TaskBodyLayout): Segment | null =>
  layout.description === ""
    ? null
    : {
        kind: "description",
        lead: layout.descriptionLead,
        text: layout.description,
      };

/**
 * The layout with whitespace fixed where parts were removed, added or
 * changed: the text starts without whitespace, and a part that is new next
 * to another is apart from it. Parts next to the same part as before keep
 * their whitespace, so an unchanged layout stays as it is.
 */
export function respaced(
  original: TaskBodyLayout,
  layout: TaskBodyLayout,
): TaskBodyLayout {
  const originalDescription = descriptionSegment(original);
  const description =
    layout.description === original.description
      ? originalDescription
      : descriptionSegment(layout);
  const before: Segment[] = [
    ...original.head,
    ...(originalDescription ? [originalDescription] : []),
    ...original.parts,
  ];
  const after: Segment[] = [
    ...layout.head,
    ...(description ? [description] : []),
    ...layout.parts,
  ];
  const wasNext = (previous: Segment, segment: Segment): boolean => {
    const at = before.indexOf(originOf(previous) as Segment);
    return at >= 0 && before[at + 1] === originOf(segment);
  };
  const spaced = after.map((segment, index): Segment => {
    if (index === 0) {
      return originOf(segment) === before[0]
        ? segment
        : { ...segment, lead: "" };
    }
    return segment.lead === "" && !wasNext(after[index - 1], segment)
      ? { ...segment, lead: " " }
      : segment;
  });
  const headLength = layout.head.length;
  const descriptionAt = spaced[headLength];
  const hasDescription = description !== null;
  return {
    ...layout,
    head: spaced.slice(0, headLength) as TailPart[],
    descriptionLead: hasDescription && descriptionAt ? descriptionAt.lead : "",
    parts: spaced.slice(headLength + (hasDescription ? 1 : 0)) as TailPart[],
  };
}

/** The fields of the layout that don't read back as the task holds them. */
function misreadKeys(read: TaskBodyLayout, task: Task): TasksFieldKey[] {
  const fields = firstFields(allParts(read));
  return WRITE_ORDER.filter((key) => {
    const part = fields.find((field) => field.field.key === key);
    return part
      ? !sameValue(part.field, task)
      : writtenValue(key, task) !== undefined;
  });
}

const readBack = (layout: TaskBodyLayout): TaskBodyLayout =>
  readTaskBody(renderTaskBody(layout));

/**
 * Takes out the fields that don't read back where they are (after an edit
 * or a removal next to them), to place them again.
 */
function withoutMisread(
  original: TaskBodyLayout,
  layout: TaskBodyLayout,
  task: Task,
): { layout: TaskBodyLayout; moved: FieldText[] } {
  const misread = new Set(
    misreadKeys(readBack(respaced(original, layout)), task),
  );
  const fields = firstFields(allParts(layout)).filter((part) =>
    misread.has(part.field.key),
  );
  if (fields.length === 0) {
    return { layout, moved: [] };
  }
  const kept = (part: TailPart) => !fields.includes(part as FieldPart);
  const rest = withoutMisread(
    original,
    {
      ...layout,
      head: layout.head.filter(kept),
      parts: layout.parts.filter(kept),
    },
    task,
  );
  return {
    layout: rest.layout,
    moved: [...fields.map((part) => part.field), ...rest.moved],
  };
}

/**
 * Where new fields may go, best first: after the last field, before a field
 * (the last one first), at the end.
 */
function positions(parts: readonly TailPart[]): number[] {
  const fieldIndexes = parts.flatMap((part, index) =>
    isField(part) ? [index] : [],
  );
  const last = fieldIndexes[fieldIndexes.length - 1] ?? -1;
  return [...new Set([last + 1, ...[...fieldIndexes].reverse(), parts.length])];
}

/**
 * The orders new fields may be written in: `formatTasksMetadata` order, then
 * with the dates last, since text may follow a date but not a rule.
 */
function orders(fields: readonly FieldText[]): FieldText[][] {
  const sorted = [...fields].sort(
    (a, b) => WRITE_ORDER.indexOf(a.key) - WRITE_ORDER.indexOf(b.key),
  );
  const datesLast = [
    ...sorted.filter((field) => !isDateField(field.key)),
    ...sorted.filter((field) => isDateField(field.key)),
  ];
  return datesLast.every((field, index) => field === sorted[index])
    ? [sorted]
    : [sorted, datesLast];
}

function* placements(
  original: TaskBodyLayout,
  layout: TaskBodyLayout,
  fields: readonly FieldText[],
): Generator<TaskBodyLayout> {
  if (fields.length === 0) {
    yield respaced(original, layout);
    return;
  }
  for (const at of positions(layout.parts)) {
    for (const order of orders(fields)) {
      const added = order.map(
        (field): TailPart => ({ kind: "field", lead: " ", field }),
      );
      yield respaced(original, {
        ...layout,
        parts: [
          ...layout.parts.slice(0, at),
          ...added,
          ...layout.parts.slice(at),
        ],
      });
    }
  }
}

const firstOf = <T>(
  items: Iterable<T>,
  test: (item: T) => boolean,
): T | undefined => {
  for (const item of items) {
    if (test(item)) {
      return item;
    }
  }
  return undefined;
};

const FIELD_NAMES: Record<TasksFieldKey, string> = {
  priority: "priority",
  due: "due date",
  start: "start date",
  scheduled: "scheduled date",
  created: "created date",
  done: "done date",
  cancelled: "cancelled date",
  recurrence: "recurrence",
  onCompletion: "on-completion action",
  id: "task id",
  dependsOn: "dependencies",
};

/**
 * The layout with `added` fields written where the line reads back as the
 * task. Fields that no longer read back where they are move with them. The
 * title stays apart from the notes after the fields when a field can stand
 * between them; when none can, the notes join the title (as Obsidian Tasks
 * reads such a line), and nothing is dropped.
 *
 * @throws When no place reads back as the task, for example when the title
 * itself would be read as a field ("Fix bug 🔺" before a date).
 */
export function placeFields(
  original: TaskBodyLayout,
  layout: TaskBodyLayout,
  added: readonly FieldText[],
  task: Task,
): TaskBodyLayout {
  const settled = withoutMisread(original, layout, task);
  const fields = [...added, ...settled.moved];
  const title = titleOf(respaced(original, settled.layout));
  const readsBack = (candidate: TaskBodyLayout, sameTitle: boolean) => {
    const read = readBack(candidate);
    return (
      misreadKeys(read, task).length === 0 &&
      (!sameTitle || titleOf(read) === title)
    );
  };
  const placed =
    firstOf(placements(original, settled.layout, fields), (candidate) =>
      readsBack(candidate, true),
    ) ??
    firstOf(placements(original, settled.layout, fields), (candidate) =>
      readsBack(candidate, false),
    );
  if (placed) {
    return placed;
  }
  const [attempt] = placements(original, settled.layout, fields);
  const body = renderTaskBody(attempt);
  const names = misreadKeys(readTaskBody(body), task).map(
    (key) => FIELD_NAMES[key],
  );
  throw new Error(
    `Cannot write the task on its Obsidian Tasks line: "${body}" would be read back with a different ${names.join(", ")}. Change the title, or edit the line in the note.`,
  );
}
