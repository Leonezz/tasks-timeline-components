# React Tools & Patterns Analysis for tasks-timeline

**Date:** 2026-01-12
**Purpose:** Evaluate modern React patterns and third-party tools for integration into the tasks-timeline component library

---

## Executive Summary

After analyzing the codebase and researching modern React patterns, I've identified 3 high-priority improvements and 1 medium-priority optimization. Two experimental features should be skipped.

### Quick Recommendations
- ✅ **Implement:** `useDeferredValue` (filter performance)
- ✅ **Implement:** `react-error-boundary` (production reliability)
- ✅ **Review:** shadcn theming docs (validate current implementation)
- ⚠️ **Consider:** `Suspense` + lazy loading (bundle size)
- ❌ **Skip:** React Compiler, `useActionState`, `useEffectEvent`, `useReducer`

---

## Detailed Analysis

### 1. React Concurrency: `useDeferredValue` & `startTransition`

**Status:** ⭐ HIGH PRIORITY - Implement Now

**Current Problem:**
- `useTaskFiltering.ts` (lines 27-120) runs expensive operations on every keystroke
- Filters include: array operations, `expr-eval` script execution, custom sorting
- With 100+ tasks, typing can feel laggy

**Evidence from Codebase:**
```typescript
// src/hooks/useTaskFiltering.ts:27-120
const processedTasks = useMemo(() => {
  let result = [...tasks];

  // 1. Standard filtering (array operations)
  if (filters.tags.length > 0) { ... }
  if (filters.categories.length > 0) { ... }

  // 2. Script evaluation (CPU intensive)
  if (filters.enableScript && filters.script.trim()) {
    const parser = new Parser();
    const expression = parser.parse(filters.script);
    result = result.filter(t => Boolean(expression.evaluate({ task: t })));
  }

  // 3. Complex sorting
  result.sort((a, b) => { ... });

  return result;
}, [tasks, filters, sort]);
```

**Solution:**
Use `useDeferredValue` to defer filter updates while keeping input responsive.

**Implementation Plan:**

#### Step 1: Add to InputBar.tsx
```typescript
// src/components/InputBar.tsx:35
const [value, setValue] = useState("");
const deferredValue = useDeferredValue(value); // NEW: Defer search updates

// Update useEffect or pass deferredValue to filtering logic
useEffect(() => {
  // Trigger filter with deferred value
  onFilterChange({ ...filters, searchTerm: deferredValue });
}, [deferredValue]);
```

#### Step 2: Consider for Filter UI
If filter dropdowns also feel sluggish:
```typescript
// Wrap expensive filter state updates in startTransition
const toggleFilter = (key: keyof FilterState, value: string) => {
  startTransition(() => {
    const currentList = filters[key];
    // ... existing logic
    onFilterChange({ ...filters, [key]: newList });
  });
};
```

**Expected Results:**
- Input field: 60fps, immediate visual feedback
- Task list updates: 100-200ms delay (acceptable)
- No perceived lag when typing

**Testing:**
- Create 500+ mock tasks
- Type rapidly in search field
- Measure input lag vs task list update delay

---

### 2. Error Boundaries: `react-error-boundary`

**Status:** ⭐ HIGH PRIORITY - Implement Now

**Current Problem:**
No error boundaries in app. Failures in these areas crash entire UI:
1. AI operations (network, API limits, malformed responses)
2. Custom script evaluation (`expr-eval` in filters/sorting)
3. Task parsing (`parseTaskString` regex failures)
4. RRule parsing in TaskEditModal

**Evidence from Codebase:**
```typescript
// src/hooks/useTaskFiltering.ts:49-73
if (filters.enableScript && filters.script.trim()) {
  try {
    const parser = new Parser();
    const expression = parser.parse(filters.script);
    result = result.filter((t) => {
      try {
        return Boolean(expression.evaluate({ task: t }));
      } catch (e) {
        logger.error("TaskFiltering", "script execution failed", e);
        return false; // Fails silently, could crash parent
      }
    });
  } catch (e) {
    logger.error("TaskFiltering", "script parsing failed", e);
    // No fallback UI!
  }
}
```

**Solution:**
Install `react-error-boundary` and wrap critical sections.

**Implementation Plan:**

#### Step 1: Install Dependency
```bash
pnpm add react-error-boundary
```

#### Step 2: Create Fallback Components
```typescript
// src/components/ErrorFallback.tsx (NEW FILE)
import React from 'react';
import { Icon } from './Icon';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const TaskListErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => (
  <div className="p-8 text-center space-y-4">
    <div className="text-rose-500">
      <Icon name="AlertTriangle" size={48} className="mx-auto" />
    </div>
    <div>
      <h3 className="font-bold text-lg text-slate-900">Something went wrong</h3>
      <p className="text-sm text-slate-600 mt-2">{error.message}</p>
    </div>
    <button
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
    >
      Try Again
    </button>
  </div>
);

export const AIErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => (
  <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
    <div className="flex items-start gap-3">
      <Icon name="AlertCircle" size={20} className="text-rose-600 mt-0.5" />
      <div className="flex-1">
        <h4 className="font-semibold text-rose-900">AI Command Failed</h4>
        <p className="text-sm text-rose-700 mt-1">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="text-xs text-rose-600 underline mt-2"
        >
          Dismiss
        </button>
      </div>
    </div>
  </div>
);
```

