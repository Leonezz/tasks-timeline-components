import type { Priority, Task } from "../../types";
import { getDaysFromNowISO } from "../../utils/date-helpers";

/**
 * Deterministic large vault with every kind of task: about a third undated
 * (backlog), a third created-only over two years, and the rest due, doing,
 * scheduled, done or cancelled. With 2000 tasks the timeline has about 520
 * day sections and the backlog about 700 tasks. Some titles are long
 * Markdown that wraps on narrow panes.
 */
export interface MixedVaultOptions {
  count?: number;
  seed?: number;
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
const TAGS = ["work", "home", "read", "idea", "errand", "study", "health"];
const CATEGORIES = [
  "Inbox.md",
  "Projects/Work.md",
  "Areas/Home.md",
  "Daily/2026.md",
];

export const buildMixedVault = (options: MixedVaultOptions = {}): Task[] => {
  const { count = 2000, seed = 777 } = options,
    rand = mulberry32(seed),
    pick = <T>(items: readonly T[]): T =>
      items[Math.floor(rand() * items.length)],
    daysAgo = (max: number) => getDaysFromNowISO(-Math.floor(rand() * max));

  return Array.from({ length: count }, (_, i): Task => {
    const base: Task = {
        id: `m${i}`,
        title:
          rand() < 0.15
            ? `Long **markdown** title number ${i} with [[link]] and \`code\` that wraps on narrow panes and keeps going for a while`
            : `Mixed task ${i}`,
        status: "todo",
        priority: pick(PRIORITIES),
        category: pick(CATEGORIES),
        tags: Array.from(new Set([pick(TAGS), pick(TAGS)])).map((name, k) => ({
          id: `mt${i}-${k}`,
          name,
        })),
      },
      roll = rand();
    if (roll < 0.35) {
      return base;
    }
    if (roll < 0.65) {
      return { ...base, createdAt: daysAgo(720) };
    }
    if (roll < 0.82) {
      return {
        ...base,
        createdAt: getDaysFromNowISO(-200),
        dueAt: getDaysFromNowISO(Math.floor(rand() * 180) - 90),
      };
    }
    if (roll < 0.88) {
      return { ...base, status: "doing", startAt: daysAgo(20) };
    }
    if (roll < 0.92) {
      return {
        ...base,
        startAt: getDaysFromNowISO(Math.floor(rand() * 30) + 1),
      };
    }
    return {
      ...base,
      status: rand() < 0.8 ? "done" : "cancelled",
      createdAt: getDaysFromNowISO(-100),
      completedAt: daysAgo(90),
    };
  });
};
