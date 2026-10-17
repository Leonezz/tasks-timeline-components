import type { Task } from "../types";
import { deriveWorkflowStatus, isTaskRecurring } from "./task";

export const STALE_EDITOR_ERROR =
  "This task changed since you opened it — close and reopen it.";

/** Stored fields compared as they are (null and missing are the same). */
const PLAIN_FIELDS = [
  "title",
  "description",
  "priority",
  "category",
  "createdAt",
  "startAt",
  "dueAt",
  "completedAt",
  "cancelledAt",
  "recurringInterval",
] as const;

/** Tags by name and color: hosts may give the same tag a new id on reload. */
const tagsKey = (task: Task): string =>
  JSON.stringify(task.tags.map((tag) => [tag.name, tag.color ?? null]));

/** `extra` without the source line (compared on its own) and unset keys. */
const extraKey = (task: Task): string =>
  JSON.stringify(
    Object.entries(task.extra ?? {})
      .filter(([key, value]) => key !== "rawText" && value !== undefined)
      .sort(([a], [b]) => a.localeCompare(b)),
  );

/**
 * Whether every stored field an editor save writes back is unchanged. The
 * status is compared as it is saved (display statuses such as "due" are
 * stored as "todo"), and the recurrence switch as it is read.
 */
const sameStoredFields = (a: Task, b: Task): boolean =>
  PLAIN_FIELDS.every((field) => (a[field] ?? null) === (b[field] ?? null)) &&
  deriveWorkflowStatus(a) === deriveWorkflowStatus(b) &&
  isTaskRecurring(a) === isTaskRecurring(b) &&
  tagsKey(a) === tagsKey(b) &&
  extraKey(a) === extraKey(b);

/**
 * Whether `current` is still the task an editor opened as `opened`. Hosts may
 * reuse ids (the Obsidian plugin uses line positions), so after a reload the
 * same id can belong to another task, or the task may have changed elsewhere.
 * Compares the source line when both have one, else every stored field the
 * editor's save would overwrite.
 */
export function isSameTaskVersion(opened: Task, current: Task): boolean {
  const openedLine = opened.extra?.rawText;
  const currentLine = current.extra?.rawText;
  if (openedLine !== undefined && currentLine !== undefined) {
    return openedLine === currentLine;
  }
  return sameStoredFields(opened, current);
}

/**
 * Saves an update through the host and returns what was saved. With
 * `opened` (the task as an editor opened it), refuses when the task now at
 * that id is no longer that task, and passes `opened` as the previous
 * version so the host can check too.
 */
export async function persistTaskUpdate(
  tasks: Task[],
  updated: Task,
  onTaskUpdated: (task: Task, previous: Task) => void | Promise<void>,
  opened?: Task,
): Promise<Task> {
  const current = tasks.find((task) => task.id === updated.id);
  if (!current) {
    throw new Error(
      opened
        ? "This task no longer exists — close the editor."
        : `Task ${updated.id} not found`,
    );
  }
  if (opened && !isSameTaskVersion(opened, current)) {
    throw new Error(STALE_EDITOR_ERROR);
  }
  // Persist only the explicit workflow status; dates drive render state.
  const processed = { ...updated, status: deriveWorkflowStatus(updated) };
  await onTaskUpdated(processed, opened ?? current);
  return processed;
}
