# AI Capabilities Layer Design

**Date:** 2026-02-22
**Status:** Approved design, pending implementation

## Summary

Standardize the AI functionalities by extracting atomic capabilities (tools, resources, prompts) into a framework-agnostic layer. This enables both the built-in AI agent and external AI agents (via MCP servers hosted by the consuming application) to use the same capability definitions and executors.

## Motivation

The current AI integration has two tightly coupled concerns mixed into `useAIAgent.ts`:

1. **Capability logic** (what the app can do): create/query/update/delete tasks
2. **Agent orchestration** (the multi-turn chat loop): provider selection, prompt composition, tool-call dispatching

Problems:
- Tool executors are locked inside a React hook (not usable by external agents)
- Tool definitions are static and incomplete (missing `startAt`, `completedAt`, recurring, tag filtering)
- `update_task` bypasses `deriveTaskStatus()` (bug)
- `query_tasks` results never surface back to the caller
- No extension mechanism for host apps to add custom tools
- No way for host apps to expose capabilities to their own AI agents (e.g., via MCP)

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Primary consumer | Host app plugin (e.g., Obsidian) | MCP server lives in host's plugin layer, not in this library |
| Relationship to built-in agent | Replace (single source of truth) | `useAIAgent` refactored to use capabilities internally |
| Architecture | Unified registry pattern | Single `createCapabilities(ctx)` factory; one entry point for all capabilities |
| Data access | Context object injection | `CapabilityContext` interface with injected deps; pure executors |
| Capability scope | Full task management suite | Enhanced CRUD + batch ops + stats + planning + prompts |
| Recurring format | RRULE (RFC 5545) | Standard, well-documented, interoperable with calendar systems |

## Architecture

```
@tasks-timeline/components
  └── exports capabilities API
      ├── Tool definitions (JSON Schema)
      ├── Tool executors (pure functions)
      ├── Resource descriptors + handlers
      ├── Prompt templates
      └── System prompt

Consumer: Host App Plugin
  └── Registers capabilities as MCP tools/resources/prompts

Consumer: Built-in useAIAgent hook
  └── Uses same capabilities internally
```

The library does NOT host an MCP server. It exports the building blocks; the host app wires them to whatever transport it needs.

## Core Types

### CapabilityContext

Injected by the consumer to provide data access and mutation callbacks.

```typescript
interface CapabilityContext {
  // Read
  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | null>;

  // Write
  addTask(task: Task): Promise<void>;
  updateTask(task: Task): Promise<void>;
  deleteTask(id: string): Promise<void>;

  // Optional
  getSettings?(): AppSettings | null;
  notify?(type: "success" | "error" | "info", message: string): void;
}
```

### Capability Specs

```typescript
interface ToolSpec {
  name: string;
  description: string;
  schema: {
    type: "object";
    properties: Record<string, JSONSchemaProperty>;
    required?: string[];
  };
  execute(args: Record<string, unknown>): Promise<ToolResult>;
}

interface ResourceSpec {
  name: string;
  uri: string;
  uriTemplate?: string;
  description: string;
  mimeType: string;
  read(params?: Record<string, string>): Promise<ResourceContent>;
}

interface PromptSpec {
  name: string;
  description: string;
  arguments?: PromptArgument[];
  render(args?: Record<string, string>): PromptMessage[];
}
```

### Capabilities Registry

```typescript
interface Capabilities {
  tools: ToolSpec[];
  resources: ResourceSpec[];
  prompts: PromptSpec[];

  getTool(name: string): ToolSpec | undefined;
  getResource(name: string): ResourceSpec | undefined;
  getPrompt(name: string): PromptSpec | undefined;

  getSystemPrompt(developerPrompt?: string, userPrompt?: string): string;
  executeTool(name: string, args: Record<string, unknown>): Promise<ToolResult>;
}

function createCapabilities(ctx: CapabilityContext): Capabilities;
```

## Tools (9)

### Enhanced CRUD Tools

