import { describe, it, expect } from "vitest";
import type { FilterState, SortState, Task } from "../types";
import {
  deriveFilterOptions,
  filterTasks,
  sortTasks,
} from "./useTaskFiltering";

// -- Test fixtures --

const EMPTY_FILTER: FilterState = {
  tags: { include: [], exclude: [] },
  categories: { include: [], exclude: [] },
  priorities: { include: [], exclude: [] },
  statuses: { include: [], exclude: [] },
  enableScript: false,
  script: "",
};

const DEFAULT_SORT: SortState = {
  field: "createdAt",
  direction: "asc",
  script: "",
};

function makeTask(overrides: Partial<Task> & { id: string }): Task {
  return {
    title: overrides.id,
    status: "todo",
    priority: "medium",
    tags: [],
    ...overrides,
  };
}

const TASKS: Task[] = [
  makeTask({
    id: "t1",
    title: "Buy groceries",
    status: "todo",
    priority: "high",
    category: "personal",
    tags: [
      { id: "tag1", name: "shopping" },
      { id: "tag2", name: "errands" },
    ],
    createdAt: "2026-01-01",
    dueAt: "2027-02-01",
  }),
  makeTask({
    id: "t2",
    title: "Write report",
    status: "doing",
    priority: "medium",
    category: "work",
    tags: [{ id: "tag3", name: "writing" }],
    createdAt: "2026-01-05",
    dueAt: "2027-02-10",
  }),
  makeTask({
    id: "t3",
    title: "Fix bug",
    status: "todo",
    priority: "high",
    category: "work",
    tags: [{ id: "tag4", name: "coding" }],
    createdAt: "2026-01-10",
    dueAt: "2026-01-15",
  }),
  makeTask({
    id: "t4",
    title: "Plan vacation",
    status: "todo",
    priority: "low",
    category: "personal",
    tags: [{ id: "tag5", name: "travel" }],
    createdAt: "2026-01-15",
    startAt: "2027-01-15",
  }),
  makeTask({
    id: "t5",
    title: "Read book",
    status: "done",
    priority: "low",
    tags: [],
    createdAt: "2026-01-20",
  }),
];

// -- deriveFilterOptions --

describe("deriveFilterOptions", () => {
  it("extracts unique tags from all tasks", () => {
    const { uniqueTags } = deriveFilterOptions(TASKS);
    expect(uniqueTags).toEqual(
      expect.arrayContaining([
        "shopping",
        "errands",
        "writing",
        "coding",
        "travel",
      ]),
    );
    expect(uniqueTags).toHaveLength(5);
  });

  it("extracts unique categories from all tasks", () => {
    const { uniqueCategories } = deriveFilterOptions(TASKS);
    expect(uniqueCategories).toEqual(
      expect.arrayContaining(["personal", "work"]),
    );
    expect(uniqueCategories).toHaveLength(2);
  });

  it("returns empty arrays for tasks with no tags or categories", () => {
    const tasks = [makeTask({ id: "x1" })];
    const { uniqueTags, uniqueCategories } = deriveFilterOptions(tasks);
    expect(uniqueTags).toEqual([]);
    expect(uniqueCategories).toEqual([]);
  });

  it("returns empty arrays for empty task list", () => {
    const { uniqueTags, uniqueCategories } = deriveFilterOptions([]);
    expect(uniqueTags).toEqual([]);
    expect(uniqueCategories).toEqual([]);
  });
});

// -- filterTasks: tags --

