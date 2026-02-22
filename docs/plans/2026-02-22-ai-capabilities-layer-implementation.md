# AI Capabilities Layer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Extract atomic AI capabilities (9 tools, 6 resources, 3 prompts) into a framework-agnostic layer with a unified registry, then refactor `useAIAgent` to consume it.

**Architecture:** Unified registry pattern — `createCapabilities(ctx: CapabilityContext)` returns a `Capabilities` object with tools, resources, prompts, and convenience methods. The built-in `useAIAgent` and external consumers (host app plugins) share the same capability definitions and executors.

**Tech Stack:** TypeScript, Vitest (unit tests for pure functions), Luxon (dates), existing `Task`/`AppSettings` types.

**Design doc:** `docs/plans/2026-02-22-ai-capabilities-layer-design.md`

---

## Task 1: Foundation — Capability Types

**Files:**
- Create: `src/capabilities/types.ts`
- Create: `src/capabilities/__tests__/types.test.ts`

**Step 1: Write the type test**

```typescript
// src/capabilities/__tests__/types.test.ts
import { describe, it, expect, vi } from "vitest";
import type {
  CapabilityContext,
  ToolSpec,
  ResourceSpec,
  PromptSpec,
  PromptMessage,
  ResourceContent,
  Capabilities,
} from "../types";

describe("Capability types", () => {
  it("CapabilityContext satisfies the interface", () => {
    const ctx: CapabilityContext = {
      getTasks: vi.fn().mockResolvedValue([]),
      getTask: vi.fn().mockResolvedValue(null),
      addTask: vi.fn().mockResolvedValue(undefined),
      updateTask: vi.fn().mockResolvedValue(undefined),
      deleteTask: vi.fn().mockResolvedValue(undefined),
    };
    expect(ctx.getTasks).toBeDefined();
    expect(ctx.getTask).toBeDefined();
    expect(ctx.addTask).toBeDefined();
    expect(ctx.updateTask).toBeDefined();
    expect(ctx.deleteTask).toBeDefined();
  });

  it("ToolSpec has required fields", () => {
    const tool: ToolSpec = {
      name: "test_tool",
      description: "A test tool",
      schema: { type: "object", properties: {} },
      execute: vi.fn().mockResolvedValue({ name: "test_tool", result: {} }),
    };
    expect(tool.name).toBe("test_tool");
    expect(tool.execute).toBeDefined();
  });

  it("ResourceSpec has required fields", () => {
    const resource: ResourceSpec = {
      name: "test",
      uri: "test://all",
      description: "Test resource",
      mimeType: "application/json",
      read: vi.fn().mockResolvedValue({ contents: [] }),
    };
    expect(resource.uri).toBe("test://all");
  });

  it("PromptSpec has required fields", () => {
    const prompt: PromptSpec = {
      name: "test_prompt",
      description: "A test prompt",
      render: () => [{ role: "user", content: "test" }],
    };
    expect(prompt.render()).toHaveLength(1);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/capabilities/__tests__/types.test.ts`
Expected: FAIL — module `../types` not found.

**Step 3: Write the types**

```typescript
// src/capabilities/types.ts
import type { Task, AppSettings, TaskStatus, Priority, Tag } from "../types";
import type { ToolResult, JSONSchemaProperty } from "../providers/types";

/**
 * Context object injected by the consumer to provide data access
 * and mutation callbacks. The host app (or useAIAgent hook) provides
 * concrete implementations.
 */
export interface CapabilityContext {
  // Read
  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | null>;

  // Write
  addTask(task: Task): Promise<void>;
  updateTask(task: Task): Promise<void>;
  deleteTask(id: string): Promise<void>;

  // Optional extensions
  getSettings?(): AppSettings | null;
  notify?(type: "success" | "error" | "info", message: string): void;
}

/**
 * A tool capability — JSON Schema definition + bound executor.
 */
export interface ToolSpec {
  name: string;
  description: string;
  schema: {
    type: "object";
    properties: Record<string, JSONSchemaProperty>;
    required?: string[];
  };
  execute(args: Record<string, unknown>): Promise<ToolResult>;
}

/**
 * Content returned by a resource read.
 */
export interface ResourceContent {
  contents: Array<{
    uri: string;
    text: string;
    mimeType?: string;
  }>;
}

/**
 * A resource capability — read-only data endpoint.
 */
export interface ResourceSpec {
  name: string;
  uri: string;
  uriTemplate?: string;
  description: string;
  mimeType: string;
  read(params?: Record<string, string>): Promise<ResourceContent>;
}

/**
 * A message in a prompt template.
 */
export interface PromptMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * An argument for a prompt template.
 */
export interface PromptArgument {
  name: string;
  description: string;
  required?: boolean;
}

/**
 * A prompt capability — user-controlled template.
 */
export interface PromptSpec {
  name: string;
  description: string;
  arguments?: PromptArgument[];
  render(args?: Record<string, string>): PromptMessage[];
}

/**
 * The unified capabilities registry returned by createCapabilities().
 */
export interface Capabilities {
  tools: ToolSpec[];
  resources: ResourceSpec[];
  prompts: PromptSpec[];

  getTool(name: string): ToolSpec | undefined;
  getResource(name: string): ResourceSpec | undefined;
  getPrompt(name: string): PromptSpec | undefined;

  getSystemPrompt(developerPrompt?: string, userPrompt?: string): string;
  executeTool(name: string, args: Record<string, unknown>): Promise<ToolResult>;
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/capabilities/__tests__/types.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/capabilities/types.ts src/capabilities/__tests__/types.test.ts
git commit -m "feat(capabilities): add core capability types"
```

---

## Task 2: create_task Tool

**Files:**
- Create: `src/capabilities/tools/create-task.ts`
- Create: `src/capabilities/__tests__/tools/create-task.test.ts`

**Step 1: Write the failing test**

```typescript
// src/capabilities/__tests__/tools/create-task.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCreateTaskTool } from "../../tools/create-task";
import type { CapabilityContext } from "../../types";
import type { Task } from "../../../types";

function makeContext(overrides?: Partial<CapabilityContext>): CapabilityContext {
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

describe("create_task tool", () => {
  it("has correct name and schema", () => {
    const tool = createCreateTaskTool(makeContext());
    expect(tool.name).toBe("create_task");
    expect(tool.schema.required).toContain("title");
    expect(tool.schema.properties.title).toBeDefined();
    expect(tool.schema.properties.recurrence).toBeDefined();
  });

  it("creates a task with just a title", async () => {
    const ctx = makeContext();
    const tool = createCreateTaskTool(ctx);
    const result = await tool.execute({ title: "Buy groceries" });

    expect(ctx.addTask).toHaveBeenCalledOnce();
    const addedTask = (ctx.addTask as ReturnType<typeof vi.fn>).mock.calls[0][0] as Task;
    expect(addedTask.title).toBe("Buy groceries");
    expect(addedTask.id).toMatch(/^ai-/);
    expect(addedTask.priority).toBe("medium"); // default
    expect(addedTask.tags).toEqual([]);
    expect(result.result).toMatchObject({ success: true });
  });

  it("creates a task with all optional fields", async () => {
    const ctx = makeContext();
    const tool = createCreateTaskTool(ctx);
    await tool.execute({
      title: "Write report",
      description: "Quarterly report",
      priority: "high",
      dueAt: "2026-03-01",
      startAt: "2026-02-25",
      category: "work",
      tags: ["urgent", "report"],
      recurrence: "FREQ=WEEKLY;BYDAY=MO",
    });

    const addedTask = (ctx.addTask as ReturnType<typeof vi.fn>).mock.calls[0][0] as Task;
    expect(addedTask.description).toBe("Quarterly report");
    expect(addedTask.priority).toBe("high");
    expect(addedTask.dueAt).toBe("2026-03-01");
    expect(addedTask.startAt).toBe("2026-02-25");
    expect(addedTask.category).toBe("work");
    expect(addedTask.tags).toHaveLength(2);
    expect(addedTask.tags[0].name).toBe("urgent");
    expect(addedTask.isRecurring).toBe(true);
    expect(addedTask.recurringInterval).toBe("FREQ=WEEKLY;BYDAY=MO");
  });

  it("derives task status via deriveTaskStatus", async () => {
    const ctx = makeContext();
    const tool = createCreateTaskTool(ctx);
    // startAt in the past should yield "doing" status
    await tool.execute({
      title: "Active task",
      startAt: "2020-01-01",
    });

    const addedTask = (ctx.addTask as ReturnType<typeof vi.fn>).mock.calls[0][0] as Task;
    expect(addedTask.status).toBe("doing");
  });

  it("notifies on success", async () => {
    const ctx = makeContext();
    const tool = createCreateTaskTool(ctx);
    await tool.execute({ title: "Test" });
    expect(ctx.notify).toHaveBeenCalledWith("success", expect.stringContaining("Test"));
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/capabilities/__tests__/tools/create-task.test.ts`
Expected: FAIL — module not found.

**Step 3: Write the implementation**

