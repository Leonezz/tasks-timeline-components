import { useState } from "react";

const sameItems = <T>(a: readonly T[], b: readonly T[]) =>
  a.length === b.length && a.every((item, i) => Object.is(item, b[i]));

/**
 * The previous array while the new one holds the same items in the same
 * order, so a list rebuilt on every change (e.g. categories derived from the
 * tasks) does not change a context value or a memo dependency.
 */
export function useStableArray<T>(items: T[]): T[] {
  const [stable, setStable] = useState(items),
    same = stable === items || sameItems(stable, items);
  if (!same) {
    setStable(items);
  }
  return same ? stable : items;
}
