import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CapabilityContext } from "../../types";
import { createCreateTaskTool } from "../../tools/create-task";

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

describe("create_task tool", () => {
  let ctx: CapabilityContext;

  beforeEach(() => {
    ctx = makeContext();
  });

  it("has correct name and schema", () => {
    const tool = createCreateTaskTool(ctx);

    expect(tool.name).toBe("create_task");
    expect(tool.schema.type).toBe("object");
    expect(tool.schema.required).toEqual(["title"]);
    expect(tool.schema.properties).toHaveProperty("title");
    expect(tool.schema.properties).toHaveProperty("description");
    expect(tool.schema.properties).toHaveProperty("priority");
    expect(tool.schema.properties).toHaveProperty("status");
    expect(tool.schema.properties).toHaveProperty("dueAt");
    expect(tool.schema.properties).toHaveProperty("startAt");
    expect(tool.schema.properties).toHaveProperty("category");
    expect(tool.schema.properties).toHaveProperty("tags");
    expect(tool.schema.properties).toHaveProperty("recurrence");
    expect(tool.schema.properties.priority.enum).toEqual([
      "low",
      "medium",
      "high",
    ]);
    expect(tool.schema.properties.status.enum).toEqual(["todo", "scheduled"]);
  });

  it("creates task with just a title using defaults", async () => {
    const tool = createCreateTaskTool(ctx);
    const result = await tool.execute({ title: "Buy groceries" });

    expect(result.name).toBe("create_task");
    expect(result.result).toMatchObject({
      success: true,
      title: "Buy groceries",
    });

    const resultObj = result.result as { success: boolean; id: string };
    expect(resultObj.id).toMatch(/^ai-/);

    expect(ctx.addTask).toHaveBeenCalledOnce();
    const addedTask = vi.mocked(ctx.addTask).mock.calls[0][0];
    expect(addedTask.title).toBe("Buy groceries");
    expect(addedTask.priority).toBe("medium");
    expect(addedTask.tags).toEqual([]);
    expect(addedTask.id).toMatch(/^ai-/);
    expect(addedTask.createdAt).toBeDefined();
  });

  it("creates task with all optional fields including recurrence", async () => {
    const tool = createCreateTaskTool(ctx);
    const result = await tool.execute({
      title: "Weekly standup",
      description: "Team standup meeting",
      priority: "high",
      status: "scheduled",
      dueAt: "2026-03-01",
      startAt: "2026-02-25",
      category: "meetings",
      tags: ["work", "recurring"],
      recurrence: "FREQ=WEEKLY;BYDAY=MO",
    });

    expect(result.name).toBe("create_task");
    expect(result.result).toMatchObject({
      success: true,
      title: "Weekly standup",
    });

    const addedTask = vi.mocked(ctx.addTask).mock.calls[0][0];
    expect(addedTask.description).toBe("Team standup meeting");
    expect(addedTask.priority).toBe("high");
    expect(addedTask.dueAt).toBe("2026-03-01");
    expect(addedTask.startAt).toBe("2026-02-25");
    expect(addedTask.category).toBe("meetings");
    expect(addedTask.tags).toHaveLength(2);
    expect(addedTask.tags[0].name).toBe("work");
    expect(addedTask.tags[0].id).toMatch(/^tag-/);
    expect(addedTask.tags[1].name).toBe("recurring");
    expect(addedTask.tags[1].id).toMatch(/^tag-/);
    expect(addedTask.isRecurring).toBe(true);
    expect(addedTask.recurringInterval).toBe("FREQ=WEEKLY;BYDAY=MO");
  });

  it("derives task status via deriveTaskStatus when startAt is in the past", async () => {
    const tool = createCreateTaskTool(ctx);
    await tool.execute({
      title: "Started task",
      status: "todo",
      startAt: "2020-01-01",
    });

    const addedTask = vi.mocked(ctx.addTask).mock.calls[0][0];
    expect(addedTask.status).toBe("doing");
  });

  it("notifies on success", async () => {
    const tool = createCreateTaskTool(ctx);
    await tool.execute({ title: "Notify test" });

    expect(ctx.notify).toHaveBeenCalledWith(
      "success",
      expect.stringContaining("Notify test"),
    );
  });
});
