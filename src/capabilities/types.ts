import type { Task, AppSettings, DetailBlock } from "../types";
import type { ToolResult, JSONSchemaProperty } from "../providers/types";

export interface CapabilityContext {
  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | null>;
  addTask(task: Task): Promise<void>;
  updateTask(task: Task): Promise<void>;
  deleteTask(id: string): Promise<void>;
  getSettings?(): AppSettings | null;
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
  confirm?(title: string, description?: string): Promise<boolean | null>;
  select?(
    title: string,
    options: { label: string; value: string }[],
  ): Promise<string | null>;
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
