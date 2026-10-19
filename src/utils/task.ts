import { DateTime, Settings, type Zone } from "luxon";
import type {
  DateGroupBy,
  DayGroup,
  PlanningStatus,
  PrimaryVisualStatus,
  Task,
  TaskStatus,
  TemporalStatus,
  WorkflowStatus,
  YearGroup,
} from "../types";

export interface DateValidationState {
  hasMissingDates: boolean;
  hasInvalidDates: boolean;
}

/**
 * One frozen object per result, so a row that receives it as a prop keeps
 * equal props across renders and React.memo can skip it.
 */
const DATE_VALIDATION_STATES = {
  missing: Object.freeze({ hasMissingDates: true, hasInvalidDates: false }),
  invalid: Object.freeze({ hasMissingDates: false, hasInvalidDates: true }),
  both: Object.freeze({ hasMissingDates: true, hasInvalidDates: true }),
} as const satisfies Record<string, DateValidationState>;

export const computeDateValidation = (
  task: Task,
  strategies: DateGroupBy[],
): DateValidationState | undefined => {
  const dateFields: DateGroupBy[] = [
    "dueAt",
    "startAt",
    "createdAt",
    "completedAt",
  ];

  let hasMissingDates = false;
  let hasInvalidDates = false;

  // Check strategy-required dates
  for (const strategy of strategies) {
    const value = task[strategy];
    if (!value) {
      hasMissingDates = true;
    } else {
      const dt = DateTime.fromISO(value);
      if (!dt.isValid) {
        hasInvalidDates = true;
      }
    }
  }

  // Check all populated dates for validity
  for (const field of dateFields) {
    const value = task[field];
    if (value) {
      const dt = DateTime.fromISO(value);
      if (!dt.isValid) {
        hasInvalidDates = true;
      }
    }
  }

  if (hasMissingDates && hasInvalidDates) {
    return DATE_VALIDATION_STATES.both;
  }
  if (hasMissingDates) {
    return DATE_VALIDATION_STATES.missing;
  }
  if (hasInvalidDates) {
    return DATE_VALIDATION_STATES.invalid;
  }
  return undefined; // No badge needed
};

const safeDate = (dateStr: string): DateTime => {
  if (!dateStr) {
    return DateTime.invalid("No date");
  }
  const dt = DateTime.fromISO(dateStr);
  return dt.isValid ? dt : DateTime.invalid("Invalid ISO");
};

const WORKFLOW_STATUSES: readonly WorkflowStatus[] = [
  "todo",
  "doing",
  "done",
  "cancelled",
];

export interface TaskRenderState {
  workflowStatus: WorkflowStatus;
  temporalStatus: TemporalStatus;
  planningStatus: PlanningStatus;
  primaryStatus: PrimaryVisualStatus;
  isActive: boolean;
  isUrgent: boolean;
}

export const isWorkflowStatus = (
  status: TaskStatus | string | undefined,
): status is WorkflowStatus =>
  status !== undefined && WORKFLOW_STATUSES.includes(status as WorkflowStatus);

export const deriveWorkflowStatus = (task: Task): WorkflowStatus =>
  isWorkflowStatus(task.status) ? task.status : "todo";

/**
 * `next` with the done and cancelled dates its status keeps, as Obsidian
 * Tasks sets them on a status change: `completedAt` (✅) only while the task
 * is done, `cancelledAt` (❌) only while it is cancelled. A reopened task
 * loses both, and a done task that is cancelled loses its done date. When
 * the status stays the same, `next` is returned as it is.
 */
export function withStatusDates(previous: Task, next: Task): Task {
  const status = deriveWorkflowStatus(next);
  if (status === deriveWorkflowStatus(previous)) {
    return next;
  }
  return {
    ...next,
    completedAt: status === "done" ? next.completedAt : undefined,
    cancelledAt: status === "cancelled" ? next.cancelledAt : undefined,
  };
}

interface DayContext {
  zone: Zone;
  dayStartMs: number;
  nextDayStartMs: number;
  today: string;
  tomorrow: string;
}

let cachedDay: DayContext | null = null;

/**
 * Today's and tomorrow's local dates for `nowMs`. Building them with Luxon
 * for every task dominated a status pass over a few hundred tasks, so they
 * are kept until the clock leaves the cached day (either way) or the
 * default zone changes.
 */
const getDayContext = (nowMs: number): DayContext => {
  const zone = Settings.defaultZone;
  if (
    cachedDay &&
    cachedDay.zone === zone &&
    nowMs >= cachedDay.dayStartMs &&
    nowMs < cachedDay.nextDayStartMs
  ) {
    return cachedDay;
  }
  const dayStart = DateTime.fromMillis(nowMs).startOf("day"),
    nextDayStart = dayStart.plus({ days: 1 });
  cachedDay = {
    zone,
    dayStartMs: dayStart.toMillis(),
    nextDayStartMs: nextDayStart.toMillis(),
    today: dayStart.toISODate() ?? "",
    tomorrow: nextDayStart.toISODate() ?? "",
  };
  return cachedDay;
};

