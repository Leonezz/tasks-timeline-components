import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { Task } from "../types";
import {
  computeDateValidation,
  deriveTaskRenderState,
  deriveWorkflowStatus,
  isTaskRecurring,
  removeTagAt,
  taskMatchesStatus,
  withStatusDates,
} from "./task";

const makeTask = (overrides: Partial<Task>): Task => ({
  id: "task-1",
  title: "Task",
  status: "todo",
  priority: "medium",
  tags: [],
  ...overrides,
});

describe("task render state", () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-22T12:00:00Z"));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("keeps doing as workflow status while rendering overdue with higher priority", () => {
    const task = makeTask({
      status: "doing",
      dueAt: "2026-02-20",
    });

    const renderState = deriveTaskRenderState(task);

    expect(renderState.workflowStatus).toBe("doing");
    expect(renderState.temporalStatus).toBe("overdue");
    expect(renderState.primaryStatus).toBe("overdue");
    expect(renderState.isUrgent).toBe(true);
    expect(taskMatchesStatus(task, "doing")).toBe(true);
    expect(taskMatchesStatus(task, "overdue")).toBe(true);
  });

  it("derives scheduled display state from a future start date", () => {
    const task = makeTask({
      status: "todo",
      startAt: "2026-03-01",
    });

    const renderState = deriveTaskRenderState(task);

    expect(renderState.workflowStatus).toBe("todo");
    expect(renderState.planningStatus).toBe("scheduled");
    expect(renderState.primaryStatus).toBe("scheduled");
    expect(taskMatchesStatus(task, "todo")).toBe(true);
    expect(taskMatchesStatus(task, "scheduled")).toBe(true);
  });

  it("normalizes legacy display statuses to todo workflow status", () => {
    const task = makeTask({
      status: "overdue",
      dueAt: "2026-02-20",
    });

    expect(deriveWorkflowStatus(task)).toBe("todo");
    expect(deriveTaskRenderState(task).primaryStatus).toBe("overdue");
  });

  it("does not render terminal tasks as urgent even when their due date is past", () => {
    const task = makeTask({
      status: "done",
      dueAt: "2026-02-20",
    });

    const renderState = deriveTaskRenderState(task);

    expect(renderState.workflowStatus).toBe("done");
    expect(renderState.temporalStatus).toBe("none");
    expect(renderState.primaryStatus).toBe("done");
    expect(renderState.isUrgent).toBe(false);
    expect(taskMatchesStatus(task, "overdue")).toBe(false);
  });
});

describe("removeTagAt", () => {
  it("removes only the tag at the index when tags share an id", () => {
    const tags = [
      { id: "#TODO", name: "TODO" },
      { id: "#TODO", name: "TODO" },
      { id: "#home", name: "home" },
    ];

    expect(removeTagAt(tags, 1)).toEqual([
      { id: "#TODO", name: "TODO" },
      { id: "#home", name: "home" },
    ]);
    expect(tags).toHaveLength(3);
  });

  it("returns the same tags for an index out of range", () => {
    const tags = [{ id: "a", name: "a" }];

    expect(removeTagAt(tags, 5)).toEqual(tags);
  });
});

describe("isTaskRecurring", () => {
  it("treats a rule without an isRecurring flag as recurring", () => {
    expect(isTaskRecurring({ recurringInterval: "every week" })).toBe(true);
  });

  it("respects an explicit flag", () => {
    expect(
      isTaskRecurring({ isRecurring: false, recurringInterval: "every week" }),
    ).toBe(false);
    expect(isTaskRecurring({ isRecurring: true })).toBe(true);
  });

  it("is false without a flag or a rule", () => {
    expect(isTaskRecurring({})).toBe(false);
  });
});

describe("withStatusDates", () => {
  const DONE = "2026-10-16T09:00:00.000+08:00";
  const CANCELLED = "2026-10-17T09:00:00.000+08:00";

  it.each([
    ["cancelled", "todo", { cancelledAt: CANCELLED }],
    ["cancelled", "doing", { cancelledAt: CANCELLED }],
    ["done", "todo", { completedAt: DONE }],
    ["done", "cancelled", { completedAt: DONE, cancelledAt: CANCELLED }],
    ["cancelled", "done", { completedAt: DONE, cancelledAt: CANCELLED }],
  ] as const)(
    "keeps only the date of the new status when %s becomes %s",
    (from, to, dates) => {
      const previous = makeTask({ status: from, ...dates });

      const next = withStatusDates(previous, { ...previous, status: to });

      expect(next.status).toBe(to);
      expect(next.completedAt).toBe(to === "done" ? DONE : undefined);
      expect(next.cancelledAt).toBe(to === "cancelled" ? CANCELLED : undefined);
    },
  );

  it("changes nothing when the status stays the same", () => {
    const previous = makeTask({
      status: "todo",
      completedAt: DONE,
      cancelledAt: CANCELLED,
    });
    const next = { ...previous, title: "Renamed" };

    expect(withStatusDates(previous, next)).toBe(next);
  });

  it("compares statuses as they are saved (a display status is todo)", () => {
    const previous = makeTask({ status: "due", cancelledAt: CANCELLED });
    const next = { ...previous, status: "todo" as const };

    expect(withStatusDates(previous, next)).toBe(next);
  });
});

describe("computeDateValidation", () => {
  it("returns the same object for the same result, so memoized rows skip renders", () => {
    const a = computeDateValidation(makeTask({ id: "a" }), ["dueAt"]),
      b = computeDateValidation(makeTask({ id: "b" }), ["dueAt"]);

    expect(a).toEqual({ hasMissingDates: true, hasInvalidDates: false });
    expect(a).toBe(b);
    expect(Object.isFrozen(a)).toBe(true);
  });

  it("returns undefined when nothing is missing or invalid", () => {
    expect(
      computeDateValidation(makeTask({ dueAt: "2026-02-22" }), ["dueAt"]),
    ).toBeUndefined();
  });
});

describe("deriveTaskRenderState across days", () => {
  afterAll(() => {
    vi.useRealTimers();
  });

  it("uses the current day after the clock moves past midnight", () => {
    vi.useFakeTimers();
    const task = makeTask({ dueAt: "2026-02-24" });

    vi.setSystemTime(new Date(2026, 1, 20, 23, 59));
    expect(deriveTaskRenderState(task).temporalStatus).toBe("none");

    vi.setSystemTime(new Date(2026, 1, 23, 0, 1));
    expect(deriveTaskRenderState(task).temporalStatus).toBe("due");

    vi.setSystemTime(new Date(2026, 1, 25, 9));
    expect(deriveTaskRenderState(task).temporalStatus).toBe("overdue");

    // A clock set back is honoured too
    vi.setSystemTime(new Date(2026, 1, 20, 9));
    expect(deriveTaskRenderState(task).temporalStatus).toBe("none");
  });

  it("compares start dates against the current time, not the cached day", () => {
    vi.useFakeTimers();
    const task = makeTask({ startAt: "2026-02-20T15:00:00" });

    vi.setSystemTime(new Date(2026, 1, 20, 14));
    expect(deriveTaskRenderState(task).planningStatus).toBe("scheduled");

    vi.setSystemTime(new Date(2026, 1, 20, 16));
    expect(deriveTaskRenderState(task).planningStatus).toBe("planned");
  });
});