| Tool | Required | Optional | Notes |
|------|----------|----------|-------|
| `create_task` | `title` | `description`, `priority`, `status`, `dueAt`, `startAt`, `category`, `tags`, `recurrence` | Auto-generates ID, calls `deriveTaskStatus()` |
| `query_tasks` | none | `status`, `search`, `category`, `tag`, `dateFrom`, `dateTo`, `recurring`, `sort`, `limit` | Enhanced filtering and sorting |
| `update_task` | `id` | `title`, `description`, `status`, `priority`, `dueAt`, `startAt`, `completedAt`, `category`, `tags`, `recurrence` | Calls `deriveTaskStatus()` after update |
| `delete_task` | `id` | none | Validates task exists first |

### Semantic Shortcut Tools

| Tool | Required | Optional | Notes |
|------|----------|----------|-------|
| `complete_task` | `id` | none | Sets `status: "done"`, `completedAt: now`. For recurring tasks: completes current instance + creates next occurrence |
| `cancel_task` | `id` | none | Sets `status: "cancelled"`, `cancelledAt: now` |

### Bulk and Read-Only Tools

| Tool | Required | Optional | Notes |
|------|----------|----------|-------|
| `batch_update_tasks` | `filter`, `update` | none | Filter by status/category/tag/recurring, update status/dueAt/priority/category/recurrence |
| `get_task_stats` | none | none | Returns counts by status, priority, category; overdue count; completion rate; recurring count |
| `get_today_plan` | none | none | Today's tasks sorted by priority with overdue items flagged |

### Recurring Tasks

- Single `recurrence` field using iCalendar RRULE format (RFC 5545)
- Present = recurring, absent = not recurring
- Examples: `FREQ=DAILY`, `FREQ=WEEKLY;BYDAY=MO,WE,FR`, `FREQ=MONTHLY;BYMONTHDAY=1`
- `complete_task` on a recurring task advances to the next occurrence
- `cancel_task` on a recurring task cancels the entire series
- `query_tasks` supports `recurring: boolean` filter
- Executor maps RRULE string to internal `isRecurring` + `recurringInterval` fields

### Tool Schema: create_task

```json
{
  "name": "create_task",
  "description": "Create a new task",
  "schema": {
    "type": "object",
    "properties": {
      "title":       { "type": "string", "description": "Task title" },
      "description": { "type": "string", "description": "Task description" },
      "priority":    { "type": "string", "enum": ["low", "medium", "high"] },
      "status":      { "type": "string", "enum": ["todo", "scheduled"] },
      "dueAt":       { "type": "string", "description": "Due date (YYYY-MM-DD)" },
      "startAt":     { "type": "string", "description": "Start date (YYYY-MM-DD)" },
      "category":    { "type": "string" },
      "tags":        { "type": "array", "items": { "type": "string" }, "description": "Tag names" },
      "recurrence":  { "type": "string", "description": "RRULE (RFC 5545). E.g. FREQ=DAILY, FREQ=WEEKLY;BYDAY=MO,WE,FR" }
    },
    "required": ["title"]
  }
}
```

### Tool Schema: query_tasks

```json
{
  "name": "query_tasks",
  "description": "Search and filter tasks",
  "schema": {
    "type": "object",
    "properties": {
      "status":    { "type": "string", "enum": ["todo","doing","done","cancelled","overdue","due","scheduled","unplanned"] },
      "search":    { "type": "string", "description": "Search in title and description" },
      "category":  { "type": "string" },
      "tag":       { "type": "string", "description": "Filter by tag name" },
      "dateFrom":  { "type": "string", "description": "Due date range start (YYYY-MM-DD)" },
      "dateTo":    { "type": "string", "description": "Due date range end (YYYY-MM-DD)" },
      "recurring": { "type": "boolean", "description": "Filter recurring vs one-off tasks" },
      "sort":      { "type": "string", "enum": ["priority", "dueAt", "createdAt", "title"] },
      "limit":     { "type": "number", "description": "Max results (default 50)" }
    }
  }
}
```

### Tool Schema: batch_update_tasks

