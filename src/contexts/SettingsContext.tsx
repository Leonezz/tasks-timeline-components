import { type ReactNode, useContext } from "react";
import type { AppSettings, FilterState, SortState } from "../types";
import type { VoiceRuntime } from "../utils/voice-providers";
import { SettingsContext } from "./context-objects";
import { TaskRowBridge } from "./TaskRowContext";

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
  voiceRuntime?: VoiceRuntime;
  hasAgentSession?: boolean;
  isAgentPanelOpen?: boolean;
  isAgentConversationActive?: boolean;
  agentPanelUnreadCount?: number;
  onOpenAgentPanel?: () => void;
  onOpenSettings?: () => void;
}

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
      {/* Task rows read a narrower, stable context (see TaskRowContext) */}
      <TaskRowBridge>{children}</TaskRowBridge>
    </SettingsContext.Provider>
  );
}
