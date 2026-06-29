import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { Task } from "../types";
import {
  deriveTaskRenderState,
  deriveWorkflowStatus,
  taskMatchesStatus,
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
