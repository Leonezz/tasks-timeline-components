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

- Multi-provider support: Gemini, OpenAI, Anthropic
- Function calling via Gemini SDK for task operations
- Tool definitions in `getToolDefinitions()` (utils/ai-tools.ts:4-116)
- Natural language parsing fallback via `parseTaskString()` (utils/parsing.ts)

### Component Organization

```
src/
├── components/
│   ├── TodoList.tsx          # Main container with grouping logic
│   ├── TaskItem.tsx          # Individual task display
│   ├── InputBar.tsx          # Task creation with AI support
│   ├── TaskEditModal.tsx     # Full task editor
│   ├── DaySection.tsx        # Day-grouped tasks
│   ├── YearSection.tsx       # Year-grouped tasks
│   ├── BacklogSection.tsx    # Unscheduled tasks
│   ├── settings/             # Settings UI components
│   └── AppContext.tsx        # Shadow DOM context provider
├── hooks/
│   ├── useTaskFiltering.ts   # Filter/search logic
│   ├── useTaskStats.ts       # Statistics calculation
│   └── useAIAgent.ts         # AI provider integration
├── utils/                    # Core utilities (refactored)
│   ├── task.ts               # deriveTaskStatus, groupTasksByYearAndDate
│   ├── ai-tools.ts           # getToolDefinitions
│   ├── parsing.ts            # parseTaskString
│   ├── date.ts               # Date formatting utilities
│   └── cn.ts                 # Tailwind class merge utility
├── lib/utils.ts              # Shadcn re-export
├── types.ts                  # All TypeScript definitions
├── TasksTimelineApp.tsx      # Main app component
└── index.ts                  # Library entry point
```

### Type System

Key types defined in `types.ts`:

- `Task`: Core task model with dates, priority, status, tags
- `AppSettings`: Application configuration including AI config
- `FilterState` & `SortState`: Task filtering/sorting state
- `TaskRepository` & `SettingsRepository`: Persistence interfaces

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

### AI Function Calling

The library uses Gemini's function calling API:

- Tool definitions must match the schema in `getToolDefinitions()`
- Parameters use `@google/genai` Type enum (not plain strings)
- Fallback to regex-based parsing if AI unavailable

### Shadow DOM Considerations

- Modals/popovers need `portalContainer` from `useAppContext()`
- Global styles won't affect components (by design)
- Event bubbling works differently across shadow boundaries

### Workspace Structure

This is a pnpm workspace with `examples/app` as a sub-package:

- Changes to library require rebuild to reflect in example app
- Example app imports from parent via workspace protocol

## Build Output

The library exports multiple entry points (package.json:13-34):

- `.` - Main entry (all exports)
- `./components` - Components only
- `./hooks` - Hooks only
- `./types` - Types only
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
- No separate unit test files (tests via Storybook addon)

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

The ESLint config automatically catches dangerous patterns:
```
❌ TIMEZONE BUG: new Date().toISOString().split("T")[0] returns UTC date,
   not local date. Use getTodayISO() from utils/date-helpers instead.
```

## Plans & Progresses & Other Intermediate Files

- Write plans, progresses and other intermediate files in the `./claude/` folder under the project folder, instead of the global `~/.claude/` folder.
- MUST update documents after making code changes that need to be ducumented.
- MUST update test suits and storybook stories after components are changed
- Always run `pnpm run lint` and `pnpm run type-check` to check and fix errors, after that, run `pnpm run format` to auto format code

## Documents
- shadcn: https://ui.shadcn.com/llms.txt
