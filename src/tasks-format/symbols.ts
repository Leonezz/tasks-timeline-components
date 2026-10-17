/**
 * Obsidian Tasks plugin format symbols.
 *
 * Pure module: no React, no DOM.
 */
import type { Priority, TaskStatus } from "../types";

export const TasksPrioritySymbolToLabel: Record<string, Priority> = {
  "🔺": "high",
  "⏫": "high",
  "🔼": "medium",
  "": "medium",
  "🔽": "low",
  "⏬": "low",
};

export type TasksPrioritySymbol = keyof typeof TasksPrioritySymbolToLabel;

/**
 * Symbol written for each priority. Parsing accepts every symbol above, but
 * writing uses the plain "high" / "low" ones: 🔺 / ⏬ mean highest / lowest in
 * the Tasks plugin. Medium is the default and is not written.
 */
export const PriorityToTasksSymbol: Record<Priority, string> = {
  high: "⏫",
  medium: "",
  low: "🔽",
};

export const recurrenceSymbol = "🔁";
export const startDateSymbol = "🛫";
export const scheduledDateSymbol = "⏳";
export const dueDateSymbol = "📅";
export const doneDateSymbol = "✅";
export const createdDateSymbol = "➕";
export const cancelledDateSymbol = "❌";
export const onCompletionSymbol = "🏁";
export const idSymbol = "🆔";
export const dependsOnSymbol = "⛔";

export type MarkdownTaskStatus = Extract<
  TaskStatus,
  "todo" | "doing" | "done" | "cancelled"
>;

export const MdMarkerToTaskStatus: Record<string, MarkdownTaskStatus> = {
  " ": "todo",
  x: "done",
  "/": "doing",
  "-": "cancelled",
};
export const TaskStatusCollection: MarkdownTaskStatus[] = [
  "todo",
  "cancelled",
  "doing",
  "done",
];

export const getTaskStatusFromMarker = (marker: string): MarkdownTaskStatus => {
  switch (marker.trim()) {
    case "": {
      return "todo";
    }
    case "x": {
      return "done";
    }
    case "/": {
      return "doing";
    }
    case "-": {
      return "cancelled";
    }
    default: {
      return "todo";
    }
  }
};
