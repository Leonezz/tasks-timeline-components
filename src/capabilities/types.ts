import type { Task, AppSettings, DetailBlock } from "../types";
import type { ToolResult, JSONSchemaProperty } from "../providers/types";

/**
 * How destructive tools behave when the host provides no `confirm` callback.
 * - "require" (default): refuse the action and return an error result.
 * - "skip": perform the action without asking (for headless hosts such as MCP servers).
 */
export type ConfirmPolicy = "require" | "skip";

export interface CapabilityContext {
  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | null>;
  /**
   * Stores a new task. Hosts that store tasks under their own ids should
   * return the stored task so tools report the id that later calls must use.
   */
  addTask(task: Task): Promise<void | Task>;
  updateTask(task: Task): Promise<void>;
  deleteTask(id: string): Promise<void>;
  getSettings?(): AppSettings | null;
  updateSettings?(settings: AppSettings): Promise<void> | void;
  notify?(
    type: "success" | "error" | "info" | "warning",
    message: string,
  ): void;
  showToast?(toast: {
    variant: "success" | "error" | "info" | "warning";
    title: string;
    description?: string;
    body?: string;
    detail?: DetailBlock[];
    timeout?: number | null;
  }): void;
  /**
   * Asks a yes/no question. Resolves `true` for yes, `false` for no, and
   * `null` when the user closes the question without answering. Rejects when
   * the host can no longer ask (for example after unmount); `select` and
   * `prompt` follow the same contract.
   */
  confirm?(title: string, description?: string): Promise<boolean | null>;
  /**
   * What destructive tools do when `confirm` is not provided. Defaults to "require".
   * Has no effect when `confirm` is provided.
   */
  confirmPolicy?: ConfirmPolicy;
  /** Resolves the chosen value, or `null` when the user cancels or closes it. */
  select?(
    title: string,
    options: { label: string; value: string }[],
  ): Promise<string | null>;
  /** Resolves the entered text, or `null` when the user cancels or closes it. */
  prompt?(question: string): Promise<string | null>;
}

export interface ToolSpec {
  name: string;
  description: string;
  schema: {
    type: "object";
    properties: Record<string, JSONSchemaProperty>;
    required?: string[];
  };
  execute(args: Record<string, unknown>): Promise<ToolResult>;
}

export interface ResourceContent {
  contents: Array<{
    uri: string;
    text: string;
    mimeType?: string;
  }>;
}

export interface ResourceSpec {
  name: string;
  uri: string;
  uriTemplate?: string;
  description: string;
  mimeType: string;
  read(params?: Record<string, string>): Promise<ResourceContent>;
}

export interface PromptMessage {
  role: "user" | "assistant";
  content: string;
}

export interface PromptArgument {
  name: string;
  description: string;
  required?: boolean;
}

export interface PromptSpec {
  name: string;
  description: string;
  arguments?: PromptArgument[];
  render(
    args?: Record<string, string>,
  ): PromptMessage[] | Promise<PromptMessage[]>;
}

export interface CreateCapabilitiesOptions {
  /** Host-provided tools appended after the built-in tools. Names must be unique. */
  extraTools?: ToolSpec[];
  /** Host-provided resources appended after the built-in resources. Names must be unique. */
  extraResources?: ResourceSpec[];
  /** Host-provided prompts appended after the built-in prompts. Names must be unique. */
  extraPrompts?: PromptSpec[];
}

export interface Capabilities {
  tools: ToolSpec[];
  resources: ResourceSpec[];
  prompts: PromptSpec[];
  getTool(name: string): ToolSpec | undefined;
  getResource(name: string): ResourceSpec | undefined;
  getPrompt(name: string): PromptSpec | undefined;
  getSystemPrompt(developerPrompt?: string, userPrompt?: string): string;
  executeTool(name: string, args: Record<string, unknown>): Promise<ToolResult>;
}
