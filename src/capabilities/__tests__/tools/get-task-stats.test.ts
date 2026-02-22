import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CapabilityContext } from "../../types";
import type { Task } from "../../../types";
import { createGetTaskStatsTool } from "../../tools/get-task-stats";

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

const SAMPLE_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Buy groceries",
    status: "todo",
    priority: "high",
    category: "personal",
    tags: [{ id: "t1", name: "Shopping" }],
    dueAt: "2026-03-01",
    createdAt: "2026-02-01",
    isRecurring: true,
  },
  {
    id: "task-2",
    title: "Write report",
    status: "doing",
    priority: "medium",
    category: "work",
    tags: [{ id: "t2", name: "Writing" }],
    dueAt: "2026-03-15",
    startAt: "2026-02-10",
    createdAt: "2026-02-05",
    isRecurring: false,
  },
  {
    id: "task-3",
    title: "Fix login bug",
    status: "overdue",
    priority: "high",
    category: "work",
    tags: [{ id: "t4", name: "Bug" }],
    dueAt: "2026-02-15",
    createdAt: "2026-02-10",
    isRecurring: false,
  },
  {
    id: "task-4",
    title: "Plan vacation",
    status: "done",
    priority: "low",
    category: "personal",
    tags: [{ id: "t5", name: "Travel" }],
    dueAt: "2026-04-01",
    createdAt: "2026-01-20",
    completedAt: "2026-02-22",
    isRecurring: false,
  },
];

describe("get_task_stats tool", () => {
  let ctx: CapabilityContext;

  beforeEach(() => {
    ctx = makeContext({
      getTasks: vi.fn().mockResolvedValue(SAMPLE_TASKS),
    });
  });

  it("has correct name and no required schema parameters", () => {
    const tool = createGetTaskStatsTool(ctx);

    expect(tool.name).toBe("get_task_stats");
    expect(tool.schema.type).toBe("object");
    expect(tool.schema.required).toBeUndefined();
    expect(tool.schema.properties).toEqual({});
  });

  it("returns correct aggregate statistics with mixed tasks", async () => {
    const tool = createGetTaskStatsTool(ctx);
    const result = await tool.execute({});

    expect(result.name).toBe("get_task_stats");
    const stats = result.result as Record<string, unknown>;

    // Check basic counts
    expect(stats.total).toBe(4);

    // Check byStatus aggregation
    const byStatus = stats.byStatus as Record<string, number>;
    expect(byStatus.todo).toBe(1);
    expect(byStatus.doing).toBe(1);
    expect(byStatus.overdue).toBe(1);
    expect(byStatus.done).toBe(1);

    // Check byPriority aggregation
    const byPriority = stats.byPriority as Record<string, number>;
    expect(byPriority.high).toBe(2);
    expect(byPriority.medium).toBe(1);
    expect(byPriority.low).toBe(1);

    // Check byCategory aggregation
    const byCategory = stats.byCategory as Record<string, number>;
    expect(byCategory.personal).toBe(2);
    expect(byCategory.work).toBe(2);

    // Check overdue count
    expect(stats.overdue).toBe(1);

    // Check completedToday (task-4 has completedAt: "2026-02-22", and today is 2026-02-22)
    expect(stats.completedToday).toBe(1);

    // Check completion rate: 1 done / 4 total = 0.25
    expect(stats.completionRate).toBe(0.25);

    // Check recurring count
    expect(stats.recurring).toBe(1);

    // Check generatedAt is a timestamp
    expect(stats.generatedAt).toBeDefined();
    expect(typeof stats.generatedAt).toBe("string");
  });

  it("returns proper completion rate rounding (2 decimals)", async () => {
    // Create tasks where completion rate is 1/3 = 0.333...
    const tasks: Task[] = [
      {
        id: "t1",
        title: "Task 1",
        status: "done",
        priority: "low",
        tags: [],
        completedAt: "2026-02-22",
      },
      {
        id: "t2",
        title: "Task 2",
        status: "todo",
        priority: "low",
        tags: [],
      },
      {
        id: "t3",
        title: "Task 3",
        status: "todo",
        priority: "low",
        tags: [],
      },
    ];

    ctx = makeContext({
      getTasks: vi.fn().mockResolvedValue(tasks),
    });

    const tool = createGetTaskStatsTool(ctx);
    const result = await tool.execute({});
    const stats = result.result as Record<string, unknown>;

    // 1/3 = 0.33 (rounded to 2 decimals)
    expect(stats.completionRate).toBe(0.33);
  });

  it("counts completedToday based on today's date string", async () => {
    // Simulate today is 2026-02-22
    const tasks: Task[] = [
      {
        id: "t1",
        title: "Completed today",
        status: "done",
        priority: "low",
        tags: [],
        completedAt: "2026-02-22T10:30:00Z",
      },
      {
        id: "t2",
        title: "Completed yesterday",
        status: "done",
        priority: "low",
        tags: [],
        completedAt: "2026-02-21T10:30:00Z",
      },
      {
        id: "t3",
        title: "Not completed",
        status: "todo",
        priority: "low",
        tags: [],
      },
    ];

    ctx = makeContext({
      getTasks: vi.fn().mockResolvedValue(tasks),
    });

    const tool = createGetTaskStatsTool(ctx);
    const result = await tool.execute({});
    const stats = result.result as Record<string, unknown>;

    expect(stats.completedToday).toBe(1);
  });

  it("handles empty task list", async () => {
    ctx = makeContext({
      getTasks: vi.fn().mockResolvedValue([]),
    });

    const tool = createGetTaskStatsTool(ctx);
    const result = await tool.execute({});
    const stats = result.result as Record<string, unknown>;

    expect(stats.total).toBe(0);
    expect(stats.overdue).toBe(0);
    expect(stats.completedToday).toBe(0);
    expect(stats.completionRate).toBe(0);
    expect(stats.recurring).toBe(0);

    const byStatus = stats.byStatus as Record<string, number>;
    expect(Object.keys(byStatus)).toHaveLength(0);
  });

  it("correctly counts recurring tasks", async () => {
    const tasks: Task[] = [
      {
        id: "t1",
        title: "Recurring task 1",
        status: "todo",
        priority: "low",
        tags: [],
        isRecurring: true,
      },
      {
        id: "t2",
        title: "Recurring task 2",
        status: "done",
        priority: "low",
        tags: [],
        isRecurring: true,
      },
      {
        id: "t3",
        title: "Non-recurring task",
        status: "todo",
        priority: "low",
        tags: [],
        isRecurring: false,
      },
    ];

    ctx = makeContext({
      getTasks: vi.fn().mockResolvedValue(tasks),
    });

    const tool = createGetTaskStatsTool(ctx);
    const result = await tool.execute({});
    const stats = result.result as Record<string, unknown>;

    expect(stats.recurring).toBe(2);
  });
});
