import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CapabilityContext } from "../../types";
import type { Task } from "../../../types";
import { createCompleteTaskTool } from "../../tools/complete-task";

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

const NON_RECURRING_TASK: Task = {
  id: "task-1",
  title: "Buy groceries",
  status: "todo",
  priority: "medium",
  tags: [{ id: "t1", name: "shopping" }],
  createdAt: "2026-01-01",
  dueAt: "2026-02-20",
};

const RECURRING_TASK: Task = {
  id: "task-2",
  title: "Weekly standup",
  status: "todo",
  priority: "high",
  tags: [{ id: "t2", name: "work" }],
  createdAt: "2026-01-01",
  dueAt: "2026-02-20",
  startAt: "2026-02-18",
  isRecurring: true,
  recurringInterval: "FREQ=WEEKLY;BYDAY=MO",
  category: "meetings",
};

describe("complete_task tool", () => {
  let ctx: CapabilityContext;

  beforeEach(() => {
    ctx = makeContext({
      getTask: vi.fn().mockResolvedValue({ ...NON_RECURRING_TASK }),
    });
  });

  it("has correct name and schema", () => {
    const tool = createCompleteTaskTool(ctx);

    expect(tool.name).toBe("complete_task");
    expect(tool.schema.type).toBe("object");
    expect(tool.schema.required).toEqual(["id"]);
    expect(tool.schema.properties).toHaveProperty("id");
    expect(tool.schema.properties.id.type).toBe("string");
    expect(tool.schema.properties.id.description).toBeDefined();
    expect(tool.description).toContain("recurring");
  });

  it("marks non-recurring task as done with completedAt", async () => {
    const tool = createCompleteTaskTool(ctx);
    const result = await tool.execute({ id: "task-1" });

    expect(result.name).toBe("complete_task");
    expect(result.result).toMatchObject({
      success: true,
      id: "task-1",
      title: "Buy groceries",
      createdNextOccurrence: false,
    });

    expect(ctx.getTask).toHaveBeenCalledWith("task-1");
    expect(ctx.updateTask).toHaveBeenCalledOnce();

    const completedTask = vi.mocked(ctx.updateTask).mock.calls[0][0];
    expect(completedTask.status).toBe("done");
    expect(completedTask.completedAt).toBeDefined();
    expect(completedTask.completedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);

    // Non-recurring: no new task created
    expect(ctx.addTask).not.toHaveBeenCalled();

    expect(ctx.notify).toHaveBeenCalledWith(
      "success",
      expect.stringContaining("Buy groceries"),
    );
  });

  it("creates next occurrence for recurring task", async () => {
    ctx = makeContext({
      getTask: vi.fn().mockResolvedValue({ ...RECURRING_TASK }),
    });

    const tool = createCompleteTaskTool(ctx);
    const result = await tool.execute({ id: "task-2" });

    expect(result.name).toBe("complete_task");
    expect(result.result).toMatchObject({
      success: true,
      id: "task-2",
      title: "Weekly standup",
      createdNextOccurrence: true,
    });

    // Original task should be marked done
    expect(ctx.updateTask).toHaveBeenCalledOnce();
    const completedTask = vi.mocked(ctx.updateTask).mock.calls[0][0];
    expect(completedTask.status).toBe("done");
    expect(completedTask.completedAt).toBeDefined();
    expect(completedTask.id).toBe("task-2");

    // Next occurrence should be created
    expect(ctx.addTask).toHaveBeenCalledOnce();
    const nextTask = vi.mocked(ctx.addTask).mock.calls[0][0];

    // New ID, not the same as original
    expect(nextTask.id).not.toBe("task-2");
    expect(nextTask.id).toMatch(/^ai-/);

    // Preserves recurring fields
    expect(nextTask.isRecurring).toBe(true);
    expect(nextTask.recurringInterval).toBe("FREQ=WEEKLY;BYDAY=MO");

    // Preserves other fields from original
    expect(nextTask.title).toBe("Weekly standup");
    expect(nextTask.priority).toBe("high");
    expect(nextTask.tags).toEqual([{ id: "t2", name: "work" }]);
    expect(nextTask.category).toBe("meetings");

    // Reset fields
    expect(nextTask.status).not.toBe("done");
    expect(nextTask.createdAt).toBeDefined();
    expect(nextTask.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
    expect(nextTask.completedAt).toBeUndefined();
    expect(nextTask.cancelledAt).toBeUndefined();
  });

  it("returns error for non-existent task", async () => {
    const ctxNotFound = makeContext({
      getTask: vi.fn().mockResolvedValue(null),
    });

    const tool = createCompleteTaskTool(ctxNotFound);
    const result = await tool.execute({ id: "nonexistent" });

    expect(result.name).toBe("complete_task");
    expect(result.result).toMatchObject({
      success: false,
    });
    expect((result.result as Record<string, unknown>).error).toContain(
      "Task not found",
    );

    expect(ctxNotFound.getTask).toHaveBeenCalledWith("nonexistent");
    expect(ctxNotFound.updateTask).not.toHaveBeenCalled();
    expect(ctxNotFound.addTask).not.toHaveBeenCalled();
    expect(ctxNotFound.notify).not.toHaveBeenCalled();
  });
});
