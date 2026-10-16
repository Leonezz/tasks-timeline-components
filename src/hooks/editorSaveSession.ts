import { useCallback, useRef } from "react";

/**
 * Ties a task editor save to the editor that started it. A save that ends
 * after its editor closed, or after another task's editor opened, must not
 * close the editor now showing, and its failure must still reach the user.
 *
 * `currentSession` returns a number the host bumps whenever an editor opens
 * or closes.
 */

/**
 * Runs `persist`. On success, closes the editor if it is still the one that
 * saved. On failure, rejects while that editor is still open (it shows the
 * error), otherwise calls `reportClosedFailure`.
 */
export async function saveInEditorSession(
  currentSession: () => number,
  persist: () => Promise<void>,
  handlers: {
    close: () => void;
    reportClosedFailure: (error: unknown) => void;
  },
): Promise<void> {
  const session = currentSession();
  try {
    await persist();
  } catch (error) {
    if (session !== currentSession()) {
      handlers.reportClosedFailure(error);
      return;
    }
    throw error;
  }
  if (session === currentSession()) {
    handlers.close();
  }
}

/**
 * Opens and closes a task editor, and saves from it, so that a save only
 * closes the editor that started it (see saveInEditorSession).
 */
export function useEditorSaveSession<T>(setEditing: (value: T | null) => void) {
  const sessionRef = useRef(0);
  const open = useCallback(
    (value: T) => {
      sessionRef.current += 1;
      setEditing(value);
    },
    [setEditing],
  );
  const close = useCallback(() => {
    sessionRef.current += 1;
    setEditing(null);
  }, [setEditing]);
  const save = useCallback(
    (
      persist: () => Promise<void>,
      reportClosedFailure: (error: unknown) => void,
    ) =>
      saveInEditorSession(() => sessionRef.current, persist, {
        close,
        reportClosedFailure,
      }),
    [close],
  );
  return { open, close, save };
}
