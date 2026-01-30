# Story Files Fix Plan

## Summary of Issues

After analyzing all story files and their corresponding component definitions, I've identified the following categories of problems:

### Issue Categories

1. **Missing Context Providers** - Stories that don't wrap components in required contexts
2. **Invalid Props/ArgTypes** - Stories passing props that components don't accept
3. **AppProvider Missing Container** - AppProvider used without required `container` prop

---

## Detailed Analysis

### Components and Their Context Requirements

| Component | Props Interface | Uses Contexts |
|-----------|----------------|---------------|
| TaskItem | `{ task, missingStrategies? }` | TasksContext, SettingsContext, AppContext |
| DaySection | `{ group }` | TasksContext, SettingsContext |
| InputBar | `{}` (empty) | TasksContext, SettingsContext, AppContext |
| DateBadge | `{ task, onUpdate, type, date, label, icon, className, prefix? }` | AppContext |
| TagBadge | `{ tag, task, onUpdate, badgeClass }` | AppContext |
| PriorityPopover | `{ task, onUpdate, badgeClass }` | AppContext |
| CategoryPopover | `{ task, onUpdate, availableCategories, badgeClass }` | AppContext |
| YearSection | `{ group }` | SettingsContext |
| BacklogSection | `{ tasks }` | TasksContext, SettingsContext |
| TodoList | `{}` (empty) | TasksContext, SettingsContext |

---

## Files That Need Fixes

### 1. TaskItem.stories.ts - CRITICAL

**Problems:**
- No context providers (TasksContext, SettingsContext, AppContext)
- Component will crash when trying to use `useTasksContext()`, `useSettingsContext()`, `useAppContext()`

**Fix Required:**
- Add decorator with TasksProvider, SettingsProvider, and AppProvider wrapper
- Reference pattern from `TodoList.stories.tsx`

### 2. DaySection.stories.ts - CRITICAL

**Problems:**
- No context providers (TasksContext, SettingsContext)
- Invalid argTypes: `onUpdateTask`, `onAddTask`, `onAICommand`, `onEditTask`, `onDeleteTask`, `settings`, `isAiMode`, `onVoiceError`, `availableCategories`
- These props are passed via args but DaySectionProps only accepts `{ group }`

**Fix Required:**
- Remove all invalid argTypes
- Add decorator with TasksProvider and SettingsProvider
- Stories should only pass `group` prop

### 3. InputBar.stories.tsx - CRITICAL

**Problems:**
- Uses `DefaultInputBar` wrapper component that doesn't provide any contexts
- Component has empty props interface but uses TasksContext, SettingsContext, AppContext internally
- All settings passed to `DefaultInputBar` are never used because InputBar reads from context

**Fix Required:**
- Add proper decorator with TasksProvider, SettingsProvider, and AppProvider
- Update `DefaultInputBar` wrapper or remove it and use decorator pattern

### 4. DateBadge.stories.tsx - NEEDS FIX

**Problems:**
- `AppProvider` used without required `container` prop
- AppProvider signature: `AppProvider: FC<{ container: HTMLElement | null; children: ReactNode }>`

**Fix Required:**
- Pass `container={null}` to AppProvider (or use a ref to actual container)

### 5. TagBadge.stories.tsx - NEEDS FIX

**Problems:**
- Same as DateBadge - AppProvider missing `container` prop

**Fix Required:**
- Pass `container={null}` to AppProvider

### 6. PriorityPopover.stories.tsx - NEEDS FIX

**Problems:**
- Same as DateBadge - AppProvider missing `container` prop

**Fix Required:**
- Pass `container={null}` to AppProvider

### 7. CategoryPopover.stories.tsx - NEEDS FIX

**Problems:**
- Same as DateBadge - AppProvider missing `container` prop

**Fix Required:**
- Pass `container={null}` to AppProvider

---

## Files That Are Correct (Reference Patterns)

### TodoList.stories.tsx - CORRECT ✓
Good decorator pattern:
```tsx
decorators: [
  (Story, context) => {
    const [tasks, setTasks] = useState<Task[]>(context.args.tasks || []);
    // ... state setup ...

    const tasksContextValue = { /* ... */ };
    const settingsContextValue = { /* ... */ };

    return (
      <TasksProvider value={tasksContextValue}>
        <SettingsProvider value={settingsContextValue}>
          <Story />
        </SettingsProvider>
      </TasksProvider>
    );
  },
],
```

