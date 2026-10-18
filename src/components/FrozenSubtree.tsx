import React, { useState } from "react";

/**
 * `value` while not frozen; while frozen, the value from the last render
 * before it froze.
 */
const useHeldWhile = <T,>(value: T, frozen: boolean): T => {
  const [held, setHeld] = useState(value);
  if (!frozen && held !== value) {
    setHeld(value);
  }
  return frozen ? held : value;
};

interface FrozenSubtreeProps {
  /** While true, the children render nothing new. */
  frozen: boolean;
  children: React.ReactNode;
}

/**
 * Stops a hidden subtree from re-rendering: while `frozen`, its children
 * stay the elements they were when it froze, so a change elsewhere (a
 * filter, a stat card, a task update) does not render them. When it
 * unfreezes it renders once with the latest elements. State (open sections,
 * measured heights) is kept throughout.
 *
 * The children must read only contexts that those changes leave alone (the
 * timeline sections read TimelineSectionContext, rows TaskRowContext): a
 * consumer of a changed context renders even inside a frozen subtree.
 * Only for content the user cannot see or reach while frozen (the timeline
 * in focus mode is `hidden`), since it shows stale data until it unfreezes.
 */
export const FrozenSubtree: React.FC<FrozenSubtreeProps> = ({
  frozen,
  children,
}) => <>{useHeldWhile(children, frozen)}</>;
