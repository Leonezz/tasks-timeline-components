import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CapabilityContext } from "../../types";
import type { Task } from "../../../types";
import { createUpdateTaskTool } from "../../tools/update-task";

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
  title: "Original title",
  description: "Original description",
  status: "todo",
  priority: "medium",
  category: "work",
  tags: [{ id: "t1", name: "existing-tag" }],
  dueAt: "2026-06-01",
  startAt: "2026-05-01",
  createdAt: "2026-01-01",
};

describe("update_task tool", () => {
  let ctx: CapabilityContext;

  beforeEach(() => {
    ctx = makeContext({
      getTask: vi.fn().mockResolvedValue({ ...EXISTING_TASK }),
    });
  });

  it("has correct name and schema", () => {
    const tool = createUpdateTaskTool(ctx);

    expect(tool.name).toBe("update_task");
    expect(tool.schema.type).toBe("object");
    expect(tool.schema.required).toEqual(["id"]);
    expect(tool.schema.properties).toHaveProperty("id");
    expect(tool.schema.properties).toHaveProperty("title");
    expect(tool.schema.properties).toHaveProperty("description");
    expect(tool.schema.properties).toHaveProperty("status");
    expect(tool.schema.properties).toHaveProperty("priority");
    expect(tool.schema.properties).toHaveProperty("dueAt");
    expect(tool.schema.properties).toHaveProperty("startAt");
    expect(tool.schema.properties).toHaveProperty("completedAt");
    expect(tool.schema.properties).toHaveProperty("category");
    expect(tool.schema.properties).toHaveProperty("tags");
    expect(tool.schema.properties).toHaveProperty("recurrence");
    expect(tool.schema.properties.status.enum).toEqual([
      "todo",
      "done",
      "cancelled",
    ]);
  });

  it("updates basic fields (title, priority) and preserves unchanged fields", async () => {
    const tool = createUpdateTaskTool(ctx);
    const result = await tool.execute({
      id: "task-1",
      title: "Updated title",
      priority: "high",
    });

    expect(result.name).toBe("update_task");
    expect(result.result).toMatchObject({ success: true, id: "task-1" });

    expect(ctx.updateTask).toHaveBeenCalledOnce();
    const updatedTask = vi.mocked(ctx.updateTask).mock.calls[0][0];
    expect(updatedTask.title).toBe("Updated title");
    expect(updatedTask.priority).toBe("high");
    // Unchanged fields preserved
    expect(updatedTask.description).toBe("Original description");
    expect(updatedTask.category).toBe("work");
    expect(updatedTask.createdAt).toBe("2026-01-01");
  });

  it("calls deriveTaskStatus after update (past dueAt triggers overdue)", async () => {
    const tool = createUpdateTaskTool(ctx);
    await tool.execute({
      id: "task-1",
      dueAt: "2020-01-01",
    });

    expect(ctx.updateTask).toHaveBeenCalledOnce();
    const updatedTask = vi.mocked(ctx.updateTask).mock.calls[0][0];
    expect(updatedTask.status).toBe("overdue");
  });

  it("handles recurrence set (FREQ=DAILY sets isRecurring true)", async () => {
    const tool = createUpdateTaskTool(ctx);
    await tool.execute({
      id: "task-1",
      recurrence: "FREQ=DAILY",
    });

    expect(ctx.updateTask).toHaveBeenCalledOnce();
    const updatedTask = vi.mocked(ctx.updateTask).mock.calls[0][0];
    expect(updatedTask.isRecurring).toBe(true);
    expect(updatedTask.recurringInterval).toBe("FREQ=DAILY");
  });

  it("clears recurrence when set to empty string", async () => {
    const recurringTask: Task = {
      ...EXISTING_TASK,
      isRecurring: true,
      recurringInterval: "FREQ=WEEKLY",
    };
    ctx = makeContext({
      getTask: vi.fn().mockResolvedValue({ ...recurringTask }),
    });

    const tool = createUpdateTaskTool(ctx);
    await tool.execute({
      id: "task-1",
      recurrence: "",
    });

    expect(ctx.updateTask).toHaveBeenCalledOnce();
    const updatedTask = vi.mocked(ctx.updateTask).mock.calls[0][0];
    expect(updatedTask.isRecurring).toBeUndefined();
    expect(updatedTask.recurringInterval).toBeUndefined();
  });

  it("returns error for non-existent task (getTask returns null)", async () => {
    ctx = makeContext({
      getTask: vi.fn().mockResolvedValue(null),
    });

    const tool = createUpdateTaskTool(ctx);
    const result = await tool.execute({
      id: "nonexistent-id",
      title: "Should fail",
    });

    expect(result.name).toBe("update_task");
    expect(result.result).toMatchObject({ success: false });
    expect(ctx.updateTask).not.toHaveBeenCalled();
  });

  it("handles tag updates from string array", async () => {
    const tool = createUpdateTaskTool(ctx);
    await tool.execute({
      id: "task-1",
      tags: ["new-tag-1", "new-tag-2"],
    });

    expect(ctx.updateTask).toHaveBeenCalledOnce();
    const updatedTask = vi.mocked(ctx.updateTask).mock.calls[0][0];
    expect(updatedTask.tags).toHaveLength(2);
    expect(updatedTask.tags[0].name).toBe("new-tag-1");
    expect(updatedTask.tags[0].id).toMatch(/^tag-/);
    expect(updatedTask.tags[1].name).toBe("new-tag-2");
    expect(updatedTask.tags[1].id).toMatch(/^tag-/);
  });

  it("notifies on success", async () => {
    const tool = createUpdateTaskTool(ctx);
    await tool.execute({
      id: "task-1",
      title: "Notify test",
    });

    expect(ctx.notify).toHaveBeenCalledWith(
      "success",
      expect.stringContaining("task-1"),
    );
  });
});
