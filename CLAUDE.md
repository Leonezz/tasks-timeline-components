# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React component library for task management and timeline visualization, published as `@tasks-timeline/components`. It provides 11+ UI components, custom hooks, and utilities for building task-based applications with AI integration support.

## Common Commands

### Development

```bash
# Install dependencies
pnpm install

# Run Storybook (interactive component documentation)
pnpm storybook

# Type checking
pnpm type-check

# Linting
pnpm lint
```

- Always use pnpm instead of npm

### Building

```bash
# Build the library (generates dist/ with types)
pnpm build:lib

# Build library with type declarations
pnpm build

# Watch mode for type declarations
pnpm dev:lib
```

### Example Application

```bash
# Run the example app (in examples/app/)
pnpm dev:example

# Build the example app
pnpm build:example
```

### Testing

```bash
# Run Storybook tests with Vitest
pnpm test-storybook

# Build Storybook for deployment
pnpm build-storybook
```

## Architecture

### Library Structure

The project is a **dual-purpose repository**:

1. **Component Library** (`src/`) - Published to npm
2. **Example Application** (`examples/app/`) - Demonstrates library usage

### Key Architectural Patterns

#### 1. Shadow DOM Isolation

- Uses `react-shadow` to encapsulate styles via Shadow DOM
- `AppProvider` component wraps the entire app in a shadow root
- Styles are injected inline to prevent global CSS conflicts
- Portal container passed via context for modals/popovers

#### 2. Repository Pattern for Persistence

- Abstract interfaces: `TaskRepository` and `SettingsRepository` (types.ts:129-145)
- Consumers implement their own storage (localStorage, API, etc.)
- Library components are storage-agnostic

#### 3. Date-Based Task Grouping

- Tasks grouped by year → day hierarchy
- Flexible grouping strategies via `DateGroupBy` type
- Supports multiple date fields: `dueAt`, `startAt`, `createdAt`, `completedAt`
- Core logic in `groupTasksByYearAndDate()` (utils/task.ts:110-188)

#### 4. Dynamic Task Status Derivation

- Task status automatically computed from dates
- `deriveTaskStatus()` function (utils/task.ts:68-108) determines:
  - `overdue`: due date in past
  - `due`: due today/tomorrow
  - `scheduled`: start date in future
  - `doing`: start date passed
- Preserves explicit `done`/`cancelled` statuses

#### 5. AI Integration Architecture

Two layers work together:

**Capabilities Layer** (`src/capabilities/`) — Framework-agnostic atomic capabilities:
- `createCapabilities(ctx: CapabilityContext)` factory returns a `Capabilities` registry
- **11 tools**: `create_task`, `query_tasks`, `update_task`, `delete_task`, `complete_task`, `cancel_task`, `batch_update_tasks`, `get_task_stats`, `get_today_plan`, `notify_user`, `ask_user`
- **6 resources**: `tasks://all`, `tasks://{taskId}`, `tasks://overdue`, `tasks://today`, `tasks://upcoming`, `tasks://stats`
- **3 prompts**: `plan_my_day`, `weekly_review`, `task_triage`
- Enhanced system prompt documenting all tools, RRULE recurrence, and `deriveTaskStatus()` logic
- `CapabilityContext` interface injects data access (getTasks, addTask, etc.) and optional UI interaction callbacks (`showToast`, `confirm`, `select`, `prompt`) — pure executors, no React dependency
- All tool executors call `deriveTaskStatus()` after mutations (fixes prior bypass bug)
- Recurring tasks use RRULE format (RFC 5545): `FREQ=DAILY`, `FREQ=WEEKLY;BYDAY=MO,WE,FR`, etc.
- Designed for both built-in `useAIAgent` and external consumers (host app MCP servers)

**Provider Layer** (`src/providers/`) — AI provider implementations:
- **Provider Strategy Pattern** with pluggable `IAIProvider` interface
- Supports 4 provider types: Gemini, OpenAI, Anthropic, and OpenAI-compatible (DeepSeek, Ollama, etc.)
- Gemini provider converts JSON Schema → Gemini `Type` enum internally
- OpenAI and Anthropic SDKs loaded via **dynamic import** (optional peer dependencies)
- Provider factory: `createProvider(type, config)` returns the appropriate `IAIProvider`
- Natural language parsing fallback via `parseTaskString()` (utils/parsing.ts)

