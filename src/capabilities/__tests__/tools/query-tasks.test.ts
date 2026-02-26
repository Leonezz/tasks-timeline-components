import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CapabilityContext } from "../../types";
import type { Task } from "../../../types";
import { createQueryTasksTool } from "../../tools/query-tasks";

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
    description: "Milk, eggs, bread",
    status: "todo",
    priority: "high",
    category: "personal",
    tags: [{ id: "t1", name: "Shopping" }],
    dueAt: "2026-03-01",
    createdAt: "2026-02-01",
    isRecurring: true,
    recurringInterval: "FREQ=WEEKLY",
  },
  {
    id: "task-2",
    title: "Write report",
    description: "Quarterly sales report",
    status: "doing",
    priority: "medium",
    category: "work",
    tags: [
      { id: "t2", name: "Writing" },
      { id: "t3", name: "Reports" },
    ],
    dueAt: "2026-03-15",
    startAt: "2026-02-10",
    createdAt: "2026-02-05",
  },
  {
    id: "task-3",
    title: "Fix login bug",
    description: "Users cannot log in with SSO",
    status: "overdue",
    priority: "high",
    category: "work",
    tags: [{ id: "t4", name: "Bug" }],
    dueAt: "2026-02-15",
    createdAt: "2026-02-10",
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
    isRecurring: false,
  },
];

