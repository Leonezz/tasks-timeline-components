# Enriched Toasts Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the toast system into an interactive AI communication channel with structured content, expandable details, and blocking user interactions (confirm/select).

**Architecture:** Replace the simple `ToastMessage` type with a richer model supporting 4 variants, 3 interaction modes (dismiss/confirm/select), and typed detail blocks (text/task-list/stats/key-value). Extend `CapabilityContext` with `showToast()`, `confirm()`, and `select()` methods that use Promise-based resolvers to block tool execution. The Toast component handles both compact and expanded states with Framer Motion animations.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v4, Framer Motion, Vitest

---

### Task 1: Define New Toast Types

**Files:**
- Modify: `src/types.ts`
- Modify: `src/components/Toast.tsx` (update exports only)

**Step 1: Add new types to `src/types.ts`**

Add at end of file before the repository interfaces (before line 181):

```typescript
// --- Enriched Toast Types ---

export type ToastVariant = "success" | "error" | "info" | "warning";

export type DetailBlock =
  | { type: "text"; content: string }
  | { type: "task-list"; tasks: Task[]; label?: string }
  | {
      type: "stats";
      data: {
        total: number;
        byStatus: Record<string, number>;
        byPriority: Record<string, number>;
      };
    }
  | { type: "key-value"; entries: { key: string; value: string }[] };

export type ToastInteraction =
  | { kind: "dismiss" }
  | {
      kind: "confirm";
      onConfirm: () => void;
      onCancel?: () => void;
      confirmLabel?: string;
      cancelLabel?: string;
    }
  | {
      kind: "select";
      options: { label: string; value: string }[];
      onSelect: (value: string) => void;
      onCancel?: () => void;
    };

export interface ToastMessage {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  body?: string;
  detail?: DetailBlock[];
  interaction: ToastInteraction;
  timeout: number | null;
}
```

**Step 2: Remove old `ToastType` and `ToastMessage` from `src/components/Toast.tsx`**

Remove lines 6-13 (`ToastType`, `ToastMessage` type and interface). Update `Toast.tsx` to import from `src/types.ts` instead. Also update `src/components/index.ts` to re-export from types.

**Step 3: Update all imports of `ToastType` and `ToastMessage`**

Files that import from `Toast.tsx`:
- `src/TasksTimelineApp.tsx:8` — change to import from `../types`
- `src/components/index.ts:23-24` — re-export from `../types`
- `src/stories/UI/Toast.stories.ts:2-3` — change to import from `../../types`

**Step 4: Run type check**

Run: `pnpm type-check`
Expected: FAIL (Toast component not yet updated to use new interface)

**Step 5: Commit**

```bash
git add src/types.ts
git commit -m "feat(toast): add enriched toast type system with variants, interactions, and detail blocks"
```

---

### Task 2: Rewrite Toast Component

**Files:**
- Modify: `src/components/Toast.tsx`

**Step 1: Rewrite Toast component**

The new Toast component must handle:
- 4 variants: success (emerald), error (rose), info (blue), warning (amber)
- `body` field rendered as text below description
- Interaction buttons: confirm (Yes/No), select (option list)
- Expanded state for `detail` blocks (toggle with "Show details" link)
- Auto-dismiss via `timeout` (null = no auto-dismiss)
- Expand animation: grows upward-left from compact position

```typescript
import React, { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { cn } from "../utils";
import { MotionDiv } from "./Motion";
import { AnimatePresence } from "framer-motion";
import type { ToastMessage, ToastVariant } from "../types";

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  toast,
  onDismiss,
  isExpanded,
  onToggleExpand,
}) => {
  // Auto-dismiss based on timeout
  useEffect(() => {
    if (toast.timeout === null) return;
    const timer = setTimeout(() => onDismiss(toast.id), toast.timeout);
    return () => clearTimeout(timer);
  }, [toast.id, toast.timeout, onDismiss]);

  // ... variant styling (success/error/info/warning)
  // ... icon mapping (CheckCircle2/AlertCircle/Info/AlertTriangle)
  // ... render: header, body, interaction buttons, expandable detail area
};
```

Key implementation details:
- Keep existing styling pattern (getStyles/getIcon/getIconColor) but add `warning` variant with amber colors
- `interaction.kind === "confirm"` renders two buttons below body
- `interaction.kind === "select"` renders a vertical list of option buttons
- `detail` presence adds a "Show details ▼" / "Collapse ▲" toggle
- Expanded state uses Framer Motion `layout` + `animate` for smooth resize
- Expanded max dimensions: `max-w-[350px] max-h-[60vh] overflow-y-auto`
- When expanded, align to bottom-right (origin point stays fixed)