```typescript
// src/capabilities/tools/create-task.ts
import type { CapabilityContext, ToolSpec } from "../types";
import type { Task, Tag } from "../../types";
import { deriveTaskStatus } from "../../utils/task";
import { generateTimestampId, getNowISO } from "../../utils/date-helpers";

export function createCreateTaskTool(ctx: CapabilityContext): ToolSpec {
  return {
    name: "create_task",
    description: "Create a new task",
    schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Task title" },
        description: { type: "string", description: "Task description" },
        priority: {
          type: "string",
          enum: ["low", "medium", "high"],
          description: "Task priority",
        },
        status: {
          type: "string",
          enum: ["todo", "scheduled"],
          description: "Initial status",
        },
        dueAt: {
          type: "string",
          description: "Due date (YYYY-MM-DD)",
        },
        startAt: {
          type: "string",
          description: "Start date (YYYY-MM-DD)",
        },
        category: { type: "string", description: "Task category" },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Tag names",
        },
        recurrence: {
          type: "string",
          description:
            "Recurrence rule in RRULE format (RFC 5545). E.g. FREQ=DAILY, FREQ=WEEKLY;BYDAY=MO,WE,FR",
        },
      },
      required: ["title"],
    },
    async execute(args) {
      const tagNames = (args.tags as string[] | undefined) ?? [];
      const tags: Tag[] = tagNames.map((name) => ({
        id: generateTimestampId("tag"),
        name,
      }));

      const recurrence = args.recurrence as string | undefined;

      const task: Task = {
        id: generateTimestampId("ai"),
        title: args.title as string,
        description: args.description as string | undefined,
        status: (args.status as string) ?? "todo",
        priority: (args.priority as string) ?? "medium",
        createdAt: getNowISO(),
        dueAt: args.dueAt as string | undefined,
        startAt: args.startAt as string | undefined,
        category: args.category as string | undefined,
        tags,
        isRecurring: recurrence ? true : undefined,
        recurringInterval: recurrence ?? undefined,
      } as Task;

      // Derive status from dates
      task.status = deriveTaskStatus(task);

      await ctx.addTask(task);
      ctx.notify?.("success", `Created task: ${task.title}`);

      return {
        name: "create_task",
        result: { success: true, id: task.id, title: task.title },
      };
    },
  };
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/capabilities/__tests__/tools/create-task.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/capabilities/tools/create-task.ts src/capabilities/__tests__/tools/create-task.test.ts
git commit -m "feat(capabilities): add create_task tool with deriveTaskStatus"
```

---

## Task 3: query_tasks Tool

**Files:**
- Create: `src/capabilities/tools/query-tasks.ts`
- Create: `src/capabilities/__tests__/tools/query-tasks.test.ts`

**Step 1: Write the failing test**

```typescript
// src/capabilities/__tests__/tools/query-tasks.test.ts
import { describe, it, expect, vi } from "vitest";
import { createQueryTasksTool } from "../../tools/query-tasks";
import type { CapabilityContext } from "../../types";
import type { Task } from "../../../types";

const sampleTasks: Task[] = [
  {
    id: "1", title: "Buy groceries", status: "todo", priority: "low",
    tags: [{ id: "t1", name: "personal" }], dueAt: "2026-02-22", category: "personal",
  },
  {
    id: "2", title: "Write report", status: "doing", priority: "high",
    tags: [{ id: "t2", name: "work" }], dueAt: "2026-02-25", category: "work",
    isRecurring: true, recurringInterval: "FREQ=WEEKLY",
  },
  {
    id: "3", title: "Clean house", status: "done", priority: "medium",
    tags: [], dueAt: "2026-02-20", category: "personal",
    completedAt: "2026-02-20T10:00:00",
  },
  {
    id: "4", title: "Review PR", status: "overdue", priority: "high",
    tags: [{ id: "t3", name: "work" }], dueAt: "2026-02-15", category: "work",
  },
] as Task[];

function makeContext(tasks = sampleTasks): CapabilityContext {
  return {
    getTasks: vi.fn().mockResolvedValue(tasks),
    getTask: vi.fn(),
    addTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  };
}

describe("query_tasks tool", () => {
  it("returns all tasks with no filters", async () => {
    const tool = createQueryTasksTool(makeContext());
    const result = await tool.execute({});
    expect((result.result as any).tasks).toHaveLength(4);
  });

  it("filters by status", async () => {
    const tool = createQueryTasksTool(makeContext());
    const result = await tool.execute({ status: "todo" });
    expect((result.result as any).tasks).toHaveLength(1);
    expect((result.result as any).tasks[0].title).toBe("Buy groceries");
  });

  it("filters by search (case-insensitive, matches title and description)", async () => {
    const tool = createQueryTasksTool(makeContext());
    const result = await tool.execute({ search: "report" });
    expect((result.result as any).tasks).toHaveLength(1);
  });

  it("filters by category", async () => {
    const tool = createQueryTasksTool(makeContext());
    const result = await tool.execute({ category: "work" });
    expect((result.result as any).tasks).toHaveLength(2);
  });

  it("filters by tag", async () => {
    const tool = createQueryTasksTool(makeContext());
    const result = await tool.execute({ tag: "work" });
    expect((result.result as any).tasks).toHaveLength(2);
  });

  it("filters by date range", async () => {
    const tool = createQueryTasksTool(makeContext());
    const result = await tool.execute({ dateFrom: "2026-02-21", dateTo: "2026-02-25" });
    expect((result.result as any).tasks).toHaveLength(2); // groceries (22) + report (25)
  });

  it("filters by recurring", async () => {
    const tool = createQueryTasksTool(makeContext());
    const result = await tool.execute({ recurring: true });
    expect((result.result as any).tasks).toHaveLength(1);
    expect((result.result as any).tasks[0].title).toBe("Write report");
  });

  it("sorts by priority", async () => {
    const tool = createQueryTasksTool(makeContext());
    const result = await tool.execute({ sort: "priority" });
    const titles = (result.result as any).tasks.map((t: any) => t.title);
    // high first: Write report, Review PR, then medium: Clean house, then low: Buy groceries
    expect(titles[0]).toBe("Write report");
  });

  it("respects limit", async () => {
    const tool = createQueryTasksTool(makeContext());
    const result = await tool.execute({ limit: 2 });
    expect((result.result as any).tasks).toHaveLength(2);
  });

  it("has correct schema with all filter properties", () => {
    const tool = createQueryTasksTool(makeContext());
    expect(tool.schema.properties.status).toBeDefined();
    expect(tool.schema.properties.search).toBeDefined();
    expect(tool.schema.properties.category).toBeDefined();
    expect(tool.schema.properties.tag).toBeDefined();
    expect(tool.schema.properties.dateFrom).toBeDefined();
    expect(tool.schema.properties.dateTo).toBeDefined();
    expect(tool.schema.properties.recurring).toBeDefined();
    expect(tool.schema.properties.sort).toBeDefined();
    expect(tool.schema.properties.limit).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/capabilities/__tests__/tools/query-tasks.test.ts`
Expected: FAIL

**Step 3: Write the implementation**

```typescript
// src/capabilities/tools/query-tasks.ts
import type { CapabilityContext, ToolSpec } from "../types";
import type { Task, Priority } from "../../types";

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export function createQueryTasksTool(ctx: CapabilityContext): ToolSpec {
  return {
    name: "query_tasks",
    description: "Search and filter tasks",
    schema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["todo", "doing", "done", "cancelled", "overdue", "due", "scheduled", "unplanned"],
          description: "Filter by task status",
        },
        search: {
          type: "string",
          description: "Search in title and description (case-insensitive)",
        },
        category: { type: "string", description: "Filter by category" },
        tag: { type: "string", description: "Filter by tag name" },
        dateFrom: {
          type: "string",
          description: "Due date range start, inclusive (YYYY-MM-DD)",
        },
        dateTo: {
          type: "string",
          description: "Due date range end, inclusive (YYYY-MM-DD)",
        },
        recurring: {
          type: "boolean",
          description: "Filter recurring (true) or one-off (false) tasks",
        },
        sort: {
          type: "string",
          enum: ["priority", "dueAt", "createdAt", "title"],
          description: "Sort field",
        },
        limit: {
          type: "number",
          description: "Max results (default 50)",
        },
      },
    },
    async execute(args) {
      let tasks = await ctx.getTasks();

      // Filter by status
      if (args.status) {
        tasks = tasks.filter((t) => t.status === args.status);
      }

      // Filter by search (title + description)
      if (args.search) {
        const q = (args.search as string).toLowerCase();
        tasks = tasks.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            (t.description?.toLowerCase().includes(q) ?? false),
        );
      }

      // Filter by category
      if (args.category) {
        tasks = tasks.filter((t) => t.category === args.category);
      }

      // Filter by tag
      if (args.tag) {
        const tagName = (args.tag as string).toLowerCase();
        tasks = tasks.filter((t) =>
          t.tags.some((tag) => tag.name.toLowerCase() === tagName),
        );
      }

      // Filter by date range (on dueAt)
      if (args.dateFrom) {
        tasks = tasks.filter((t) => t.dueAt && t.dueAt >= (args.dateFrom as string));
      }
      if (args.dateTo) {
        tasks = tasks.filter((t) => t.dueAt && t.dueAt <= (args.dateTo as string));
      }

      // Filter by recurring
      if (args.recurring !== undefined) {
        tasks = tasks.filter((t) =>
          args.recurring ? t.isRecurring === true : !t.isRecurring,
        );
      }

      // Sort
      if (args.sort) {
        const sortField = args.sort as string;
        tasks = [...tasks].sort((a, b) => {
          if (sortField === "priority") {
            return (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1);
          }
          const aVal = (a as Record<string, unknown>)[sortField] as string ?? "";
          const bVal = (b as Record<string, unknown>)[sortField] as string ?? "";
          return aVal.localeCompare(bVal);
        });
      }

      // Limit
      const limit = (args.limit as number) ?? 50;
      tasks = tasks.slice(0, limit);

      // Return summary for AI (not full Task objects — keep token-efficient)
      const summary = tasks.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueAt: t.dueAt,
        startAt: t.startAt,
        category: t.category,
        tags: t.tags.map((tag) => tag.name),
        isRecurring: t.isRecurring ?? false,
      }));

      return {
        name: "query_tasks",
        result: { tasks: summary, count: summary.length },
      };
    },
  };
}
```

