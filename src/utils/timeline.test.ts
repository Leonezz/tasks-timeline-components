import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { Task } from "../types";
import { groupTasksByYearAndDate, summarizeDayGroups } from "./task";
import { countActiveDays, partitionTimeline } from "./timeline";

const makeTask = (overrides: Partial<Task> & { id: string }): Task => ({
  title: overrides.id,
  status: "todo",
  priority: "medium",
  tags: [],
  ...overrides,
});

const TODAY = "2026-07-14";

describe("timeline partition", () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 14, 12));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("keeps today's tasks out of the year header totals", () => {
    const tasks = [
        makeTask({ id: "due-today-1", dueAt: TODAY }),
        makeTask({ id: "due-today-2", dueAt: TODAY }),
        makeTask({ id: "older", createdAt: "2026-07-11" }),
        makeTask({ id: "undated" }),
      ],
      partition = partitionTimeline(tasks, {
        groupingStrategy: ["dueAt"],
        showCompleted: true,
        today: TODAY,
      });

    expect(partition.todayGroup.tasks.map((t) => t.id)).toEqual([
      "due-today-1",
      "due-today-2",
    ]);
    expect(partition.yearGroups).toHaveLength(1);
    expect(partition.yearGroups[0]).toMatchObject({
      year: 2026,
      totalTasks: 1,
      completedTasks: 0,
    });
    expect(partition.yearGroups[0].dayGroups.map((d) => d.date)).toEqual([
      "2026-07-11",
    ]);
    expect(partition.backlogTasks.map((t) => t.id)).toEqual(["undated"]);
  });

  it("drops a year whose only day is today", () => {
    const partition = partitionTimeline(
      [makeTask({ id: "due-today", dueAt: TODAY })],
      { groupingStrategy: ["dueAt"], showCompleted: true, today: TODAY },
    );

    expect(partition.yearGroups).toEqual([]);
  });

  it("hides finished tasks when showCompleted is off", () => {
    const partition = partitionTimeline(
      [
        makeTask({ id: "open", dueAt: "2026-07-01" }),
        makeTask({ id: "done", status: "done", dueAt: "2026-07-01" }),
        makeTask({ id: "cancelled-undated", status: "cancelled" }),
      ],
      { groupingStrategy: ["dueAt"], showCompleted: false, today: TODAY },
    );

    expect(partition.yearGroups[0].totalTasks).toBe(1);
    expect(partition.backlogTasks).toEqual([]);
  });

  it("counts a task shown on two days once in the year totals", () => {
    const both = makeTask({
        id: "both",
        dueAt: "2026-07-20",
        startAt: "2026-07-10",
      }),
      groups = groupTasksByYearAndDate([both], ["dueAt", "startAt"]);

    expect(groups[0].dayGroups).toHaveLength(2);
    expect(groups[0]).toMatchObject({ totalTasks: 1, completedTasks: 0 });
  });

  it("summarizes day groups by task identity", () => {
    const shared = makeTask({ id: "shared", status: "done" }),
      other = makeTask({ id: "other" });

    expect(
      summarizeDayGroups([
        { date: "2026-07-01", tasks: [shared, other] },
        { date: "2026-07-02", tasks: [shared] },
      ]),
    ).toEqual({ totalTasks: 2, completedTasks: 1 });
  });

  it("counts only days with unfinished tasks as active", () => {
    expect(
      countActiveDays([
        { date: "2026-07-01", tasks: [makeTask({ id: "a" })] },
        {
          date: "2026-07-02",
          tasks: [makeTask({ id: "b", status: "done" })],
        },
        {
          date: "2026-07-03",
          tasks: [
            makeTask({ id: "c", status: "cancelled" }),
            makeTask({ id: "d", status: "doing" }),
          ],
        },
      ]),
    ).toBe(2);
  });
});
