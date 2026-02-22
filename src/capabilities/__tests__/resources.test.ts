import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CapabilityContext } from "../types";
import type { Task } from "../../types";
import { createAllTasksResource } from "../resources/all-tasks";
import { createTaskByIdResource } from "../resources/task-by-id";
import { createFilteredTasksResources } from "../resources/filtered-tasks";
import { createStatsResource } from "../resources/stats";
import { getTodayISO, getDaysFromNowISO } from "../../utils/date-helpers";

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

const today = getTodayISO();
const yesterday = getDaysFromNowISO(-1);
const threeDaysAgo = getDaysFromNowISO(-3);
const inThreeDays = getDaysFromNowISO(3);
const inEightDays = getDaysFromNowISO(8);

const SAMPLE_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Overdue task",
    status: "overdue",
    priority: "high",
    category: "work",
    tags: [{ id: "t1", name: "Bug" }],
    dueAt: yesterday,
    createdAt: threeDaysAgo,
    isRecurring: false,
  },
  {
    id: "task-2",
    title: "Due today",
    status: "due",
    priority: "medium",
    category: "work",
    tags: [{ id: "t2", name: "Feature" }],
    dueAt: today,
    createdAt: threeDaysAgo,
    isRecurring: false,
  },
  {
    id: "task-3",
    title: "Starting today",
    status: "doing",
    priority: "low",
    category: "personal",
    tags: [],
    startAt: today,
    dueAt: inThreeDays,
    createdAt: yesterday,
    isRecurring: false,
  },
  {
    id: "task-4",
    title: "Upcoming task",
    status: "scheduled",
    priority: "medium",
    category: "work",
    tags: [{ id: "t3", name: "Planning" }],
    dueAt: inThreeDays,
    createdAt: today,
    isRecurring: true,
  },
  {
    id: "task-5",
    title: "Far future task",
    status: "scheduled",
    priority: "low",
    category: "personal",
    tags: [],
    dueAt: inEightDays,
    createdAt: today,
    isRecurring: false,
  },
  {
    id: "task-6",
    title: "Completed task",
    status: "done",
    priority: "high",
    category: "work",
    tags: [{ id: "t4", name: "Done" }],
    dueAt: yesterday,
    completedAt: today,
    createdAt: threeDaysAgo,
    isRecurring: false,
  },
];

describe("all-tasks resource", () => {
  let ctx: CapabilityContext;

  beforeEach(() => {
    ctx = makeContext({
      getTasks: vi.fn().mockResolvedValue(SAMPLE_TASKS),
    });
  });

  it("has correct name, uri, and mimeType", () => {
    const resource = createAllTasksResource(ctx);

    expect(resource.name).toBe("all-tasks");
    expect(resource.uri).toBe("tasks://all");
    expect(resource.mimeType).toBe("application/json");
  });

  it("returns all tasks with count", async () => {
    const resource = createAllTasksResource(ctx);
    const result = await resource.read();

    expect(result.contents).toHaveLength(1);
    expect(result.contents[0].uri).toBe("tasks://all");
    expect(result.contents[0].mimeType).toBe("application/json");

    const data = JSON.parse(result.contents[0].text);
    expect(data.tasks).toHaveLength(6);
    expect(data.count).toBe(6);
    expect(data.generatedAt).toBeDefined();
    expect(typeof data.generatedAt).toBe("string");
  });

  it("returns empty list when no tasks", async () => {
    ctx = makeContext({
      getTasks: vi.fn().mockResolvedValue([]),
    });
    const resource = createAllTasksResource(ctx);
    const result = await resource.read();
    const data = JSON.parse(result.contents[0].text);

    expect(data.tasks).toHaveLength(0);
    expect(data.count).toBe(0);
  });
});

describe("task-by-id resource", () => {
  let ctx: CapabilityContext;

  beforeEach(() => {
    ctx = makeContext({
      getTask: vi.fn().mockImplementation(async (id: string) => {
        return SAMPLE_TASKS.find((t) => t.id === id) ?? null;
      }),
    });
  });

  it("has correct name, uri, uriTemplate, and mimeType", () => {
    const resource = createTaskByIdResource(ctx);

    expect(resource.name).toBe("task-by-id");
    expect(resource.uri).toBe("tasks://task");
    expect(resource.uriTemplate).toBe("tasks://{taskId}");
    expect(resource.mimeType).toBe("application/json");
  });

  it("returns specific task when found", async () => {
    const resource = createTaskByIdResource(ctx);
    const result = await resource.read({ taskId: "task-2" });

    expect(result.contents).toHaveLength(1);
    const data = JSON.parse(result.contents[0].text);

    expect(data.found).toBe(true);
    expect(data.task).toBeDefined();
    expect(data.task.id).toBe("task-2");
    expect(data.task.title).toBe("Due today");
  });

  it("returns not-found for missing task", async () => {
    const resource = createTaskByIdResource(ctx);
    const result = await resource.read({ taskId: "nonexistent" });

    expect(result.contents).toHaveLength(1);
    const data = JSON.parse(result.contents[0].text);

    expect(data.found).toBe(false);
    expect(data.task).toBeNull();
  });
});