**Step 4: Run tests**

Run: `pnpm vitest run src/capabilities/__tests__/tools/query-tasks.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/capabilities/tools/query-tasks.ts src/capabilities/__tests__/tools/query-tasks.test.ts
git commit -m "feat(capabilities): add query_tasks tool with enhanced filtering"
```

---

## Task 4: update_task Tool

**Files:**
- Create: `src/capabilities/tools/update-task.ts`
- Create: `src/capabilities/__tests__/tools/update-task.test.ts`

**Step 1: Write the failing test**

```typescript
// src/capabilities/__tests__/tools/update-task.test.ts
import { describe, it, expect, vi } from "vitest";
import { createUpdateTaskTool } from "../../tools/update-task";
import type { CapabilityContext } from "../../types";
import type { Task } from "../../../types";

const existingTask: Task = {
  id: "task-1", title: "Old title", status: "todo", priority: "low",
  tags: [], dueAt: "2026-03-01",
} as Task;

function makeContext(task: Task | null = existingTask): CapabilityContext {
  return {
    getTasks: vi.fn().mockResolvedValue(task ? [task] : []),
    getTask: vi.fn().mockResolvedValue(task),
    addTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    notify: vi.fn(),
  };
}

describe("update_task tool", () => {
  it("updates basic fields", async () => {
    const ctx = makeContext();
    const tool = createUpdateTaskTool(ctx);
    const result = await tool.execute({ id: "task-1", title: "New title", priority: "high" });

    expect(ctx.updateTask).toHaveBeenCalledOnce();
    const updated = (ctx.updateTask as ReturnType<typeof vi.fn>).mock.calls[0][0] as Task;
    expect(updated.title).toBe("New title");
    expect(updated.priority).toBe("high");
    expect(updated.dueAt).toBe("2026-03-01"); // unchanged
    expect(result.result).toMatchObject({ success: true });
  });

  it("calls deriveTaskStatus after update", async () => {
    // Task with past due date should become overdue
    const pastDueTask: Task = {
      id: "task-2", title: "Overdue task", status: "todo", priority: "medium",
      tags: [], dueAt: "2020-01-01",
    } as Task;
    const ctx = makeContext(pastDueTask);
    const tool = createUpdateTaskTool(ctx);
    await tool.execute({ id: "task-2", title: "Still overdue" });

    const updated = (ctx.updateTask as ReturnType<typeof vi.fn>).mock.calls[0][0] as Task;
    expect(updated.status).toBe("overdue");
  });

  it("handles recurrence field", async () => {
    const ctx = makeContext();
    const tool = createUpdateTaskTool(ctx);
    await tool.execute({ id: "task-1", recurrence: "FREQ=DAILY" });

    const updated = (ctx.updateTask as ReturnType<typeof vi.fn>).mock.calls[0][0] as Task;
    expect(updated.isRecurring).toBe(true);
    expect(updated.recurringInterval).toBe("FREQ=DAILY");
  });

  it("clears recurrence when set to empty string", async () => {
    const recurringTask: Task = {
      id: "task-3", title: "Recurring", status: "todo", priority: "medium",
      tags: [], isRecurring: true, recurringInterval: "FREQ=DAILY",
    } as Task;
    const ctx = makeContext(recurringTask);
    const tool = createUpdateTaskTool(ctx);
    await tool.execute({ id: "task-3", recurrence: "" });

    const updated = (ctx.updateTask as ReturnType<typeof vi.fn>).mock.calls[0][0] as Task;
    expect(updated.isRecurring).toBeUndefined();
    expect(updated.recurringInterval).toBeUndefined();
  });

  it("returns error for non-existent task", async () => {
    const ctx = makeContext(null);
    const tool = createUpdateTaskTool(ctx);
    const result = await tool.execute({ id: "nonexistent", title: "X" });

    expect(ctx.updateTask).not.toHaveBeenCalled();
    expect(result.result).toMatchObject({ success: false });
  });

  it("handles tag updates from string array", async () => {
    const ctx = makeContext();
    const tool = createUpdateTaskTool(ctx);
    await tool.execute({ id: "task-1", tags: ["new-tag"] });

    const updated = (ctx.updateTask as ReturnType<typeof vi.fn>).mock.calls[0][0] as Task;
    expect(updated.tags).toHaveLength(1);
    expect(updated.tags[0].name).toBe("new-tag");
  });
});
```

**Step 2: Run test — FAIL**

**Step 3: Write the implementation**

```typescript
// src/capabilities/tools/update-task.ts
import type { CapabilityContext, ToolSpec } from "../types";
import type { Task, Tag } from "../../types";
import { deriveTaskStatus } from "../../utils/task";
import { generateTimestampId } from "../../utils/date-helpers";

export function createUpdateTaskTool(ctx: CapabilityContext): ToolSpec {
  return {
    name: "update_task",
    description: "Update an existing task's fields",
    schema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Task ID to update" },
        title: { type: "string", description: "New title" },
        description: { type: "string", description: "New description" },
        status: {
          type: "string",
          enum: ["todo", "done", "cancelled"],
          description: "New status (only terminal states; derived states are computed automatically)",
        },
        priority: { type: "string", enum: ["low", "medium", "high"] },
        dueAt: { type: "string", description: "New due date (YYYY-MM-DD)" },
        startAt: { type: "string", description: "New start date (YYYY-MM-DD)" },
        completedAt: { type: "string", description: "Completion timestamp" },
        category: { type: "string" },
        tags: { type: "array", items: { type: "string" }, description: "Tag names (replaces all)" },
        recurrence: {
          type: "string",
          description: "RRULE string to set recurrence, or empty string to clear",
        },
      },
      required: ["id"],
    },
    async execute(args) {
      const task = await ctx.getTask(args.id as string);
      if (!task) {
        return {
          name: "update_task",
          result: { success: false, message: `Task not found: ${args.id}` },
        };
      }

      // Build updated task immutably
      const updates: Partial<Task> = {};

      if (args.title !== undefined) updates.title = args.title as string;
      if (args.description !== undefined) updates.description = args.description as string;
      if (args.status !== undefined) updates.status = args.status as Task["status"];
      if (args.priority !== undefined) updates.priority = args.priority as Task["priority"];
      if (args.dueAt !== undefined) updates.dueAt = args.dueAt as string;
      if (args.startAt !== undefined) updates.startAt = args.startAt as string;
      if (args.completedAt !== undefined) updates.completedAt = args.completedAt as string;
      if (args.category !== undefined) updates.category = args.category as string;

      // Handle tags
      if (args.tags !== undefined) {
        updates.tags = (args.tags as string[]).map((name) => ({
          id: generateTimestampId("tag"),
          name,
        }));
      }

      // Handle recurrence
      if (args.recurrence !== undefined) {
        const recurrence = args.recurrence as string;
        if (recurrence) {
          updates.isRecurring = true;
          updates.recurringInterval = recurrence;
        } else {
          updates.isRecurring = undefined;
          updates.recurringInterval = undefined;
        }
      }

      const updatedTask: Task = { ...task, ...updates };

      // Derive status from dates (fixes the bypass bug in the old code)
      updatedTask.status = deriveTaskStatus(updatedTask);

      await ctx.updateTask(updatedTask);
      ctx.notify?.("success", `Updated task: ${updatedTask.title}`);

      return {
        name: "update_task",
        result: { success: true, id: updatedTask.id, title: updatedTask.title },
      };
    },
  };
}
```

**Step 4: Run tests — PASS**

**Step 5: Commit**

```bash
git add src/capabilities/tools/update-task.ts src/capabilities/__tests__/tools/update-task.test.ts
git commit -m "feat(capabilities): add update_task tool with deriveTaskStatus fix"
```

---

## Task 5: delete_task Tool

**Files:**
- Create: `src/capabilities/tools/delete-task.ts`
- Create: `src/capabilities/__tests__/tools/delete-task.test.ts`

**Step 1: Write the failing test**