export const deriveTaskRenderState = (task: Task): TaskRenderState => {
  const workflowStatus = deriveWorkflowStatus(task),
    isActive = workflowStatus !== "done" && workflowStatus !== "cancelled";

  if (!isActive) {
    return {
      workflowStatus,
      temporalStatus: "none",
      planningStatus: "planned",
      primaryStatus: workflowStatus,
      isActive,
      isUrgent: false,
    };
  }

  const nowMs = Settings.now(),
    { today, tomorrow } = getDayContext(nowMs),
    dueDate = task.dueAt ? DateTime.fromISO(task.dueAt).toISODate() : null,
    startDate = task.startAt ? DateTime.fromISO(task.startAt) : null;

  let temporalStatus: TemporalStatus = "none";
  if (dueDate && dueDate < today) {
    temporalStatus = "overdue";
  } else if (dueDate && (dueDate === today || dueDate === tomorrow)) {
    temporalStatus = "due";
  }

  let planningStatus: PlanningStatus = "planned";
  if (startDate?.isValid && startDate.toMillis() > nowMs) {
    planningStatus = "scheduled";
  } else if (!task.dueAt && !task.startAt) {
    planningStatus = "unplanned";
  }

  let primaryStatus: PrimaryVisualStatus = workflowStatus;
  if (temporalStatus !== "none") {
    primaryStatus = temporalStatus;
  } else if (workflowStatus === "doing") {
    primaryStatus = "doing";
  } else if (planningStatus === "scheduled") {
    primaryStatus = "scheduled";
  } else if (planningStatus === "unplanned") {
    primaryStatus = "unplanned";
  }

  return {
    workflowStatus,
    temporalStatus,
    planningStatus,
    primaryStatus,
    isActive,
    isUrgent: temporalStatus === "due" || temporalStatus === "overdue",
  };
};

export const deriveTaskStatus = (task: Task): TaskStatus =>
  deriveTaskRenderState(task).primaryStatus;

export const taskMatchesStatus = (
  task: Task,
  status: TaskStatus | string,
): boolean => {
  const renderState = deriveTaskRenderState(task);
  if (isWorkflowStatus(status)) {
    return renderState.workflowStatus === status;
  }
  return (
    renderState.primaryStatus === status ||
    renderState.temporalStatus === status ||
    renderState.planningStatus === status
  );
};

/**
 * Whether a task recurs. Hosts that never set `isRecurring` (older parsed
 * Obsidian Tasks lines, other integrations) fall back to whether it has a rule.
 */
export const isTaskRecurring = (
  task: Pick<Task, "isRecurring" | "recurringInterval">,
): boolean => task.isRecurring ?? Boolean(task.recurringInterval);

/** Removes only the tag at `index`; tags parsed from text can share an id. */
export const removeTagAt = (tags: Task["tags"], index: number): Task["tags"] =>
  tags.filter((_, i) => i !== index);

/** Done or cancelled. */
export const isTaskFinished = (task: Task): boolean => {
  const workflowStatus = deriveWorkflowStatus(task);
  return workflowStatus === "done" || workflowStatus === "cancelled";
};

/**
 * Totals for a set of day groups. A task shown on several days (several
 * grouping fields) counts once, so the totals match the rows a reader sees
 * as distinct tasks.
 */
export const summarizeDayGroups = (
  dayGroups: readonly DayGroup[],
): { totalTasks: number; completedTasks: number } => {
  const unique = new Set(dayGroups.flatMap((group) => group.tasks));
  let completedTasks = 0;
  unique.forEach((task) => {
    if (isTaskFinished(task)) {
      completedTasks += 1;
    }
  });
  return { totalTasks: unique.size, completedTasks };
};

export const groupTasksByYearAndDate = (
  tasks: Task[],
  strategies: DateGroupBy[] = ["dueAt"],
): YearGroup[] => {
  const groups: Record<number, Record<string, Task[]>> = {},
    allPossibleDateFields: DateGroupBy[] = [
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
      if (val && safeDate(val).isValid) {
        datesToUse.push(val);
      }
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
      const dt = safeDate(dateKey),
        { year } = dt,
        dayStr = dt.toISODate();
      if (!dayStr) {
        return;
      }

      if (!groups[year]) {
        groups[year] = {};
      }
      if (!groups[year][dayStr]) {
        groups[year][dayStr] = [];
      }

      if (!groups[year][dayStr].includes(task)) {
        groups[year][dayStr].push(task);
      }
    });
  });

  const sortedYears = Object.keys(groups)
    .map(Number)
    .sort((a, b) => b - a);

  return sortedYears.map((year) => {
    const yearTasks = groups[year],
      sortedDays = Object.keys(yearTasks).sort((a, b) => b.localeCompare(a)),
      dayGroups: DayGroup[] = sortedDays.map((date) => ({
        date,
        tasks: yearTasks[date],
      }));

    return { year, dayGroups, ...summarizeDayGroups(dayGroups) };
  });
};