**Step 2: Run type check**

Run: `pnpm type-check`
Expected: FAIL (TasksTimelineApp still using old props)

**Step 3: Commit**

```bash
git add src/components/Toast.tsx
git commit -m "feat(toast): rewrite Toast component with variants, interactions, and expandable detail"
```

---

### Task 3: Create Detail Block Components

**Files:**
- Create: `src/components/toast/DetailBlockText.tsx`
- Create: `src/components/toast/DetailBlockTaskList.tsx`
- Create: `src/components/toast/DetailBlockStats.tsx`
- Create: `src/components/toast/DetailBlockKeyValue.tsx`
- Create: `src/components/toast/index.ts`

**Step 1: Create detail block components**

Each is a small focused component:

`DetailBlockText.tsx`:
```typescript
import React from "react";

export const DetailBlockText: React.FC<{ content: string }> = ({ content }) => (
  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
    {content}
  </p>
);
```

`DetailBlockTaskList.tsx`:
```typescript
import React from "react";
import type { Task } from "../../types";
import { Icon } from "../Icon";

// Render compact task cards with: title, priority badge, status dot, due date
// Use existing color conventions from the codebase (emerald=done, rose=overdue, etc.)
```

`DetailBlockStats.tsx`:
```typescript
import React from "react";

// Render: total count, horizontal bar segments for status distribution,
// priority breakdown as small colored badges
```

`DetailBlockKeyValue.tsx`:
```typescript
import React from "react";

// Simple two-column grid: key (label) on left, value on right
```

`index.ts`:
```typescript
export { DetailBlockText } from "./DetailBlockText";
export { DetailBlockTaskList } from "./DetailBlockTaskList";
export { DetailBlockStats } from "./DetailBlockStats";
export { DetailBlockKeyValue } from "./DetailBlockKeyValue";
```

**Step 2: Import detail blocks in Toast component**

Update `src/components/Toast.tsx` to import and render detail blocks in the expanded area based on `block.type`.

**Step 3: Run type check**

Run: `pnpm type-check`
Expected: PASS (components are self-contained)

**Step 4: Commit**

```bash
git add src/components/toast/
git commit -m "feat(toast): add detail block components for text, task-list, stats, and key-value"
```

---

### Task 4: Update TasksTimelineApp Toast State Management

**Files:**
- Modify: `src/TasksTimelineApp.tsx`

**Step 1: Update toast state and helpers**

Replace the current `addNotification` / `removeNotification` with:

```typescript
// State
const [toasts, setToasts] = useState<ToastMessage[]>([]);
const [expandedToastId, setExpandedToastId] = useState<string | null>(null);
const toastResolversRef = useRef<Map<string, { resolve: (v: unknown) => void }>>(new Map());

// Add a toast (generic)
const addToast = (toast: Omit<ToastMessage, "id">) => {
  const id = Math.random().toString(36).slice(2, 11);
  setToasts((prev) => [...prev, { ...toast, id }]);
  return id;
};

// Simple notification (backward compat wrapper)
const addNotification = (
  type: ToastVariant,
  title: string,
  description?: string,
) => {
  addToast({
    variant: type,
    title,
    description,
    interaction: { kind: "dismiss" },
    timeout: 4000,
  });
};

// Show rich toast (fire-and-forget)
const showToast = (toast: Omit<ToastMessage, "id">) => {
  addToast(toast);
};

// Confirm (blocking, returns Promise<boolean>)
const confirmToast = (title: string, description?: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const id = addToast({
      variant: "info",
      title,
      description,
      interaction: {
        kind: "confirm",
        onConfirm: () => { resolve(true); removeToast(id); },
        onCancel: () => { resolve(false); removeToast(id); },
      },
      timeout: null,
    });
    toastResolversRef.current.set(id, { resolve });
  });
};

// Select (blocking, returns Promise<string | null>)
const selectToast = (
  title: string,
  options: { label: string; value: string }[],
): Promise<string | null> => {
  return new Promise((resolve) => {
    const id = addToast({
      variant: "info",
      title,
      interaction: {
        kind: "select",
        options,
        onSelect: (value) => { resolve(value); removeToast(id); },
        onCancel: () => { resolve(null); removeToast(id); },
      },
      timeout: null,
    });
    toastResolversRef.current.set(id, { resolve });
  });
};

// Remove toast (also cleans up any pending resolver)
const removeToast = (id: string) => {
  setToasts((prev) => prev.filter((t) => t.id !== id));
  const resolver = toastResolversRef.current.get(id);
  if (resolver) {
    resolver.resolve(false); // default resolve if dismissed without action
    toastResolversRef.current.delete(id);
  }
  if (expandedToastId === id) setExpandedToastId(null);
};

// Toggle expand
const toggleExpandToast = (id: string) => {
  setExpandedToastId((prev) => (prev === id ? null : id));
};
```

