import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CapabilityContext } from "../types";
import type { Task } from "../../types";
import { createPlanMyDayPrompt } from "../prompts/plan-my-day";
import { createWeeklyReviewPrompt } from "../prompts/weekly-review";
import { createTaskTriagePrompt } from "../prompts/task-triage";
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

const SAMPLE_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Fix login bug",
    status: "overdue",
    priority: "high",
    tags: [{ id: "t1", name: "Bug" }],
    dueAt: yesterday,
    createdAt: threeDaysAgo,
  },
  {
    id: "task-2",
    title: "Write tests",
    status: "due",
    priority: "medium",
    tags: [],
    dueAt: today,
    createdAt: threeDaysAgo,
  },
  {
    id: "task-3",
    title: "Review PR",
    status: "todo",
    priority: "low",
    tags: [],
    dueAt: today,
    createdAt: yesterday,
  },
];

describe("plan_my_day prompt", () => {
  let ctx: CapabilityContext;

  beforeEach(() => {
    ctx = makeContext({
      getTasks: vi.fn().mockResolvedValue(SAMPLE_TASKS),
    });
  });

  it("has correct name and arguments", () => {
    const prompt = createPlanMyDayPrompt(ctx);

    expect(prompt.name).toBe("plan_my_day");
    expect(prompt.arguments).toHaveLength(1);
    expect(prompt.arguments![0].name).toBe("focusArea");
    expect(prompt.arguments![0].required).toBe(false);
  });

  it("renders with task data", async () => {
    const prompt = createPlanMyDayPrompt(ctx);
    const messages = await prompt.render();

    expect(messages).toHaveLength(1);
    expect(messages[0].role).toBe("user");

    const content = messages[0].content;
    expect(content).toContain("Review my tasks for today");
    expect(content).toContain("Today's Tasks");
    expect(content).toContain("Write tests");
    expect(content).toContain("Review PR");
    expect(content).toContain("Overdue");
    expect(content).toContain("Fix login bug");
  });

  it("includes focus area when provided", async () => {
    const prompt = createPlanMyDayPrompt(ctx);
    const messages = await prompt.render({ focusArea: "bug fixes" });

    const content = messages[0].content;
    expect(content).toContain("Focus area: bug fixes");
  });

  it("does not include focus area line when not provided", async () => {
    const prompt = createPlanMyDayPrompt(ctx);
    const messages = await prompt.render();

    const content = messages[0].content;
    expect(content).not.toContain("Focus area:");
  });
});

describe("weekly_review prompt", () => {
  let ctx: CapabilityContext;

  const weeklyTasks: Task[] = [
    ...SAMPLE_TASKS,
    {
      id: "task-4",
      title: "Deploy feature",
      status: "done",
      priority: "high",
      tags: [],
      dueAt: yesterday,
      completedAt: today,
      createdAt: threeDaysAgo,
    },
  ];

  beforeEach(() => {
    ctx = makeContext({
      getTasks: vi.fn().mockResolvedValue(weeklyTasks),
    });
  });

  it("has correct name and arguments", () => {
    const prompt = createWeeklyReviewPrompt(ctx);

    expect(prompt.name).toBe("weekly_review");
    expect(prompt.arguments).toHaveLength(1);
    expect(prompt.arguments![0].name).toBe("weekStart");
    expect(prompt.arguments![0].required).toBe(false);
  });

  it("renders with task context", async () => {
    const prompt = createWeeklyReviewPrompt(ctx);
    const messages = await prompt.render();

    expect(messages).toHaveLength(1);
    expect(messages[0].role).toBe("user");

    const content = messages[0].content;
    expect(content).toContain("Review my task progress");
    expect(content).toContain("Summary");
    expect(content).toContain("Completed:");
    expect(content).toContain("Overdue:");
    expect(content).toContain("Active:");
    expect(content).toContain("Completed Tasks");
    expect(content).toContain("Deploy feature");
    expect(content).toContain("Still Active");
  });
});

describe("task_triage prompt", () => {
  let ctx: CapabilityContext;

  const triageTasks: Task[] = [
    ...SAMPLE_TASKS,
    {
      id: "task-5",
      title: "Brainstorm ideas",
      status: "unplanned",
      priority: "low",
      tags: [],
    },
    {
      id: "task-6",
      title: "Cleanup backlog",
      status: "todo",
      priority: "medium",
      tags: [],
      // no dueAt — unscheduled
    },
  ];

  beforeEach(() => {
    ctx = makeContext({
      getTasks: vi.fn().mockResolvedValue(triageTasks),
    });
  });

  it("has correct name and no required arguments", () => {
    const prompt = createTaskTriagePrompt(ctx);

    expect(prompt.name).toBe("task_triage");
    expect(prompt.arguments).toBeUndefined();
  });

  it("renders with overdue and unscheduled context", async () => {
    const prompt = createTaskTriagePrompt(ctx);
    const messages = await prompt.render();

    expect(messages).toHaveLength(1);
    expect(messages[0].role).toBe("user");

    const content = messages[0].content;
    expect(content).toContain("Triage my tasks");
    expect(content).toContain("Overdue");
    expect(content).toContain("Fix login bug");
    expect(content).toContain("Unscheduled");
    expect(content).toContain("Brainstorm ideas");
    expect(content).toContain("Cleanup backlog");
    expect(content).toContain("suggest one action");
  });
});