**Key files:**
- `src/capabilities/types.ts` — `CapabilityContext`, `ToolSpec`, `ResourceSpec`, `PromptSpec`, `Capabilities`
- `src/capabilities/registry.ts` — `createCapabilities()` factory assembling all capabilities
- `src/capabilities/tools/` — 11 tool executors (one file each)
- `src/capabilities/resources/` — 6 resource handlers
- `src/capabilities/prompts/` — 3 prompt templates
- `src/capabilities/system-prompt.ts` — Enhanced system prompt (single source of truth)
- `src/capabilities/index.ts` — Barrel exports
- `src/providers/types.ts` — `IAIProvider` interface, `ToolDefinition`, `ToolCall`, `ToolResult`
- `src/providers/tools.ts` — Legacy 4-tool definitions (kept for backward compat)
- `src/providers/gemini-provider.ts` — Gemini implementation (uses `@google/genai`)
- `src/providers/openai-provider.ts` — OpenAI implementation (also serves `openai-compatible`)
- `src/providers/anthropic-provider.ts` — Anthropic implementation
- `src/providers/index.ts` — Factory, barrel exports, `testProvider()` utility

### Component Organization

```
src/
├── capabilities/              # AI capabilities layer (framework-agnostic)
│   ├── types.ts               # CapabilityContext, ToolSpec, ResourceSpec, PromptSpec, Capabilities
│   ├── registry.ts            # createCapabilities() factory
│   ├── system-prompt.ts       # Enhanced system prompt (single source of truth)
│   ├── index.ts               # Barrel exports
│   ├── tools/                 # 11 tool executors
│   │   ├── create-task.ts
│   │   ├── query-tasks.ts
│   │   ├── update-task.ts
│   │   ├── delete-task.ts
│   │   ├── complete-task.ts
│   │   ├── cancel-task.ts
│   │   ├── batch-update-tasks.ts
│   │   ├── get-task-stats.ts
│   │   ├── get-today-plan.ts
│   │   ├── notify-user.ts
│   │   └── ask-user.ts
│   ├── resources/             # 6 resource handlers
│   │   ├── all-tasks.ts
│   │   ├── task-by-id.ts
│   │   ├── filtered-tasks.ts  # overdue, today, upcoming
│   │   └── stats.ts
│   ├── prompts/               # 3 prompt templates
│   │   ├── plan-my-day.ts
│   │   ├── weekly-review.ts
│   │   └── task-triage.ts
│   └── __tests__/             # 135 unit tests
├── components/
│   ├── TodoList.tsx           # Main container with grouping logic
│   ├── TaskItem.tsx           # Individual task display
│   ├── InputBar.tsx           # Task creation with AI support
│   ├── TaskEditModal.tsx      # Full task editor
│   ├── DaySection.tsx         # Day-grouped tasks
│   ├── YearSection.tsx        # Year-grouped tasks
│   ├── BacklogSection.tsx     # Unscheduled tasks
│   ├── Toast.tsx              # Rich toast with interactions (dismiss/confirm/select/prompt)
│   ├── settings/              # Settings UI components
│   └── AppContext.tsx         # Shadow DOM context provider
├── hooks/
│   ├── useTaskFiltering.ts    # Filter/search logic
│   ├── useTaskStats.ts        # Statistics calculation
│   ├── useAIAgent.ts          # AI agent orchestrator (uses capabilities layer)
│   └── useDateHelpers.ts      # Timezone-safe date utilities hook
├── providers/                 # AI provider implementations
│   ├── types.ts               # IAIProvider interface, ToolDefinition, ToolCall
│   ├── tools.ts               # Legacy tool definitions (backward compat)
│   ├── system-prompt.ts       # Re-exports from capabilities/system-prompt
│   ├── gemini-provider.ts     # Gemini implementation (@google/genai)
│   ├── openai-provider.ts     # OpenAI implementation (also openai-compatible)
│   ├── anthropic-provider.ts  # Anthropic implementation (@anthropic-ai/sdk)
│   └── index.ts               # Factory (createProvider), testProvider, exports
├── utils/                     # Core utilities
│   ├── task.ts                # deriveTaskStatus, groupTasksByYearAndDate
│   ├── parsing.ts             # parseTaskString
│   ├── date.ts                # Date formatting utilities
│   ├── date-helpers.ts        # Timezone-safe date operations
│   ├── voice-providers.ts     # Voice input provider implementations
│   └── cn.ts                  # Tailwind class merge utility
├── lib/utils.ts               # Shadcn re-export
├── types.ts                   # All TypeScript definitions
├── TasksTimelineApp.tsx       # Main app component
└── index.ts                   # Library entry point
```

