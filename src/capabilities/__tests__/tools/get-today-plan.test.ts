import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CapabilityContext } from "../../types";
import type { Task } from "../../../types";
import { createGetTodayPlanTool } from "../../tools/get-today-plan";
import { getTodayISO } from "../../../utils/date-helpers";

function makeContext(
  overrides?: Partial<CapabilityContext>,
): CapabilityContext {
  return {
    getTasks: vi.fn().mockResolvedValue([]),
    getTask: vi.fn().mockResolvedValue(null),
    addTask: vi.fn().mockResolvedValue(undefined),
    updateTask: vi.fn().mockResolvedValue(undefined),
    deleteTask: vi.fn().mockResolvedValue(undefined),
    notify: vi.fn(),
    ...overrides,
  };
}

const TODAY = getTodayISO();

const SAMPLE_TASKS: Task[] = [
  {
    id: "task-today-1",
    title: "High priority task due today",
    status: "todo",
    priority: "high",
    category: "work",
    tags: [{ id: "t1", name: "urgent" }],
    dueAt: TODAY,
    createdAt: "2026-02-01",
    isRecurring: false,
  },
  {
    id: "task-today-2",
    title: "Medium priority task due today",
    status: "due",
    priority: "medium",
    category: "personal",
    tags: [{ id: "t2", name: "health" }],
    dueAt: TODAY,
    createdAt: "2026-02-05",
    isRecurring: true,
  },
  {
    id: "task-overdue-1",
    title: "Overdue high priority",
    status: "overdue",
    priority: "high",
    category: "work",
    tags: [{ id: "t3", name: "bug" }],
    dueAt: "2026-02-15",
    createdAt: "2026-02-10",
    isRecurring: false,
  },
  {
    id: "task-overdue-2",
    title: "Overdue low priority",
    status: "overdue",
    priority: "low",
    category: "personal",
    tags: [{ id: "t4", name: "reading" }],
    dueAt: "2026-02-20",
    createdAt: "2026-02-15",
    isRecurring: false,
  },
  {
    id: "task-done-today",
    title: "Completed task due today (should be excluded)",
    status: "done",
    priority: "high",
    category: "work",
    tags: [{ id: "t5", name: "done" }],
    dueAt: TODAY,
    createdAt: "2026-02-10",
    completedAt: TODAY,
    isRecurring: false,
  },
  {
    id: "task-cancelled-today",
    title: "Cancelled task due today (should be excluded)",
    status: "cancelled",
    priority: "medium",
    category: "personal",
    tags: [{ id: "t6", name: "skip" }],
    dueAt: TODAY,
    createdAt: "2026-02-10",
    isRecurring: false,
  },
  {
    id: "task-future",
    title: "Future task",
    status: "scheduled",
    priority: "high",
    category: "work",
    tags: [{ id: "t7", name: "future" }],
    dueAt: "2026-03-01",
    createdAt: "2026-02-10",
    isRecurring: false,
  },
];

