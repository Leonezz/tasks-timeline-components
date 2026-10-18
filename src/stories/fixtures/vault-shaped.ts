import type { Priority, Task } from "../../types";
import { getDaysFromNowISO } from "../../utils/date-helpers";

/**
 * Deterministic dataset shaped like a real Obsidian vault (~520 tasks, almost
 * all of them without a due date).
 *
 * `undatedHaveCreatedAt`:
 * - false (default): 504 tasks carry NO date at all, so they land in
 *   "Backlog / Undated"; 8 unplanned tasks carry only a ➕ created date 3-4
 *   months ago and land in day sections.
 * - true: 505 tasks carry a createdAt over the last 6 months.
 *   groupTasksByYearAndDate falls back to createdAt, so they are all grouped
 *   into day sections (~170 of them) and the backlog is empty.
 */
export interface VaultShapedOptions {
  seed?: number;
  undatedHaveCreatedAt?: boolean;
}

const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const PRIORITIES: Priority[] = ["low", "medium", "high"];
const CATEGORIES = ["Inbox.md", "Projects/Work.md", "Areas/Home.md"];
const TAGS = ["work", "home", "read", "idea", "errand", "study", "health"];

export const buildVaultShapedTasks = (
  options: VaultShapedOptions = {},
): Task[] => {
  const { seed = 20261018, undatedHaveCreatedAt = false } = options,
    rand = mulberry32(seed),
    pick = <T>(items: readonly T[]): T =>
      items[Math.floor(rand() * items.length)],
    tagsFor = (n: number) => {
      const count = 1 + Math.floor(rand() * 3),
        names = Array.from(
          new Set(Array.from({ length: count }, () => pick(TAGS))),
        );
      return names.map((name, i) => ({ id: `t${n}-${i}`, name }));
    },
    base = (n: number, title: string): Task => ({
      id: `u${n}`,
      title,
      status: "todo",
      priority: pick(PRIORITIES),
      category: pick(CATEGORIES),
      tags: tagsFor(n),
    }),
    tasks: Task[] = [];

  let n = 0;
  // Unplanned bulk: undated (backlog) or createdAt-only
  const bulk = undatedHaveCreatedAt ? 505 : 504;
  for (let i = 0; i < bulk; i++) {
    const t = base(n++, `Someday item ${i + 1}`);
    tasks.push(
      undatedHaveCreatedAt
        ? { ...t, createdAt: getDaysFromNowISO(-Math.floor(rand() * 180)) }
        : t,
    );
  }
  if (!undatedHaveCreatedAt) {
    // 8 unplanned with only a created date, 3-4 months ago
    const createdOffsets = [-96, -96, -99, -117, -117, -117, -117, -117];
    createdOffsets.forEach((offset, i) => {
      tasks.push({
        ...base(n++, `Created-only item ${i + 1}`),
        createdAt: getDaysFromNowISO(offset),
      });
    });
  }
  // 10 overdue
  for (let i = 0; i < 10; i++) {
    tasks.push({
      ...base(n++, `Overdue item ${i + 1}`),
      createdAt: getDaysFromNowISO(-120),
      dueAt: getDaysFromNowISO(-(3 + i * 4)),
    });
  }
  // 2 doing (started in the past)
  for (let i = 0; i < 2; i++) {
    tasks.push({
      ...base(n++, `Doing item ${i + 1}`),
      status: "doing",
      startAt: getDaysFromNowISO(-(2 + i)),
    });
  }
  // 1 todo with a future due date
  tasks.push({
    ...base(n++, "Future due item"),
    dueAt: getDaysFromNowISO(12),
  });
  // 3 done
  for (let i = 0; i < 3; i++) {
    tasks.push({
      ...base(n++, `Done item ${i + 1}`),
      status: "done",
      createdAt: getDaysFromNowISO(-40),
      completedAt: getDaysFromNowISO(-(5 + i)),
    });
  }
  return tasks;
};
