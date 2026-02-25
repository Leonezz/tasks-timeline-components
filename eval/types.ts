import type { AIProvider, TokenUsageRecord, Task } from "../src/types";

/** Matcher for flexible argument assertion */
export type ArgMatcher =
  | { contains: string }
  | { type: "date" | "string" | "number" | "boolean" | "array" }
  | { equals: unknown }
  | { oneOf: unknown[] };

/** Expected tool call in a test case */
export interface ExpectedTool {
  name: string;
  args?: Record<string, ArgMatcher | unknown>;
}

/** A single evaluation test case */
export interface EvalCase {
  id: string;
  description: string;
  input: string;
  expectedTools: ExpectedTool[];
  /** Optional: pre-populate the mock task store with these tasks */
  seedTasks?: Partial<Task>[];
}

/** Provider configuration for eval */
export interface EvalProviderConfig {
  provider: AIProvider;
  model: string;
  apiKeyEnv: string;
  baseUrl?: string;
  default?: boolean;
}

/** A single turn in a recorded interaction */
export interface RecordingTurn {
  role: "assistant" | "tool";
  text?: string;
  toolCalls?: Array<{ name: string; args: Record<string, unknown> }>;
  toolResults?: Array<{ name: string; result: unknown }>;
  tokenUsage?: TokenUsageRecord;
  latencyMs?: number;
}

/** Full recording of one test case execution */
export interface Recording {
  caseId: string;
  input: string;
  provider: string;
  model: string;
  timestamp: string;
  turns: RecordingTurn[];
  finalTasks: Task[];
  totalTokenUsage: TokenUsageRecord;
  totalLatencyMs: number;
}

/** Result of evaluating one test case against one model */
export interface CaseResult {
  caseId: string;
  description: string;
  provider: string;
  model: string;
  pass: boolean;
  errors: string[];
  actualToolCalls: Array<{ name: string; args: Record<string, unknown> }>;
  expectedTools: ExpectedTool[];
  tokenUsage: TokenUsageRecord;
  latencyMs: number;
}

/** Aggregated results for a full eval run */
export interface EvalResult {
  provider: string;
  model: string;
  cases: CaseResult[];
  totalPassed: number;
  totalFailed: number;
  totalTokenUsage: TokenUsageRecord;
  totalLatencyMs: number;
}
