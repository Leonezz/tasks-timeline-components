import type { CapabilityContext } from "../src/capabilities/types";
import type { Task, Priority, TaskStatus } from "../src/types";
import { deriveWorkflowStatus } from "../src/utils/task";
import { getNowISO } from "../src/utils/date-helpers";

export interface MockContextState {
  tasks: Task[];
}

export function createMockContext(seedTasks: Partial<Task>[] = []): {
  ctx: CapabilityContext;
  getState: () => MockContextState;
} {
  const tasks: Task[] = seedTasks.map(
    (seed, i) =>
      ({
        id: seed.id || `seed-${i}`,
        title: seed.title || `Seed Task ${i}`,
        status: (seed.status || "todo") as TaskStatus,
        priority: (seed.priority || "medium") as Priority,
        tags: seed.tags || [],
        createdAt: seed.createdAt || getNowISO(),
        ...seed,
      }) as Task,
  );

  const ctx: CapabilityContext = {
    getTasks: async () => [...tasks],
    getTask: async (id: string) => tasks.find((t) => t.id === id) || null,
    addTask: async (task: Task) => {
      const processed = { ...task, status: deriveWorkflowStatus(task) };
      tasks.push(processed);
    },
    updateTask: async (task: Task) => {
      const idx = tasks.findIndex((t) => t.id === task.id);
      if (idx !== -1) {
        tasks[idx] = { ...task, status: deriveWorkflowStatus(task) };
      }
    },
    deleteTask: async (id: string) => {
      const idx = tasks.findIndex((t) => t.id === id);
      if (idx !== -1) tasks.splice(idx, 1);
    },
    getSettings: () => null,
    notify: (_type: "success" | "error" | "info", _message: string) => {
      // Silent in eval mode
    },
  };

  return {
    ctx,
    getState: () => ({ tasks: [...tasks] }),
  };
}