### YearSection.stories.tsx - CORRECT ✓
Same good pattern as TodoList

### BacklogSection.stories.tsx - CORRECT ✓
Same good pattern as TodoList

### TaskEditModal.stories.tsx - CORRECT ✓
Component accepts props directly, doesn't use context

### App.stories.ts - CORRECT ✓
Top-level component sets up its own providers

### SettingsPage.stories.ts - CORRECT ✓
Component accepts props directly

### SettingsModal.stories.ts - CORRECT ✓
Component accepts props directly

---

## Implementation Plan

### Phase 1: Fix AppProvider Container Issue (Quick Fix)
Files: DateBadge.stories.tsx, TagBadge.stories.tsx, PriorityPopover.stories.tsx, CategoryPopover.stories.tsx

Change:
```tsx
<AppProvider>
```
To:
```tsx
<AppProvider container={null}>
```

### Phase 2: Fix DaySection.stories.ts
1. Remove all invalid argTypes (lines 17-23)
2. Add decorator pattern from TodoList.stories.tsx
3. Update args to only pass `group` prop

### Phase 3: Fix TaskItem.stories.ts
1. Add decorator with all three context providers
2. Move handler functions into decorator

### Phase 4: Fix InputBar.stories.tsx
1. Replace current approach with proper decorator pattern
2. Or update DefaultInputBar to include proper context providers

---

## Code Templates for Fixes

### Standard Context Decorator (for TaskItem, DaySection)
```tsx
import { useState } from "react";
import { TasksProvider } from "../../contexts/TasksContext";
import { SettingsProvider } from "../../contexts/SettingsContext";
import { AppProvider } from "../../components/AppContext";
import type { Task, FilterState, SortState } from "../../types";
import { DateTime } from "luxon";
import { settingsBuilder } from "../fixtures";

// In meta:
decorators: [
  (Story, context) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [isAiMode, setIsAiMode] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
      tags: [],
      categories: [],
      priorities: [],
      statuses: [],
      enableScript: false,
      script: "",
    });
    const [sort, setSort] = useState<SortState>({
      field: "dueAt",
      direction: "asc",
      script: "",
    });

    const tasksContextValue = {
      tasks,
      availableCategories: ["Work", "Personal", "Shopping"],
      availableTags: ["work", "personal", "urgent"],
      onUpdateTask: (task: Task) => {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
        console.log("Update task:", task);
      },
      onDeleteTask: (id: string) => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        console.log("Delete task:", id);
      },
      onAddTask: (task: Partial<Task>) => {
        const newTask: Task = {
          id: `task-${Date.now()}`,
          title: task.title || "New Task",
          status: "todo",
          priority: "medium",
          createdAt: DateTime.now().toISO()!,
          ...task,
        } as Task;
        setTasks((prev) => [...prev, newTask]);
        console.log("Add task:", newTask);
      },
      onEditTask: (task: Task) => console.log("Edit task:", task),
      onAICommand: async (input: string) => console.log("AI command:", input),
    };

    const settingsContextValue = {
      settings: context.args.settings || settingsBuilder.default(),
      updateSettings: (s: any) => console.log("Update settings:", s),
      isFocusMode,
      toggleFocusMode: () => setIsFocusMode(!isFocusMode),
      isAiMode,
      toggleAiMode: () => setIsAiMode(!isAiMode),
      filters,
      onFilterChange: setFilters,
      sort,
      onSortChange: setSort,
      onVoiceError: (msg: string) => console.error("Voice error:", msg),
      onOpenSettings: () => console.log("Open settings"),
    };

    return (
      <AppProvider container={null}>
        <TasksProvider value={tasksContextValue}>
          <SettingsProvider value={settingsContextValue}>
            <div className="p-4">
              <Story />
            </div>
          </SettingsProvider>
        </TasksProvider>
      </AppProvider>
    );
  },
],
```

### Simple AppProvider Fix
```tsx
decorators: [
  (Story) => (
    <AppProvider container={null}>
      <div className="p-4 bg-slate-50 min-w-50">
        <Story />
      </div>
    </AppProvider>
  ),
],
```
