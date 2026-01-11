import { type ReactNode, createContext, useContext } from "react";
import type { AppSettings, FilterState, SortState } from "../types";

/* eslint-disable react-refresh/only-export-components */
export interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  isFocusMode: boolean;
  toggleFocusMode: () => void;
  isAiMode: boolean;
  toggleAiMode: () => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  sort: SortState;
  onSortChange: (sort: SortState) => void;
  onVoiceError: (msg: string) => void;
  onOpenSettings?: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettingsContext must be used within SettingsProvider");
  }
  return context;
}

export function SettingsProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: SettingsContextType;
}) {
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
