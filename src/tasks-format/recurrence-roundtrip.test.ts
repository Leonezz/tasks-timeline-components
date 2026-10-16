import { describe, expect, it, vi } from "vitest";
import { RRule } from "rrule";
import type { Task } from "../types";
import { parseTasksFormatItem } from "./parser";
import { formatTasksMetadata, taskToMarkdown } from "./serializer";
import {
  readRecurrenceRule,
  resolveRecurrenceOnSave,
} from "../utils/recurrence";
import type { CapabilityContext } from "../capabilities/types";
import { createCreateTaskTool } from "../capabilities/tools/create-task";

const parseLine = (line: string): Task =>
  parseTasksFormatItem({
    id: "note.md:0:0",
    title: line,
    status: "todo",
    priority: "medium",
    tags: [],
    category: "note.md",
  });

const writeLine = (task: Task): string =>
  `${task.title} ${formatTasksMetadata(task)}`;

describe("recurrence on Obsidian Tasks lines", () => {
  it("reads back a rule edited in the task editor", () => {
    const original = parseLine(
      "Water plants 📅 2026-10-16 🔁 every week when done",
    );
    const stored = readRecurrenceRule(original.recurringInterval);
    const saved: Task = {
      ...original,
      ...resolveRecurrenceOnSave(original, {
        isRecurring: true,
        controlsTouched: true,
        format: "text",
        whenDone: stored.whenDone,
        state: { ...stored.state, interval: 2, byWeekDay: [RRule.MO] },
      }),
    };

    const reread = parseLine(writeLine(saved));

    expect(reread.title).toBe("Water plants");
    expect(reread.dueAt).toBe("2026-10-16");
    expect(reread.recurringInterval).toBe("every 2 weeks on Monday when done");
  });

  it("writes an RRULE from create_task as text that reads back", () => {
    const line = writeLine({
      id: "ai-1",
      title: "Standup",
      status: "todo",
      priority: "medium",
      tags: [],
      isRecurring: true,
      recurringInterval: "FREQ=WEEKLY;BYDAY=MO",
    });

    expect(line).toBe("Standup 🔁 every week on Monday");
    expect(parseLine(line)).toMatchObject({
      title: "Standup",
      recurringInterval: "every week on Monday",
      isRecurring: true,
    });
  });

  it("refuses to write a rule with a start date instead of splitting the line", () => {
    expect(() =>
      writeLine({
        id: "ai-2",
        title: "Report",
        status: "todo",
        priority: "medium",
        tags: [],
        recurringInterval: "DTSTART:20261016T000000Z\nRRULE:FREQ=WEEKLY",
      }),
    ).toThrow("can't store a start date");
  });
});

/** create_task, then write the task as a line, then read the line back. */
async function createWriteRead(recurrence: string) {
  const addTask = vi.fn().mockResolvedValue(undefined);
  const ctx: CapabilityContext = {
    getTasks: vi.fn().mockResolvedValue([]),
    getTask: vi.fn().mockResolvedValue(null),
    addTask,
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  };
  const result = await createCreateTaskTool(ctx).execute({
    title: "Pay rent",
    dueAt: "2026-10-01",
    recurrence,
  });
  if (addTask.mock.calls.length === 0) {
    return { result: result.result };
  }
  const line = taskToMarkdown(addTask.mock.calls[0][0], "- [ ] Pay rent");
  return {
    result: result.result,
    line,
    reread: parseLine(line.replace(/^- \[.\] /, "")),
  };
}

describe("recurrence text from create_task on an Obsidian Tasks line", () => {
  it.each([
    ["every month until 2026-12-31", "every month until December 31, 2026"],
    ["every week until 12/31/2026", "every week until December 31, 2026"],
    ["every week until 2026/12/31", "every week until December 31, 2026"],
  ])("writes %j as %j and reads it back", async (recurrence, written) => {
    const { reread } = await createWriteRead(recurrence);

    expect(reread).toMatchObject({
      title: "Pay rent",
      recurringInterval: written,
      dueAt: "2026-10-01",
    });
  });

  it.each([
    "every week on Monday-Friday",
    "every week on Monday & Friday",
    "every week on Monday (work)",
    "every week.",
    "every month on the 1st's",
  ])("rejects %j instead of corrupting the line", async (recurrence) => {
    const { result, line } = await createWriteRead(recurrence);

    expect(result).toMatchObject({
      success: false,
      error: expect.stringContaining("letters, digits, spaces, commas"),
    });
    expect(line).toBeUndefined();
  });

  it("refuses to write stored text an Obsidian Tasks line can't hold", () => {
    expect(() =>
      formatTasksMetadata({
        id: "t",
        title: "Pay rent",
        status: "todo",
        priority: "medium",
        tags: [],
        recurringInterval: "every week on Monday-Friday",
      }),
    ).toThrow("only holds letters, digits, spaces, commas");
  });
});

