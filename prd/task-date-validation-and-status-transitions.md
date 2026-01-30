# PRD: Task Date Validation Badges & Status Transition Auto-Dating

## Overview

This document outlines two improvements to the TaskItem component:

1. **Simplify date validation badges** - Replace multiple "Missing XX Date" badges with a single consolidated badge
2. **Auto-populate dates on status transitions** - Automatically set relevant dates when changing task status via the icon button

---

## Feature 1: Consolidated Date Validation Badge

### Current Behavior

When a task is missing dates required by the grouping strategy, the TaskItem shows **multiple** badges:
- "Missing Due Date"
- "Missing Start Date"
- "Missing Created Date"
- etc.

This creates visual clutter and is redundant since the user just needs to know dates are missing/invalid.

### Proposed Behavior

Show a **single** consolidated badge based on the validation state:

| Condition | Badge | Style |
|-----------|-------|-------|
| No dates at all | "No Dates" | Warning (amber) |
| Has dates but some are invalid format | "Invalid Date" | Error (rose) |
| All required dates present and valid | No badge | - |

### Implementation

**File: `src/components/TaskItem.tsx`**

1. Change `missingStrategies?: string[]` prop to a more descriptive type:
   ```typescript
   interface DateValidationState {
     hasMissingDates: boolean;
     hasInvalidDates: boolean;
   }

   interface TaskItemProps {
     task: Task;
     dateValidation?: DateValidationState;
   }
   ```

2. Update the badge rendering logic (around line 410-423):
   ```typescript
   {/* Date Validation Warning */}
   {dateValidation && (
     dateValidation.hasInvalidDates ? (
       <div className="flex items-center gap-1.5 px-2 h-5 rounded-full border font-medium leading-none text-rose-600 bg-rose-50 border-rose-200">
         <Icon name="AlertTriangle" size={10} />
         <span className="text-[10px]">Invalid Date</span>
       </div>
     ) : dateValidation.hasMissingDates ? (
       <div className="flex items-center gap-1.5 px-2 h-5 rounded-full border font-medium leading-none text-amber-600 bg-amber-50 border-amber-200">
         <Icon name="AlertCircle" size={10} />
         <span className="text-[10px]">No Dates</span>
       </div>
     ) : null
   )}
   ```

**File: `src/components/BacklogSection.tsx`**

Update the prop passed to TaskItem:
```typescript
// Before
<TaskItem task={task} missingStrategies={settings.groupingStrategy} />

// After
<TaskItem
  task={task}
  dateValidation={computeDateValidation(task, settings.groupingStrategy)}
/>
```

**File: `src/utils/task.ts`** (add helper function)

```typescript
export const computeDateValidation = (
  task: Task,
  strategies: DateGroupBy[]
): DateValidationState | undefined => {
  const dateFields: DateGroupBy[] = ["dueAt", "startAt", "createdAt", "completedAt"];

  let hasMissingDates = false;
  let hasInvalidDates = false;

  // Check strategy-required dates
  for (const strategy of strategies) {
    const value = task[strategy];
    if (!value) {
      hasMissingDates = true;
    } else {
      const dt = DateTime.fromISO(value);
      if (!dt.isValid) {
        hasInvalidDates = true;
      }
    }
  }

  // Check all populated dates for validity
  for (const field of dateFields) {
    const value = task[field];
    if (value) {
      const dt = DateTime.fromISO(value);
      if (!dt.isValid) {
        hasInvalidDates = true;
      }
    }
  }

  if (!hasMissingDates && !hasInvalidDates) {
    return undefined; // No badge needed
  }

  return { hasMissingDates, hasInvalidDates };
};
```

---

## Feature 2: Auto-Populate Dates on Status Transitions

### Current Behavior

When clicking the status icon and selecting a new status, only the `status` field is updated. Users must manually set dates afterward.

### Proposed Behavior

When transitioning to certain statuses, automatically set the corresponding date to "now":

| From Status | To Status | Auto-Set Date |
|-------------|-----------|---------------|
| `todo` | `doing` | `startAt` = now |
| `todo` | `scheduled` | `startAt` = now |
| `todo` | `done` | `completedAt` = now |
| `todo` | `cancelled` | `cancelledAt` = now |
| `doing` | `done` | `completedAt` = now |
| `doing` | `cancelled` | `cancelledAt` = now |
| `scheduled` | `done` | `completedAt` = now |
| `scheduled` | `cancelled` | `cancelledAt` = now |
| Any | `todo` | Clear `startAt` if not manually set? (optional) |

**Note:** Only auto-set dates if they are currently empty. Don't overwrite user-set values.

**New Field Required:** Add `cancelledAt?: ISO8601String` to the `Task` interface in `src/types.ts`.

### Implementation

**File: `src/components/TaskItem.tsx`**

Update `handleStatusChange` function (around line 82-84):

```typescript
const handleStatusChange = (newStatus: TaskStatus) => {
  const now = DateTime.now().toISO();
  const updates: Partial<Task> = { status: newStatus };

  // Auto-populate startAt when transitioning to doing/scheduled
  if (
    (newStatus === "doing" || newStatus === "scheduled") &&
    !task.startAt &&
    task.status === "todo"
  ) {
    updates.startAt = now;
  }

  // Auto-populate completedAt when transitioning to done
  if (newStatus === "done" && !task.completedAt) {
    updates.completedAt = now;
  }

  // Auto-populate cancelledAt when transitioning to cancelled
  if (newStatus === "cancelled" && !task.cancelledAt) {
    updates.cancelledAt = now;
  }

  onUpdateTask({ ...task, ...updates });
};
```

### Edge Cases to Handle

1. **User already has a date set** - Don't overwrite. The condition `!task.startAt` ensures this.
2. **Transitioning from scheduled to doing** - `startAt` already set, no change needed.
3. **Transitioning back to todo** - Consider whether to clear auto-set dates (optional, may require tracking which dates were auto-set vs user-set).

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/types.ts` | Add `cancelledAt?: ISO8601String` to Task interface |
| `src/components/TaskItem.tsx` | Update badge rendering, modify `handleStatusChange` |
| `src/components/BacklogSection.tsx` | Update prop passed to TaskItem |
| `src/utils/task.ts` | Add `computeDateValidation` helper |
| `src/stories/Core/TaskItem.stories.tsx` | Update storybook props |

---

## Testing Checklist

### Date Validation Badge
- [ ] Task with no dates shows "No Dates" badge (amber)
- [ ] Task with invalid date format shows "Invalid Date" badge (rose)
- [ ] Task with valid dates shows no badge
- [ ] Task with partial dates (some missing) shows "No Dates" badge
- [ ] Badge only appears in BacklogSection (where missingStrategies is passed)

### Status Transitions
- [ ] todo -> doing: sets startAt to now
- [ ] todo -> scheduled: sets startAt to now
- [ ] todo -> done: sets completedAt to now
- [ ] todo -> cancelled: sets cancelledAt to now
- [ ] doing -> done: sets completedAt to now (startAt preserved)
- [ ] doing -> cancelled: sets cancelledAt to now (startAt preserved)
- [ ] scheduled -> done: sets completedAt to now (startAt preserved)
- [ ] scheduled -> cancelled: sets cancelledAt to now (startAt preserved)
- [ ] Existing dates are NOT overwritten
- [ ] Status icon correctly updates after transition
- [ ] Date badges update after auto-date population

---

## Out of Scope

- Clearing dates when transitioning back to `todo` (requires tracking auto-set vs manual)
- Custom date selection during status transition (would require a popover)
- Bulk status transitions with date handling
