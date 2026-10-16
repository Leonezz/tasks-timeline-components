import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CapabilityContext } from "../../types";
import type { Task } from "../../../types";
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
    expect(tool.schema.properties.status.enum).toEqual([
      "todo",
      "doing",
      "done",
      "cancelled",
    ]);
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
      status: "doing",
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

  it("preserves workflow status when dates imply a display state", async () => {
    const tool = createCreateTaskTool(ctx);
    await tool.execute({
      title: "Started task",
      status: "todo",
      startAt: "2020-01-01",
    });

    const addedTask = vi.mocked(ctx.addTask).mock.calls[0][0];
    expect(addedTask.status).toBe("todo");
  });

  it("reports the id the host stored the task under", async () => {
    const ctx = makeContext({
      addTask: vi.fn(async (task: Task) => ({ ...task, id: "1/HOSTKEY1" })),
    });
    const tool = createCreateTaskTool(ctx);
    const result = await tool.execute({ title: "Stored elsewhere" });
    expect(result.result).toMatchObject({ success: true, id: "1/HOSTKEY1" });
  });

  it("keeps its own id when the host returns nothing", async () => {
    const tool = createCreateTaskTool(ctx);
    const result = await tool.execute({ title: "Local" });
    const addedTask = vi.mocked(ctx.addTask).mock.calls[0][0];
    expect(result.result).toMatchObject({ id: addedTask.id });
  });

  it("notifies on success", async () => {
    const tool = createCreateTaskTool(ctx);
    await tool.execute({ title: "Notify test" });

    expect(ctx.notify).toHaveBeenCalledWith(
      "success",
      expect.stringContaining("Notify test"),
    );
  });

  it("rejects an unreadable recurrence rule without creating the task", async () => {
    const result = await createCreateTaskTool(ctx).execute({
      title: "Report",
      recurrence: "INTERVAL=2",
    });

    expect(result.result).toMatchObject({
      success: false,
      error: expect.stringContaining(
        'Cannot use the recurrence rule "INTERVAL=2"',
      ),
    });
    expect(ctx.addTask).not.toHaveBeenCalled();
  });

  it("accepts the dashed UNTIL form and Obsidian Tasks text", async () => {
    const tool = createCreateTaskTool(ctx);
    await tool.execute({
      title: "A",
      recurrence: "FREQ=WEEKLY;UNTIL=2026-12-31",
    });
    await tool.execute({ title: "B", recurrence: "every week" });

    const added = vi.mocked(ctx.addTask).mock.calls.map(([task]) => task);
    expect(added.map((t) => t.recurringInterval)).toEqual([
      "FREQ=WEEKLY;UNTIL=2026-12-31",
      "every week",
    ]);
  });

  it("treats an empty recurrence as no recurrence", async () => {
    await createCreateTaskTool(ctx).execute({ title: "Once", recurrence: "" });

    const added = vi.mocked(ctx.addTask).mock.calls[0][0];
    expect(added.isRecurring).toBeUndefined();
    expect(added.recurringInterval).toBeUndefined();
  });

  it("rejects a recurrence that is not a string", async () => {
    const result = await createCreateTaskTool(ctx).execute({
      title: "Report",
      recurrence: { freq: "weekly" },
    });

    expect(result.result).toMatchObject({
      success: false,
      error: expect.stringContaining("recurrence must be a string"),
    });
    expect(ctx.addTask).not.toHaveBeenCalled();
  });

  it.each([
    ["every year on the 25th of December", "of december"],
    ["every year on December 25", "25"],
    ["every day except Sunday", "except sunday"],
    ["every weekend", "weekend"],
    ["every month on the 1st and the 15th", "15th"],
  ])(
    "rejects %j, which the parser would read with words skipped",
    async (recurrence, skipped) => {
      const result = await createCreateTaskTool(ctx).execute({
        title: "Report",
        recurrence,
      });

      expect(result.result).toMatchObject({
        success: false,
        error: expect.stringContaining(`would skip "${skipped}"`),
      });
      expect(ctx.addTask).not.toHaveBeenCalled();
    },
  );

  it.each([
    "every week until Dec 31",
    "every week until December 31",
    "every week until 2026",
  ])("rejects %j, whose end date has no full date", async (recurrence) => {
    const result = await createCreateTaskTool(ctx).execute({
      title: "Report",
      recurrence,
    });

    expect(result.result).toMatchObject({
      success: false,
      error: expect.stringContaining("needs a month, day and year"),
    });
  });

  it("rejects 'when done' anywhere but the end", async () => {
    const result = await createCreateTaskTool(ctx).execute({
      title: "Report",
      recurrence: "every week when done until 2026-12-31",
    });

    expect(result.result).toMatchObject({
      success: false,
      error: expect.stringContaining('"when done" can only come at the end'),
    });
  });

  it("rejects an end date before the task's date", async () => {
    const result = await createCreateTaskTool(ctx).execute({
      title: "Report",
      dueAt: "2099-06-01",
      recurrence: "every week until January 1, 2099",
    });

    expect(result.result).toMatchObject({
      success: false,
      error: expect.stringContaining("before 2099-06-01"),
    });
  });

  it("stores natural wordings rrule reads in full", async () => {
    const result = await createCreateTaskTool(ctx).execute({
      title: "Report",
      recurrence: "Every month on the first Mon until december 31,2099",
    });

    expect(result.result).toMatchObject({
      success: true,
      understoodAs: "every month on the 1st Monday until December 31, 2099",
    });
    expect(vi.mocked(ctx.addTask).mock.calls[0][0].recurringInterval).toBe(
      "every month on the 1st Monday until December 31, 2099",
    );
  });

  it("stores text in the library's words and returns understoodAs", async () => {
    const result = await createCreateTaskTool(ctx).execute({
      title: "Report",
      dueAt: "2099-01-05",
      recurrence: "every year in December until 2099-12-31",
    });

    expect(result.result).toMatchObject({
      success: true,
      understoodAs: "every December until December 31, 2099",
    });
    expect(vi.mocked(ctx.addTask).mock.calls[0][0].recurringInterval).toBe(
      "every December until December 31, 2099",
    );
  });

  it.each([
    "every week for 3 weeks",
    "every week for 3 times",
    "every day for 2 months",
  ])(
    "rejects %j, a repetition count that would never end",
    async (recurrence) => {
      const result = await createCreateTaskTool(ctx).execute({
        title: "Report",
        recurrence,
      });

      expect(result.result).toMatchObject({
        success: false,
        error: expect.stringContaining("until <date>"),
      });
      expect(ctx.addTask).not.toHaveBeenCalled();
    },
  );
});
