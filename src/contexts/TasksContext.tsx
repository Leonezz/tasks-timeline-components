import React, { type ReactNode, useContext } from "react";
import type { Task } from "../types";
import { TasksContext } from "./context-objects";
import { TaskRowBridge } from "./TaskRowContext";

/* eslint-disable react-refresh/only-export-components */
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
  renderTitle?: (title: string) => React.ReactNode;
}

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
    <TasksContext.Provider value={value}>
      {/* Task rows read a narrower, stable context (see TaskRowContext) */}
      <TaskRowBridge>{children}</TaskRowBridge>
    </TasksContext.Provider>
  );
}
