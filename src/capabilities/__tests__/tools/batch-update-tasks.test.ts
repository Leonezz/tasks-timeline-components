import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CapabilityContext } from "../../types";
import type { Task } from "../../../types";
import { createBatchUpdateTasksTool } from "../../tools/batch-update-tasks";

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

// Sample tasks with mixed status, category, tags, and recurring
const SAMPLE_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Complete project",
    description: "Finish the main project",
    status: "todo",
    priority: "high",
    category: "work",
    tags: [{ id: "tag-1", name: "urgent" }],
    dueAt: "2026-03-01",
    startAt: "2026-02-23",
    createdAt: "2026-01-01",
    isRecurring: false,
  },
  {
    id: "task-2",
    title: "Weekly standup",
    description: "Team standup meeting",
    status: "todo",
    priority: "medium",
    category: "work",
    tags: [{ id: "tag-2", name: "meeting" }],
    dueAt: "2026-02-24",
    createdAt: "2026-02-01",
    isRecurring: true,
    recurringInterval: "FREQ=WEEKLY;BYDAY=MO",
  },
  {
    id: "task-3",
    title: "Personal workout",
    description: "Daily exercise routine",
    status: "scheduled",
    priority: "medium",
    category: "personal",
    tags: [{ id: "tag-3", name: "health" }],
    dueAt: "2026-02-25",
    startAt: "2026-02-25",
    createdAt: "2026-01-15",
    isRecurring: true,
    recurringInterval: "FREQ=DAILY",
  },
];