describe("filterTasks — tags", () => {
  it("returns all tasks when no filters are set", () => {
    const result = filterTasks(TASKS, EMPTY_FILTER);
    expect(result).toHaveLength(5);
  });

  it("includes only tasks matching included tags", () => {
    const filters: FilterState = {
      ...EMPTY_FILTER,
      tags: { include: ["shopping"], exclude: [] },
    };
    const result = filterTasks(TASKS, filters);
    expect(result.map((t) => t.id)).toEqual(["t1"]);
  });

  it("includes tasks matching any included tag (OR logic)", () => {
    const filters: FilterState = {
      ...EMPTY_FILTER,
      tags: { include: ["shopping", "coding"], exclude: [] },
    };
    const result = filterTasks(TASKS, filters);
    expect(result.map((t) => t.id)).toEqual(["t1", "t3"]);
  });

  it("excludes tasks matching excluded tags", () => {
    const filters: FilterState = {
      ...EMPTY_FILTER,
      tags: { include: [], exclude: ["shopping"] },
    };
    const result = filterTasks(TASKS, filters);
    expect(result.map((t) => t.id)).toEqual(["t2", "t3", "t4", "t5"]);
  });

  it("applies include then exclude (exclude wins on overlap)", () => {
    const filters: FilterState = {
      ...EMPTY_FILTER,
      tags: { include: ["shopping", "coding"], exclude: ["shopping"] },
    };
    const result = filterTasks(TASKS, filters);
    // t1 matches include (shopping) but also matches exclude (shopping) → removed
    expect(result.map((t) => t.id)).toEqual(["t3"]);
  });

  it("keeps tasks with no tags when only exclude is set", () => {
    const filters: FilterState = {
      ...EMPTY_FILTER,
      tags: { include: [], exclude: ["shopping"] },
    };
    const result = filterTasks(TASKS, filters);
    // t5 has no tags, should be kept
    expect(result.map((t) => t.id)).toContain("t5");
  });
});

// -- filterTasks: categories --

describe("filterTasks — categories", () => {
  it("includes only tasks matching included categories", () => {
    const filters: FilterState = {
      ...EMPTY_FILTER,
      categories: { include: ["work"], exclude: [] },
    };
    const result = filterTasks(TASKS, filters);
    expect(result.map((t) => t.id)).toEqual(["t2", "t3"]);
  });

  it("excludes tasks matching excluded categories", () => {
    const filters: FilterState = {
      ...EMPTY_FILTER,
      categories: { include: [], exclude: ["work"] },
    };
    const result = filterTasks(TASKS, filters);
    // t1 (personal), t4 (personal), t5 (no category — kept)
    expect(result.map((t) => t.id)).toEqual(["t1", "t4", "t5"]);
  });

  it("keeps tasks with no category when include is set (filters them out)", () => {
    const filters: FilterState = {
      ...EMPTY_FILTER,
      categories: { include: ["personal"], exclude: [] },
    };
    const result = filterTasks(TASKS, filters);
    // t5 has no category, should NOT be included
    expect(result.map((t) => t.id)).toEqual(["t1", "t4"]);
  });

  it("keeps tasks with no category when exclude is set", () => {
    const filters: FilterState = {
      ...EMPTY_FILTER,
      categories: { include: [], exclude: ["personal"] },
    };
    const result = filterTasks(TASKS, filters);
    // t5 has no category → !t.category is true → kept
    expect(result.map((t) => t.id)).toContain("t5");
  });
});

// -- filterTasks: priorities --

describe("filterTasks — priorities", () => {
  it("includes only tasks matching included priorities", () => {
    const filters: FilterState = {
      ...EMPTY_FILTER,
      priorities: { include: ["high"], exclude: [] },
    };
    const result = filterTasks(TASKS, filters);
    expect(result.map((t) => t.id)).toEqual(["t1", "t3"]);
  });

  it("excludes tasks matching excluded priorities", () => {
    const filters: FilterState = {
      ...EMPTY_FILTER,
      priorities: { include: [], exclude: ["low"] },
    };
    const result = filterTasks(TASKS, filters);
    expect(result.map((t) => t.id)).toEqual(["t1", "t2", "t3"]);
  });

  it("combines include and exclude", () => {
    const filters: FilterState = {
      ...EMPTY_FILTER,
      priorities: { include: ["high", "medium"], exclude: ["medium"] },
    };
    const result = filterTasks(TASKS, filters);
    expect(result.map((t) => t.id)).toEqual(["t1", "t3"]);
  });
});

