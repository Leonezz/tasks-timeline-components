import { createContext, useContext, type ReactNode } from "react";
import type { Task } from "../types";

export interface TasksContextType {
  tasks: Task[];
  availableCategories: string[];
  availableTags: string[];
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (task: Partial<Task>) => void;
  onEditTask?: (task: Task) => void;
  onAICommand: (input: string) => Promise<void>;
  onItemClick?: (item: Task) => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function useTasksContext() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error("useTasksContext must be used within TasksProvider");
  }
  return context;
}

export function TasksProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: TasksContextType;
}) {
  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
}