**Step 2: Update Toast rendering**

Replace the toast rendering section to pass new props:

```tsx
<div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse gap-2 pointer-events-none">
  <AnimatePresence>
    {toasts.map((toast) => (
      <Toast
        key={toast.id}
        toast={toast}
        onDismiss={removeToast}
        isExpanded={expandedToastId === toast.id}
        onToggleExpand={toggleExpandToast}
      />
    ))}
  </AnimatePresence>
</div>
```

Note: `flex-col-reverse` so newest toasts appear at bottom (closest to origin point).

**Step 3: Update all `addNotification` call sites**

The `addNotification` wrapper maintains backward compatibility, so existing calls (`addNotification("error", "Update Failed", ...)`) continue to work unchanged. No changes needed at call sites.

**Step 4: Run type check**

Run: `pnpm type-check`
Expected: PASS

**Step 5: Commit**

```bash
git add src/TasksTimelineApp.tsx
git commit -m "feat(toast): update TasksTimelineApp with rich toast state, Promise resolvers, and expand toggle"
```

---

### Task 5: Extend CapabilityContext

**Files:**
- Modify: `src/capabilities/types.ts`
- Modify: `src/hooks/useAIAgent.ts`
- Modify: `src/TasksTimelineApp.tsx` (wire new callbacks)

**Step 1: Add new methods to CapabilityContext**

In `src/capabilities/types.ts`, extend the interface:

```typescript
export interface CapabilityContext {
  // ... existing methods ...
  notify?(type: "success" | "error" | "info" | "warning", message: string): void;
  showToast?(toast: {
    variant: "success" | "error" | "info" | "warning";
    title: string;
    description?: string;
    body?: string;
    detail?: import("../types").DetailBlock[];
    timeout?: number | null;
  }): void;
  confirm?(title: string, description?: string): Promise<boolean>;
  select?(
    title: string,
    options: { label: string; value: string }[],
  ): Promise<string | null>;
}
```

**Step 2: Update useAIAgent to accept and wire new callbacks**

Add `onShowToast`, `onConfirm`, `onSelect` parameters to `useAIAgent` and wire them into the `ctx` object:

```typescript
export const useAIAgent = (
  tasks: Task[],
  onTaskAdded: ...,
  onTaskUpdated: ...,
  onTaskDeleted: ...,
  settings: AppSettings,
  _onManualAdd: ...,
  onNotify: (type: "success" | "error" | "info" | "warning", title: string, desc?: string) => void,
  onTokenUsageUpdate?: ...,
  aiSystemPrompt?: string,
  onShowToast?: (toast: Omit<ToastMessage, "id">) => void,
  onConfirm?: (title: string, description?: string) => Promise<boolean>,
  onSelect?: (title: string, options: { label: string; value: string }[]) => Promise<string | null>,
) => {
  // ... existing code ...

  const ctx: CapabilityContext = {
    // ... existing bindings ...
    showToast: onShowToast ? (toast) => onShowToast({ ...toast, interaction: { kind: "dismiss" }, timeout: toast.timeout ?? 8000 }) : undefined,
    confirm: onConfirm,
    select: onSelect,
  };
};
```

**Step 3: Wire in TasksTimelineApp**

Pass `showToast`, `confirmToast`, `selectToast` to `useAIAgent`.

**Step 4: Run type check**

Run: `pnpm type-check`
Expected: PASS

**Step 5: Commit**

```bash
git add src/capabilities/types.ts src/hooks/useAIAgent.ts src/TasksTimelineApp.tsx
git commit -m "feat(toast): extend CapabilityContext with showToast, confirm, and select methods"
```

---

### Task 6: Update Tools to Use Enriched Toasts

**Files:**
- Modify: `src/capabilities/tools/delete-task.ts`
- Modify: `src/capabilities/tools/query-tasks.ts`
- Modify: `src/capabilities/tools/batch-update-tasks.ts`
- Modify: `src/capabilities/tools/get-task-stats.ts`
- Modify: `src/capabilities/tools/get-today-plan.ts`

