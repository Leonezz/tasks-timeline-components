/**
 * Parser for the Obsidian Tasks plugin emoji-based task format.
 *
 * Pure module: no React, no DOM.
 */
import type { Task } from "../types";
import { readFieldValues } from "./fields";
import { notesOf, readTaskBody, titleOf } from "./layout";

/**
 * Reads the Obsidian Tasks fields of a task whose `title` is the text after
 * the checkbox, as Obsidian Tasks does (originally its `fromLine`):
 *
 * - `title` is the text before the first field (or, on a line that starts
 *   with fields, the text after them), with the tags written around the
 *   fields added back. ⏰ reminders, a trailing block id (`^id`), and notes
 *   and links after the fields are not part of it; `taskToMarkdown` keeps
 *   them where they are. 🏁, 🆔, ⛔ and priority emoji count as fields only
 *   next to the other fields, so "⛔ Don't touch prod" stays title text.
 * - `extra.lineNotes` is the notes and links after the fields, which
 *   `taskToMarkdown` writes on a new line for the task (the next occurrence
 *   of a recurring task); ⏰ reminders, which are for one occurrence, are not
 *   part of it.
 * - Fields: priority, 📅 due, 🛫 start, ⏳ scheduled (`extra.scheduledAt`),
 *   ➕ created, ✅ done (`completedAt`), ❌ cancelled (`cancelledAt`),
 *   🔁 recurrence (`recurringInterval`), 🏁 `onCompletion`, 🆔 `taskId` and
 *   ⛔ `dependsOn`. When a field is written twice, the first one counts.
 */
export const parseTasksFormatItem = (item: Task): Task => {
  const layout = readTaskBody(item.title);
  const { scheduledAt, priority, ...values } = readFieldValues(
    [...layout.head, ...layout.parts].flatMap((part) =>
      part.kind === "field" ? [part.field] : [],
    ),
  );
  const notes = notesOf(layout);
  const isTasksTask = [
    values.startAt,
    scheduledAt,
    values.dueAt,
    values.completedAt,
    values.createdAt,
    values.cancelledAt,
  ].some((date) => !!date);

  return {
    ...item,
    title: titleOf(layout),
    priority: priority ?? "medium",
    isRecurring: !!values.recurringInterval,
    recurringInterval: values.recurringInterval,
    dueAt: values.dueAt,
    createdAt: values.createdAt,
    startAt: values.startAt,
    completedAt: values.completedAt,
    cancelledAt: values.cancelledAt,
    onCompletion: values.onCompletion,
    taskId: values.taskId,
    dependsOn: values.dependsOn,
    extra: {
      ...item.extra,
      ...(scheduledAt ? { scheduledAt } : {}),
      ...(notes ? { lineNotes: notes } : {}),
      isTasksTask: isTasksTask ? "true" : "false",
    },
  };
};
