# Virtualization Design — IntersectionObserver Lazy Sections

**Issue:** #24
**Date:** 2026-02-12
**Status:** Approved

## Problem

When a vault has thousands of tasks, the component library renders all TaskItems upfront, causing poor performance. Hundreds of DaySections each rendering multiple TaskItems creates thousands of DOM nodes.

## Approach: IntersectionObserver Lazy Sections

Use the browser's IntersectionObserver API to only render TaskItems for sections near the viewport. Section headers always render (lightweight). Zero new dependencies.

### Why not @tanstack/virtual or react-virtuoso?

- Thousands of tasks is the rare extreme case, not the norm
- The nested Year → Day → Task hierarchy would need flattening
- Framer Motion animations would be lost or degraded
- IntersectionObserver preserves the existing architecture and all animations

## Design

### New: `useLazyRender` hook

```typescript
// src/hooks/useLazyRender.ts
function useLazyRender(estimatedHeight: number, rootMargin?: string): {
  containerRef: RefObject<HTMLDivElement>;
  contentRef: RefObject<HTMLDivElement>;
  isNearViewport: boolean;
  placeholderHeight: number;
}
```

**Behavior:**
- `isNearViewport` starts `false`; observer fires on mount and sets `true` for sections within range
- `rootMargin` defaults to `"500px 0px"` — sections pre-render 500px before becoming visible
- When a section leaves the viewport, its measured height is cached (prevents scroll jumps)
- Before any measurement, uses `estimatedHeight` (task count × ~52px)

### Component changes

**DaySection** — Add `lazy?: boolean` prop (default `true`):
- When `lazy=true`: wrap task list with `useLazyRender`, render placeholder when off-screen
- When `lazy=false`: render all tasks immediately (used for Today section)
- Section headers, collapse/expand, sticky behavior: untouched

**BacklogSection** — Wrap task list with `useLazyRender`.

**TodoList** — Pass `lazy={false}` to the Today `<DaySection>`.

### What's preserved

- All Framer Motion animations (collapse/expand, add/delete, hover/click)
- Collapsible section state (section component stays mounted, only TaskItems unmount)
- Sticky day headers
- Existing component hierarchy and API

### Edge cases

- **Task count changes while off-screen**: estimated height updates; fresh tasks render on re-entry
- **Rapid scrolling**: 500px rootMargin provides buffer; observer is browser-native (efficient)
- **Collapsed sections**: collapse state preserved (lives in DaySection useState, not in TaskItems)
- **Focus mode**: only Today section visible, no virtualization needed
- **Filter changes**: task list recalculates in TodoList useMemo, DaySections re-render naturally

## Files

| File | Change |
|------|--------|
| `src/hooks/useLazyRender.ts` | **New** — IntersectionObserver hook |
| `src/components/DaySection.tsx` | Add `lazy` prop, wrap task list |
| `src/components/BacklogSection.tsx` | Wrap task list |
| `src/components/TodoList.tsx` | Pass `lazy={false}` to Today section |
| `src/hooks/index.ts` | Export `useLazyRender` |

No changes to TaskItem, YearSection, TasksTimelineApp, types, or contexts.