describe("get_today_plan tool", () => {
  let ctx: CapabilityContext;

  beforeEach(() => {
    ctx = makeContext({
      getTasks: vi.fn().mockResolvedValue(SAMPLE_TASKS),
    });
  });

  it("has correct name and no required schema parameters", () => {
    const tool = createGetTodayPlanTool(ctx);

    expect(tool.name).toBe("get_today_plan");
    expect(tool.schema.type).toBe("object");
    expect(tool.schema.required).toBeUndefined();
    expect(tool.schema.properties).toEqual({});
  });

  it("returns today's date", async () => {
    const tool = createGetTodayPlanTool(ctx);
    const result = await tool.execute({});

    expect(result.name).toBe("get_today_plan");
    const plan = result.result as Record<string, unknown>;

    expect(plan.date).toBe(TODAY);
  });

  it("returns today's tasks sorted by priority (high first)", async () => {
    const tool = createGetTodayPlanTool(ctx);
    const result = await tool.execute({});

    const plan = result.result as Record<string, unknown>;
    const todayTasks = plan.todayTasks as Array<Record<string, unknown>>;

    // Should have 2 tasks (done and cancelled are excluded)
    expect(todayTasks).toHaveLength(2);
    expect(plan.todayCount).toBe(2);

    // Should be sorted by priority: high then medium
    expect(todayTasks[0].priority).toBe("high");
    expect(todayTasks[0].id).toBe("task-today-1");
    expect(todayTasks[1].priority).toBe("medium");
    expect(todayTasks[1].id).toBe("task-today-2");
  });

  it("excludes done and cancelled tasks from today's list", async () => {
    const tool = createGetTodayPlanTool(ctx);
    const result = await tool.execute({});

    const plan = result.result as Record<string, unknown>;
    const todayTasks = plan.todayTasks as Array<Record<string, unknown>>;
    const ids = todayTasks.map((t) => t.id);

    expect(ids).not.toContain("task-done-today");
    expect(ids).not.toContain("task-cancelled-today");
  });

  it("returns overdue tasks sorted by priority (high first)", async () => {
    const tool = createGetTodayPlanTool(ctx);
    const result = await tool.execute({});

    const plan = result.result as Record<string, unknown>;
    const overdueTasks = plan.overdueTasks as Array<Record<string, unknown>>;

    expect(overdueTasks).toHaveLength(2);
    expect(plan.overdueCount).toBe(2);

    // Should be sorted by priority: high then low
    expect(overdueTasks[0].priority).toBe("high");
    expect(overdueTasks[0].id).toBe("task-overdue-1");
    expect(overdueTasks[1].priority).toBe("low");
    expect(overdueTasks[1].id).toBe("task-overdue-2");
  });

  it("returns task summaries with required fields only", async () => {
    const tool = createGetTodayPlanTool(ctx);
    const result = await tool.execute({});

    const plan = result.result as Record<string, unknown>;
    const todayTasks = plan.todayTasks as Array<Record<string, unknown>>;
    const task = todayTasks[0];

    // Required fields
    expect(task).toHaveProperty("id");
    expect(task).toHaveProperty("title");
    expect(task).toHaveProperty("priority");
    expect(task).toHaveProperty("status");
    expect(task).toHaveProperty("category");
    expect(task).toHaveProperty("tags");
    expect(task).toHaveProperty("isRecurring");

    // Should NOT have description or other heavy fields
    expect(task).not.toHaveProperty("description");
    expect(task).not.toHaveProperty("createdAt");
    expect(task).not.toHaveProperty("dueAt");
  });

  it("returns tags as string array (names only)", async () => {
    const tool = createGetTodayPlanTool(ctx);
    const result = await tool.execute({});

    const plan = result.result as Record<string, unknown>;
    const todayTasks = plan.todayTasks as Array<Record<string, unknown>>;
    const task = todayTasks[0];

    expect(Array.isArray(task.tags)).toBe(true);
    expect(task.tags).toEqual(["urgent"]);
  });

  it("handles empty task lists", async () => {
    ctx = makeContext({
      getTasks: vi.fn().mockResolvedValue([]),
    });

    const tool = createGetTodayPlanTool(ctx);
    const result = await tool.execute({});

    const plan = result.result as Record<string, unknown>;

    expect(plan.date).toBe(TODAY);
    expect(plan.todayTasks).toEqual([]);
    expect(plan.todayCount).toBe(0);
    expect(plan.overdueTasks).toEqual([]);
    expect(plan.overdueCount).toBe(0);
  });

  it("only includes tasks with status='overdue' in overdueTasks", async () => {
    const tool = createGetTodayPlanTool(ctx);
    const result = await tool.execute({});

    const plan = result.result as Record<string, unknown>;
    const overdueTasks = plan.overdueTasks as Array<Record<string, unknown>>;

    // All should have status overdue
    overdueTasks.forEach((task) => {
      expect(task.status).toBe("overdue");
    });
  });

  it("only includes tasks with dueAt === today in todayTasks (excluding done/cancelled)", async () => {
    const tool = createGetTodayPlanTool(ctx);
    const result = await tool.execute({});

    const plan = result.result as Record<string, unknown>;
    const todayTasks = plan.todayTasks as Array<Record<string, unknown>>;

    // All should be from today and not done/cancelled
    const expectedStatuses = ["todo", "due", "scheduled", "doing"];
    todayTasks.forEach((task) => {
      expect(expectedStatuses).toContain(task.status);
      expect(["done", "cancelled"]).not.toContain(task.status);
    });
  });

  it("counts recurring status correctly", async () => {
    const tool = createGetTodayPlanTool(ctx);
    const result = await tool.execute({});

    const plan = result.result as Record<string, unknown>;
    const todayTasks = plan.todayTasks as Array<Record<string, unknown>>;

    // task-today-1 is not recurring, task-today-2 is recurring
    const task1 = todayTasks.find((t) => t.id === "task-today-1");
    const task2 = todayTasks.find((t) => t.id === "task-today-2");

    expect(task1?.isRecurring).toBe(false);
    expect(task2?.isRecurring).toBe(true);
  });
});