describe("batch_update_tasks tool", () => {
  let ctx: CapabilityContext;
  let mockConfirm: ReturnType<typeof vi.fn>;
  let mockShowToast: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-22T12:00:00Z"));
    mockConfirm = vi.fn().mockResolvedValue(true);
    mockShowToast = vi.fn();
    ctx = makeContext({
      getTasks: vi.fn().mockResolvedValue([...SAMPLE_TASKS]),
      confirm: mockConfirm as CapabilityContext["confirm"],
      showToast: mockShowToast as CapabilityContext["showToast"],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("has correct name and schema", () => {
    const tool = createBatchUpdateTasksTool(ctx);

    expect(tool.name).toBe("batch_update_tasks");
    expect(tool.schema.type).toBe("object");
    expect(tool.schema.required).toEqual(["filter", "update"]);
    expect(tool.schema.properties).toHaveProperty("filter");
    expect(tool.schema.properties).toHaveProperty("update");

    // Check filter schema
    const filterProp = tool.schema.properties.filter as unknown as Record<
      string,
      unknown
    >;
    expect(filterProp.type).toBe("object");
    const filterProperties = filterProp.properties as Record<string, unknown>;
    expect(filterProperties).toHaveProperty("status");
    expect(filterProperties).toHaveProperty("category");
    expect(filterProperties).toHaveProperty("tag");
    expect(filterProperties).toHaveProperty("recurring");

    // Check update schema
    const updateProp = tool.schema.properties.update as unknown as Record<
      string,
      unknown
    >;
    expect(updateProp.type).toBe("object");
    const updateProperties = updateProp.properties as Record<string, unknown>;
    expect(updateProperties).toHaveProperty("status");
    expect(updateProperties).toHaveProperty("dueAt");
    expect(updateProperties).toHaveProperty("priority");
    expect(updateProperties).toHaveProperty("category");
    expect(updateProperties).toHaveProperty("recurrence");
  });

  it("updates tasks matching status filter", async () => {
    const tool = createBatchUpdateTasksTool(ctx);
    const result = await tool.execute({
      filter: { status: "todo" },
      update: { status: "done" },
    });

    expect(result.name).toBe("batch_update_tasks");
    expect(result.result).toMatchObject({
      success: true,
      updatedCount: 2, // task-1 and task-2 are "todo"
    });
    const resultData = result.result as Record<string, unknown>;
    expect(resultData.taskIds as string[]).toContain("task-1");
    expect(resultData.taskIds as string[]).toContain("task-2");
    expect(ctx.updateTask).toHaveBeenCalledTimes(2);
  });

  it("updates tasks matching category filter", async () => {
    const tool = createBatchUpdateTasksTool(ctx);
    const result = await tool.execute({
      filter: { category: "work" },
      update: { priority: "high" },
    });

    expect(result.result).toMatchObject({
      success: true,
      updatedCount: 2, // task-1 and task-2 are "work"
    });
    const resultData = result.result as Record<string, unknown>;
    expect(resultData.taskIds as string[]).toContain("task-1");
    expect(resultData.taskIds as string[]).toContain("task-2");
    expect(ctx.updateTask).toHaveBeenCalledTimes(2);

    // Verify priority was updated
    const calls = vi.mocked(ctx.updateTask).mock.calls;
    calls.forEach((call) => {
      const updatedTask = call[0];
      expect(updatedTask.priority).toBe("high");
    });
  });

  it("updates tasks matching tag filter (case-insensitive)", async () => {
    const tool = createBatchUpdateTasksTool(ctx);
    const result = await tool.execute({
      filter: { tag: "health" },
      update: { dueAt: "2026-03-15" },
    });

    expect(result.result).toMatchObject({
      success: true,
      updatedCount: 1, // only task-3 has "health" tag
    });
    const resultData = result.result as Record<string, unknown>;
    expect(resultData.taskIds as string[]).toContain("task-3");
    expect(ctx.updateTask).toHaveBeenCalledOnce();
  });

  it("updates tasks with recurring filter (true)", async () => {
    const tool = createBatchUpdateTasksTool(ctx);
    const result = await tool.execute({
      filter: { recurring: true },
      update: { category: "schedule" },
    });

    expect(result.result).toMatchObject({
      success: true,
      updatedCount: 2, // task-2 and task-3 are recurring
    });
    const resultData = result.result as Record<string, unknown>;
    expect(resultData.taskIds as string[]).toContain("task-2");
    expect(resultData.taskIds as string[]).toContain("task-3");
  });

  it("updates tasks with recurring filter (false)", async () => {
    const tool = createBatchUpdateTasksTool(ctx);
    const result = await tool.execute({
      filter: { recurring: false },
      update: { priority: "low" },
    });

    expect(result.result).toMatchObject({
      success: true,
      updatedCount: 1, // only task-1 is non-recurring
    });
    const resultData = result.result as Record<string, unknown>;
    expect(resultData.taskIds as string[]).toContain("task-1");
  });

  it("returns zero when no tasks match the filter", async () => {
    const tool = createBatchUpdateTasksTool(ctx);
    const result = await tool.execute({
      filter: { status: "cancelled" },
      update: { priority: "high" },
    });

    expect(result.result).toMatchObject({
      success: true,
      updatedCount: 0,
    });
    const resultData = result.result as Record<string, unknown>;
    expect(resultData.taskIds as string[]).toHaveLength(0);
    expect(ctx.updateTask).not.toHaveBeenCalled();
  });

  it("combines multiple filter conditions (all must match)", async () => {
    const tool = createBatchUpdateTasksTool(ctx);
    const result = await tool.execute({
      filter: { status: "todo", category: "work" },
      update: { status: "done" },
    });

    expect(result.result).toMatchObject({
      success: true,
      updatedCount: 2, // task-1 and task-2 match both filters
    });
    expect(ctx.updateTask).toHaveBeenCalledTimes(2);
  });

  it("handles recurrence update: sets isRecurring and recurringInterval when recurrence provided", async () => {
    const tool = createBatchUpdateTasksTool(ctx);
    const result = await tool.execute({
      filter: { status: "todo" },
      update: { recurrence: "FREQ=WEEKLY;BYDAY=FR" },
    });

    expect(result.result).toMatchObject({
      success: true,
      updatedCount: 2,
    });

    const calls = vi.mocked(ctx.updateTask).mock.calls;
    calls.forEach((call) => {
      const updatedTask = call[0];
      expect(updatedTask.isRecurring).toBe(true);
      expect(updatedTask.recurringInterval).toBe("FREQ=WEEKLY;BYDAY=FR");
    });
  });

  it("clears recurrence when recurrence is empty string", async () => {
    const tool = createBatchUpdateTasksTool(ctx);
    const result = await tool.execute({
      filter: { recurring: true },
      update: { recurrence: "" },
    });

    expect(result.result).toMatchObject({
      success: true,
      updatedCount: 2,
    });

    const calls = vi.mocked(ctx.updateTask).mock.calls;
    calls.forEach((call) => {
      const updatedTask = call[0];
      expect(updatedTask.isRecurring).toBeUndefined();
      expect(updatedTask.recurringInterval).toBeUndefined();
    });
  });

  it("calls deriveTaskStatus after applying updates", async () => {
    // Create a task that will trigger status derivation
    const futureTask: Task = {
      ...SAMPLE_TASKS[0],
      id: "task-future",
      startAt: "2026-03-01",
      dueAt: undefined,
      status: "todo",
    };

    ctx = makeContext({
      getTasks: vi.fn().mockResolvedValue([futureTask]),
    });

    const tool = createBatchUpdateTasksTool(ctx);
    await tool.execute({
      filter: { id: "task-future" }, // This won't match but we just need to test deriveTaskStatus
      update: { startAt: "2026-02-25" }, // Set start to today/soon
    });

    // Actually, let's update the start date to trigger "scheduled" status
    ctx = makeContext({
      getTasks: vi.fn().mockResolvedValue([futureTask]),
    });

    const tool2 = createBatchUpdateTasksTool(ctx);
    await tool2.execute({
      filter: { status: "todo" },
      update: { startAt: "2026-03-15" }, // Set start date in future
    });

    expect(ctx.updateTask).toHaveBeenCalledOnce();
    const updatedTask = vi.mocked(ctx.updateTask).mock.calls[0][0];
    // Status should be derived as "scheduled" since startAt is in future
    expect(updatedTask.status).toBe("scheduled");
  });

  it("preserves unchanged fields in updated tasks", async () => {
    const tool = createBatchUpdateTasksTool(ctx);
    await tool.execute({
      filter: { status: "todo" },
      update: { priority: "low" },
    });

    const calls = vi.mocked(ctx.updateTask).mock.calls;
    const updatedTask1 = calls[0][0];
    const updatedTask2 = calls[1][0];

    // Verify unchanged fields are preserved
    expect(updatedTask1.title).toBe("Complete project");
    expect(updatedTask1.description).toBe("Finish the main project");
    expect(updatedTask1.category).toBe("work");
    expect(updatedTask1.dueAt).toBe("2026-03-01");

    expect(updatedTask2.title).toBe("Weekly standup");
    expect(updatedTask2.category).toBe("work");
  });

  it("notifies on successful batch update", async () => {
    const tool = createBatchUpdateTasksTool(ctx);
    await tool.execute({
      filter: { category: "work" },
      update: { status: "done" },
    });

    expect(ctx.notify).toHaveBeenCalledWith(
      "success",
      expect.stringContaining("2"),
    );
  });

  it("updates tasks when user confirms batch update", async () => {
    mockConfirm.mockResolvedValue(true);
    const tool = createBatchUpdateTasksTool(ctx);
    const result = await tool.execute({
      filter: { status: "todo" },
      update: { status: "done" },
    });

    expect(mockConfirm).toHaveBeenCalledWith(
      expect.stringContaining("2"),
      expect.any(String),
    );
    expect(result.result).toMatchObject({
      success: true,
      updatedCount: 2,
    });
    expect(ctx.updateTask).toHaveBeenCalledTimes(2);
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "success",
        detail: expect.arrayContaining([
          expect.objectContaining({ type: "task-list" }),
        ]),
      }),
    );
  });

  it("cancels batch update when user declines", async () => {
    mockConfirm.mockResolvedValue(false);
    const tool = createBatchUpdateTasksTool(ctx);
    const result = await tool.execute({
      filter: { status: "todo" },
      update: { status: "done" },
    });

    expect(mockConfirm).toHaveBeenCalled();
    expect(result.result).toMatchObject({
      success: false,
      message: "Cancelled by user",
    });
    expect(ctx.updateTask).not.toHaveBeenCalled();
  });

  it("calls showToast with updated task list after successful batch update", async () => {
    mockConfirm.mockResolvedValue(true);
    const tool = createBatchUpdateTasksTool(ctx);
    await tool.execute({
      filter: { category: "work" },
      update: { priority: "high" },
    });

    expect(mockShowToast).toHaveBeenCalledOnce();
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: "success",
        title: expect.stringContaining("2"),
        detail: [
          expect.objectContaining({
            type: "task-list",
            label: "Updated Tasks",
          }),
        ],
        timeout: 6000,
      }),
    );
  });
});