// -- filterTasks: statuses --

describe("filterTasks — statuses", () => {
  it("includes only tasks matching included statuses", () => {
    const filters: FilterState = {
      ...EMPTY_FILTER,
      statuses: { include: ["todo", "doing"], exclude: [] },
    };
    const result = filterTasks(TASKS, filters);
    expect(result.map((t) => t.id)).toEqual(["t1", "t2", "t3", "t4"]);
  });

  it("excludes tasks matching excluded statuses", () => {
    const filters: FilterState = {
      ...EMPTY_FILTER,
      statuses: { include: [], exclude: ["done", "overdue"] },
    };
    const result = filterTasks(TASKS, filters);
    expect(result.map((t) => t.id)).toEqual(["t1", "t2", "t4"]);
  });

  it("includes tasks matching derived display statuses", () => {
    const filters: FilterState = {
      ...EMPTY_FILTER,
      statuses: { include: ["overdue"], exclude: [] },
    };
    const result = filterTasks(TASKS, filters);
    expect(result.map((t) => t.id)).toEqual(["t3"]);
  });
});

// -- filterTasks: combined dimensions --

describe("filterTasks — combined dimensions", () => {
  it("applies filters across multiple dimensions (AND logic)", () => {
    const filters: FilterState = {
      ...EMPTY_FILTER,
      categories: { include: ["work"], exclude: [] },
      priorities: { include: ["high"], exclude: [] },
    };
    const result = filterTasks(TASKS, filters);
    // Must be work AND high → only t3
    expect(result.map((t) => t.id)).toEqual(["t3"]);
  });

  it("applies tag include with status exclude", () => {
    const filters: FilterState = {
      ...EMPTY_FILTER,
      tags: { include: ["shopping", "coding"], exclude: [] },
      statuses: { include: [], exclude: ["overdue"] },
    };
    const result = filterTasks(TASKS, filters);
    // t1 (shopping, todo) ✓, t3 (coding, overdue) excluded
    expect(result.map((t) => t.id)).toEqual(["t1"]);
  });
});

// -- filterTasks: script filter --

describe("filterTasks — script filter", () => {
  it("applies script filter when enabled", () => {
    const filters: FilterState = {
      ...EMPTY_FILTER,
      enableScript: true,
      script: "task.priority == 'high'",
    };
    const result = filterTasks(TASKS, filters);
    expect(result.map((t) => t.id)).toEqual(["t1", "t3"]);
  });

  it("does not apply script when disabled", () => {
    const filters: FilterState = {
      ...EMPTY_FILTER,
      enableScript: false,
      script: "task.priority == 'high'",
    };
    const result = filterTasks(TASKS, filters);
    expect(result).toHaveLength(5);
  });

  it("ignores empty script", () => {
    const filters: FilterState = {
      ...EMPTY_FILTER,
      enableScript: true,
      script: "   ",
    };
    const result = filterTasks(TASKS, filters);
    expect(result).toHaveLength(5);
  });

  it("handles invalid script gracefully (keeps all tasks)", () => {
    const filters: FilterState = {
      ...EMPTY_FILTER,
      enableScript: true,
      script: "this is not valid!!!",
    };
    const result = filterTasks(TASKS, filters);
    // Script parsing fails → original result preserved
    expect(result).toHaveLength(5);
  });

  it("supports boolean operators and parentheses", () => {
    const filters: FilterState = {
      ...EMPTY_FILTER,
      enableScript: true,
      script: "task.priority == 'high' && (task.category == 'work')",
    };
    const result = filterTasks(TASKS, filters);
    expect(result.map((t) => t.id)).toEqual(["t3"]);
  });

  it("rejects function calls", () => {
    const filters: FilterState = {
      ...EMPTY_FILTER,
      enableScript: true,
      script: "task.title.includes('bug')",
    };
    const result = filterTasks(TASKS, filters);
    expect(result).toHaveLength(5);
  });

  it("rejects prototype-path access", () => {
    const filters: FilterState = {
      ...EMPTY_FILTER,
      enableScript: true,
      script: "task.__proto__ == null",
    };
    const result = filterTasks(TASKS, filters);
    expect(result).toHaveLength(5);
  });
});

