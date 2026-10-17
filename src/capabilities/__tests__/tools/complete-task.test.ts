import { afterEach, describe, it, expect, vi, beforeEach } from "vitest";
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

    // Moves to the next Monday after the Friday due date; start keeps its offset
    expect(nextTask.dueAt).toBe("2026-02-23");
    expect(nextTask.startAt).toBe("2026-02-21");

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

  describe("next occurrence", () => {
    const completeAndGetNext = async (task: Task) => {
      const ctxWithTask = makeContext({
        getTask: vi.fn().mockResolvedValue({ ...task }),
      });
      const result = await createCompleteTaskTool(ctxWithTask).execute({
        id: task.id,
      });
      const nextTask = vi.mocked(ctxWithTask.addTask).mock.calls[0]?.[0];
      return { ctx: ctxWithTask, result: result.result, nextTask };
    };

    // Shape of a task parsed from `- [ ] Water plants 🔁 every week ...`
    const OBSIDIAN_TASK: Task = {
      id: "task-3",
      title: "Water plants",
      status: "todo",
      priority: "medium",
      tags: [],
      dueAt: "2026-02-20",
      startAt: "2026-02-18",
      recurringInterval: "every week",
      extra: { scheduledAt: "2026-02-19", isTasksTask: "true" },
    };

    afterEach(() => {
      vi.useRealTimers();
    });

    it("advances an Obsidian Tasks text rule and keeps the rule text", async () => {
      const { result, nextTask } = await completeAndGetNext(OBSIDIAN_TASK);

      expect(result).toMatchObject({
        success: true,
        createdNextOccurrence: true,
      });
      expect(nextTask.dueAt).toBe("2026-02-27");
      expect(nextTask.startAt).toBe("2026-02-25");
      expect(nextTask.extra).toEqual({
        scheduledAt: "2026-02-26",
        isTasksTask: "true",
      });
      expect(nextTask.recurringInterval).toBe("every week");
    });

    it("gives the next occurrence no 🆔 or ⛔, as Obsidian Tasks does, and keeps 🏁", async () => {
      const { nextTask } = await completeAndGetNext({
        ...OBSIDIAN_TASK,
        taskId: "water1",
        dependsOn: ["buy-can"],
        onCompletion: "delete",
      });

      expect(nextTask.taskId).toBeUndefined();
      expect(nextTask.dependsOn).toBeUndefined();
      expect(nextTask.onCompletion).toBe("delete");
    });

    it("advances 'when done' rules from the completion date", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 2, 4, 12));

      const { nextTask } = await completeAndGetNext({
        ...OBSIDIAN_TASK,
        recurringInterval: "every week when done",
      });

      expect(nextTask.dueAt).toBe("2026-03-11");
      // Other dates keep their offset from the due date
      expect(nextTask.startAt).toBe("2026-03-09");
      expect(nextTask.recurringInterval).toBe("every week when done");
    });

    it("keeps the time and offset of full ISO dates", async () => {
      const { nextTask } = await completeAndGetNext({
        ...OBSIDIAN_TASK,
        dueAt: "2026-02-20T09:30:00.000+08:00",
        startAt: undefined,
        extra: undefined,
        recurringInterval: "every day",
      });

      expect(nextTask.dueAt).toBe("2026-02-21T09:30:00.000+08:00");
    });

    it("creates an undated next occurrence for an undated task", async () => {
      const { result, nextTask } = await completeAndGetNext({
        ...OBSIDIAN_TASK,
        dueAt: undefined,
        startAt: undefined,
        extra: undefined,
      });

      expect(result).toMatchObject({ createdNextOccurrence: true });
      expect(nextTask.dueAt).toBeUndefined();
      expect(nextTask.startAt).toBeUndefined();
    });

    it("completes without a next occurrence when the rule has ended", async () => {
      const {
        ctx: endedCtx,
        result,
        nextTask,
      } = await completeAndGetNext({
        ...OBSIDIAN_TASK,
        isRecurring: true,
        recurringInterval: "RRULE:FREQ=WEEKLY;UNTIL=20260221T000000Z",
      });

      expect(endedCtx.updateTask).toHaveBeenCalledOnce();
      expect(nextTask).toBeUndefined();
      expect(result).toMatchObject({
        success: true,
        createdNextOccurrence: false,
        message: expect.stringContaining("ended"),
      });
    });

    it("fails without changing anything when the rule cannot be read", async () => {
      const { ctx: badCtx, result } = await completeAndGetNext({
        ...OBSIDIAN_TASK,
        recurringInterval: "every fortnight",
      });

      expect(result).toMatchObject({
        success: false,
        error: expect.stringContaining('"every fortnight"'),
      });
      expect(badCtx.updateTask).not.toHaveBeenCalled();
      expect(badCtx.addTask).not.toHaveBeenCalled();
    });

    it("does not create a next occurrence when recurrence is switched off", async () => {
      const { result, nextTask } = await completeAndGetNext({
        ...OBSIDIAN_TASK,
        isRecurring: false,
      });

      expect(result).toMatchObject({ createdNextOccurrence: false });
      expect(nextTask).toBeUndefined();
    });
  });
});

describe("complete_task on a task that is already done", () => {
  it("writes nothing and says so", async () => {
    const ctx = makeContext({
      getTask: vi.fn().mockResolvedValue({
        ...RECURRING_TASK,
        status: "done",
        completedAt: "2026-02-20",
      }),
    });

    const result = await createCompleteTaskTool(ctx).execute({ id: "task-2" });

    expect(result.result).toEqual({
      success: true,
      id: "task-2",
      title: "Weekly standup",
      alreadyCompleted: true,
      createdNextOccurrence: false,
      message: "The task was already done, so nothing was changed.",
    });
    expect(ctx.updateTask).not.toHaveBeenCalled();
    expect(ctx.addTask).not.toHaveBeenCalled();
  });
});

describe("complete_task when the next occurrence can't be made", () => {
  const recurring: Task = {
    ...RECURRING_TASK,
    dueAt: "2026-02-10",
    startAt: undefined,
    recurringInterval: "every week",
  };

  it("changes nothing for a rule with no later date", async () => {
    const ctx = makeContext({
      getTask: vi.fn().mockResolvedValue({
        ...recurring,
        recurringInterval: "FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=30",
      }),
    });

    const result = await createCompleteTaskTool(ctx).execute({ id: "task-2" });

    expect(result.result).toMatchObject({
      success: false,
      error: expect.stringContaining("has no date after 2026-02-10"),
    });
    expect(ctx.updateTask).not.toHaveBeenCalled();
    expect(ctx.addTask).not.toHaveBeenCalled();
  });

  it("says the task is done and returns the next occurrence when adding it fails", async () => {
    const ctx = makeContext({
      getTask: vi.fn().mockResolvedValue({
        ...recurring,
        description: "Agenda in the team doc",
      }),
      addTask: vi.fn().mockRejectedValue(new Error("index timed out")),
    });

    const result = await createCompleteTaskTool(ctx).execute({ id: "task-2" });

    expect(ctx.updateTask).toHaveBeenCalledOnce();
    expect(result.result).toMatchObject({
      success: false,
      completed: true,
      createdNextOccurrence: false,
      error: expect.stringContaining("index timed out"),
      nextOccurrence: {
        title: "Weekly standup",
        description: "Agenda in the team doc",
        priority: "high",
        dueAt: "2026-02-17",
        category: "meetings",
        recurrence: "every week",
        tags: ["work"],
      },
    });
  });
});
