// Re-export all utilities from their respective modules
export { cn } from "./cn";
export {
  formatDateDisplay,
  formatTime,
  formatRelativeDate,
  formatSmartDate,
  formatRecurrence,
} from "./date";
export { deriveTaskStatus, groupTasksByYearAndDate } from "./task";
export { parseTaskString } from "./parsing";
export { getToolDefinitions } from "./ai-tools";

/**
 * Deep equality comparison for objects
 * Used to detect if a task has actually changed before persisting
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return false;
  if (typeof obj1 !== "object" || typeof obj2 !== "object") return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}