```typescript
// src/capabilities/__tests__/tools/delete-task.test.ts
import { describe, it, expect, vi } from "vitest";
import { createDeleteTaskTool } from "../../tools/delete-task";
import type { CapabilityContext } from "../../types";
import type { Task } from "../../../types";

function makeContext(task: Task | null): CapabilityContext {
  return {
    getTasks: vi.fn(), getTask: vi.fn().mockResolvedValue(task),
    addTask: vi.fn(), updateTask: vi.fn(),
    deleteTask: vi.fn(), notify: vi.fn(),
  };
}

describe("delete_task tool", () => {
  it("deletes an existing task", async () => {
    const task = { id: "1", title: "Delete me", status: "todo", priority: "low", tags: [] } as Task;
    const ctx = makeContext(task);
    const tool = createDeleteTaskTool(ctx);
    const result = await tool.execute({ id: "1" });

    expect(ctx.deleteTask).toHaveBeenCalledWith("1");
    expect(result.result).toMatchObject({ success: true });
    expect(ctx.notify).toHaveBeenCalledWith("info", expect.stringContaining("Delete me"));
  });

  it("returns error for non-existent task", async () => {
    const ctx = makeContext(null);
    const tool = createDeleteTaskTool(ctx);
    const result = await tool.execute({ id: "nonexistent" });

    expect(ctx.deleteTask).not.toHaveBeenCalled();
    expect(result.result).toMatchObject({ success: false });
  });
});
```

**Step 2: Run — FAIL. Step 3: Implement.**

```typescript
// src/capabilities/tools/delete-task.ts
import type { CapabilityContext, ToolSpec } from "../types";

export function createDeleteTaskTool(ctx: CapabilityContext): ToolSpec {
  return {
    name: "delete_task",
    description: "Delete a task by ID",
    schema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Task ID to delete" },
      },
      required: ["id"],
    },
    async execute(args) {
      const task = await ctx.getTask(args.id as string);
      if (!task) {
        return {
          name: "delete_task",
          result: { success: false, message: `Task not found: ${args.id}` },
        };
      }

      await ctx.deleteTask(task.id);
      ctx.notify?.("info", `Deleted task: ${task.title}`);

      return {
        name: "delete_task",
        result: { success: true, id: task.id, title: task.title },
      };
    },
  };
}
```

**Step 4: Run — PASS. Step 5: Commit.**

```bash
git add src/capabilities/tools/delete-task.ts src/capabilities/__tests__/tools/delete-task.test.ts
git commit -m "feat(capabilities): add delete_task tool"
```

---

## Task 6: complete_task and cancel_task Tools

**Files:**
- Create: `src/capabilities/tools/complete-task.ts`
- Create: `src/capabilities/tools/cancel-task.ts`
- Create: `src/capabilities/__tests__/tools/complete-task.test.ts`
- Create: `src/capabilities/__tests__/tools/cancel-task.test.ts`

**Step 1: Write the failing tests**

```typescript
// src/capabilities/__tests__/tools/complete-task.test.ts
import { describe, it, expect, vi } from "vitest";
import { createCompleteTaskTool } from "../../tools/complete-task";
import type { CapabilityContext } from "../../types";
import type { Task } from "../../../types";

function makeContext(task: Task | null): CapabilityContext {
  return {
    getTasks: vi.fn(), getTask: vi.fn().mockResolvedValue(task),
    addTask: vi.fn(), updateTask: vi.fn(),
    deleteTask: vi.fn(), notify: vi.fn(),
  };
}

describe("complete_task tool", () => {
  it("marks a task as done with completedAt", async () => {
    const task = { id: "1", title: "Do thing", status: "todo", priority: "medium", tags: [] } as Task;
    const ctx = makeContext(task);
    const tool = createCompleteTaskTool(ctx);
    const result = await tool.execute({ id: "1" });

    expect(ctx.updateTask).toHaveBeenCalledOnce();
    const updated = (ctx.updateTask as ReturnType<typeof vi.fn>).mock.calls[0][0] as Task;
    expect(updated.status).toBe("done");
    expect(updated.completedAt).toBeDefined();
    expect(result.result).toMatchObject({ success: true });
  });

  it("creates next occurrence for recurring task", async () => {
    const task = {
      id: "1", title: "Daily standup", status: "todo", priority: "medium",
      tags: [], dueAt: "2026-02-22",
      isRecurring: true, recurringInterval: "FREQ=DAILY",
    } as Task;
    const ctx = makeContext(task);
    const tool = createCompleteTaskTool(ctx);
    await tool.execute({ id: "1" });

    // Should complete original AND create next occurrence
    expect(ctx.updateTask).toHaveBeenCalledOnce();
    expect(ctx.addTask).toHaveBeenCalledOnce();
    const nextTask = (ctx.addTask as ReturnType<typeof vi.fn>).mock.calls[0][0] as Task;
    expect(nextTask.isRecurring).toBe(true);
    expect(nextTask.status).not.toBe("done");
    expect(nextTask.id).not.toBe("1"); // new ID
  });

  it("returns error for non-existent task", async () => {
    const ctx = makeContext(null);
    const tool = createCompleteTaskTool(ctx);
    const result = await tool.execute({ id: "nonexistent" });
    expect(result.result).toMatchObject({ success: false });
  });
});
```

```typescript
// src/capabilities/__tests__/tools/cancel-task.test.ts
import { describe, it, expect, vi } from "vitest";
import { createCancelTaskTool } from "../../tools/cancel-task";
import type { CapabilityContext } from "../../types";
import type { Task } from "../../../types";

function makeContext(task: Task | null): CapabilityContext {
  return {
    getTasks: vi.fn(), getTask: vi.fn().mockResolvedValue(task),
    addTask: vi.fn(), updateTask: vi.fn(),
    deleteTask: vi.fn(), notify: vi.fn(),
  };
}

describe("cancel_task tool", () => {
  it("marks a task as cancelled with cancelledAt", async () => {
    const task = { id: "1", title: "Nope", status: "todo", priority: "medium", tags: [] } as Task;
    const ctx = makeContext(task);
    const tool = createCancelTaskTool(ctx);
    const result = await tool.execute({ id: "1" });

    const updated = (ctx.updateTask as ReturnType<typeof vi.fn>).mock.calls[0][0] as Task;
    expect(updated.status).toBe("cancelled");
    expect(updated.cancelledAt).toBeDefined();
    expect(result.result).toMatchObject({ success: true });
  });

  it("returns error for non-existent task", async () => {
    const ctx = makeContext(null);
    const tool = createCancelTaskTool(ctx);
    const result = await tool.execute({ id: "nonexistent" });
    expect(result.result).toMatchObject({ success: false });
  });
});
```

**Step 2: Run — FAIL. Step 3: Implement both.**

```typescript
// src/capabilities/tools/complete-task.ts
import type { CapabilityContext, ToolSpec } from "../types";
import type { Task } from "../../types";
import { deriveTaskStatus } from "../../utils/task";
import { generateTimestampId, getNowISO } from "../../utils/date-helpers";

export function createCompleteTaskTool(ctx: CapabilityContext): ToolSpec {
  return {
    name: "complete_task",
    description:
      "Mark a task as done. For recurring tasks, completes the current instance and creates the next occurrence.",
    schema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Task ID to complete" },
      },
      required: ["id"],
    },
    async execute(args) {
      const task = await ctx.getTask(args.id as string);
      if (!task) {
        return {
          name: "complete_task",
          result: { success: false, message: `Task not found: ${args.id}` },
        };
      }

      // Complete the current task
      const completedTask: Task = {
        ...task,
        status: "done",
        completedAt: getNowISO(),
      };
      await ctx.updateTask(completedTask);

      // For recurring tasks, create the next occurrence
      if (task.isRecurring && task.recurringInterval) {
        const nextTask: Task = {
          ...task,
          id: generateTimestampId("ai"),
          status: "todo",
          createdAt: getNowISO(),
          completedAt: undefined,
          cancelledAt: undefined,
        };
        // Derive status from dates for the next occurrence
        nextTask.status = deriveTaskStatus(nextTask);
        await ctx.addTask(nextTask);
      }

      ctx.notify?.("success", `Completed task: ${task.title}`);

      return {
        name: "complete_task",
        result: {
          success: true,
          id: task.id,
          title: task.title,
          createdNextOccurrence: !!(task.isRecurring && task.recurringInterval),
        },
      };
    },
  };
}
```

```typescript
// src/capabilities/tools/cancel-task.ts
import type { CapabilityContext, ToolSpec } from "../types";
import type { Task } from "../../types";
import { getNowISO } from "../../utils/date-helpers";

export function createCancelTaskTool(ctx: CapabilityContext): ToolSpec {
  return {
    name: "cancel_task",
    description: "Cancel a task. For recurring tasks, cancels the entire series.",
    schema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Task ID to cancel" },
      },
      required: ["id"],
    },
    async execute(args) {
      const task = await ctx.getTask(args.id as string);
      if (!task) {
        return {
          name: "cancel_task",
          result: { success: false, message: `Task not found: ${args.id}` },
        };
      }

      const cancelledTask: Task = {
        ...task,
        status: "cancelled",
        cancelledAt: getNowISO(),
      };
      await ctx.updateTask(cancelledTask);
      ctx.notify?.("info", `Cancelled task: ${task.title}`);

      return {
        name: "cancel_task",
        result: { success: true, id: task.id, title: task.title },
      };
    },
  };
}
```