#### Step 3: Wrap Critical Sections in TasksTimelineApp.tsx
```typescript
// src/TasksTimelineApp.tsx
import { ErrorBoundary } from 'react-error-boundary';
import { TaskListErrorFallback, AIErrorFallback } from './components/ErrorFallback';

// Wrap InputBar (AI operations)
<ErrorBoundary
  FallbackComponent={AIErrorFallback}
  onError={(error, info) => {
    logger.error('InputBar', 'Error caught by boundary', error, info);
    toast.error(`Failed: ${error.message}`);
  }}
  onReset={() => {
    // Clear AI state if needed
  }}
>
  <InputBar />
</ErrorBoundary>

// Wrap TodoList (filtering, script eval)
<ErrorBoundary
  FallbackComponent={TaskListErrorFallback}
  onError={(error, info) => {
    logger.error('TodoList', 'Error caught by boundary', error, info);
  }}
  onReset={() => {
    // Could reset filters to safe defaults
    onFilterChange({ tags: [], categories: [], priorities: [], statuses: [], script: '', enableScript: false });
  }}
>
  <TodoList />
</ErrorBoundary>

// Wrap TaskEditModal (RRule parsing)
<ErrorBoundary
  FallbackComponent={TaskListErrorFallback}
  onError={(error) => {
    logger.error('TaskEditModal', 'Error in modal', error);
    toast.error('Failed to save task');
  }}
  onReset={() => {
    setEditingTask(null); // Close modal
  }}
>
  {editingTask && <TaskEditModal ... />}
</ErrorBoundary>
```

#### Step 4: Update package.json
```json
{
  "dependencies": {
    "react-error-boundary": "^4.0.13"
  }
}
```

**Expected Results:**
- Graceful degradation instead of white screen
- User can recover without refresh
- Production debugging via error logs
- Integrates with existing toast system

**Testing:**
- Inject errors in script evaluation
- Test AI failures (network disconnect, invalid API key)
- Verify fallback UI renders correctly
- Test reset functionality

---

### 3. shadcn Theming Documentation Review

**Status:** ⭐ HIGH PRIORITY - Review & Validate

**Background:**
Previous session fixed dark theme bugs where popovers rendered outside shadow DOM. Need to ensure current implementation follows best practices.

**Current Implementation:**
- Shadow DOM via `react-shadow`
- Theme switching via `data-theme` attribute
- Custom CSS variables with `--tt-c-*` prefix
- Tailwind v4 with `@theme` directive

**Action Items:**

#### 1. Read Official Docs
- https://ui.shadcn.com/docs/theming
- https://ui.shadcn.com/docs/dark-mode/vite
- https://ui.shadcn.com/llms.txt

#### 2. Compare Variable Structure
```bash
# Compare our variables to shadcn's recommended structure
rg "^\\s*--" src/index.css | head -20
```

Current structure (src/index.css:1-288):
- Uses `--tt-c-*` prefix (non-standard)
- Maps to `--color-*` for Tailwind
- Theme variants via `[data-theme="dark"]`, `[data-theme="midnight"]`, etc.

shadcn structure:
- Uses `--background`, `--foreground`, `--primary`, etc.
- Direct HSL values
- Simpler `.dark` class selector

#### 3. Validate Theme Switching
Ensure current implementation in `TasksTimelineApp.tsx:277-291` aligns with shadcn patterns:
```typescript
const effectiveTheme = settings.theme === "system"
  ? systemInDarkMode ? "midnight" : "light"
  : settings.theme;

useEffect(() => {
  containerElement.setAttribute("data-theme", effectiveTheme);
}, [effectiveTheme, containerElement]);
```

#### 4. Check Popover Integration
Verify `src/components/ui/popover.tsx` uses theme-aware classes correctly after previous fix:
- Removed portal usage ✓
- Uses `bg-popover` and `text-popover-foreground` ✓
- Renders within shadow DOM ✓

**Deliverable:**
Document comparing current approach vs shadcn recommendations. Note any discrepancies or improvements.

---

### 4. Code Splitting with `Suspense`

**Status:** ⚠️ MEDIUM PRIORITY - Consider for v0.1.0

**Current Problem:**
Bundle size is **2.6MB** (from build output):
```
dist/index.js     2,637.50 kB │ gzip: 583.50 kB
dist/index.umd.cjs 1,775.40 kB │ gzip: 482.84 kB
```

**Candidates for Lazy Loading:**
1. **TaskEditModal** (728 lines) - only loads when editing
2. **SettingsModal** - only loads when opening settings
3. **AI SDK** (`@google/generative-ai`) - only needed if AI enabled

