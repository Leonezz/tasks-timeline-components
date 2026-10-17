/**
 * Unit tests for the Tasks-format parser
 * Tests date parsing, priority extraction, and title extraction
 */

import { describe, expect, it } from "vitest";
import type { Task } from "../types";
import { parseTasksFormatItem } from "./parser";

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: "test:0:0",
  title: "",
  status: "todo",
  category: "test.md",
  priority: "medium",
  tags: [],
  ...overrides,
});

describe("parseTasksFormatItem", () => {
  describe("date parsing (yyyy-MM-dd format)", () => {
    it("should parse due date with correct month", () => {
      const task = makeTask({ title: "Interview 📅 2026-02-27" });
      const result = parseTasksFormatItem(task);

      expect(result.dueAt).toBe("2026-02-27");
    });

    it("should parse created date with correct month", () => {
      const task = makeTask({ title: "Task ➕ 2026-02-26" });
      const result = parseTasksFormatItem(task);

      expect(result.createdAt).toBe("2026-02-26");
    });

    it("should parse start date with correct month", () => {
      const task = makeTask({ title: "Task 🛫 2026-03-15" });
      const result = parseTasksFormatItem(task);

      expect(result.startAt).toBe("2026-03-15");
    });

    it("should parse scheduled date with correct month", () => {
      const task = makeTask({ title: "Task ⏳ 2026-11-05" });
      const result = parseTasksFormatItem(task);

      expect(result.extra?.["scheduledAt"]).toBe("2026-11-05");
    });

    it("should parse done date with correct month", () => {
      const task = makeTask({ title: "Task ✅ 2026-12-31" });
      const result = parseTasksFormatItem(task);

      expect(result.completedAt).toBe("2026-12-31");
    });

    it("should preserve month for all 12 months", () => {
      const months = [
        "01",
        "02",
        "03",
        "04",
        "05",
        "06",
        "07",
        "08",
        "09",
        "10",
        "11",
        "12",
      ];
      for (const month of months) {
        const task = makeTask({ title: `Task 📅 2026-${month}-15` });
        const result = parseTasksFormatItem(task);
        expect(result.dueAt).toBe(`2026-${month}-15`);
      }
    });

    it("should parse multiple dates with correct months", () => {
      const task = makeTask({
        title: "Interview 📅 2026-02-27 🛫 2026-03-01 ➕ 2026-01-15",
      });
      const result = parseTasksFormatItem(task);

      expect(result.dueAt).toBe("2026-02-27");
      expect(result.startAt).toBe("2026-03-01");
      expect(result.createdAt).toBe("2026-01-15");
    });
  });

  describe("priority parsing", () => {
    it("should parse high priority", () => {
      const task = makeTask({ title: "Task 🔺" });
      const result = parseTasksFormatItem(task);

      expect(result.priority).toBe("high");
    });

    it("should parse low priority", () => {
      const task = makeTask({ title: "Task 🔽" });
      const result = parseTasksFormatItem(task);

      expect(result.priority).toBe("low");
    });

    it("should default to medium priority", () => {
      const task = makeTask({ title: "Task without priority" });
      const result = parseTasksFormatItem(task);

      expect(result.priority).toBe("medium");
    });
  });

  describe("title extraction", () => {
    it("should strip dates and priority from title", () => {
      const task = makeTask({
        title: "Interview with Rednote 🔺 📅 2026-02-27 ➕ 2026-02-26",
      });
      const result = parseTasksFormatItem(task);

      expect(result.title).toBe("Interview with Rednote");
      expect(result.dueAt).toBe("2026-02-27");
      expect(result.createdAt).toBe("2026-02-26");
      expect(result.priority).toBe("high");
    });

    it("should preserve inline tags before dates in title", () => {
      const task = makeTask({
        title: "Task #interview 📅 2026-02-27",
      });
      const result = parseTasksFormatItem(task);

      expect(result.title).toContain("#interview");
      expect(result.dueAt).toBe("2026-02-27");
    });
  });

  describe("Obsidian Tasks dependency and lifecycle fields", () => {
    it("reads 🏁, ❌, 🆔 and ⛔", () => {
      const result = parseTasksFormatItem(
        makeTask({
          title: "Review 🆔 rev-1 ⛔ draft_1,outline 🏁 delete ❌ 2026-10-15",
        }),
      );

      expect(result).toMatchObject({
        title: "Review",
        taskId: "rev-1",
        dependsOn: ["draft_1", "outline"],
        onCompletion: "delete",
        cancelledAt: "2026-10-15",
      });
      expect(result.extra?.["isTasksTask"]).toBe("true");
    });

    it("leaves them unset when the line has none", () => {
      const result = parseTasksFormatItem(makeTask({ title: "Buy milk" }));

      expect(result.taskId).toBeUndefined();
      expect(result.dependsOn).toBeUndefined();
      expect(result.onCompletion).toBeUndefined();
      expect(result.cancelledAt).toBeUndefined();
    });
  });

  it("does not change the task it reads", () => {
    const extra = { file: "note.md" };
    const task = makeTask({ title: "Task ⏳ 2026-11-05", extra });

    const result = parseTasksFormatItem(task);

    expect(result.extra).toEqual({
      file: "note.md",
      scheduledAt: "2026-11-05",
      isTasksTask: "true",
    });
    expect(extra).toEqual({ file: "note.md" });
    expect(task.title).toBe("Task ⏳ 2026-11-05");
  });

  describe("recurrence parsing", () => {
    it("should parse recurrence rule", () => {
      const task = makeTask({ title: "Task 🔁 every week" });
      const result = parseTasksFormatItem(task);

      expect(result.recurringInterval).toBe("every week");
    });

    it("marks tasks with a recurrence rule as recurring", () => {
      const result = parseTasksFormatItem(
        makeTask({ title: "Water plants 🔁 every week when done" }),
      );

      expect(result.isRecurring).toBe(true);
      expect(result.recurringInterval).toBe("every week when done");
    });

    it("keeps notes after the rule out of the rule and the title", () => {
      const result = parseTasksFormatItem(
        makeTask({
          title: "Water plants 🔁 every week when done see notes 🏁 keep",
        }),
      );

      expect(result.recurringInterval).toBe("every week when done");
      expect(result.title).toBe("Water plants");
      expect(result.onCompletion).toBe("keep");
    });

    it("marks tasks without a recurrence rule as not recurring", () => {
      const result = parseTasksFormatItem(
        makeTask({ title: "Buy milk 📅 2026-02-27", isRecurring: true }),
      );

      expect(result.isRecurring).toBe(false);
      expect(result.recurringInterval).toBeUndefined();
    });
  });
});
