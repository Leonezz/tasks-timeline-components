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
  it("compares title and dates when there is no source line", () => {
    const task: Task = {
      id: "t",
      title: "A",
      status: "todo",
      priority: "medium",
      tags: [],
      dueAt: "2026-10-16",
    };

    expect(isSameTaskVersion(task, { ...task, priority: "high" })).toBe(true);
    expect(isSameTaskVersion(task, { ...task, title: "B" })).toBe(false);
    expect(isSameTaskVersion(task, { ...task, dueAt: "2026-10-17" })).toBe(
      false,
    );
  });
});