**Implementation Plan:**

#### Step 1: Lazy Load Heavy Modals
```typescript
// src/TasksTimelineApp.tsx
import { lazy, Suspense } from 'react';

const TaskEditModal = lazy(() => import('./components/TaskEditModal'));
const SettingsModal = lazy(() => import('./components/settings/SettingsModal'));

// Render with Suspense
<Suspense fallback={<ModalLoadingSkeleton />}>
  {editingTask && <TaskEditModal ... />}
</Suspense>

<Suspense fallback={<ModalLoadingSkeleton />}>
  {showSettings && <SettingsModal ... />}
</Suspense>
```

#### Step 2: Create Loading Skeleton
```typescript
// src/components/ModalLoadingSkeleton.tsx (NEW FILE)
export const ModalLoadingSkeleton = () => (
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="w-full max-w-lg bg-paper rounded-xl shadow-2xl p-8 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-slate-200 rounded"></div>
        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
      </div>
    </div>
  </div>
);
```

#### Step 3: Conditional AI Import
```typescript
// src/hooks/useAIAgent.ts
// Lazy load AI SDK only when needed
const initializeAI = async () => {
  if (!settings.aiConfig.enabled) return null;

  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  return new GoogleGenerativeAI(settings.aiConfig.apiKey);
};
```

**Expected Results:**
- Initial bundle: ~1.8MB (30% reduction)
- Modal load time: 200-500ms first time, instant after
- Better library consumer experience

**Trade-offs:**
- Slight delay opening modals first time
- More complex build configuration
- Need loading states

**Decision:** Defer to v0.1.0 release. Current bundle size acceptable for v0.0.5.

---

## Tools to Skip

### ❌ React Compiler
**Reason:** Too experimental for published library. Manual memoization (current `useMemo` usage) is sufficient.

### ❌ `useActionState`
**Reason:** Marginal benefit. Current loading state management in InputBar is clear and working.

### ❌ `useEffectEvent` (RFC)
**Reason:** Not shipped in React 19. Experimental only. No complex effects in codebase that need it.

### ❌ `useReducer` Refactor
**Reason:** Current state management in TaskEditModal (lines 63-111) is complex but functional. Switching to reducer would be refactoring for refactoring's sake without clear benefit.

### ❓ `Activity` API
**Status:** Unknown - link broken or future experimental feature. Need clarification.

---

## Implementation Roadmap

### Phase 1: Quick Wins (This Week)
1. **Day 1:** Implement `react-error-boundary`
   - Install package
   - Create fallback components
   - Wrap critical sections
   - Test error scenarios

2. **Day 2:** Add `useDeferredValue` to InputBar
   - Implement deferred search
   - Test with 500+ tasks
   - Measure performance improvement

3. **Day 3:** Review shadcn docs
   - Compare variable structure
   - Document findings
   - Note any improvements needed

### Phase 2: Bundle Optimization (v0.1.0)
4. Implement lazy loading for modals
5. Conditional AI SDK import
6. Measure bundle size reduction

### Phase 3: Polish (v0.2.0)
7. Consider `startTransition` for filter toggles if needed
8. Add more granular error boundaries
9. Performance monitoring in production

---

## Testing Checklist

After implementing each improvement:

### `useDeferredValue` Testing
- [ ] Create 500+ mock tasks
- [ ] Type rapidly in search field (measure FPS)
- [ ] Verify task list updates with acceptable delay
- [ ] Test on low-end devices (throttle CPU in DevTools)

### `react-error-boundary` Testing
- [ ] Inject error in script evaluation
- [ ] Test AI network failure
- [ ] Test RRule parsing error
- [ ] Verify fallback UI renders
- [ ] Test reset/recovery flow
- [ ] Check error logging

### shadcn Theming Review
- [ ] Read all three doc URLs
- [ ] Document variable structure comparison
- [ ] Test all theme variants (light, dark, midnight, coffee)
- [ ] Verify popover theming in all themes
- [ ] Check for any CSS specificity issues

### Code Splitting (v0.1.0)
- [ ] Measure bundle size before/after
- [ ] Test modal load time (first open vs subsequent)
- [ ] Verify loading skeleton appearance
- [ ] Test with slow 3G network throttling
- [ ] Check for lazy loading errors in console

---

## References

- React Docs: https://react.dev/reference/react
- `startTransition`: https://react.dev/reference/react/startTransition
- `useDeferredValue`: https://react.dev/reference/react/useDeferredValue
- `Suspense`: https://react.dev/reference/react/Suspense
- `react-error-boundary`: https://github.com/bvaughn/react-error-boundary
- shadcn Theming: https://ui.shadcn.com/docs/theming
- shadcn Dark Mode (Vite): https://ui.shadcn.com/docs/dark-mode/vite

---

## Notes

- All changes should maintain backward compatibility
- Update Storybook stories after each change
- Run `pnpm lint && pnpm type-check && pnpm format` before committing
- Update documentation in CLAUDE.md after major changes