**Step 4: Run — PASS. Step 5: Commit.**

```bash
git add src/capabilities/tools/complete-task.ts src/capabilities/tools/cancel-task.ts \
  src/capabilities/__tests__/tools/complete-task.test.ts src/capabilities/__tests__/tools/cancel-task.test.ts
git commit -m "feat(capabilities): add complete_task and cancel_task tools"
```

---

## Task 7: batch_update_tasks Tool

**Files:**
- Create: `src/capabilities/tools/batch-update-tasks.ts`
- Create: `src/capabilities/__tests__/tools/batch-update-tasks.test.ts`

**Step 1: Write the failing test**

```typescript
// src/capabilities/__tests__/tools/batch-update-tasks.test.ts
import { describe, it, expect, vi } from "vitest";
import { createBatchUpdateTasksTool } from "../../tools/batch-update-tasks";
import type { CapabilityContext } from "../../types";
import type { Task } from "../../../types";

const tasks: Task[] = [
  { id: "1", title: "A", status: "overdue", priority: "low", tags: [{ id: "t1", name: "work" }], category: "work" } as Task,
  { id: "2", title: "B", status: "overdue", priority: "medium", tags: [], category: "personal" } as Task,
  { id: "3", title: "C", status: "todo", priority: "high", tags: [{ id: "t2", name: "work" }], category: "work" } as Task,
];

function makeContext(): CapabilityContext {
  return {
    getTasks: vi.fn().mockResolvedValue(tasks),
    getTask: vi.fn(), addTask: vi.fn(),
    updateTask: vi.fn(), deleteTask: vi.fn(), notify: vi.fn(),
  };
}

describe("batch_update_tasks tool", () => {
  it("updates tasks matching status filter", async () => {
    const ctx = makeContext();
    const tool = createBatchUpdateTasksTool(ctx);
    const result = await tool.execute({
      filter: { status: "overdue" },
      update: { dueAt: "2026-03-01" },
    });

    expect(ctx.updateTask).toHaveBeenCalledTimes(2); // tasks 1 and 2
    expect((result.result as any).updatedCount).toBe(2);
  });

  it("updates tasks matching category filter", async () => {
    const ctx = makeContext();
    const tool = createBatchUpdateTasksTool(ctx);
    await tool.execute({
      filter: { category: "work" },
      update: { priority: "high" },
    });

    expect(ctx.updateTask).toHaveBeenCalledTimes(2); // tasks 1 and 3
  });

  it("updates tasks matching tag filter", async () => {
    const ctx = makeContext();
    const tool = createBatchUpdateTasksTool(ctx);
    await tool.execute({
      filter: { tag: "work" },
      update: { category: "office" },
    });

    expect(ctx.updateTask).toHaveBeenCalledTimes(2); // tasks 1 and 3
  });

  it("returns zero when no tasks match", async () => {
    const ctx = makeContext();
    const tool = createBatchUpdateTasksTool(ctx);
    const result = await tool.execute({
      filter: { status: "done" },
      update: { priority: "low" },
    });

    expect(ctx.updateTask).not.toHaveBeenCalled();
    expect((result.result as any).updatedCount).toBe(0);
  });
});
```

**Step 2: Run — FAIL. Step 3: Implement.**

```typescript
// src/capabilities/tools/batch-update-tasks.ts
import type { CapabilityContext, ToolSpec } from "../types";
import type { Task, Tag } from "../../types";
import { deriveTaskStatus } from "../../utils/task";
import { generateTimestampId } from "../../utils/date-helpers";

export function createBatchUpdateTasksTool(ctx: CapabilityContext): ToolSpec {
  return {
    name: "batch_update_tasks",
    description: "Update multiple tasks matching a filter",
    schema: {
      type: "object",
      properties: {
        filter: {
          type: "object",
          properties: {
            status: { type: "string", description: "Filter by status" },
            category: { type: "string", description: "Filter by category" },
            tag: { type: "string", description: "Filter by tag name" },
            recurring: { type: "boolean", description: "Filter recurring tasks" },
          },
        },
        update: {
          type: "object",
          properties: {
            status: { type: "string" },
            dueAt: { type: "string" },
            priority: { type: "string", enum: ["low", "medium", "high"] },
            category: { type: "string" },
            recurrence: { type: "string", description: "RRULE or empty to clear" },
          },
        },
      },
      required: ["filter", "update"],
    },
    async execute(args) {
      const filter = args.filter as Record<string, unknown>;
      const update = args.update as Record<string, unknown>;
      let tasks = await ctx.getTasks();

      // Apply filters
      if (filter.status) {
        tasks = tasks.filter((t) => t.status === filter.status);
      }
      if (filter.category) {
        tasks = tasks.filter((t) => t.category === filter.category);
      }
      if (filter.tag) {
        const tagName = (filter.tag as string).toLowerCase();
        tasks = tasks.filter((t) =>
          t.tags.some((tag) => tag.name.toLowerCase() === tagName),
        );
      }
      if (filter.recurring !== undefined) {
        tasks = tasks.filter((t) =>
          filter.recurring ? t.isRecurring === true : !t.isRecurring,
        );
      }

      // Apply updates
      for (const task of tasks) {
        const updated: Task = { ...task };

        if (update.status !== undefined) updated.status = update.status as Task["status"];
        if (update.dueAt !== undefined) updated.dueAt = update.dueAt as string;
        if (update.priority !== undefined) updated.priority = update.priority as Task["priority"];
        if (update.category !== undefined) updated.category = update.category as string;

        if (update.recurrence !== undefined) {
          const recurrence = update.recurrence as string;
          if (recurrence) {
            updated.isRecurring = true;
            updated.recurringInterval = recurrence;
          } else {
            updated.isRecurring = undefined;
            updated.recurringInterval = undefined;
          }
        }

        updated.status = deriveTaskStatus(updated);
        await ctx.updateTask(updated);
      }

      ctx.notify?.("success", `Updated ${tasks.length} tasks`);

      return {
        name: "batch_update_tasks",
        result: {
          success: true,
          updatedCount: tasks.length,
          taskIds: tasks.map((t) => t.id),
        },
      };
    },
  };
}
```

**Step 4: Run — PASS. Step 5: Commit.**

```bash
git add src/capabilities/tools/batch-update-tasks.ts src/capabilities/__tests__/tools/batch-update-tasks.test.ts
git commit -m "feat(capabilities): add batch_update_tasks tool"
```

---

## Task 8: get_task_stats and get_today_plan Tools

**Files:**
- Create: `src/capabilities/tools/get-task-stats.ts`
- Create: `src/capabilities/tools/get-today-plan.ts`
- Create: `src/capabilities/__tests__/tools/get-task-stats.test.ts`
- Create: `src/capabilities/__tests__/tools/get-today-plan.test.ts`

**Step 1: Write the failing tests**

```typescript
// src/capabilities/__tests__/tools/get-task-stats.test.ts
import { describe, it, expect, vi } from "vitest";
import { createGetTaskStatsTool } from "../../tools/get-task-stats";
import type { CapabilityContext } from "../../types";
import type { Task } from "../../../types";

const tasks: Task[] = [
  { id: "1", title: "A", status: "todo", priority: "high", tags: [], category: "work" } as Task,
  { id: "2", title: "B", status: "done", priority: "medium", tags: [], category: "work", completedAt: new Date().toISOString() } as Task,
  { id: "3", title: "C", status: "overdue", priority: "low", tags: [], category: "personal" } as Task,
  { id: "4", title: "D", status: "todo", priority: "high", tags: [], category: "work", isRecurring: true } as Task,
];

function makeContext(): CapabilityContext {
  return {
    getTasks: vi.fn().mockResolvedValue(tasks),
    getTask: vi.fn(), addTask: vi.fn(),
    updateTask: vi.fn(), deleteTask: vi.fn(),
  };
}

describe("get_task_stats tool", () => {
  it("returns correct aggregate statistics", async () => {
    const tool = createGetTaskStatsTool(makeContext());
    const result = await tool.execute({});
    const stats = result.result as any;

    expect(stats.total).toBe(4);
    expect(stats.byStatus.todo).toBe(2);
    expect(stats.byStatus.done).toBe(1);
    expect(stats.byStatus.overdue).toBe(1);
    expect(stats.byPriority.high).toBe(2);
    expect(stats.byCategory.work).toBe(3);
    expect(stats.overdue).toBe(1);
    expect(stats.recurring).toBe(1);
  });

  it("has no required schema parameters", () => {
    const tool = createGetTaskStatsTool(makeContext());
    expect(tool.schema.required).toBeUndefined();
  });
});
```

