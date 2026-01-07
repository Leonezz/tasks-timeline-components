import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { DateTime } from "luxon";
import { RRule } from "rrule";
import type {
  Task,
  YearGroup,
  DayGroup,
  Priority,
  DateGroupBy,
  TaskStatus,
} from "./types";
// Import needed types for Gemini tools from @google/genai as per guidelines
import { type FunctionDeclaration, Type } from "@google/genai";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const safeDate = (dateStr: string): DateTime => {
  if (!dateStr) return DateTime.invalid("No date");
  const dt = DateTime.fromISO(dateStr);
  return dt.isValid ? dt : DateTime.invalid("Invalid ISO");
};

export const formatDateDisplay = (dateStr: string, format = "yyyy-MM-dd") => {
  const dt = safeDate(dateStr);
  if (!dt.isValid) return "";
  return dt.toFormat(format);
};

export const formatTime = (dateStr: string) => {
  const dt = safeDate(dateStr);
  if (!dt.isValid || !dateStr.includes("T")) return null;
  return dt.toFormat("HH:mm");
};

export const formatRelativeDate = (dateStr: string) => {
  const dt = safeDate(dateStr);
  if (!dt.isValid) return "";
  const now = DateTime.now().startOf("day");
  const target = dt.startOf("day");
  const diff = target.diff(now, "days").days;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return dt.toFormat("MMM d");
};

export const formatSmartDate = (
  dateStr: string,
  useRelative: boolean,
  absoluteFormat: string
) => {
  if (!useRelative) return formatDateDisplay(dateStr, absoluteFormat);
  const dt = safeDate(dateStr);
  if (!dt.isValid) return "INVALID";
  const now = DateTime.now().startOf("day");
  const target = dt.startOf("day");
  const diff = target.diff(now, "days").days;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (Math.abs(diff) < 7) return dt.toRelativeCalendar() || "INVALID";
  return dt.toRelative() || "INVALID";
};

export const formatRecurrence = (ruleStr: string): string => {
  if (!ruleStr) return "";
  try {
    const rule = RRule.fromString(ruleStr);
    return rule.toText();
  } catch (e) {
    return ruleStr;
  }
};

export const deriveTaskStatus = (task: Task): TaskStatus => {
  // 1. If explicitly Done or Cancelled, preserve status
  if (task.status === "done" || task.status === "cancelled") {
    return task.status;
  }

  const now = DateTime.now();
  const today = now.toISODate() || "";
  const tomorrow = now.plus({ days: 1 }).toISODate();

  // 2. Overdue: Due date is strictly in the past
  if (task.dueAt && task.dueAt < today) {
    return "overdue";
  }

  // 3. Due: Due date is Today or Tomorrow
  if (task.dueAt && (task.dueAt === today || task.dueAt === tomorrow)) {
    return "due";
  }

  // 4. Scheduled vs Doing checks on Start Date
  if (task.startAt) {
    const startDt = DateTime.fromISO(task.startAt);
    if (startDt.isValid) {
      // If start time is in the future relative to now
      if (startDt > now) {
        return "scheduled";
      }
      // If start time is past or now, it is doing (unless captured by due/overdue above)
      return "doing";
    }
  }

  // 6. Fallbacks: If manual status was set to a state that is no longer valid based on dates, reset to todo
  // e.g. was 'doing' but user cleared start date
  if (["due", "overdue", "scheduled", "doing"].includes(task.status)) {
    return "todo";
  }

  return task.status;
};

export const groupTasksByYearAndDate = (
  tasks: Task[],
  strategies: DateGroupBy[] = ["dueAt"]
): YearGroup[] => {
  const groups: Record<number, Record<string, Task[]>> = {};
  const allPossibleDateFields: DateGroupBy[] = [
    "dueAt",
    "startAt",
    "createdAt",
    "completedAt",
  ];

  tasks.forEach((task) => {
    const datesToUse: string[] = [];

    // Try active strategies
    strategies.forEach((strategy) => {
      const val = task[strategy];
      if (val && safeDate(val).isValid) datesToUse.push(val);
    });

    // Fallback
    if (datesToUse.length === 0) {
      for (const field of allPossibleDateFields) {
        const val = task[field];
        if (val && safeDate(val).isValid) {
          datesToUse.push(val);
          break;
        }
      }
    }

    datesToUse.forEach((dateKey) => {
      const dt = safeDate(dateKey);
      const year = dt.year;
      const dayStr = dt.toISODate();
      if (!dayStr) return;

      if (!groups[year]) groups[year] = {};
      if (!groups[year][dayStr]) groups[year][dayStr] = [];

      if (!groups[year][dayStr].includes(task)) {
        groups[year][dayStr].push(task);
      }
    });
  });

  const sortedYears = Object.keys(groups)
    .map(Number)
    .sort((a, b) => b - a);

  return sortedYears.map((year) => {
    const yearTasks = groups[year];
    const sortedDays = Object.keys(yearTasks).sort((a, b) =>
      b.localeCompare(a)
    );

    const dayGroups: DayGroup[] = sortedDays.map((date) => ({
      date,
      tasks: yearTasks[date],
    }));

    const allTasksInYear = Object.values(yearTasks).flat();
    const completed = allTasksInYear.filter(
      (t) => t.status === "done" || t.status === "cancelled"
    ).length;

    return {
      year,
      dayGroups,
      totalTasks: allTasksInYear.length,
      completedTasks: completed,
    };
  });
};