### Type System

Key types defined in `types.ts`:

- `Task`: Core task model with dates, priority, status, tags
- `AppSettings`: Application configuration including AI config
- `FilterState` & `SortState`: Task filtering/sorting state
- `TaskRepository` & `SettingsRepository`: Persistence interfaces
- `ToastMessage` & `ToastInteraction`: Rich toast with dismiss/confirm/select/prompt interactions
- `DetailBlock`: Expandable detail blocks (text, task-list, stats, key-value)

### Styling

- **Tailwind CSS v4** via `@tailwindcss/vite` plugin
- **Radix UI** for accessible primitives (Popover, Collapsible, Portal)
- **Shadcn UI** components (configured via components.json)
- **Framer Motion** for animations
- Utility function `cn()` in `utils/cn.ts` combines `clsx` + `tailwind-merge`

### Date Handling

- **Luxon** for all date operations (not date-fns or moment)
- ISO 8601 strings (`YYYY-MM-DD` or full ISO) throughout
- Relative date formatting: "Today", "Tomorrow", "Yesterday"
- Smart date display based on `useRelativeDates` setting

## Important Implementation Details

### Task Status Logic

When modifying task status code, understand that status is **derived** from dates, not just stored:

- Changing `dueAt` can automatically change status to `overdue`/`due`
- Setting `startAt` triggers `scheduled`/`doing` status
- Only `done` and `cancelled` are "terminal" states

### AI Capabilities Layer

The library exposes atomic AI capabilities via a unified registry:

```typescript
import { createCapabilities } from '@tasks-timeline/components/capabilities';
import type { CapabilityContext } from '@tasks-timeline/components/capabilities';

const ctx: CapabilityContext = {
  getTasks: () => loadTasks(),
  getTask: (id) => findTask(id),
  addTask: (task) => saveTask(task),
  updateTask: (task) => updateTask(task),
  deleteTask: (id) => removeTask(id),
};

const capabilities = createCapabilities(ctx);
// capabilities.tools — 11 ToolSpec[] (name, description, schema, execute)
// capabilities.resources — 6 ResourceSpec[] (name, uri, read)
// capabilities.prompts — 3 PromptSpec[] (name, description, render)
// capabilities.executeTool(name, args) — dispatch by name
// capabilities.getSystemPrompt() — enhanced system prompt
```

**11 Tools:** `create_task`, `query_tasks`, `update_task`, `delete_task`, `complete_task`, `cancel_task`, `batch_update_tasks`, `get_task_stats`, `get_today_plan`, `notify_user`, `ask_user`

**6 Resources:** `tasks://all`, `tasks://{taskId}`, `tasks://overdue`, `tasks://today`, `tasks://upcoming`, `tasks://stats`

**3 Prompts:** `plan_my_day` (optional `focusArea`), `weekly_review` (optional `weekStart`), `task_triage`

**Recurring tasks** use RRULE format (RFC 5545): `FREQ=DAILY`, `FREQ=WEEKLY;BYDAY=MO,WE,FR`, `FREQ=MONTHLY;BYMONTHDAY=1`. Completing a recurring task via `complete_task` marks the current instance done and creates the next occurrence.

All tool executors call `deriveTaskStatus()` after mutations. The built-in `useAIAgent` hook consumes this layer internally. External consumers (e.g., host app MCP servers) can wire the same capabilities to any transport.

