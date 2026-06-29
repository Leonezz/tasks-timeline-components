import { DateTime } from "luxon";
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

  if (!hasMissingDates && !hasInvalidDates) {
    return undefined; // No badge needed
  }

  return { hasMissingDates, hasInvalidDates };
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

  const now = DateTime.now(),
    today = now.toISODate() || "",
    tomorrow = now.plus({ days: 1 }).toISODate(),
    dueDate = task.dueAt ? DateTime.fromISO(task.dueAt).toISODate() : null,
    startDate = task.startAt ? DateTime.fromISO(task.startAt) : null;

  let temporalStatus: TemporalStatus = "none";
  if (dueDate && dueDate < today) {
    temporalStatus = "overdue";
  } else if (dueDate && (dueDate === today || dueDate === tomorrow)) {
    temporalStatus = "due";
  }

  let planningStatus: PlanningStatus = "planned";
  if (startDate?.isValid && startDate > now) {
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
      })),
      allTasksInYear = Object.values(yearTasks).flat(),
      completed = allTasksInYear.filter((t) => {
        const workflowStatus = deriveWorkflowStatus(t);
        return workflowStatus === "done" || workflowStatus === "cancelled";
      }).length;

    return {
      year,
      dayGroups,
      totalTasks: allTasksInYear.length,
      completedTasks: completed,
    };
  });
};
