import type { Task } from "../types";
import { deriveWorkflowStatus } from "./task";

export const STALE_EDITOR_ERROR =
  "This task changed since you opened it — close and reopen it.";

/**
 * Whether `current` is still the task an editor opened as `opened`. Hosts may
 * reuse ids (the Obsidian plugin uses line positions), so after a reload the
 * same id can belong to another task, or the task may have changed elsewhere.
 * Compares the source line when both have one, else the title and dates.
 */
export function isSameTaskVersion(opened: Task, current: Task): boolean {
  const openedLine = opened.extra?.rawText;
  const currentLine = current.extra?.rawText;
  if (openedLine !== undefined && currentLine !== undefined) {
    return openedLine === currentLine;
  }
  return (
    opened.title === current.title &&
    opened.dueAt === current.dueAt &&
    opened.startAt === current.startAt &&
    opened.createdAt === current.createdAt &&
    opened.completedAt === current.completedAt &&
    opened.extra?.scheduledAt === current.extra?.scheduledAt
  );
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