```json
{
  "name": "batch_update_tasks",
  "description": "Update multiple tasks matching a filter",
  "schema": {
    "type": "object",
    "properties": {
      "filter": {
        "type": "object",
        "properties": {
          "status":    { "type": "string" },
          "category":  { "type": "string" },
          "tag":       { "type": "string" },
          "recurring": { "type": "boolean" }
        }
      },
      "update": {
        "type": "object",
        "properties": {
          "status":     { "type": "string" },
          "dueAt":      { "type": "string" },
          "priority":   { "type": "string", "enum": ["low","medium","high"] },
          "category":   { "type": "string" },
          "recurrence": { "type": "string", "description": "RRULE string or null to clear" }
        }
      }
    },
    "required": ["filter", "update"]
  }
}
```

## Resources (6)

| Resource | URI | Description | Content Shape |
|----------|-----|-------------|---------------|
| All tasks | `tasks://all` | Full task list | `{ tasks: Task[], count, generatedAt }` |
| Task by ID | `tasks://{taskId}` (template) | Single task | `{ task: Task \| null, found }` |
| Overdue | `tasks://overdue` | Past due date | `{ tasks: Task[], count, generatedAt }` |
| Today | `tasks://today` | Due/starting today | `{ tasks: Task[], count, generatedAt }` |
| Upcoming | `tasks://upcoming` | Due in next 7 days | `{ tasks: Task[], count, generatedAt }` |
| Stats | `tasks://stats` | Aggregate statistics | See below |

### Stats Content Shape

```typescript
{
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<Priority, number>;
  byCategory: Record<string, number>;
  overdue: number;
  completedToday: number;
  completionRate: number;    // 0-1
  recurring: number;
  generatedAt: string;
}
```

### Resources vs Tools

- **Tools** (model-controlled): The AI decides when to call them. `query_tasks` for flexible on-demand filtering.
- **Resources** (application-controlled): The host app injects them as context before the agent starts. `tasks://today` + `tasks://stats` pre-loaded into every conversation.

## Prompts (3)

| Prompt | Arguments | Description |
|--------|-----------|-------------|
| `plan_my_day` | `focusArea?: string` | Prioritized plan for today, using today's tasks + overdue items |
| `weekly_review` | `weekStart?: string` | Past week's progress, next week's priorities |
| `task_triage` | none | Identifies overdue/stale tasks, suggests actions (reschedule, cancel, complete) |

Each prompt returns `PromptMessage[]` with `role` and `content`. Prompt templates embed live task data from resources so the agent starts with full context.

### Example: plan_my_day

```typescript
render({ focusArea: "writing" })
// Returns:
[{
  role: "user",
  content: `Review my tasks for today and create a prioritized plan.

Focus area: writing

## Today's Tasks (5)
- [todo] Write blog post (high)
- [doing] Review PR #42 (medium)
- ...

## Overdue (2)
- Submit report — due 2026-02-20
- ...

Use the available tools to reschedule, complete, or update tasks as needed.`
}]
```

## System Prompt

Moved from `providers/system-prompt.ts` to `capabilities/system-prompt.ts`.

```typescript
capabilities.getSystemPrompt(developerPrompt?, userPrompt?)
```

Enhancements:
- Documents all 9 tools (not just 4)
- Documents RRULE format with examples for recurring tasks
- Documents `complete_task` behavior for recurring tasks (advance to next occurrence)
- Documents `deriveTaskStatus()` logic so agents understand automatic status computation
- Keeps two injection points: `developerPrompt` (host app context), `userPrompt` (end-user customization)

## File Structure