export const parseTaskString = (input: string): Partial<Task> => {
  let title = input;
  const result: Partial<Task> = { tags: [] };

  const priorityRegex = /\b(p|priority):(low|medium|high)\b/i;
  const pMatch = title.match(priorityRegex);
  if (pMatch) {
    result.priority = pMatch[2].toLowerCase() as Priority;
    title = title.replace(pMatch[0], "");
  }

  const dueRegex = /\bdue:(\S+)\b/i;
  const dueMatch = title.match(dueRegex);
  if (dueMatch) {
    const val = dueMatch[1].toLowerCase();
    let dateVal = "";
    if (val === "today") dateVal = DateTime.now().toISODate() || "";
    else if (val === "tomorrow")
      dateVal = DateTime.now().plus({ days: 1 }).toISODate() || "";
    else if (DateTime.fromISO(val).isValid)
      dateVal = DateTime.fromISO(val).toISODate() || "";
    if (dateVal) result.dueAt = dateVal;
    title = title.replace(dueMatch[0], "");
  }

  const tagRegex = /#(\w+)/g;
  const tags: string[] = [];
  let match;
  while ((match = tagRegex.exec(title)) !== null) {
    tags.push(match[1]);
  }
  if (tags.length > 0) {
    result.tags = tags.map((t) => ({ id: `new-${t}`, name: t }));
    title = title.replace(tagRegex, "");
  }

  const catRegex = /\b(cat|category):(\w+)\b/i;
  const catMatch = title.match(catRegex);
  if (catMatch) {
    result.category = catMatch[2];
    title = title.replace(catMatch[0], "");
  }

  result.title = title.trim().replace(/\s+/g, " ");
  return result;
};

// Define tool declarations for Gemini Function Calling
export const getToolDefinitions = (): FunctionDeclaration[] => {
  return [
    {
      name: "create_task",
      description: "Creates a new task with given properties.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "The title of the task." },
          description: {
            type: Type.STRING,
            description: "Additional details about the task.",
          },
          priority: {
            type: Type.STRING,
            description: "Task priority: low, medium, or high.",
            enum: ["low", "medium", "high"],
          },
          dueDate: {
            type: Type.STRING,
            description: "ISO 8601 date string (YYYY-MM-DD).",
          },
          category: {
            type: Type.STRING,
            description: "The organizational category.",
          },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of tag names.",
          },
        },
        required: ["title"],
      },
    },
    {
      name: "query_tasks",
      description: "Queries existing tasks based on filters.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          status: {
            type: Type.STRING,
            description: "Filter by task status.",
            enum: [
              "done",
              "scheduled",
              "todo",
              "due",
              "overdue",
              "cancelled",
              "unplanned",
              "doing",
            ],
          },
          date: {
            type: Type.STRING,
            description: "Filter by date (YYYY-MM-DD).",
          },
          search: {
            type: Type.STRING,
            description: "Search term for task title.",
          },
        },
      },
    },
    {
      name: "update_task",
      description: "Updates properties of an existing task.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            description: "The unique ID of the task to update.",
          },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          status: {
            type: Type.STRING,
            enum: [
              "done",
              "scheduled",
              "todo",
              "due",
              "overdue",
              "cancelled",
              "unplanned",
              "doing",
            ],
          },
          priority: { type: Type.STRING, enum: ["low", "medium", "high"] },
          dueDate: { type: Type.STRING },
          category: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["id"],
      },
    },
    {
      name: "delete_task",
      description: "Deletes a task by its ID.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            description: "The ID of the task to delete.",
          },
        },
        required: ["id"],
      },
    },
  ];
};
