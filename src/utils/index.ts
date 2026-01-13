// Re-export all utilities from their respective modules
export { cn } from "./cn";
export {
  formatDateDisplay,
  formatTime,
  formatRelativeDate,
  formatSmartDate,
  formatRecurrence,
} from "./date";
export {
  deriveTaskStatus,
  groupTasksByYearAndDate,
  computeDateValidation,
  type DateValidationState,
} from "./task";
export { parseTaskString } from "./parsing";
export { getToolDefinitions } from "./ai-tools";

/**
 * Deep equality comparison for objects
 * Used to detect if a task has actually changed before persisting
 */
export function deepEqual(obj1: unknown, obj2: unknown): boolean {
  if (obj1 === obj2) {
    return true;
  }
  if (obj1 == null || obj2 == null) {
    return false;
  }
  if (typeof obj1 !== "object" || typeof obj2 !== "object") {
    return false;
  }

  const o1 = obj1 as Record<string, unknown>,
    o2 = obj2 as Record<string, unknown>,
    keys1 = Object.keys(o1),
    keys2 = Object.keys(o2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!keys2.includes(key)) {
      return false;
    }
    if (!deepEqual(o1[key], o2[key])) {
      return false;
    }
  }

  return true;
}
