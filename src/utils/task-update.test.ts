import { describe, expect, it, vi } from "vitest";
import type { Task } from "../types";
import {
  isSameTaskVersion,
  persistTaskUpdate,
  STALE_EDITOR_ERROR,
} from "./task-update";

const lineTask = (title: string, line: number): Task => ({
  id: `note.md:${line}`,
  title,
  status: "todo",
  priority: "medium",
  tags: [],
  dueAt: "2026-10-16",
  extra: { rawText: `- [ ] ${title} 📅 2026-10-16` },
});

describe("persistTaskUpdate from an editor", () => {
  it("refuses a save when another task now has that id", async () => {
    const opened = lineTask("Pay rent", 3);
    // The host reloaded: line 3 now holds a different task
    const tasks = [lineTask("Call the bank", 3)];
    const onTaskUpdated = vi.fn();

    await expect(
      persistTaskUpdate(
        tasks,
        { ...opened, title: "Pay rent today" },
        onTaskUpdated,
        opened,
      ),
    ).rejects.toThrow(STALE_EDITOR_ERROR);
    expect(onTaskUpdated).not.toHaveBeenCalled();
  });

  it("refuses a save when the task was edited elsewhere", async () => {
    const opened = lineTask("Pay rent", 3);
    const editedInNote = {
      ...opened,
      dueAt: "2026-10-20",
      extra: { rawText: "- [ ] Pay rent 📅 2026-10-20" },
    };

    await expect(
      persistTaskUpdate([editedInNote], opened, vi.fn(), opened),
    ).rejects.toThrow(STALE_EDITOR_ERROR);
  });

  it("refuses a save when the task is gone", async () => {
    const opened = lineTask("Pay rent", 3);

    await expect(
      persistTaskUpdate([], opened, vi.fn(), opened),
    ).rejects.toThrow("no longer exists");
  });

  it("saves and passes the opened version as previous", async () => {
    const opened = lineTask("Pay rent", 3);
    const onTaskUpdated = vi.fn();
    const edited = { ...opened, title: "Pay rent today" };

    await persistTaskUpdate([{ ...opened }], edited, onTaskUpdated, opened);

    expect(onTaskUpdated).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Pay rent today" }),
      opened,
    );
  });
});

describe("isSameTaskVersion", () => {
  const task: Task = {
    id: "t",
    title: "A",
    description: "Notes",
    status: "todo",
    priority: "medium",
    category: "Home",
    tags: [{ id: "tag-1", name: "bills", color: "red" }],
    dueAt: "2026-10-16",
    isRecurring: true,
    recurringInterval: "FREQ=WEEKLY",
    extra: { scheduledAt: "2026-10-15", source: "json" },
  };

  it("is the same version when nothing stored changed", () => {
    expect(isSameTaskVersion(task, structuredClone(task))).toBe(true);
  });

  it.each<[string, Partial<Task>]>([
    ["the title", { title: "B" }],
    ["the description", { description: "Other notes" }],
    ["the status", { status: "doing" }],
    ["the priority", { priority: "high" }],
    ["the category", { category: "Work" }],
    ["the tags", { tags: [{ id: "tag-1", name: "rent" }] }],
    [
      "a tag's color",
      { tags: [{ id: "tag-1", name: "bills", color: "blue" }] },
    ],
    ["the recurrence rule", { recurringInterval: "FREQ=DAILY" }],
    ["the recurrence switch", { isRecurring: false }],
    ["the due date", { dueAt: "2026-10-17" }],
    ["the start date", { startAt: "2026-10-01" }],
    ["the created date", { createdAt: "2026-10-01" }],
    ["the completion date", { completedAt: "2026-10-16" }],
    ["the cancellation date", { cancelledAt: "2026-10-16" }],
    [
      "the scheduled date",
      { extra: { ...task.extra, scheduledAt: "2026-10-14" } },
    ],
    ["another extra field", { extra: { ...task.extra, source: "api" } }],
  ])("sees a change to %s when there is no source line", (_field, change) => {
    expect(isSameTaskVersion(task, { ...task, ...change })).toBe(false);
  });

  it("ignores what doesn't change the stored task", () => {
    expect(
      isSameTaskVersion(task, {
        ...task,
        // Tag ids may be generated again when the host reloads
        tags: [{ id: "tag-9", name: "bills", color: "red" }],
        // A display status is stored as "todo"
        status: "due",
        isRecurring: undefined,
        extra: { ...task.extra, unset: undefined },
      }),
    ).toBe(true);
  });

  it("compares only the source line when both have one", () => {
    const line = { ...task, extra: { rawText: "- [ ] A 📅 2026-10-16" } };

    expect(isSameTaskVersion(line, { ...line, priority: "high" })).toBe(true);
    expect(
      isSameTaskVersion(line, {
        ...line,
        extra: { rawText: "- [ ] A ⏫ 📅 2026-10-16" },
      }),
    ).toBe(false);
  });
});

describe("persistTaskUpdate without source lines", () => {
  it("refuses an editor save after the agent changed the priority", async () => {
    const opened: Task = {
      id: "t",
      title: "Pay rent",
      status: "todo",
      priority: "medium",
      tags: [],
    };
    const onTaskUpdated = vi.fn();

    await expect(
      persistTaskUpdate(
        [{ ...opened, priority: "high" }],
        { ...opened, title: "Pay rent today" },
        onTaskUpdated,
        opened,
      ),
    ).rejects.toThrow(STALE_EDITOR_ERROR);
    expect(onTaskUpdated).not.toHaveBeenCalled();
  });
});