**Step 1: `delete-task.ts` — Add confirmation before delete**

```typescript
async execute(args: Record<string, unknown>) {
  const id = args.id as string;
  const existingTask = await ctx.getTask(id);
  if (!existingTask) {
    return { name: "delete_task", result: { success: false, message: `Task not found: ${id}` } };
  }

  // Ask for confirmation
  const confirmed = await ctx.confirm?.(
    `Delete "${existingTask.title}"?`,
    "This action cannot be undone.",
  );
  if (confirmed === false) {
    return { name: "delete_task", result: { success: false, message: "Cancelled by user" } };
  }

  await ctx.deleteTask(id);
  ctx.notify?.("info", `Deleted task: ${existingTask.title}`);
  return { name: "delete_task", result: { success: true, id, title: existingTask.title } };
}
```

**Step 2: `query-tasks.ts` — Show results in toast with task-list detail**

After computing `limited`, add before the return:

```typescript
if (limited.length > 0) {
  ctx.showToast?.({
    variant: "info",
    title: `Found ${limited.length} task${limited.length === 1 ? "" : "s"}`,
    detail: [{ type: "task-list", tasks: limited as unknown as Task[], label: "Search Results" }],
    timeout: 8000,
  });
}
```

Note: `limited` contains `TaskSummary` objects, not full `Task` objects. We need to either:
- Store the full `Task` objects for the detail block (since `DetailBlock` expects `Task[]`)
- Or adjust to keep the filtered `Task[]` alongside summaries

The cleaner approach: keep `filteredTasks` (full Task objects) alongside summaries, pass those to showToast.

**Step 3: `batch-update-tasks.ts` — Add confirmation before batch update**

After computing `filtered` count but before the update loop:

```typescript
if (filtered.length > 0) {
  const confirmed = await ctx.confirm?.(
    `Update ${filtered.length} task${filtered.length === 1 ? "" : "s"}?`,
    `This will apply changes to all matching tasks.`,
  );
  if (confirmed === false) {
    return { name: "batch_update_tasks", result: { success: false, message: "Cancelled by user" } };
  }
}
```

After the update loop, show detail toast with updated tasks:

```typescript
ctx.showToast?.({
  variant: "success",
  title: `Updated ${filtered.length} task${filtered.length === 1 ? "" : "s"}`,
  detail: [{ type: "task-list", tasks: filtered, label: "Updated Tasks" }],
  timeout: 6000,
});
```

**Step 4: `get-task-stats.ts` — Show stats in toast**

After computing stats, add before return:

```typescript
ctx.showToast?.({
  variant: "info",
  title: `Task Statistics`,
  description: `${stats.total} total tasks`,
  detail: [{
    type: "stats",
    data: {
      total: stats.total,
      byStatus: stats.byStatus,
      byPriority: stats.byPriority,
    },
  }],
  timeout: 8000,
});
```

**Step 5: `get-today-plan.ts` — Show plan in toast with task-list blocks**

After computing `plan`, add before return. We need the full Task objects here, so keep `todayFullTasks` and `overdueFullTasks` alongside the summaries:

```typescript
const detailBlocks: DetailBlock[] = [];
if (todayFullTasks.length > 0) {
  detailBlocks.push({ type: "task-list", tasks: todayFullTasks, label: "Today" });
}
if (overdueFullTasks.length > 0) {
  detailBlocks.push({ type: "task-list", tasks: overdueFullTasks, label: "Overdue" });
}
if (detailBlocks.length > 0) {
  ctx.showToast?.({
    variant: todayFullTasks.length > 0 ? "info" : "warning",
    title: `Today's Plan`,
    description: `${plan.todayCount} due today, ${plan.overdueCount} overdue`,
    detail: detailBlocks,
    timeout: 10000,
  });
}
```

**Step 6: Run type check**

Run: `pnpm type-check`
Expected: PASS

**Step 7: Run existing capability tests**

Run: `pnpm vitest run src/capabilities/`
Expected: Some tests may need updates for tools that now call `ctx.confirm?.()` or `ctx.showToast?.()` — the mock contexts in tests don't provide these methods, but since they're optional (`?.`), calls should safely no-op.

**Step 8: Commit**

```bash
git add src/capabilities/tools/delete-task.ts src/capabilities/tools/query-tasks.ts src/capabilities/tools/batch-update-tasks.ts src/capabilities/tools/get-task-stats.ts src/capabilities/tools/get-today-plan.ts
git commit -m "feat(toast): integrate enriched toasts into delete, query, batch-update, stats, and today-plan tools"
```

---

### Task 7: Update Tests

**Files:**
- Modify: `src/capabilities/__tests__/tools/delete-task.test.ts`
- Modify: `src/capabilities/__tests__/tools/batch-update-tasks.test.ts`
- Modify: `src/capabilities/__tests__/tools/query-tasks.test.ts`
- Modify: `src/capabilities/__tests__/tools/get-task-stats.test.ts`
- Modify: `src/capabilities/__tests__/tools/get-today-plan.test.ts`

**Step 1: Add `confirm` and `showToast` mocks to test contexts**

For each test file that tests an updated tool, add to the mock context:

```typescript
const mockConfirm = vi.fn().mockResolvedValue(true);
const mockShowToast = vi.fn();