```typescript
// src/capabilities/__tests__/tools/get-today-plan.test.ts
import { describe, it, expect, vi } from "vitest";
import { createGetTodayPlanTool } from "../../tools/get-today-plan";
import type { CapabilityContext } from "../../types";
import type { Task } from "../../../types";
import { getTodayISO } from "../../../utils/date-helpers";

const today = getTodayISO();
const tasks: Task[] = [
  { id: "1", title: "Due today low", status: "todo", priority: "low", tags: [], dueAt: today } as Task,
  { id: "2", title: "Due today high", status: "todo", priority: "high", tags: [], dueAt: today } as Task,
  { id: "3", title: "Due tomorrow", status: "todo", priority: "medium", tags: [], dueAt: "2099-12-31" } as Task,
  { id: "4", title: "Overdue", status: "overdue", priority: "high", tags: [], dueAt: "2020-01-01" } as Task,
];

function makeContext(): CapabilityContext {
  return {
    getTasks: vi.fn().mockResolvedValue(tasks),
    getTask: vi.fn(), addTask: vi.fn(),
    updateTask: vi.fn(), deleteTask: vi.fn(),
  };
}

describe("get_today_plan tool", () => {
  it("returns today's tasks sorted by priority", async () => {
    const tool = createGetTodayPlanTool(makeContext());
    const result = await tool.execute({});
    const plan = result.result as any;

    expect(plan.todayTasks).toHaveLength(2);
    expect(plan.todayTasks[0].title).toBe("Due today high"); // high first
    expect(plan.todayTasks[1].title).toBe("Due today low");
  });

  it("includes overdue tasks separately", async () => {
    const tool = createGetTodayPlanTool(makeContext());
    const result = await tool.execute({});
    const plan = result.result as any;

    expect(plan.overdueTasks).toHaveLength(1);
    expect(plan.overdueTasks[0].title).toBe("Overdue");
  });
});
```

**Step 2: Run — FAIL. Step 3: Implement both.**

```typescript
// src/capabilities/tools/get-task-stats.ts
import type { CapabilityContext, ToolSpec } from "../types";
import type { TaskStatus, Priority } from "../../types";
import { getTodayISO } from "../../utils/date-helpers";

export function createGetTaskStatsTool(ctx: CapabilityContext): ToolSpec {
  return {
    name: "get_task_stats",
    description: "Get aggregate task statistics: counts by status, priority, category, and more",
    schema: { type: "object", properties: {} },
    async execute() {
      const tasks = await ctx.getTasks();
      const today = getTodayISO();

      const byStatus: Record<string, number> = {};
      const byPriority: Record<string, number> = {};
      const byCategory: Record<string, number> = {};
      let overdue = 0;
      let completedToday = 0;
      let doneCount = 0;
      let cancelledCount = 0;
      let recurring = 0;

      for (const task of tasks) {
        byStatus[task.status] = (byStatus[task.status] ?? 0) + 1;
        byPriority[task.priority] = (byPriority[task.priority] ?? 0) + 1;

        const cat = task.category ?? "uncategorized";
        byCategory[cat] = (byCategory[cat] ?? 0) + 1;

        if (task.status === "overdue") overdue++;
        if (task.status === "done") doneCount++;
        if (task.status === "cancelled") cancelledCount++;
        if (task.completedAt?.startsWith(today)) completedToday++;
        if (task.isRecurring) recurring++;
      }

      const denominator = doneCount + cancelledCount + (tasks.length - doneCount - cancelledCount);
      const completionRate = denominator > 0 ? doneCount / denominator : 0;

      return {
        name: "get_task_stats",
        result: {
          total: tasks.length,
          byStatus,
          byPriority,
          byCategory,
          overdue,
          completedToday,
          completionRate: Math.round(completionRate * 100) / 100,
          recurring,
          generatedAt: new Date().toISOString(),
        },
      };
    },
  };
}
```

```typescript
// src/capabilities/tools/get-today-plan.ts
import type { CapabilityContext, ToolSpec } from "../types";
import type { Priority } from "../../types";
import { getTodayISO } from "../../utils/date-helpers";

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export function createGetTodayPlanTool(ctx: CapabilityContext): ToolSpec {
  return {
    name: "get_today_plan",
    description: "Get today's tasks sorted by priority, with overdue items flagged separately",
    schema: { type: "object", properties: {} },
    async execute() {
      const tasks = await ctx.getTasks();
      const today = getTodayISO();

      const todayTasks = tasks
        .filter((t) => t.dueAt === today && t.status !== "done" && t.status !== "cancelled")
        .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1))
        .map((t) => ({
          id: t.id,
          title: t.title,
          priority: t.priority,
          status: t.status,
          category: t.category,
          tags: t.tags.map((tag) => tag.name),
          isRecurring: t.isRecurring ?? false,
        }));

      const overdueTasks = tasks
        .filter((t) => t.status === "overdue")
        .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1))
        .map((t) => ({
          id: t.id,
          title: t.title,
          priority: t.priority,
          dueAt: t.dueAt,
          category: t.category,
        }));

      return {
        name: "get_today_plan",
        result: {
          date: today,
          todayTasks,
          todayCount: todayTasks.length,
          overdueTasks,
          overdueCount: overdueTasks.length,
        },
      };
    },
  };
}
```

**Step 4: Run — PASS. Step 5: Commit.**

```bash
git add src/capabilities/tools/get-task-stats.ts src/capabilities/tools/get-today-plan.ts \
  src/capabilities/__tests__/tools/get-task-stats.test.ts src/capabilities/__tests__/tools/get-today-plan.test.ts
git commit -m "feat(capabilities): add get_task_stats and get_today_plan tools"
```

---

## Task 9: Resources

**Files:**
- Create: `src/capabilities/resources/all-tasks.ts`
- Create: `src/capabilities/resources/task-by-id.ts`
- Create: `src/capabilities/resources/filtered-tasks.ts`
- Create: `src/capabilities/resources/stats.ts`
- Create: `src/capabilities/__tests__/resources.test.ts`

**Step 1: Write the failing test**

```typescript
// src/capabilities/__tests__/resources.test.ts
import { describe, it, expect, vi } from "vitest";
import { createAllTasksResource } from "../resources/all-tasks";
import { createTaskByIdResource } from "../resources/task-by-id";
import { createFilteredTasksResources } from "../resources/filtered-tasks";
import { createStatsResource } from "../resources/stats";
import type { CapabilityContext } from "../types";
import type { Task } from "../../types";
import { getTodayISO, getDaysFromNowISO } from "../../utils/date-helpers";

const today = getTodayISO();
const tasks: Task[] = [
  { id: "1", title: "Today task", status: "todo", priority: "high", tags: [], dueAt: today } as Task,
  { id: "2", title: "Overdue task", status: "overdue", priority: "medium", tags: [], dueAt: "2020-01-01" } as Task,
  { id: "3", title: "Upcoming task", status: "scheduled", priority: "low", tags: [], dueAt: getDaysFromNowISO(3) } as Task,
];

function makeContext(): CapabilityContext {
  return {
    getTasks: vi.fn().mockResolvedValue(tasks),
    getTask: vi.fn().mockImplementation(async (id: string) => tasks.find(t => t.id === id) ?? null),
    addTask: vi.fn(), updateTask: vi.fn(), deleteTask: vi.fn(),
  };
}

describe("Resources", () => {
  describe("all-tasks", () => {
    it("returns all tasks", async () => {
      const resource = createAllTasksResource(makeContext());
      expect(resource.uri).toBe("tasks://all");
      const content = await resource.read();
      const data = JSON.parse(content.contents[0].text);
      expect(data.tasks).toHaveLength(3);
      expect(data.count).toBe(3);
    });
  });

  describe("task-by-id", () => {
    it("returns a specific task", async () => {
      const resource = createTaskByIdResource(makeContext());
      expect(resource.uriTemplate).toBe("tasks://{taskId}");
      const content = await resource.read({ taskId: "1" });
      const data = JSON.parse(content.contents[0].text);
      expect(data.found).toBe(true);
      expect(data.task.title).toBe("Today task");
    });

    it("returns not found for missing task", async () => {
      const resource = createTaskByIdResource(makeContext());
      const content = await resource.read({ taskId: "nonexistent" });
      const data = JSON.parse(content.contents[0].text);
      expect(data.found).toBe(false);
    });
  });

  describe("filtered-tasks", () => {
    it("creates overdue, today, and upcoming resources", () => {
      const resources = createFilteredTasksResources(makeContext());
      expect(resources).toHaveLength(3);
      expect(resources.map(r => r.uri)).toContain("tasks://overdue");
      expect(resources.map(r => r.uri)).toContain("tasks://today");
      expect(resources.map(r => r.uri)).toContain("tasks://upcoming");
    });

    it("overdue resource returns only overdue tasks", async () => {
      const resources = createFilteredTasksResources(makeContext());
      const overdue = resources.find(r => r.uri === "tasks://overdue")!;
      const content = await overdue.read();
      const data = JSON.parse(content.contents[0].text);
      expect(data.tasks).toHaveLength(1);
      expect(data.tasks[0].title).toBe("Overdue task");
    });

    it("today resource returns tasks due today", async () => {
      const resources = createFilteredTasksResources(makeContext());
      const todayR = resources.find(r => r.uri === "tasks://today")!;
      const content = await todayR.read();
      const data = JSON.parse(content.contents[0].text);
      expect(data.tasks).toHaveLength(1);
      expect(data.tasks[0].title).toBe("Today task");
    });
  });

  describe("stats", () => {
    it("returns task statistics", async () => {
      const resource = createStatsResource(makeContext());
      expect(resource.uri).toBe("tasks://stats");
      const content = await resource.read();
      const data = JSON.parse(content.contents[0].text);
      expect(data.total).toBe(3);
      expect(data.byStatus).toBeDefined();
    });
  });
});
```