```
src/
├── capabilities/                    # NEW
│   ├── types.ts                     # CapabilityContext, ToolSpec, ResourceSpec, PromptSpec, Capabilities
│   ├── registry.ts                  # createCapabilities(ctx) → Capabilities
│   ├── tools/
│   │   ├── create-task.ts
│   │   ├── query-tasks.ts
│   │   ├── update-task.ts
│   │   ├── delete-task.ts
│   │   ├── complete-task.ts
│   │   ├── cancel-task.ts
│   │   ├── batch-update-tasks.ts
│   │   ├── get-task-stats.ts
│   │   └── get-today-plan.ts
│   ├── resources/
│   │   ├── all-tasks.ts
│   │   ├── task-by-id.ts
│   │   ├── filtered-tasks.ts        # overdue, today, upcoming
│   │   └── stats.ts
│   ├── prompts/
│   │   ├── plan-my-day.ts
│   │   ├── weekly-review.ts
│   │   └── task-triage.ts
│   ├── system-prompt.ts
│   └── index.ts
├── providers/                       # Existing (unchanged except re-exports)
│   ├── tools.ts                     # DEPRECATED → re-exports from capabilities
│   ├── system-prompt.ts             # DEPRECATED → re-exports from capabilities
│   └── ...
├── hooks/
│   └── useAIAgent.ts                # REFACTORED to use capabilities.executeTool()
└── index.ts                         # Add capabilities to library exports
```

## useAIAgent Refactoring

The hook becomes a thin orchestrator consuming the capabilities layer:

```typescript
function useAIAgent(/* existing params */) {
  const ctx: CapabilityContext = {
    getTasks: async () => tasksRef.current,
    getTask: async (id) => tasksRef.current.find(t => t.id === id) ?? null,
    addTask: async (task) => { onTaskAdded(task); },
    updateTask: async (task) => { onTaskUpdated(task); },
    deleteTask: async (id) => { onTaskDeleted(id); },
    notify: onNotify,
  };

  const capabilities = createCapabilities(ctx);

  async function handleAICommand(input: string) {
    const provider = await createProvider(activeProvider, config);
    const tools = capabilities.tools.map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.schema,
    }));
    const systemPrompt = capabilities.getSystemPrompt(aiSystemPrompt, userPrompt);

    let response = await provider.chat(systemPrompt, input, tools);
    for (let i = 0; i < 5 && response.toolCalls?.length; i++) {
      const results = await Promise.all(
        response.toolCalls.map(call => capabilities.executeTool(call.name, call.args))
      );
      // ... append to history, continue loop
    }
  }
}
```

The `executeTool()` switch statement is eliminated — replaced by registry lookup.

## Library Export

New entry point added to `package.json` exports:

```json
{
  "exports": {
    "./capabilities": {
      "import": "./dist/capabilities/index.js",
      "types": "./dist/capabilities/index.d.ts"
    }
  }
}
```

Consumer usage:

```typescript
import { createCapabilities } from '@tasks-timeline/components/capabilities';
import type { CapabilityContext, Capabilities } from '@tasks-timeline/components/capabilities';
```

## Consumer Integration Example (Obsidian Plugin)

```typescript
import { createCapabilities } from '@tasks-timeline/components/capabilities';
import { McpServer } from '@modelcontextprotocol/server';

// Build context from plugin's data layer
const ctx = {
  getTasks: () => plugin.taskRepo.loadTasks(),
  getTask: (id) => plugin.taskRepo.getTask(id),
  addTask: (task) => plugin.taskRepo.addTask(task),
  updateTask: (task) => plugin.taskRepo.updateTask(task),
  deleteTask: (id) => plugin.taskRepo.deleteTask(id),
};

const capabilities = createCapabilities(ctx);

// Register with host MCP server
const server = new McpServer({ name: "tasks-timeline", version: "1.0.0" });

for (const tool of capabilities.tools) {
  server.registerTool(tool.name, { description: tool.description, inputSchema: tool.schema }, tool.execute);
}

for (const resource of capabilities.resources) {
  server.registerResource(resource.name, resource.uri, { description: resource.description }, resource.read);
}

for (const prompt of capabilities.prompts) {
  server.registerPrompt(prompt.name, { description: prompt.description, arguments: prompt.arguments }, prompt.render);
}
```

## Migration Notes

- `providers/tools.ts` → deprecated, re-exports `getToolDefinitions()` from capabilities for backward compatibility
- `providers/system-prompt.ts` → deprecated, re-exports from capabilities
- `useAIAgent.ts` executeTool switch → replaced by `capabilities.executeTool()`
- No breaking changes to existing public API (`TasksTimelineApp` props, `useAIAgent` behavior)
- New `capabilities` export is additive
