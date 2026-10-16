/**
 * Serializer for the Obsidian Tasks plugin emoji-based task format.
 *
 * Pure module: no React, no DOM.
 */
import type { Task, TaskStatus } from "../types";
import {
  MdMarkerToTaskStatus,
  PriorityToTasksSymbol,
  dueDateSymbol,
  startDateSymbol,
  scheduledDateSymbol,
  doneDateSymbol,
  recurrenceSymbol,
} from "./symbols";
import { TaskRegularExpressions } from "./regex";
import { toTasksRecurrenceText } from "../utils/recurrence-text";

const createdDateSymbol = "➕";

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

/** Truncates an ISO date/datetime to YYYY-MM-DD (Tasks plugin date format). */
const dateOnly = (iso: string): string => iso.slice(0, 10);

/**
 * Formats the Tasks-plugin metadata tokens of a task: priority symbol (unless
 * "medium"), then due / start / scheduled (`extra.scheduledAt`) / created /
 * completed dates (truncated to YYYY-MM-DD), then recurrence. RRULE-syntax
 * rules are written as Obsidian Tasks text ("every week on Monday"); one that
 * can't be (for example with a start date) throws instead of breaking the line.
 *
 * Tokens are joined by single spaces with no leading or trailing whitespace.
 * Returns an empty string when the task has no metadata. Never includes the
 * title, tags, block link or checkbox.
 */
export const formatTasksMetadata = (task: Task): string => {
  const tokens: string[] = [];

  const prioritySymbol = PriorityToTasksSymbol[task.priority];
  if (prioritySymbol) {
    tokens.push(prioritySymbol);
  }

  const scheduledAt = task.extra?.["scheduledAt"];
  if (task.dueAt) tokens.push(`${dueDateSymbol} ${dateOnly(task.dueAt)}`);
  if (task.startAt) tokens.push(`${startDateSymbol} ${dateOnly(task.startAt)}`);
  if (scheduledAt)
    tokens.push(`${scheduledDateSymbol} ${dateOnly(scheduledAt)}`);
  if (task.createdAt)
    tokens.push(`${createdDateSymbol} ${dateOnly(task.createdAt)}`);
  if (task.completedAt)
    tokens.push(`${doneDateSymbol} ${dateOnly(task.completedAt)}`);

  if (task.recurringInterval) {
    tokens.push(
      `${recurrenceSymbol} ${toTasksRecurrenceText(task.recurringInterval)}`,
    );
  }

  return tokens.join(" ");
};

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
 * Serializes a Task object back into a markdown string, preserving as much of the original line as possible.
 *
 * @param task The updated Task object.
 * @param originalLine The original markdown line from the file.
 * @returns The new markdown line.
 */
export const taskToMarkdown = (task: Task, originalLine: string): string => {
  let newLine = originalLine;

  // 1. Update Status
  // Find the status check box [ ] or [x] etc.
  const checkboxMatch = newLine.match(TaskRegularExpressions.checkboxRegex);
  if (checkboxMatch) {
    const currentStatusChar = checkboxMatch[1];
    const newStatusChar = statusToMarker(task.status);

    // Only replace if changed
    if (currentStatusChar !== newStatusChar) {
      newLine = newLine.replace(
        TaskRegularExpressions.checkboxRegex,
        `[${newStatusChar}]`,
      );
    }
  }

  // 2. Update Title (Description)
  const taskMatch = newLine.match(TaskRegularExpressions.taskRegex);
  if (!taskMatch) {
    return originalLine;
  }

  const indentation = taskMatch[1];
  const listMarker = taskMatch[2];
  const finalStatusChar = statusToMarker(task.status);

  let body = task.title.trim();

  if (task.tags && task.tags.length > 0) {
    const frontmatterTags = parseFrontmatterTags(task);

    // Append a tag if:
    // 1. It is NOT in frontmatterTags.
    // 2. OR it IS in frontmatterTags, BUT it matches an inline tag in the original line.
    const tagsToAppend = task.tags
      .map((t) => (t.name.startsWith("#") ? t.name : "#" + t.name))
      .filter((tagName) => {
        const isFrontmatter = frontmatterTags.includes(tagName);
        if (!isFrontmatter) return true;
        return originalLine.includes(tagName);
      });

    if (tagsToAppend.length > 0) {
      body += " " + tagsToAppend.join(" ");
    }
  }

  // 3-5. Priority, dates, recurrence
  const metadata = formatTasksMetadata(task);
  if (metadata.length > 0) {
    body += " " + metadata;
  }

  // 6. Block Link
  // Check if original line had a block link
  const blockLinkMatch = originalLine.match(
    TaskRegularExpressions.blockLinkRegex,
  );
  if (blockLinkMatch) {
    body += blockLinkMatch[0];
  }

  // Construct final line
  return `${indentation}${listMarker} [${finalStatusChar}] ${body}`;
};
