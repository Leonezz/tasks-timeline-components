import type { AppSettings, Task, ToastMessage } from "../types";
import type { CapabilityContext } from "../capabilities";

export interface AgentCapabilityContextDeps {
  getTasks: () => Task[];
  getSettings: () => AppSettings;
  onTaskAdded: (task: Task) => void | Promise<void>;
  onTaskUpdated: (task: Task, previous: Task) => void | Promise<void>;
  onTaskDeleted: (taskId: string, previous: Task) => void | Promise<void>;
  updateSettings?: (settings: AppSettings) => void | Promise<void>;
  onNotify: (
    type: "success" | "error" | "info" | "warning",
    title: string,
    desc?: string,
  ) => void;
  onShowToast?: (toast: Omit<ToastMessage, "id">) => void;
  onConfirm?: (title: string, description?: string) => Promise<boolean | null>;
  onSelect?: (
    title: string,
    options: { label: string; value: string }[],
  ) => Promise<string | null>;
  onPrompt?: (question: string) => Promise<string | null>;
}

function findTaskOrThrow(tasks: Task[], id: string): Task {
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    throw new Error(`Task not found: ${id}`);
  }
  return task;
}

/**
 * Builds the CapabilityContext used by the built-in agent from React callbacks.
 * Mutations on unknown task ids throw instead of silently doing nothing.
 */
export function createAgentCapabilityContext(
  deps: AgentCapabilityContextDeps,
): CapabilityContext {
  const { updateSettings, onShowToast } = deps;
  return {
    getTasks: async () => deps.getTasks(),
    getTask: async (id) => deps.getTasks().find((t) => t.id === id) ?? null,
    addTask: async (task) => {
      await deps.onTaskAdded(task);
    },
    updateTask: async (task) => {
      const previous = findTaskOrThrow(deps.getTasks(), task.id);
      await deps.onTaskUpdated(task, previous);
    },
    deleteTask: async (id) => {
      const previous = findTaskOrThrow(deps.getTasks(), id);
      await deps.onTaskDeleted(id, previous);
    },
    getSettings: () => deps.getSettings(),
    updateSettings: updateSettings
      ? async (nextSettings) => {
          await updateSettings(nextSettings);
        }
      : undefined,
    notify: (type, message) => deps.onNotify(type, message),
    showToast: onShowToast
      ? (toast) =>
          onShowToast({
            ...toast,
            interaction: { kind: "dismiss" },
            timeout: toast.timeout ?? null,
          })
      : undefined,
    confirm: deps.onConfirm,
    select: deps.onSelect,
    prompt: deps.onPrompt,
  };
}