const ctx: CapabilityContext = {
  // ... existing mocks ...
  confirm: mockConfirm,
  showToast: mockShowToast,
};
```

**Step 2: Add test cases for new behavior**

For `delete-task.test.ts`:
- Test: confirm returns true → task deleted
- Test: confirm returns false → task NOT deleted, result says "Cancelled by user"

For `batch-update-tasks.test.ts`:
- Test: confirm returns true → tasks updated
- Test: confirm returns false → no tasks updated

For `query-tasks.test.ts`:
- Test: showToast called with task-list detail when results found
- Test: showToast NOT called when no results

For `get-task-stats.test.ts`:
- Test: showToast called with stats detail block

For `get-today-plan.test.ts`:
- Test: showToast called with task-list detail blocks

**Step 3: Run tests**

Run: `pnpm vitest run src/capabilities/`
Expected: ALL PASS

**Step 4: Commit**

```bash
git add src/capabilities/__tests__/
git commit -m "test(toast): add tests for enriched toast interactions in tools"
```

---

### Task 8: Update Storybook Stories

**Files:**
- Modify: `src/stories/UI/Toast.stories.ts`

**Step 1: Update existing stories to new `ToastMessage` shape**

Convert all existing stories from `{ id, type, title, description }` to `{ id, variant, title, description, interaction: { kind: "dismiss" }, timeout: 4000 }`.

**Step 2: Add new stories**

Add stories for:
- `Warning` variant
- `WithConfirm` — toast with Yes/No buttons
- `WithSelect` — toast with option buttons
- `WithBody` — toast with body text
- `WithDetail` — toast with detail blocks (expanded state)
- `WithTaskListDetail` — expanded toast showing task cards
- `WithStatsDetail` — expanded toast showing stats
- `Interactive` — confirm toast with play test

**Step 3: Run storybook build**

Run: `pnpm build-storybook`
Expected: PASS

**Step 4: Commit**

```bash
git add src/stories/UI/Toast.stories.ts
git commit -m "feat(toast): update storybook stories for enriched toast variants and interactions"
```

---

### Task 9: Cleanup — Remove Sonner

**Files:**
- Delete: `src/components/ui/sonner.tsx`
- Modify: `package.json` (remove `sonner` dependency if present)

**Step 1: Verify Sonner is unused**

Run: `grep -r "sonner" src/ --include="*.ts" --include="*.tsx" -l`
Should only show `src/components/ui/sonner.tsx`.

**Step 2: Delete the file**

```bash
rm src/components/ui/sonner.tsx
```

**Step 3: Remove from package.json if listed**

Check `pnpm ls sonner` — if it's a dependency, remove it with `pnpm remove sonner`.

**Step 4: Run type check and lint**

Run: `pnpm type-check && pnpm lint`
Expected: PASS

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove unused Sonner toast dependency"
```

---

### Task 10: Final Verification

**Step 1: Full type check**

Run: `pnpm type-check`
Expected: PASS

**Step 2: Full test suite**

Run: `pnpm vitest run src/capabilities/`
Expected: ALL PASS

**Step 3: Lint and format**

Run: `pnpm lint && pnpm format`
Expected: PASS

**Step 4: Build library**

Run: `pnpm build:lib`
Expected: PASS

**Step 5: Build storybook**

Run: `pnpm build-storybook`
Expected: PASS

**Step 6: Commit any formatting fixes**

```bash
git add -A
git commit -m "chore: lint and format enriched toasts implementation"
```
