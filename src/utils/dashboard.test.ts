import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { FilterState, Task } from "../types";
import { buildVaultShapedTasks } from "../stories/fixtures/vault-shaped";
import {
  DASHBOARD_CARDS,
  countDashboardCards,
  deriveDashboardCard,
  filterByDashboardCard,
  type DashboardCard,
} from "./dashboard";
import {
  filterTasks,
  filterTasksExceptStatus,
} from "../hooks/useTaskFiltering";

const makeTask = (overrides: Partial<Task> & { id: string }): Task => ({
  title: overrides.id,
  status: "todo",
  priority: "medium",
  tags: [],
  ...overrides,
});

const EMPTY_FILTERS: FilterState = {
  tags: { include: [], exclude: [] },
  categories: { include: [], exclude: [] },
  priorities: { include: [], exclude: [] },
  statuses: { include: [], exclude: [] },
  enableScript: false,
  script: "",
};

// Clock: 2026-02-22 (local noon), so "2026-02-20" is overdue and
// "2026-02-23" is due tomorrow.
const OVERLAP_TASKS: Task[] = [
  makeTask({ id: "planned-todo", dueAt: "2026-03-10" }),
  makeTask({ id: "unplanned-todo" }),
  makeTask({ id: "doing-no-dates", status: "doing" }),
  makeTask({ id: "doing-overdue", status: "doing", dueAt: "2026-02-20" }),
  makeTask({
    id: "scheduled-overdue",
    startAt: "2026-03-01",
    dueAt: "2026-02-20",
  }),
  makeTask({ id: "scheduled", startAt: "2026-03-01" }),
  makeTask({ id: "due-tomorrow", dueAt: "2026-02-23" }),
  makeTask({ id: "done", status: "done", dueAt: "2026-02-20" }),
  makeTask({ id: "cancelled", status: "cancelled" }),
];

describe("dashboard cards", () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 1, 22, 12));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("puts every open task in exactly one card and skips finished tasks", () => {
    const cards = OVERLAP_TASKS.map((task) => [
      task.id,
      deriveDashboardCard(task),
    ]);

    expect(Object.fromEntries(cards)).toEqual({
      "planned-todo": "todo",
      "unplanned-todo": "unplanned",
      "doing-no-dates": "doing",
      "doing-overdue": "urgent",
      "scheduled-overdue": "urgent",
      scheduled: "doing",
      "due-tomorrow": "urgent",
      done: null,
      cancelled: null,
    });
  });

  it("counts each card as exactly the tasks the card filter shows", () => {
    const counts = countDashboardCards(OVERLAP_TASKS);

    expect(counts).toEqual({ todo: 1, unplanned: 1, urgent: 3, doing: 2 });
    for (const card of DASHBOARD_CARDS) {
      expect(filterByDashboardCard(OVERLAP_TASKS, card)).toHaveLength(
        counts[card],
      );
    }
  });

  it("returns every task when no card is selected", () => {
    expect(filterByDashboardCard(OVERLAP_TASKS, null)).toEqual(OVERLAP_TASKS);
  });

  it("adds up to the number of open tasks", () => {
    const counts = countDashboardCards(OVERLAP_TASKS),
      total = DASHBOARD_CARDS.reduce((sum, card) => sum + counts[card], 0);

    expect(total).toBe(7);
  });

  it("rejects an unknown card instead of showing every task", () => {
    expect(() =>
      filterByDashboardCard(OVERLAP_TASKS, "someday" as DashboardCard),
    ).toThrow(/unknown dashboard card/i);
  });
});

describe("dashboard cards on a vault-shaped dataset", () => {
  const tasks = buildVaultShapedTasks();

  it("matches the list for every card", () => {
    const counts = countDashboardCards(tasks);

    expect(counts).toEqual({ todo: 1, unplanned: 512, urgent: 10, doing: 2 });
    for (const card of DASHBOARD_CARDS) {
      expect(filterByDashboardCard(tasks, card)).toHaveLength(counts[card]);
    }
  });

  it("follows the other filters (tags) while ignoring the status filter", () => {
    const filters: FilterState = {
        ...EMPTY_FILTERS,
        tags: { include: ["work"], exclude: [] },
        statuses: { include: ["done"], exclude: [] },
      },
      base = filterTasksExceptStatus(tasks, filters),
      counts = countDashboardCards(base);

    expect(base.every((t) => t.tags.some((tag) => tag.name === "work"))).toBe(
      true,
    );
    expect(base.length).toBeLessThan(tasks.length);
    expect(counts.unplanned).toBeLessThan(512);
    for (const card of DASHBOARD_CARDS) {
      expect(filterByDashboardCard(base, card)).toHaveLength(counts[card]);
    }
    // The status filter itself is still applied by filterTasks
    expect(filterTasks(tasks, filters).every((t) => t.status === "done")).toBe(
      true,
    );
  });
});