describe("filtered-tasks resources", () => {
  let ctx: CapabilityContext;

  beforeEach(() => {
    ctx = makeContext({
      getTasks: vi.fn().mockResolvedValue(SAMPLE_TASKS),
    });
  });

  it("creates 3 resources with correct URIs", () => {
    const resources = createFilteredTasksResources(ctx);

    expect(resources).toHaveLength(3);

    const names = resources.map((r) => r.name);
    expect(names).toContain("overdue-tasks");
    expect(names).toContain("today-tasks");
    expect(names).toContain("upcoming-tasks");

    const uris = resources.map((r) => r.uri);
    expect(uris).toContain("tasks://overdue");
    expect(uris).toContain("tasks://today");
    expect(uris).toContain("tasks://upcoming");
  });

  it("overdue returns only overdue tasks", async () => {
    const resources = createFilteredTasksResources(ctx);
    const overdueResource = resources.find((r) => r.name === "overdue-tasks")!;
    const result = await overdueResource.read();
    const data = JSON.parse(result.contents[0].text);

    expect(data.tasks).toHaveLength(1);
    expect(data.tasks[0].id).toBe("task-1");
    expect(data.tasks[0].status).toBe("overdue");
    expect(data.count).toBe(1);
    expect(data.generatedAt).toBeDefined();
  });

  it("today returns tasks due today or starting today", async () => {
    const resources = createFilteredTasksResources(ctx);
    const todayResource = resources.find((r) => r.name === "today-tasks")!;
    const result = await todayResource.read();
    const data = JSON.parse(result.contents[0].text);

    // task-2 has dueAt === today, task-3 has startAt === today
    expect(data.tasks).toHaveLength(2);
    const ids = data.tasks.map((t: Task) => t.id);
    expect(ids).toContain("task-2");
    expect(ids).toContain("task-3");
    expect(data.count).toBe(2);
  });

  it("upcoming returns tasks due in next 7 days excluding today", async () => {
    const resources = createFilteredTasksResources(ctx);
    const upcomingResource = resources.find(
      (r) => r.name === "upcoming-tasks",
    )!;
    const result = await upcomingResource.read();
    const data = JSON.parse(result.contents[0].text);

    // task-4 has dueAt === inThreeDays (within 7 days)
    // task-3 also has dueAt === inThreeDays but dueAt is not today (it's in 3 days)
    // task-5 has dueAt === inEightDays (beyond 7 days, excluded)
    // task-2 has dueAt === today (excluded, it's today not upcoming)
    const ids = data.tasks.map((t: Task) => t.id);
    expect(ids).toContain("task-3"); // dueAt = inThreeDays
    expect(ids).toContain("task-4"); // dueAt = inThreeDays
    expect(ids).not.toContain("task-2"); // dueAt = today
    expect(ids).not.toContain("task-5"); // dueAt = inEightDays
    expect(data.count).toBe(2);
  });

  it("all filtered resources have correct mimeType", () => {
    const resources = createFilteredTasksResources(ctx);
    for (const resource of resources) {
      expect(resource.mimeType).toBe("application/json");
    }
  });
});

describe("stats resource", () => {
  let ctx: CapabilityContext;

  beforeEach(() => {
    ctx = makeContext({
      getTasks: vi.fn().mockResolvedValue(SAMPLE_TASKS),
    });
  });

  it("has correct name, uri, and mimeType", () => {
    const resource = createStatsResource(ctx);

    expect(resource.name).toBe("stats");
    expect(resource.uri).toBe("tasks://stats");
    expect(resource.mimeType).toBe("application/json");
  });

  it("returns correct statistics", async () => {
    const resource = createStatsResource(ctx);
    const result = await resource.read();

    expect(result.contents).toHaveLength(1);
    expect(result.contents[0].uri).toBe("tasks://stats");

    const data = JSON.parse(result.contents[0].text);

    expect(data.total).toBe(6);
    expect(data.generatedAt).toBeDefined();

    // byStatus
    expect(data.byStatus.overdue).toBe(1);
    expect(data.byStatus.due).toBe(1);
    expect(data.byStatus.doing).toBe(1);
    expect(data.byStatus.scheduled).toBe(2);
    expect(data.byStatus.done).toBe(1);

    // byPriority
    expect(data.byPriority.high).toBe(2);
    expect(data.byPriority.medium).toBe(2);
    expect(data.byPriority.low).toBe(2);

    // byCategory
    expect(data.byCategory.work).toBe(4);
    expect(data.byCategory.personal).toBe(2);

    // overdue count
    expect(data.overdue).toBe(1);

    // completedToday: task-6 has completedAt === today
    expect(data.completedToday).toBe(1);

    // completionRate: 1 done / 6 total
    expect(data.completionRate).toBe(0.17);

    // recurring: task-4
    expect(data.recurring).toBe(1);
  });

  it("handles empty task list", async () => {
    ctx = makeContext({
      getTasks: vi.fn().mockResolvedValue([]),
    });

    const resource = createStatsResource(ctx);
    const result = await resource.read();
    const data = JSON.parse(result.contents[0].text);

    expect(data.total).toBe(0);
    expect(data.overdue).toBe(0);
    expect(data.completedToday).toBe(0);
    expect(data.completionRate).toBe(0);
    expect(data.recurring).toBe(0);
  });
});
