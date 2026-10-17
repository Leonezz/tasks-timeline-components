/**
 * Serializer for the Obsidian Tasks plugin emoji-based task format.
 *
 * Pure module: no React, no DOM.
 */
import type { Task, TaskStatus } from "../types";
import { MdMarkerToTaskStatus, getTaskStatusFromMarker } from "./symbols";
import { TaskRegularExpressions } from "./regex";
import { fieldText, taskFields } from "./fields";
import { readTaskBody } from "./layout";
import { writeTaskBody } from "./body-writer";

/**
 * Converts a task status to the corresponding markdown checkbox marker character.
 * @param status The task status (e.g., "done", "todo", "cancelled", "doing")
 * @returns The marker character (e.g., "x", " ", "-", "/")
 */
export const statusToMarker = (status: TaskStatus): string => {
  // Try to find the marker in the MdMarkerToTaskStatus map
  const entry = Object.entries(MdMarkerToTaskStatus).find(
    ([, s]) => s === status,
  );
  if (entry) {
    return entry[0];
  }

  // Fallback for known statuses if not found in map
  switch (status) {
    case "done":
      return "x";
    case "cancelled":
      return "-";
    case "doing":
      return "/";
    case "todo":
    default:
      return " ";
  }
};

/**
 * Formats the Tasks-plugin metadata tokens of a task: priority symbol (unless
 * "medium"), then due / start / scheduled (`extra.scheduledAt`) / created /
 * completed / cancelled dates (truncated to YYYY-MM-DD), then recurrence,
 * 🏁 `onCompletion`, 🆔 `taskId` and ⛔ `dependsOn`. RRULE-syntax rules are
 * written as Obsidian Tasks text ("every week on Monday"); one that can't be
 * (for example with a start date) throws instead of breaking the line, as do
 * ids and actions a line can't hold.
 *
 * Tokens are joined by single spaces with no leading or trailing whitespace.
 * Returns an empty string when the task has no metadata. Never includes the
 * title, tags, block link or checkbox.
 */
export const formatTasksMetadata = (task: Task): string =>
  taskFields(task).map(fieldText).join(" ");

const parseFrontmatterTags = (task: Task): string[] => {
  const ft: unknown = task.extra?.["frontmatterTags"];
  if (!ft) {
    return [];
  }
  try {
    if (Array.isArray(ft)) {
      return ft.filter((tag): tag is string => typeof tag === "string");
    }
    if (typeof ft === "string") {
      const parsed: unknown = JSON.parse(ft);
      if (Array.isArray(parsed)) {
        return parsed.filter((tag): tag is string => typeof tag === "string");
      }
    }
  } catch (e) {
    console.warn("Failed to parse frontmatterTags", e);
  }
  return [];
};

/**
 * The task's tags that belong on its line, with "#": all but tags that only
 * come from the note's frontmatter (those stay when the line has them too).
 */
const inlineTags = (task: Task, originalLine: string): string[] => {
  const frontmatterTags = parseFrontmatterTags(task);
  return (task.tags ?? [])
    .map((tag) => (tag.name.startsWith("#") ? tag.name : "#" + tag.name))
    .filter(
      (tagName) =>
        !frontmatterTags.includes(tagName) || originalLine.includes(tagName),
    );
};

/**
 * The line's start up to the text, with the checkbox showing the task's
 * status. A marker that already means that status (such as a custom "[>]"
 * read as todo) is kept.
 */
const withStatus = (head: string, status: TaskStatus): string => {
  const marker = statusToMarker(status);
  return head.replace(
    TaskRegularExpressions.checkboxRegex,
    (box: string, current: string) =>
      statusToMarker(getTaskStatusFromMarker(current)) === marker
        ? box
        : `[${marker}]`,
  );
};

/**
 * Writes a task onto its original markdown line, changing only what the task
 * changed: the checkbox, the title and tags, and each field in its place.
 * The indentation, list marker, block id (`^id`), ⏰ reminders, notes and
 * links stay as written, so a task read from the line and written back
 * unchanged gives the line byte for byte.
 *
 * The line written reads back as the task. Fields the task gained go after
 * the line's last field, or before a field when notes follow it (a priority
 * or a 🔁 rule right before notes would not be read back). A field that no
 * longer reads back where it is, such as a rule followed by notes once the
 * field between them is removed, moves the same way. When no field is left
 * that can stand between the title and the notes, the notes join the title,
 * as Obsidian Tasks reads such a line; no text is dropped. On a line without
 * notes (a new line), the task's `extra.lineNotes` are written after the
 * fields.
 *
 * @param task The updated Task object.
 * @param originalLine The original markdown line from the file.
 * @returns The new markdown line, or `originalLine` when it is not a task line.
 * @throws When the task holds a value a line can't (see formatTasksMetadata),
 * or when the line would not read back as the task (a title that would be
 * read as a field, such as "Fix bug 🔺" before a date).
 */
export const taskToMarkdown = (task: Task, originalLine: string): string => {
  const match = TaskRegularExpressions.taskRegex.exec(originalLine);
  if (!match) {
    return originalLine;
  }
  const body = match[4];
  const bodyEnd = match.index + match[0].length;
  const head = originalLine.slice(0, bodyEnd - body.length);
  return (
    withStatus(head, task.status) +
    writeTaskBody(readTaskBody(body), task, inlineTags(task, originalLine)) +
    originalLine.slice(bodyEnd)
  );
};
