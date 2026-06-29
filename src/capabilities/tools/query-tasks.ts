import type { Task, Priority } from "../../types";
import type { CapabilityContext, ToolSpec } from "../types";
import { deriveTaskRenderState, taskMatchesStatus } from "../../utils/task";

const PRIORITY_ORDER: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

interface TaskSummary {
  id: string;
  title: string;
  status: string;
  displayStatus: string;
  priority: string;
  dueAt: string | undefined;
  startAt: string | undefined;
  category: string | undefined;
  tags: string[];
  isRecurring: boolean;
}

function toSummary(task: Task): TaskSummary {
  const renderState = deriveTaskRenderState(task);
  return {
    id: task.id,
    title: task.title,
    status: renderState.workflowStatus,
    displayStatus: renderState.primaryStatus,
    priority: task.priority,
    dueAt: task.dueAt,
    startAt: task.startAt,
    category: task.category,
    tags: task.tags.map((t) => t.name),
    isRecurring: task.isRecurring === true,
  };
}

function matchesSearch(task: Task, search: string): boolean {
  const lowerSearch = search.toLowerCase();
  const titleMatch = task.title.toLowerCase().includes(lowerSearch);
  const descMatch =
    task.description?.toLowerCase().includes(lowerSearch) ?? false;
  return titleMatch || descMatch;
}

function matchesTag(task: Task, tag: string): boolean {
  const lowerTag = tag.toLowerCase();
  return task.tags.some((t) => t.name.toLowerCase() === lowerTag);
}

function matchesDateRange(
  task: Task,
  dateFrom: string | undefined,
  dateTo: string | undefined,
): boolean {
  if (dateFrom === undefined && dateTo === undefined) return true;
  if (task.dueAt === undefined) return false;
  if (dateFrom !== undefined && task.dueAt < dateFrom) return false;
  if (dateTo !== undefined && task.dueAt > dateTo) return false;
  return true;
}

function compareTasks(a: Task, b: Task, sort: string): number {
  switch (sort) {
    case "priority":
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    case "dueAt":
      return (a.dueAt ?? "").localeCompare(b.dueAt ?? "");
    case "createdAt":
      return (a.createdAt ?? "").localeCompare(b.createdAt ?? "");
    case "title":
      return a.title.localeCompare(b.title);
    default:
      return 0;
  }
}

export function createQueryTasksTool(ctx: CapabilityContext): ToolSpec {
  return {
    name: "query_tasks",
    description:
      "Search and filter tasks by status, category, tags, date range, recurrence, and free-text search. Returns a token-efficient summary.",
    schema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          description:
            "Filter by explicit workflow status or derived display status",
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
        search: {
          type: "string",
          description:
            "Case-insensitive substring search on task title and description",
        },
        category: {
          type: "string",
          description: "Filter by exact category match",
        },
        tag: {
          type: "string",
          description: "Filter by tag name (case-insensitive)",
        },
        dateFrom: {
          type: "string",
          description:
            "Inclusive start of due-date range in ISO 8601 format (YYYY-MM-DD)",
        },
        dateTo: {
          type: "string",
          description:
            "Inclusive end of due-date range in ISO 8601 format (YYYY-MM-DD)",
        },
        recurring: {
          type: "boolean",
          description:
            "Filter by recurrence: true for recurring tasks, false for non-recurring",
        },
        sort: {
          type: "string",
          description: "Sort results by the specified field",
          enum: ["priority", "dueAt", "createdAt", "title"],
        },
        limit: {
          type: "number",
          description: "Maximum number of tasks to return (default 50)",
        },
      },
    },

    async execute(args: Record<string, unknown>) {
      const status = args.status as string | undefined;
      const search = args.search as string | undefined;
      const category = args.category as string | undefined;
      const tag = args.tag as string | undefined;
      const dateFrom = args.dateFrom as string | undefined;
      const dateTo = args.dateTo as string | undefined;
      const recurring = args.recurring as boolean | undefined;
      const sort = args.sort as string | undefined;
      const limit = (args.limit as number | undefined) ?? 50;

      const allTasks = await ctx.getTasks();

      const filtered = allTasks.filter((task: Task) => {
        if (status !== undefined && !taskMatchesStatus(task, status))
          return false;
        if (search !== undefined && !matchesSearch(task, search)) return false;
        if (category !== undefined && task.category !== category) return false;
        if (tag !== undefined && !matchesTag(task, tag)) return false;
        if (!matchesDateRange(task, dateFrom, dateTo)) return false;
        if (recurring !== undefined) {
          if (recurring && task.isRecurring !== true) return false;
          if (!recurring && task.isRecurring === true) return false;
        }
        return true;
      });

      const sorted =
        sort !== undefined
          ? [...filtered].sort((a, b) => compareTasks(a, b, sort))
          : filtered;

      const limited = sorted.slice(0, limit);
      const summaries = limited.map(toSummary);

      if (filtered.length > 0) {
        ctx.showToast?.({
          variant: "info",
          title: `Found ${filtered.length} task${filtered.length === 1 ? "" : "s"}`,
          detail: [
            { type: "task-list", tasks: filtered, label: "Search Results" },
          ],
          timeout: 8000,
        });
      }

      return {
        name: "query_tasks",
        result: { tasks: summaries, count: summaries.length },
      };
    },
  };
}
