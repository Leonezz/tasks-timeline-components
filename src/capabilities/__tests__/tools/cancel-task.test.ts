import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CapabilityContext } from "../../types";
import type { Task } from "../../../types";
import { createCancelTaskTool } from "../../tools/cancel-task";

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

const EXISTING_TASK: Task = {
  id: "task-1",
  title: "Task to cancel",
  status: "todo",
  priority: "medium",
  tags: [],
  createdAt: "2026-01-01",
};

describe("cancel_task tool", () => {
  let ctx: CapabilityContext;

  beforeEach(() => {
    ctx = makeContext({
      getTask: vi.fn().mockResolvedValue({ ...EXISTING_TASK }),
    });
  });

  it("has correct name and schema", () => {
    const tool = createCancelTaskTool(ctx);

    expect(tool.name).toBe("cancel_task");
    expect(tool.schema.type).toBe("object");
    expect(tool.schema.required).toEqual(["id"]);
    expect(tool.schema.properties).toHaveProperty("id");
    expect(tool.schema.properties.id.type).toBe("string");
    expect(tool.schema.properties.id.description).toBeDefined();
    expect(tool.description).toContain("recurring");
  });

  it("marks task as cancelled with cancelledAt", async () => {
    const tool = createCancelTaskTool(ctx);
    const result = await tool.execute({ id: "task-1" });

    expect(result.name).toBe("cancel_task");
    expect(result.result).toMatchObject({
      success: true,
      id: "task-1",
      title: "Task to cancel",
    });

    expect(ctx.getTask).toHaveBeenCalledWith("task-1");
    expect(ctx.updateTask).toHaveBeenCalledOnce();

    const cancelledTask = vi.mocked(ctx.updateTask).mock.calls[0][0];
    expect(cancelledTask.status).toBe("cancelled");
    expect(cancelledTask.cancelledAt).toBeDefined();
    expect(cancelledTask.cancelledAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);

    expect(ctx.notify).toHaveBeenCalledWith(
      "info",
      expect.stringContaining("Task to cancel"),
    );
  });

  it("returns error for non-existent task", async () => {
    const ctxNotFound = makeContext({
      getTask: vi.fn().mockResolvedValue(null),
    });

    const tool = createCancelTaskTool(ctxNotFound);
    const result = await tool.execute({ id: "nonexistent" });

    expect(result.name).toBe("cancel_task");
    expect(result.result).toMatchObject({
      success: false,
    });
    expect((result.result as Record<string, unknown>).error).toContain(
      "Task not found",
    );

    expect(ctxNotFound.getTask).toHaveBeenCalledWith("nonexistent");
    expect(ctxNotFound.updateTask).not.toHaveBeenCalled();
    expect(ctxNotFound.notify).not.toHaveBeenCalled();
  });
});
