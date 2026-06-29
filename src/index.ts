/**
 * Tasks Timeline Component Library
 *
 * A comprehensive React component library for task management and timeline visualization.
 * Includes task components, hooks, types, and utilities for building task-based applications.
 */

// Export all components
export * from "./components/index";

// Export all hooks
export * from "./hooks/index";

// Export all types
export type {
  Priority,
  WorkflowStatus,
  RepresentationStatus,
  TaskStatus,
  TemporalStatus,
  PlanningStatus,
  PrimaryVisualStatus,
  ISO8601String,
  Tag,
  Task,
  DayGroup,
  YearGroup,
  ThemeOption,
  FontSize,
  AIProvider,
  VoiceProvider,
  DateGroupBy,
  ProviderConfig,
  AIConfig,
  VoiceConfig,
  AppSettings,
  FilterRule,
  FilterState,
  SecretFieldContext,
  SecretFieldRenderer,
  SecretFieldScope,
  SortField,
  SortDirection,
  SortState,
  AgentSessionStatus,
  AgentEntryKind,
  AgentEntry,
  AgentSession,
  AgentEvent,
  CustomSettingsTab,
  LucideIconName,
  TaskRepository,
  SettingsRepository,
} from "./types";

// Export utilities
export {
  cn,
  deriveWorkflowStatus,
  deriveTaskStatus,
  deriveTaskRenderState,
  isWorkflowStatus,
  taskMatchesStatus,
} from "./utils";
export type { TaskRenderState } from "./utils";
export type {
  VoiceRuntime,
  VoiceRuntimeRequest,
  VoiceRuntimeResponse,
} from "./utils/voice-providers";
export { TasksTimelineApp } from "./TasksTimelineApp";
export type { TasksTimelineAppProps } from "./TasksTimelineApp";
export * from "./index.css";

// Capabilities layer
export { createCapabilities } from "./capabilities";
export type {
  CapabilityContext,
  Capabilities,
  ToolSpec,
  ResourceSpec,
  PromptSpec,
  PromptMessage,
  PromptArgument,
  ResourceContent,
} from "./capabilities";
