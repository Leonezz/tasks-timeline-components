import { createContext } from "react";
import type { SettingsContextType } from "./SettingsContext";
import type { TasksContextType } from "./TasksContext";

// The raw context objects, shared by the providers and the task row bridge
// without import cycles.
export const TasksContext = createContext<TasksContextType | undefined>(
  undefined,
);

export const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);