Legacy `getToolDefinitions()` in `src/providers/tools.ts` is kept for backward compatibility but only has the original 4 tools. Prefer the capabilities layer for new integrations.

### Voice Input System

The library provides pluggable voice input with multiple provider support:

**Available Providers:**
- **Browser** - Web Speech API (free, limited accuracy, network-dependent)
- **OpenAI** - Whisper API (paid, highly accurate, requires API key)
- **Gemini** - Google speech-to-text (paid, accurate, requires API key)

**Configuration Structure:**
```typescript
voiceConfig: {
  enabled: boolean;
  activeProvider: "browser" | "openai" | "gemini";
  language: string; // Empty for system default
  providers: {
    browser: {};
    openai: { apiKey, baseUrl, model };
    gemini: { apiKey, model };
  };
}
```

**Key Implementation Files:**
- `src/utils/voice-providers.ts` - Provider implementations (BrowserVoiceProvider, OpenAIWhisperProvider, GeminiSpeechProvider)
- `src/hooks/useVoiceInput.ts` - React hook for voice input
- `src/components/settings/SettingsPageAdvanced.tsx` - Settings UI with provider selection

**Provider Interface:**
All providers implement `IVoiceProvider` with methods: `start()`, `isAvailable()`, `getName()`

See `docs/VOICE_INPUT.md` for detailed documentation.

### AI-User Interaction Tools

Two capability tools allow the AI agent to proactively communicate with users:

**`notify_user`** — Fire-and-forget rich toast notification:
- Schema: `{ variant, title, description?, body?, timeout? }`
- Calls `ctx.showToast?.()`, returns `{ success: true }`
- Default timeout 8000ms, `null` for persistent

**`ask_user`** — Blocking question with three modes:
- **Free text**: `{ question }` → renders prompt input, returns `{ question, answer: "text" }`
- **Select**: `{ question, options: [{label, value}] }` → renders option list, returns `{ question, answer: "value" }`
- **Confirm**: `{ question, confirm: true }` → renders Yes/No buttons, returns `{ question, answer: "yes"|"no" }`
- All modes echo the question back in the return value (industry standard pattern)
- Returns `{ question, answer: null, error }` when UI callbacks not available

**Key files:**
- `src/capabilities/tools/notify-user.ts` — notify_user tool executor
- `src/capabilities/tools/ask-user.ts` — ask_user tool executor
- `src/capabilities/__tests__/tools/notify-user.test.ts` — 4 tests
- `src/capabilities/__tests__/tools/ask-user.test.ts` — 10 tests

### Enriched Toast System