describe("query_tasks tool", () => {
  let ctx: CapabilityContext;
  let mockShowToast: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockShowToast = vi.fn();
    ctx = makeContext({
      getTasks: vi.fn().mockResolvedValue(SAMPLE_TASKS),
      showToast: mockShowToast as CapabilityContext["showToast"],
    });
  });

  it("has correct name and schema properties", () => {
    const tool = createQueryTasksTool(ctx);

    expect(tool.name).toBe("query_tasks");
    expect(tool.schema.type).toBe("object");
    expect(tool.schema.required).toBeUndefined();
    expect(tool.schema.properties).toHaveProperty("status");
    expect(tool.schema.properties).toHaveProperty("search");
    expect(tool.schema.properties).toHaveProperty("category");
    expect(tool.schema.properties).toHaveProperty("tag");
    expect(tool.schema.properties).toHaveProperty("dateFrom");
    expect(tool.schema.properties).toHaveProperty("dateTo");
    expect(tool.schema.properties).toHaveProperty("recurring");
    expect(tool.schema.properties).toHaveProperty("sort");
    expect(tool.schema.properties).toHaveProperty("limit");
    expect(tool.schema.properties.sort.enum).toEqual([
      "priority",
      "dueAt",
      "createdAt",
      "title",
    ]);
    expect(tool.schema.properties.recurring.type).toBe("boolean");
    expect(tool.schema.properties.limit.type).toBe("number");
  });

  it("returns all tasks when no filters are provided", async () => {
    const tool = createQueryTasksTool(ctx);
    const result = await tool.execute({});

    expect(result.name).toBe("query_tasks");
    const data = result.result as { tasks: unknown[]; count: number };
    expect(data.count).toBe(4);
    expect(data.tasks).toHaveLength(4);
  });

  it("returns token-efficient summary per task", async () => {
    const tool = createQueryTasksTool(ctx);
    const result = await tool.execute({});

    const data = result.result as {
      tasks: Array<Record<string, unknown>>;
      count: number;
    };
    const task = data.tasks[0];
    expect(task).toHaveProperty("id");
    expect(task).toHaveProperty("title");
    expect(task).toHaveProperty("status");
    expect(task).toHaveProperty("priority");
    expect(task).toHaveProperty("dueAt");
    expect(task).toHaveProperty("startAt");
    expect(task).toHaveProperty("category");
    expect(task).toHaveProperty("tags");
    expect(task).toHaveProperty("isRecurring");
    // Should NOT have description or other heavy fields
    expect(task).not.toHaveProperty("description");
    expect(task).not.toHaveProperty("createdAt");
    expect(task).not.toHaveProperty("recurringInterval");
  });

  it("tags summary is an array of strings (names only)", async () => {
    const tool = createQueryTasksTool(ctx);
    const result = await tool.execute({});

    const data = result.result as {
      tasks: Array<{ tags: string[] }>;
      count: number;
    };
    // task-2 has two tags: "Writing" and "Reports"
    const task2 = data.tasks.find(
      (t: Record<string, unknown>) => t.id === "task-2",
    ) as { tags: string[] };
    expect(task2.tags).toEqual(["Writing", "Reports"]);
  });

  it("filters by status", async () => {
    const tool = createQueryTasksTool(ctx);
    const result = await tool.execute({ status: "todo" });

    const data = result.result as {
      tasks: Array<Record<string, unknown>>;
      count: number;
    };
    expect(data.count).toBe(1);
    expect(data.tasks[0].id).toBe("task-1");
  });

  it("filters by search (case-insensitive, matches title)", async () => {
    const tool = createQueryTasksTool(ctx);
    const result = await tool.execute({ search: "groceries" });

    const data = result.result as {
      tasks: Array<Record<string, unknown>>;
      count: number;
    };
    expect(data.count).toBe(1);
    expect(data.tasks[0].id).toBe("task-1");
  });

  it("filters by search (case-insensitive, matches description)", async () => {
    const tool = createQueryTasksTool(ctx);
    const result = await tool.execute({ search: "quarterly" });

    const data = result.result as {
      tasks: Array<Record<string, unknown>>;
      count: number;
    };
    expect(data.count).toBe(1);
    expect(data.tasks[0].id).toBe("task-2");
  });

  it("filters by category", async () => {
    const tool = createQueryTasksTool(ctx);
    const result = await tool.execute({ category: "work" });

    const data = result.result as {
      tasks: Array<Record<string, unknown>>;
      count: number;
    };
    expect(data.count).toBe(2);
    const ids = data.tasks.map((t) => t.id);
    expect(ids).toContain("task-2");
    expect(ids).toContain("task-3");
  });

  it("filters by tag (case-insensitive)", async () => {
    const tool = createQueryTasksTool(ctx);
    const result = await tool.execute({ tag: "shopping" });

    const data = result.result as {
      tasks: Array<Record<string, unknown>>;
      count: number;
    };
    expect(data.count).toBe(1);
    expect(data.tasks[0].id).toBe("task-1");
  });

  it("filters by date range (dateFrom and dateTo inclusive)", async () => {
    const tool = createQueryTasksTool(ctx);
    const result = await tool.execute({
      dateFrom: "2026-03-01",
      dateTo: "2026-03-31",
    });

    const data = result.result as {
      tasks: Array<Record<string, unknown>>;
      count: number;
    };
    expect(data.count).toBe(2);
    const ids = data.tasks.map((t) => t.id);
    expect(ids).toContain("task-1"); // dueAt: 2026-03-01
    expect(ids).toContain("task-2"); // dueAt: 2026-03-15
  });

  it("excludes tasks without dueAt when date range is specified", async () => {
    const tasksWithNoDue: Task[] = [
      ...SAMPLE_TASKS,
      {
        id: "task-no-due",
        title: "No due date",
        status: "todo",
        priority: "low",
        tags: [],
      },
    ];
    ctx = makeContext({
      getTasks: vi.fn().mockResolvedValue(tasksWithNoDue),
    });
    const tool = createQueryTasksTool(ctx);
    const result = await tool.execute({
      dateFrom: "2026-01-01",
      dateTo: "2026-12-31",
    });

    const data = result.result as {
      tasks: Array<Record<string, unknown>>;
      count: number;
    };
    const ids = data.tasks.map((t) => t.id);
    expect(ids).not.toContain("task-no-due");
  });

  it("filters by recurring=true", async () => {
    const tool = createQueryTasksTool(ctx);
    const result = await tool.execute({ recurring: true });

    const data = result.result as {
      tasks: Array<Record<string, unknown>>;
      count: number;
    };
    expect(data.count).toBe(1);
    expect(data.tasks[0].id).toBe("task-1");
  });

  it("filters by recurring=false", async () => {
    const tool = createQueryTasksTool(ctx);
    const result = await tool.execute({ recurring: false });

    const data = result.result as {
      tasks: Array<Record<string, unknown>>;
      count: number;
    };
    // task-2, task-3 have no isRecurring; task-4 has isRecurring=false
    expect(data.count).toBe(3);
    const ids = data.tasks.map((t) => t.id);
    expect(ids).not.toContain("task-1");
  });

  it("sorts by priority (high first)", async () => {
    const tool = createQueryTasksTool(ctx);
    const result = await tool.execute({ sort: "priority" });

    const data = result.result as {
      tasks: Array<Record<string, unknown>>;
      count: number;
    };
    const priorities = data.tasks.map((t) => t.priority);
    expect(priorities).toEqual(["high", "high", "medium", "low"]);
  });

  it("sorts by dueAt (ascending)", async () => {
    const tool = createQueryTasksTool(ctx);
    const result = await tool.execute({ sort: "dueAt" });

    const data = result.result as {
      tasks: Array<Record<string, unknown>>;
      count: number;
    };
    const dueAts = data.tasks.map((t) => t.dueAt);
    expect(dueAts).toEqual([
      "2026-02-15",
      "2026-03-01",
      "2026-03-15",
      "2026-04-01",
    ]);
  });

  it("sorts by title (ascending)", async () => {
    const tool = createQueryTasksTool(ctx);
    const result = await tool.execute({ sort: "title" });

    const data = result.result as {
      tasks: Array<Record<string, unknown>>;
      count: number;
    };
    const titles = data.tasks.map((t) => t.title);
    expect(titles).toEqual([
      "Buy groceries",
      "Fix login bug",
      "Plan vacation",
      "Write report",
    ]);
  });

  it("limits results with default of 50", async () => {
    const tool = createQueryTasksTool(ctx);
    const result = await tool.execute({});

    const data = result.result as {
      tasks: Array<Record<string, unknown>>;
      count: number;
    };
    // Only 4 tasks, so all returned
    expect(data.tasks).toHaveLength(4);
  });

  it("limits results to specified limit", async () => {
    const tool = createQueryTasksTool(ctx);
    const result = await tool.execute({ limit: 2 });

    const data = result.result as {
      tasks: Array<Record<string, unknown>>;
      count: number;
    };
    expect(data.tasks).toHaveLength(2);
    expect(data.count).toBe(2);
  });

  it("combines multiple filters", async () => {
    const tool = createQueryTasksTool(ctx);
    const result = await tool.execute({
      category: "work",
      status: "doing",
    });

    const data = result.result as {
      tasks: Array<Record<string, unknown>>;
      count: number;
    };
    expect(data.count).toBe(1);
    expect(data.tasks[0].id).toBe("task-2");
  });

  it("calls showToast with task-list detail when results found", async () => {
    const tool = createQueryTasksTool(ctx);
    await tool.execute({});

    expect(mockShowToast).toHaveBeenCalledOnce();
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "info",
        title: expect.stringContaining("4"),
        detail: [
          expect.objectContaining({
            type: "task-list",
            label: "Search Results",
          }),
        ],
        timeout: 8000,
      }),
    );
  });

  it("does not call showToast when no results found", async () => {
    ctx = makeContext({
      getTasks: vi.fn().mockResolvedValue(SAMPLE_TASKS),
      showToast: mockShowToast as CapabilityContext["showToast"],
    });

    const tool = createQueryTasksTool(ctx);
    await tool.execute({ status: "cancelled" });

    expect(mockShowToast).not.toHaveBeenCalled();
  });
});