/** Reads a full task line, as the Obsidian plugin hands it over, and writes it back. */
const rewriteLine = (line: string) => {
  const task = parseLine(line.replace(/^- \[.\] /, ""));
  return { task, written: taskToMarkdown(task, line) };
};

describe("lines written by v0.8.0", () => {
  it.each([
    [
      "- [ ] Pay rent 📅 2026-10-01 🔁 RRULE:FREQ=WEEKLY;BYDAY=MO",
      "RRULE:FREQ=WEEKLY;BYDAY=MO",
      "- [ ] Pay rent 📅 2026-10-01 🔁 every week on Monday",
    ],
    [
      "- [ ] Pay rent 🔁 FREQ=WEEKLY;BYDAY=MO 📅 2026-10-01",
      "FREQ=WEEKLY;BYDAY=MO",
      "- [ ] Pay rent 🔁 every week on Monday 📅 2026-10-01",
    ],
    [
      "- [ ] Pay rent 🔁 every month until 2026-12-31 📅 2026-10-01",
      "every month until 2026-12-31",
      "- [ ] Pay rent 🔁 every month until December 31, 2026 📅 2026-10-01",
    ],
  ])(
    "keeps the whole rule of %j and repairs it in place on write",
    (line, rule, repaired) => {
      const { task, written } = rewriteLine(line);

      expect(task).toMatchObject({
        title: "Pay rent",
        dueAt: "2026-10-01",
        recurringInterval: rule,
      });
      expect(written).toBe(repaired);
    },
  );

  it("stops the rule at a tag", () => {
    const { task } = rewriteLine(
      "- [ ] Pay rent 🔁 FREQ=MONTHLY;BYMONTHDAY=1 #home 📅 2026-10-01",
    );

    expect(task.recurringInterval).toBe("FREQ=MONTHLY;BYMONTHDAY=1");
    expect(task.title).toBe("Pay rent #home");
  });

  it.each([
    "- [ ] Water plants 📅 2026-10-16 🔁 every week when done",
    "- [ ] Water plants 📅 2026-10-16 🔁 every 2 weeks on Monday, Friday",
    "- [ ] Water plants #garden 📅 2026-10-16 🔁 every month on the last",
  ])("leaves the valid line %j unchanged", (line) => {
    expect(rewriteLine(line).written).toBe(line);
  });

  it("stops the rule before a block id", () => {
    expect(
      parseLine("Water plants 🔁 every week ^plants").recurringInterval,
    ).toBe("every week");
  });
});

/** What a line means, so a rewritten line can be compared with the original. */
const meaning = (task: Task) => ({
  title: task.title,
  rule: task.recurringInterval,
  dueAt: task.dueAt,
  startAt: task.startAt,
  createdAt: task.createdAt,
  completedAt: task.completedAt,
  scheduledAt: task.extra?.scheduledAt,
  priority: task.priority,
});

describe("the recurrence token stops at the next field", () => {
  it.each([
    "🏁 delete",
    "❌ 2026-10-01",
    "🆔 abc123",
    "⛔ abc123",
    "⏰ 2026-10-01 09:00",
    "📅 2026-10-01",
    "⏳ 2026-10-01",
    "🛫 2026-10-01",
    "✅ 2026-10-01",
    "➕ 2026-10-01",
    "🔺",
    "⏫",
    "🔼",
    "🔽",
    "⏬",
    "(call the landlord first)",
    "[[Budget]]",
    "#home",
  ])("reads only the rule before %j, and a rewrite means the same", (field) => {
    const line = `- [ ] Pay rent 🔁 every week ${field}`;
    const { task, written } = rewriteLine(line);

    expect(task.recurringInterval).toBe("every week");
    expect(written).toContain("🔁 every week");
    expect(meaning(rewriteLine(written).task)).toEqual(meaning(task));
  });

  it("reads 🔁 followed by U+FE0F", () => {
    expect(parseLine("Pay rent 🔁\uFE0F every day").recurringInterval).toBe(
      "every day",
    );
  });

  it("reads a numeric end date and stops at the next field", () => {
    const { task, written } = rewriteLine(
      "- [ ] Pay rent 🔁 every month until 2026-12-31 🏁 delete",
    );

    expect(task.recurringInterval).toBe("every month until 2026-12-31");
    expect(written).toContain("🔁 every month until December 31, 2026");
    expect(written).toContain("🏁 delete");
  });

  it("leaves a line with fields in Obsidian Tasks order unchanged", () => {
    const line = "- [ ] Pay rent 🏁 delete 📅 2026-10-01 🔁 every week";

    expect(rewriteLine(line).written).toBe(line);
  });
});
