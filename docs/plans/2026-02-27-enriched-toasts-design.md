# Enriched Toasts Design

**Issue:** #33 — Enrich the toasts  
**Date:** 2026-02-27

## Goal

Transform the toast system from passive notifications into an interactive AI communication channel that supports structured content, user confirmation, and option selection.

## Decisions

- **Blocking interactions**: AI tool execution pauses (via Promise) while waiting for user confirmation/selection
- **Content model**: Typed content blocks (`text`, `task-list`, `stats`, `key-value`) — not markdown
- **Detail expansion**: Toast grows in-place from bottom-right toward top-left (no separate panel/drawer)
- **Interaction types (v1)**: Dismiss, confirm/cancel, and multiple choice selection (no free text input)
- **Trigger scope (v1)**: Only during active AI conversations, no proactive notifications
- **Replaces current toasts**: Single unified toast system for both AI and non-AI notifications
- **No external library**: Custom implementation on top of existing Framer Motion + Tailwind
- **Remove unused Sonner** dependency as cleanup

## Type System

```typescript
type ToastVariant = "success" | "error" | "info" | "warning";

type DetailBlock =
  | { type: "text"; content: string }
  | { type: "task-list"; tasks: Task[]; label?: string }
  | { type: "stats"; data: {
      total: number;
      byStatus: Record<string, number>;
      byPriority: Record<string, number>;
    }}
  | { type: "key-value"; entries: { key: string; value: string }[] };

type ToastInteraction =
  | { kind: "dismiss" }
  | { kind: "confirm";
      onConfirm: () => void;
      onCancel?: () => void;
      confirmLabel?: string;
      cancelLabel?: string }
  | { kind: "select";
      options: { label: string; value: string }[];
      onSelect: (value: string) => void;
      onCancel?: () => void };

interface ToastMessage {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  body?: string;
  detail?: DetailBlock[];
  interaction: ToastInteraction;
  timeout: number | null; // null = persist until user acts
}
```

## Extended CapabilityContext

```typescript
interface CapabilityContext {
  // existing task CRUD methods...
  notify?(type: ToastVariant, message: string): void;
  showToast?(toast: Omit<ToastMessage, "id">): void;
  confirm?(title: string, description?: string): Promise<boolean>;
  select?(title: string, options: { label: string; value: string }[]): Promise<string | null>;
}
```

## Blocking Interaction Flow

1. Tool calls `await ctx.confirm?.("Delete 5 tasks?")`
2. `confirm()` creates a ToastMessage with `interaction: { kind: "confirm" }` and returns a Promise
3. Promise resolver stored in a `Map<toastId, { resolve, reject }>`
4. Toast renders with Yes/No buttons
5. User clicks → resolver fires → Promise resolves → tool execution continues
6. Dismiss without choosing → resolves as `false` / `null`

## Detail Expansion

- Toast starts compact in bottom-right corner
- "Show details" link expands the toast upward and leftward (Framer Motion)
- Max expanded size: ~350px wide, up to ~60% viewport height (scrollable)
- Only one toast expanded at a time
- Click outside or "Collapse" button shrinks back

## Tool Integration

| Tool | Behavior |
|------|----------|
| `create_task` | Simple success toast (unchanged) |
| `update_task` | Simple success toast (unchanged) |
| `delete_task` | `confirm()` before deleting |
| `complete_task` | Simple success toast (unchanged) |
| `cancel_task` | Simple success toast (unchanged) |
| `query_tasks` | `showToast()` with `task-list` detail block |
| `batch_update_tasks` | `confirm()` before executing, `task-list` detail showing updated tasks |
| `get_task_stats` | `showToast()` with `stats` detail block |
| `get_today_plan` | `showToast()` with `task-list` detail blocks (today + overdue) |

## Component Structure

```
Toast (handles compact + expanded states)
├── Header (title, variant icon, close)
├── Body (inline summary text)
├── DetailBlocks (only when expanded)
│   ├── DetailBlockText
│   ├── DetailBlockTaskList
│   ├── DetailBlockStats
│   └── DetailBlockKeyValue
└── InteractionButtons (confirm/select, if applicable)
```

## Files to Change

- `src/components/Toast.tsx` — Rewrite for all variants, interactions, expandable detail
- `src/components/toast/DetailBlockText.tsx` — New
- `src/components/toast/DetailBlockTaskList.tsx` — New
- `src/components/toast/DetailBlockStats.tsx` — New
- `src/components/toast/DetailBlockKeyValue.tsx` — New
- `src/types.ts` — Add new toast types
- `src/capabilities/types.ts` — Extend CapabilityContext
- `src/TasksTimelineApp.tsx` — Wire showToast/confirm/select with Promise resolvers
- `src/hooks/useAIAgent.ts` — Pass new context methods
- `src/capabilities/tools/delete-task.ts` — Add confirm before delete
- `src/capabilities/tools/query-tasks.ts` — Add showToast with task-list
- `src/capabilities/tools/batch-update-tasks.ts` — Add confirm + task-list detail
- `src/capabilities/tools/get-task-stats.ts` — Add showToast with stats
- `src/capabilities/tools/get-today-plan.ts` — Add showToast with task-list
- `src/components/ui/sonner.tsx` — Remove (unused)

## No New Dependencies

Framer Motion (animations), Tailwind (styling), Radix (primitives) are already available.