// -- sortTasks --

describe("sortTasks", () => {
  it("sorts by createdAt ascending", () => {
    const result = sortTasks(TASKS, {
      field: "createdAt",
      direction: "asc",
      script: "",
    });
    expect(result.map((t) => t.id)).toEqual(["t1", "t2", "t3", "t4", "t5"]);
  });

  it("sorts by createdAt descending", () => {
    const result = sortTasks(TASKS, {
      field: "createdAt",
      direction: "desc",
      script: "",
    });
    expect(result.map((t) => t.id)).toEqual(["t5", "t4", "t3", "t2", "t1"]);
  });

  it("sorts by title ascending", () => {
    const result = sortTasks(TASKS, {
      field: "title",
      direction: "asc",
      script: "",
    });
    expect(result.map((t) => t.title)).toEqual([
      "Buy groceries",
      "Fix bug",
      "Plan vacation",
      "Read book",
      "Write report",
    ]);
  });

  it("sorts by priority ascending (low → high)", () => {
    const result = sortTasks(TASKS, {
      field: "priority",
      direction: "asc",
      script: "",
    });
    // low=1, medium=2, high=3
    const priorities = result.map((t) => t.priority);
    expect(priorities).toEqual(["low", "low", "medium", "high", "high"]);
  });

  it("sorts by priority descending (high → low)", () => {
    const result = sortTasks(TASKS, {
      field: "priority",
      direction: "desc",
      script: "",
    });
    const priorities = result.map((t) => t.priority);
    expect(priorities).toEqual(["high", "high", "medium", "low", "low"]);
  });

  it("sorts by dueAt with missing values treated as empty string", () => {
    const result = sortTasks(TASKS, {
      field: "dueAt",
      direction: "asc",
      script: "",
    });
    // t4, t5 have no dueAt → "" sorts before date strings
    const first2 = result.slice(0, 2).map((t) => t.id);
    expect(first2).toEqual(expect.arrayContaining(["t4", "t5"]));
  });

  it("does not mutate the input array", () => {
    const original = [...TASKS];
    sortTasks(TASKS, DEFAULT_SORT);
    expect(TASKS.map((t) => t.id)).toEqual(original.map((t) => t.id));
  });

  it("handles custom sort script", () => {
    // Sort by priority numeric value using the safe expression syntax.
    const result = sortTasks(TASKS, {
      field: "custom",
      direction: "asc",
      script: "(a.priority == 'high') - (b.priority == 'high')",
    });
    // Tasks with priority != 'high' come first (0), 'high' tasks come last (1)
    const highIdx = result.findIndex((t) => t.priority === "high");
    const nonHighAfter = result
      .slice(highIdx)
      .some((t) => t.priority !== "high");
    // Once we hit a high-priority task, no non-high should follow
    // (unless there are ties, which is fine — just check script was applied)
    expect(result).toHaveLength(5);
    // Verify script actually ran: high tasks should be at the end
    expect(result[result.length - 1].priority).toBe("high");
    expect(nonHighAfter).toBe(false);
  });

  it("handles empty custom script (preserves order)", () => {
    const result = sortTasks(TASKS, {
      field: "custom",
      direction: "asc",
      script: "",
    });
    expect(result.map((t) => t.id)).toEqual(TASKS.map((t) => t.id));
  });

  it("handles invalid custom script gracefully", () => {
    const result = sortTasks(TASKS, {
      field: "custom",
      direction: "asc",
      script: "not valid !!!",
    });
    expect(result).toHaveLength(5);
  });
});
