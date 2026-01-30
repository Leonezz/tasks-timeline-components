# Architecture & Design Patterns

## Key Architectural Patterns

### 1. Shadow DOM Isolation
- Uses `react-shadow` to encapsulate styles via Shadow DOM
- `AppProvider` component wraps entire app in shadow root
- Styles injected inline to prevent global CSS conflicts
- Portal container passed via context for modals/popovers
- Tailwind config uses `important: '#tasks-timeline-app'` selector

### 2. Repository Pattern for Persistence
- Abstract interfaces: `TaskRepository` and `SettingsRepository`
- Consumers implement their own storage (localStorage, API, etc.)
- Library components are storage-agnostic
- Enables flexible backend integration

### 3. Date-Based Task Grouping
- Tasks grouped by year → day hierarchy
- Flexible grouping strategies via `DateGroupBy` type
- Supports multiple date fields: `dueAt`, `startAt`, `createdAt`, `completedAt`
- Core logic in `groupTasksByYearAndDate()` utility

### 4. Dynamic Task Status Derivation
- Task status automatically computed from dates
- `deriveTaskStatus()` function determines:
  - `overdue`: due date in past
  - `due`: due today/tomorrow
  - `scheduled`: start date in future
  - `doing`: start date passed
- Preserves explicit `done`/`cancelled` statuses

### 5. AI Integration Architecture
- Multi-provider support: Gemini, OpenAI, Anthropic
- Function calling via Gemini SDK for task operations
- Tool definitions in `getToolDefinitions()` utility
- Natural language parsing fallback via `parseTaskString()`

## Component Hierarchy
```
AppProvider (Shadow DOM root)
├── TasksContext (task state)
├── SettingsContext (app settings)
├── TodoList (main container)
│   ├── YearSection
│   │   └── DaySection
│   │       └── TaskItem
│   ├── BacklogSection
│   └── InputBar (with AI support)
├── TaskEditModal
├── SettingsModal
└── HelpModal
```

## State Management
- **React Context API** for global state
- **TasksContext**: Task list and operations
- **SettingsContext**: App configuration and preferences
- No Redux/Zustand (kept simple for library)

## Type System
Key types in `types.ts`:
- `Task`: Core task model with dates, priority, status, tags
- `AppSettings`: Application configuration
- `FilterState` & `SortState`: Task filtering/sorting
- `TaskRepository` & `SettingsRepository`: Persistence interfaces

## Testing Strategy
- **Storybook**: Component documentation and visual testing
- **Vitest**: Unit and integration tests
- **Playwright**: Browser-based testing
- Stories serve as both docs and tests
- No separate unit test files (tests via Storybook addon)