**Step 2: Run — FAIL. Step 3: Implement all four resource files.**

Implementation follows the `ResourceSpec` interface — each factory returns a `ResourceSpec` with `uri`, `read()` that returns `ResourceContent`. The `read()` functions query `ctx.getTasks()` and filter/format the results as JSON.

Key patterns:
- `all-tasks.ts`: Returns all tasks as JSON
- `task-by-id.ts`: Uses `uriTemplate: "tasks://{taskId}"`, reads `params.taskId`, calls `ctx.getTask()`
- `filtered-tasks.ts`: Exports a function returning 3 resources (overdue/today/upcoming), each filtering by date/status
- `stats.ts`: Reuses the same counting logic as `get_task_stats` tool

**Step 4: Run — PASS. Step 5: Commit.**

```bash
git add src/capabilities/resources/ src/capabilities/__tests__/resources.test.ts
git commit -m "feat(capabilities): add 6 resource handlers"
```

---

## Task 10: Prompts

**Files:**
- Create: `src/capabilities/prompts/plan-my-day.ts`
- Create: `src/capabilities/prompts/weekly-review.ts`
- Create: `src/capabilities/prompts/task-triage.ts`
- Create: `src/capabilities/__tests__/prompts.test.ts`

**Step 1: Write the failing test**

```typescript
// src/capabilities/__tests__/prompts.test.ts
import { describe, it, expect, vi } from "vitest";
import { createPlanMyDayPrompt } from "../prompts/plan-my-day";
import { createWeeklyReviewPrompt } from "../prompts/weekly-review";
import { createTaskTriagePrompt } from "../prompts/task-triage";
import type { CapabilityContext } from "../types";
import type { Task } from "../../types";
import { getTodayISO } from "../../utils/date-helpers";

const today = getTodayISO();
const tasks: Task[] = [
  { id: "1", title: "Today task", status: "todo", priority: "high", tags: [], dueAt: today } as Task,
  { id: "2", title: "Overdue task", status: "overdue", priority: "medium", tags: [], dueAt: "2020-01-01" } as Task,
];

function makeContext(): CapabilityContext {
  return {
    getTasks: vi.fn().mockResolvedValue(tasks),
    getTask: vi.fn(), addTask: vi.fn(),
    updateTask: vi.fn(), deleteTask: vi.fn(),
  };
}

describe("Prompts", () => {
  describe("plan_my_day", () => {
    it("has correct name and arguments", () => {
      const prompt = createPlanMyDayPrompt(makeContext());
      expect(prompt.name).toBe("plan_my_day");
      expect(prompt.arguments).toBeDefined();
      expect(prompt.arguments!.some(a => a.name === "focusArea")).toBe(true);
    });

    it("renders messages with task data", async () => {
      const prompt = createPlanMyDayPrompt(makeContext());
      const messages = await prompt.render({});
      expect(messages).toHaveLength(1);
      expect(messages[0].role).toBe("user");
      expect(messages[0].content).toContain("Today task");
      expect(messages[0].content).toContain("Overdue task");
    });

    it("includes focus area when provided", async () => {
      const prompt = createPlanMyDayPrompt(makeContext());
      const messages = await prompt.render({ focusArea: "writing" });
      expect(messages[0].content).toContain("writing");
    });
  });

  describe("weekly_review", () => {
    it("has correct name", () => {
      const prompt = createWeeklyReviewPrompt(makeContext());
      expect(prompt.name).toBe("weekly_review");
    });

    it("renders with task context", async () => {
      const prompt = createWeeklyReviewPrompt(makeContext());
      const messages = await prompt.render({});
      expect(messages[0].role).toBe("user");
      expect(messages[0].content.length).toBeGreaterThan(0);
    });
  });

  describe("task_triage", () => {
    it("has correct name and no required arguments", () => {
      const prompt = createTaskTriagePrompt(makeContext());
      expect(prompt.name).toBe("task_triage");
    });

    it("renders with overdue context", async () => {
      const prompt = createTaskTriagePrompt(makeContext());
      const messages = await prompt.render();
      expect(messages[0].content).toContain("Overdue task");
    });
  });
});
```

**Note:** Prompt `render()` in our implementation is async (returns `Promise<PromptMessage[]>`) because it needs to call `ctx.getTasks()` to embed live data. Update the `PromptSpec` interface:

```typescript
// In types.ts, change render signature:
render(args?: Record<string, string>): PromptMessage[] | Promise<PromptMessage[]>;
```

**Step 2: Run — FAIL. Step 3: Implement.**

Each prompt factory receives `ctx`, and its `render()` method fetches live tasks, filters them, and builds a formatted markdown message. See design doc for the `plan_my_day` example format.

**Step 4: Run — PASS. Step 5: Commit.**

```bash
git add src/capabilities/prompts/ src/capabilities/__tests__/prompts.test.ts
git commit -m "feat(capabilities): add plan_my_day, weekly_review, task_triage prompts"
```

---

## Task 11: System Prompt Migration

**Files:**
- Create: `src/capabilities/system-prompt.ts` (copy + enhance from `src/providers/system-prompt.ts`)
- Modify: `src/providers/system-prompt.ts` (re-export for backward compat)

**Step 1: Copy the existing system prompt to new location**

Copy `src/providers/system-prompt.ts` (47 lines) to `src/capabilities/system-prompt.ts`.

**Step 2: Enhance the system prompt**

Add documentation for:
- All 9 tools (not just 4)
- RRULE format with examples for recurring tasks
- `complete_task` behavior for recurring tasks
- `deriveTaskStatus()` logic
- `batch_update_tasks` usage
- `get_task_stats` and `get_today_plan` descriptions

Keep the two injection points unchanged.

**Step 3: Update `src/providers/system-prompt.ts` to re-export**

```typescript
// src/providers/system-prompt.ts (backward compat)
export { getSystemPrompt } from "../capabilities/system-prompt";
```

**Step 4: Run `pnpm type-check` and `pnpm lint`**

Expected: PASS — no API changes.

**Step 5: Commit**

```bash
git add src/capabilities/system-prompt.ts src/providers/system-prompt.ts
git commit -m "feat(capabilities): migrate and enhance system prompt"
```

---

## Task 12: Registry — createCapabilities()

**Files:**
- Create: `src/capabilities/registry.ts`
- Create: `src/capabilities/__tests__/registry.test.ts`
- Create: `src/capabilities/index.ts`

**Step 1: Write the failing test**

```typescript
// src/capabilities/__tests__/registry.test.ts
import { describe, it, expect, vi } from "vitest";
import { createCapabilities } from "../registry";
import type { CapabilityContext } from "../types";
import type { Task } from "../../types";

function makeContext(): CapabilityContext {
  return {
    getTasks: vi.fn().mockResolvedValue([]),
    getTask: vi.fn().mockResolvedValue(null),
    addTask: vi.fn(), updateTask: vi.fn(),
    deleteTask: vi.fn(), notify: vi.fn(),
  };
}

describe("createCapabilities", () => {
  it("returns a Capabilities object with tools, resources, prompts", () => {
    const caps = createCapabilities(makeContext());
    expect(caps.tools).toBeInstanceOf(Array);
    expect(caps.resources).toBeInstanceOf(Array);
    expect(caps.prompts).toBeInstanceOf(Array);
  });

  it("has 9 tools", () => {
    const caps = createCapabilities(makeContext());
    expect(caps.tools).toHaveLength(9);
    const names = caps.tools.map(t => t.name);
    expect(names).toContain("create_task");
    expect(names).toContain("query_tasks");
    expect(names).toContain("update_task");
    expect(names).toContain("delete_task");
    expect(names).toContain("complete_task");
    expect(names).toContain("cancel_task");
    expect(names).toContain("batch_update_tasks");
    expect(names).toContain("get_task_stats");
    expect(names).toContain("get_today_plan");
  });

  it("has 6 resources", () => {
    const caps = createCapabilities(makeContext());
    expect(caps.resources).toHaveLength(6);
  });

  it("has 3 prompts", () => {
    const caps = createCapabilities(makeContext());
    expect(caps.prompts).toHaveLength(3);
  });

  it("getTool() returns a tool by name", () => {
    const caps = createCapabilities(makeContext());
    expect(caps.getTool("create_task")).toBeDefined();
    expect(caps.getTool("nonexistent")).toBeUndefined();
  });

  it("executeTool() dispatches to the correct tool", async () => {
    const ctx = makeContext();
    const caps = createCapabilities(ctx);
    const result = await caps.executeTool("create_task", { title: "Test" });
    expect(ctx.addTask).toHaveBeenCalledOnce();
    expect(result.name).toBe("create_task");
  });

  it("executeTool() returns error for unknown tool", async () => {
    const caps = createCapabilities(makeContext());
    const result = await caps.executeTool("nonexistent", {});
    expect(result.result).toMatchObject({ error: expect.stringContaining("Unknown tool") });
  });

  it("getSystemPrompt() returns a string", () => {
    const caps = createCapabilities(makeContext());
    const prompt = caps.getSystemPrompt();
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(100);
  });
});
```

**Step 2: Run — FAIL. Step 3: Implement.**

