/**
 * Parser for the Obsidian Tasks plugin emoji-based task format.
 *
 * Pure module: no React, no DOM.
 */
import type { Task } from "../types";
import { readFieldValues } from "./fields";
import { readTaskBody, titleOf } from "./layout";

/**
 * Reads the Obsidian Tasks fields of a task whose `title` is the text after
 * the checkbox, as Obsidian Tasks does (originally its `fromLine`):
 *
 * - `title` is the text before the first field, with the tags written after
 *   the fields added back. A trailing block id (`^id`), notes, links and ⏰
 *   reminders after the fields are not part of it; `taskToMarkdown` keeps
 *   them where they are.
 * - Fields: priority, 📅 due, 🛫 start, ⏳ scheduled (`extra.scheduledAt`),
 *   ➕ created, ✅ done (`completedAt`), ❌ cancelled (`cancelledAt`),
 *   🔁 recurrence (`recurringInterval`), 🏁 `onCompletion`, 🆔 `taskId` and
 *   ⛔ `dependsOn`. When a field is written twice, the first one counts.
 */
export const parseTasksFormatItem = (item: Task): Task => {
  const layout = readTaskBody(item.title);
  const { scheduledAt, priority, ...values } = readFieldValues(
    layout.parts.flatMap((part) => (part.kind === "field" ? [part.field] : [])),
  );
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
      isTasksTask: isTasksTask ? "true" : "false",
    },
  };
};