The toast system supports rich content and interactive modes (from PR #34):

**Toast Interactions** (`ToastInteraction` union in `types.ts`):
- `dismiss` — Simple dismissable toast
- `confirm` — Yes/No buttons with optional custom labels
- `select` — Clickable option list with cancel
- `prompt` — Text input field with Submit/Cancel

**Toast Content:**
- `title` + optional `description` + optional `body` (longer text)
- Optional `detail: DetailBlock[]` — expandable rich content blocks:
  - `text` — Formatted text paragraph
  - `task-list` — List of tasks with status/priority
  - `stats` — Task statistics (by status, by priority)
  - `key-value` — Key-value pairs table

**Key files:**
- `src/components/Toast.tsx` — Toast component with all interaction modes
- `src/types.ts` — `ToastMessage`, `ToastInteraction`, `DetailBlock` types
- `src/TasksTimelineApp.tsx` — `promptToast()`, `confirmToast()`, `selectToast()` Promise-based helpers

### Shadow DOM Considerations

- Modals/popovers need `portalContainer` from `useAppContext()`
- Global styles won't affect components (by design)
- Event bubbling works differently across shadow boundaries

### Workspace Structure

This is a pnpm workspace with `examples/app` as a sub-package:

- Changes to library require rebuild to reflect in example app
- Example app imports from parent via workspace protocol

## Build Output

The library exports multiple entry points (package.json exports):

- `.` - Main entry (all exports)
- `./components` - Components only
- `./hooks` - Hooks only
- `./types` - Types only
- `./capabilities` - AI capabilities layer (`createCapabilities`, types, `getSystemPrompt`)
- `./index.css` - Styles

Build generates:

- `dist/index.js` (ESM)
- `dist/index.umd.cjs` (UMD)
- `dist/index.d.ts` (TypeScript declarations)
- `dist/index.css` (Bundled styles)

## Testing Strategy

- **Storybook** for component documentation and visual testing
- **Vitest** with Playwright for browser-based tests
- Stories in `src/stories/` serve as both docs and tests
- **Unit tests** for capabilities layer: 135 tests in `src/capabilities/__tests__/` (run via `pnpm test`)
- Run capabilities tests only: `pnpm vitest run src/capabilities/`

## Timezone-Safe Date Handling (CRITICAL)

**Always use the centralized date helpers** to prevent timezone conversion bugs:

### ✅ Correct Patterns

```typescript
// For getting today's date (YYYY-MM-DD)
import { getTodayISO } from './utils/date-helpers';
const today = getTodayISO(); // "2026-01-31" (local date)

// For current datetime with timezone
import { getNowISO } from './utils/date-helpers';
const now = getNowISO(); // "2026-01-31T10:30:00.000-08:00"

// In React components
import { useDateHelpers } from './hooks/useDateHelpers';
const { today, tomorrow, isToday } = useDateHelpers();
```

### ❌ Forbidden Patterns

**These patterns cause timezone bugs and are blocked by ESLint:**

```typescript
// ❌ WRONG - Returns UTC date, not local date
const today = new Date().toISOString().split("T")[0];

// ❌ WRONG - Same issue
const today = Date().toISOString().split("T")[0];
```

### Why This Matters

In timezone GMT+8 at 4pm on Jan 30:
- ❌ `new Date().toISOString().split("T")[0]` → `"2026-01-31"` (wrong! UTC is tomorrow)
- ✅ `getTodayISO()` → `"2026-01-30"` (correct! local date)

### Available Utilities

**From `utils/date-helpers`:**
- `getTodayISO()` - Today's date (YYYY-MM-DD)
- `getNowISO()` - Current datetime with timezone
- `getTomorrowISO()` - Tomorrow's date
- `getYesterdayISO()` - Yesterday's date
- `dateToISODate(date)` - Convert Date to YYYY-MM-DD
- `dateToISO(date)` - Convert Date to full ISO
- `getDaysFromNowISO(n)` - Date N days from now
- `isToday(dateStr)` - Check if date is today
- `isSameDay(date1, date2)` - Compare two dates
- `generateTimestampId(prefix)` - Generate unique ID

**From `hooks/useDateHelpers`:**
- Hook returning `{ today, tomorrow, yesterday, isToday, daysFromNow }`

### ESLint Protection

The project includes **custom ESLint rules** that automatically prevent timezone bugs:

**Configuration:** `eslint.config.js` uses `no-restricted-syntax` to block dangerous patterns

**Blocked patterns:**
1. `new Date().toISOString().split("T")[0]` - Returns UTC date instead of local
2. `Date().toISOString().split("T")[0]` - Same issue without `new` keyword

**Error message when detected:**
```
❌ TIMEZONE BUG: new Date().toISOString().split("T")[0] returns UTC date,
   not local date. Use getTodayISO() from utils/date-helpers instead.
```

**How it works:**
The ESLint rule uses AST (Abstract Syntax Tree) selectors to identify the exact
pattern of chaining `.toISOString()` and `.split()` calls on `Date()` constructors.
This prevents accidental timezone conversion bugs from being committed.

**For contributors:**
If you see this error, simply replace the pattern with the appropriate helper:
- `getTodayISO()` for today's date
- `getNowISO()` for current timestamp
- See "Available Utilities" section above for full list

## Plans & Progresses & Other Intermediate Files

- Write plans, progresses and other intermediate files in the `./claude/` folder under the project folder, instead of the global `~/.claude/` folder.
- MUST update documents after making code changes that need to be ducumented.
- MUST update test suits and storybook stories after components are changed
- Always run `pnpm run lint` and `pnpm run type-check` to check and fix errors, after that, run `pnpm run format` to auto format code

## Documents
- shadcn: https://ui.shadcn.com/llms.txt
