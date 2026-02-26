import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CapabilityContext } from "../../types";
import type { Task } from "../../../types";
import { createDeleteTaskTool } from "../../tools/delete-task";

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
  title: "Task to delete",
  status: "todo",
  priority: "medium",
  tags: [],
  createdAt: "2026-01-01",
};

describe("delete_task tool", () => {
  let ctx: CapabilityContext;
  let mockConfirm: ReturnType<typeof vi.fn>;
  let mockShowToast: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockConfirm = vi.fn().mockResolvedValue(true);
    mockShowToast = vi.fn();
    ctx = makeContext({
      getTask: vi.fn().mockResolvedValue({ ...EXISTING_TASK }),
      confirm: mockConfirm as CapabilityContext["confirm"],
      showToast: mockShowToast as CapabilityContext["showToast"],
    });
  });

  it("has correct name and schema", () => {
    const tool = createDeleteTaskTool(ctx);

    expect(tool.name).toBe("delete_task");
    expect(tool.schema.type).toBe("object");
    expect(tool.schema.required).toEqual(["id"]);
    expect(tool.schema.properties).toHaveProperty("id");
    expect(tool.schema.properties.id.type).toBe("string");
    expect(tool.schema.properties.id.description).toBeDefined();
  });

  it("deletes existing task and returns success", async () => {
    const tool = createDeleteTaskTool(ctx);
    const result = await tool.execute({ id: "task-1" });

    expect(result.name).toBe("delete_task");
    expect(result.result).toMatchObject({
      success: true,
      id: "task-1",
      title: "Task to delete",
    });

    expect(ctx.getTask).toHaveBeenCalledWith("task-1");
    expect(ctx.deleteTask).toHaveBeenCalledOnce();
    expect(ctx.deleteTask).toHaveBeenCalledWith("task-1");
    expect(ctx.notify).toHaveBeenCalledWith(
      "info",
      expect.stringContaining("Task to delete"),
    );
  });

  it("returns error for non-existent task and does not call deleteTask", async () => {
    const ctxNotFound = makeContext({
      getTask: vi.fn().mockResolvedValue(null),
      confirm: mockConfirm as CapabilityContext["confirm"],
      showToast: mockShowToast as CapabilityContext["showToast"],
    });

    const tool = createDeleteTaskTool(ctxNotFound);
    const result = await tool.execute({ id: "nonexistent" });

    expect(result.name).toBe("delete_task");
    expect(result.result).toMatchObject({
      success: false,
      message: expect.stringContaining("Task not found"),
    });

    expect(ctxNotFound.getTask).toHaveBeenCalledWith("nonexistent");
    expect(ctxNotFound.deleteTask).not.toHaveBeenCalled();
    expect(ctxNotFound.notify).not.toHaveBeenCalled();
  });

  it("deletes task when user confirms", async () => {
    mockConfirm.mockResolvedValue(true);
    const tool = createDeleteTaskTool(ctx);
    const result = await tool.execute({ id: "task-1" });

    expect(mockConfirm).toHaveBeenCalledWith(
      expect.stringContaining("Task to delete"),
      expect.any(String),
    );
    expect(result.result).toMatchObject({
      success: true,
      id: "task-1",
      title: "Task to delete",
    });
    expect(ctx.deleteTask).toHaveBeenCalledWith("task-1");
  });

  it("cancels deletion when user declines", async () => {
    mockConfirm.mockResolvedValue(false);
    const tool = createDeleteTaskTool(ctx);
    const result = await tool.execute({ id: "task-1" });

    expect(mockConfirm).toHaveBeenCalled();
    expect(result.result).toMatchObject({
      success: false,
      message: "Cancelled by user",
    });
    expect(ctx.deleteTask).not.toHaveBeenCalled();
  });

  it("proceeds with deletion when confirm is not provided", async () => {
    const ctxNoConfirm = makeContext({
      getTask: vi.fn().mockResolvedValue({ ...EXISTING_TASK }),
    });

    const tool = createDeleteTaskTool(ctxNoConfirm);
    const result = await tool.execute({ id: "task-1" });

    expect(result.result).toMatchObject({
      success: true,
      id: "task-1",
      title: "Task to delete",
    });
    expect(ctxNoConfirm.deleteTask).toHaveBeenCalledWith("task-1");
  });
});