```typescript
// src/capabilities/registry.ts
import type { CapabilityContext, Capabilities, ToolSpec, ResourceSpec, PromptSpec } from "./types";
import type { ToolResult } from "../providers/types";
import { createCreateTaskTool } from "./tools/create-task";
import { createQueryTasksTool } from "./tools/query-tasks";
import { createUpdateTaskTool } from "./tools/update-task";
import { createDeleteTaskTool } from "./tools/delete-task";
import { createCompleteTaskTool } from "./tools/complete-task";
import { createCancelTaskTool } from "./tools/cancel-task";
import { createBatchUpdateTasksTool } from "./tools/batch-update-tasks";
import { createGetTaskStatsTool } from "./tools/get-task-stats";
import { createGetTodayPlanTool } from "./tools/get-today-plan";
import { createAllTasksResource } from "./resources/all-tasks";
import { createTaskByIdResource } from "./resources/task-by-id";
import { createFilteredTasksResources } from "./resources/filtered-tasks";
import { createStatsResource } from "./resources/stats";
import { createPlanMyDayPrompt } from "./prompts/plan-my-day";
import { createWeeklyReviewPrompt } from "./prompts/weekly-review";
import { createTaskTriagePrompt } from "./prompts/task-triage";
import { getSystemPrompt } from "./system-prompt";

export function createCapabilities(ctx: CapabilityContext): Capabilities {
  const tools: ToolSpec[] = [
    createCreateTaskTool(ctx),
    createQueryTasksTool(ctx),
    createUpdateTaskTool(ctx),
    createDeleteTaskTool(ctx),
    createCompleteTaskTool(ctx),
    createCancelTaskTool(ctx),
    createBatchUpdateTasksTool(ctx),
    createGetTaskStatsTool(ctx),
    createGetTodayPlanTool(ctx),
  ];

  const resources: ResourceSpec[] = [
    createAllTasksResource(ctx),
    createTaskByIdResource(ctx),
    ...createFilteredTasksResources(ctx),
    createStatsResource(ctx),
  ];

  const prompts: PromptSpec[] = [
    createPlanMyDayPrompt(ctx),
    createWeeklyReviewPrompt(ctx),
    createTaskTriagePrompt(ctx),
  ];

  const toolMap = new Map(tools.map((t) => [t.name, t]));
  const resourceMap = new Map(resources.map((r) => [r.name, r]));
  const promptMap = new Map(prompts.map((p) => [p.name, p]));

  return {
    tools,
    resources,
    prompts,

    getTool: (name) => toolMap.get(name),
    getResource: (name) => resourceMap.get(name),
    getPrompt: (name) => promptMap.get(name),

    getSystemPrompt: (developerPrompt?, userPrompt?) =>
      getSystemPrompt(developerPrompt, userPrompt),

    async executeTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
      const tool = toolMap.get(name);
      if (!tool) {
        return { name, result: { error: `Unknown tool: ${name}` } };
      }
      return tool.execute(args);
    },
  };
}
```

```typescript
// src/capabilities/index.ts
export { createCapabilities } from "./registry";
export type {
  CapabilityContext,
  Capabilities,
  ToolSpec,
  ResourceSpec,
  PromptSpec,
  PromptMessage,
  PromptArgument,
  ResourceContent,
} from "./types";
export { getSystemPrompt } from "./system-prompt";
```

**Step 4: Run — PASS. Step 5: Commit.**

```bash
git add src/capabilities/registry.ts src/capabilities/index.ts src/capabilities/__tests__/registry.test.ts
git commit -m "feat(capabilities): add createCapabilities() registry"
```

---

## Task 13: Refactor useAIAgent to Use Capabilities

**Files:**
- Modify: `src/hooks/useAIAgent.ts`
- Modify: `src/providers/tools.ts` (re-export for backward compat)

**Step 1: Refactor useAIAgent**

Replace the `executeTool()` switch statement (lines 43-193 of `src/hooks/useAIAgent.ts`) with `capabilities.executeTool()`. The hook builds a `CapabilityContext` from its React state/callbacks and creates a registry.

Key changes:
- Remove the entire `executeTool` function (~150 lines)
- Add `CapabilityContext` construction from React callbacks
- Call `createCapabilities(ctx)` once
- Use `capabilities.tools` for tool definitions (instead of `getToolDefinitions()`)
- Use `capabilities.getSystemPrompt()` (instead of direct `getSystemPrompt()`)
- Use `capabilities.executeTool(call.name, call.args)` in the loop

The `handleAICommand` function body stays largely the same — it's the same provider.chat() loop. Only the tool execution dispatch changes.

**Step 2: Verify `pnpm type-check` passes**

Run: `pnpm type-check`
Expected: PASS

**Step 3: Update `src/providers/tools.ts` for backward compatibility**

```typescript
// src/providers/tools.ts (backward compat)
export { getToolDefinitions } from "../capabilities/tools-compat";
```

Create `src/capabilities/tools-compat.ts` that re-creates the old `getToolDefinitions()` interface from the new tool specs (just the schema part, no executors). This ensures any existing direct imports still work.

Actually, simpler approach: keep `getToolDefinitions()` in the old location since it's still useful as a static schema-only export. The capabilities layer's tools include executors; the old function returns just schemas. Both can coexist without duplication since the registry imports the same schema definitions.

**Step 4: Run `pnpm lint` and `pnpm type-check`**

Expected: PASS

**Step 5: Commit**

```bash
git add src/hooks/useAIAgent.ts src/providers/tools.ts
git commit -m "refactor(useAIAgent): consume capabilities layer instead of inline executeTool"
```

---

## Task 14: Library Exports

**Files:**
- Modify: `src/index.ts` (add capabilities exports)
- Modify: `package.json` (add `./capabilities` entry point)

**Step 1: Update `src/index.ts`**

Add at the end:

```typescript
// Capabilities layer
export { createCapabilities } from "./capabilities";
export type {
  CapabilityContext, Capabilities,
  ToolSpec, ResourceSpec, PromptSpec,
  PromptMessage, PromptArgument, ResourceContent,
} from "./capabilities";
```

**Step 2: Add sub-path export to `package.json`**

Add to the `exports` field:

```json
"./capabilities": {
  "import": "./dist/capabilities/index.js",
  "types": "./dist/capabilities/index.d.ts"
}
```

**Step 3: Verify build**

Run: `pnpm build:lib`
Expected: PASS — `dist/capabilities/` directory created with types.

**Step 4: Commit**

```bash
git add src/index.ts package.json
git commit -m "feat: export capabilities layer from library"
```

---

## Task 15: Full Verification

**Step 1: Run all tests**

```bash
pnpm vitest run src/capabilities/
```

Expected: All tests PASS.

**Step 2: Run type checking**

```bash
pnpm type-check
```

Expected: PASS.

**Step 3: Run linting**

```bash
pnpm lint
```

Expected: PASS.

**Step 4: Run full build**

```bash
pnpm build:lib
```

Expected: PASS — `dist/` includes `capabilities/` with types.

**Step 5: Run formatting**

```bash
pnpm format
```

**Step 6: Verify the example app still works**

```bash
pnpm dev:example
```

Manually test: type a task in AI mode, verify it creates successfully. This confirms `useAIAgent` refactoring didn't break the flow.

**Step 7: Final commit if any formatting changes**

```bash
git add -A
git commit -m "chore: format and verify capabilities layer"
```

---

## Task Summary

| # | Task | Files | Tests |
|---|------|-------|-------|
| 1 | Foundation types | `capabilities/types.ts` | `__tests__/types.test.ts` |
| 2 | create_task tool | `tools/create-task.ts` | `__tests__/tools/create-task.test.ts` |
| 3 | query_tasks tool | `tools/query-tasks.ts` | `__tests__/tools/query-tasks.test.ts` |
| 4 | update_task tool | `tools/update-task.ts` | `__tests__/tools/update-task.test.ts` |
| 5 | delete_task tool | `tools/delete-task.ts` | `__tests__/tools/delete-task.test.ts` |
| 6 | complete/cancel tools | `tools/complete-task.ts`, `tools/cancel-task.ts` | `__tests__/tools/complete-task.test.ts`, `cancel-task.test.ts` |
| 7 | batch_update tool | `tools/batch-update-tasks.ts` | `__tests__/tools/batch-update-tasks.test.ts` |
| 8 | stats + today tools | `tools/get-task-stats.ts`, `get-today-plan.ts` | `__tests__/tools/get-task-stats.test.ts`, `get-today-plan.test.ts` |
| 9 | Resources (6) | `resources/*.ts` | `__tests__/resources.test.ts` |
| 10 | Prompts (3) | `prompts/*.ts` | `__tests__/prompts.test.ts` |
| 11 | System prompt | `capabilities/system-prompt.ts` | N/A (string output, verified via registry test) |
| 12 | Registry | `capabilities/registry.ts`, `index.ts` | `__tests__/registry.test.ts` |
| 13 | Refactor useAIAgent | `hooks/useAIAgent.ts` | Existing behavior preserved (manual test) |
| 14 | Library exports | `index.ts`, `package.json` | Build verification |
| 15 | Full verification | N/A | All tests + type-check + lint + build |
