import type { ToastMessage } from "../types";

type SelectOption = { label: string; value: string };

/** Rejection message for questions asked after, or still waiting at, unmount. */
export const TOAST_INTERACTION_UNAVAILABLE_ERROR =
  "User interaction not available: the task timeline was closed before the user could answer.";

export const createToastId = (): string =>
  Math.random().toString(36).slice(2, 11);

export interface ToastInteractionHost {
  show(toast: ToastMessage): void;
  hide(id: string): void;
}

export interface ToastInteractionController {
  /** Yes resolves `true`, No resolves `false`, closing the toast resolves `null`. */
  confirm(title: string, description?: string): Promise<boolean | null>;
  /** An option resolves its value; Cancel or closing the toast resolves `null`. */
  select(title: string, options: SelectOption[]): Promise<string | null>;
  /** Submit resolves the text; Cancel or closing the toast resolves `null`. */
  prompt(question: string): Promise<string | null>;
  /** Closes a toast. A question still waiting on it resolves `null` (dismissed). */
  dismiss(id: string): void;
  /** Accepts questions again after the host (re)mounts. */
  activate(): void;
  /** Rejects waiting questions, and new ones until `activate()` is called. */
  dispose(): void;
}

interface PendingQuestion {
  resolve: (answer: unknown) => void;
  reject: (error: Error) => void;
}

/**
 * Turns toasts into promise-based questions for the AI agent.
 * Every method is a stable closure, so callers can pass them around unbound.
 */
export function createToastInteractionController(
  host: ToastInteractionHost,
): ToastInteractionController {
  const pending = new Map<string, PendingQuestion>();
  let disposed = false;

  const answer = (id: string, value: unknown) => {
      const question = pending.get(id);
      pending.delete(id);
      question?.resolve(value);
      host.hide(id);
    },
    ask = <T>(
      buildToast: (id: string) => Omit<ToastMessage, "id">,
    ): Promise<T | null> => {
      if (disposed) {
        return Promise.reject(new Error(TOAST_INTERACTION_UNAVAILABLE_ERROR));
      }
      const id = createToastId();
      return new Promise<T | null>((resolve, reject) => {
        pending.set(id, {
          resolve: resolve as (answer: unknown) => void,
          reject,
        });
        host.show({ ...buildToast(id), id });
      });
    };

  return {
    confirm: (title, description) =>
      ask<boolean>((id) => ({
        variant: "info",
        title,
        description,
        interaction: {
          kind: "confirm",
          onConfirm: () => answer(id, true),
          onCancel: () => answer(id, false),
        },
        timeout: null,
      })),
    select: (title, options) =>
      ask<string>((id) => ({
        variant: "info",
        title,
        interaction: {
          kind: "select",
          options,
          onSelect: (value) => answer(id, value),
          onCancel: () => answer(id, null),
        },
        timeout: null,
      })),
    prompt: (question) =>
      ask<string>((id) => ({
        variant: "info",
        title: question,
        interaction: {
          kind: "prompt",
          onSubmit: (text) => answer(id, text),
          onCancel: () => answer(id, null),
        },
        timeout: null,
      })),
    dismiss: (id) => answer(id, null),
    activate: () => {
      disposed = false;
    },
    dispose: () => {
      disposed = true;
      const waiting = [...pending.entries()];
      pending.clear();
      for (const [id, question] of waiting) {
        question.reject(new Error(TOAST_INTERACTION_UNAVAILABLE_ERROR));
        host.hide(id);
      }
    },
  };
}
