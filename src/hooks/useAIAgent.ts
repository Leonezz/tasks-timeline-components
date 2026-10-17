import { useEffect, useRef } from "react";
import type {
  AgentEvent,
  AppSettings,
  Task,
  ToastMessage,
  TokenUsageRecord,
} from "../types";
import { resolveProviderFactory } from "../providers";
import type {
  AIProviderFactory,
  ChatMessage,
  ToolResult,
} from "../providers/types";
import { createCapabilities } from "../capabilities";
import type {
  Capabilities,
  CapabilityContext,
  ToolSpec,
} from "../capabilities";
import { logger } from "../utils/logger";
import { createAgentCapabilityContext } from "./agentCapabilityContext";

/** Default maximum number of tool-call rounds per agent turn. */
export const DEFAULT_AI_MAX_TOOL_ROUNDS = 16;

interface TokenUsageUpdate {
  provider: string;
  model: string;
  tokenUsage: TokenUsageRecord;
  totalTokens: number;
}

export type { AIProviderFactory };

export interface UseAIAgentOptions {
  providerFactory?: AIProviderFactory;
  /**
   * Fetch for the built-in providers' requests, e.g. a host's CORS-free HTTP
   * client. Cannot be combined with `providerFactory` (throws).
   */
  fetch?: typeof fetch;
  capabilities?: Capabilities;
  capabilityContext?: CapabilityContext;
  /** Extra host tools appended to the built-in tools. Cannot be combined with `capabilities`. */
  extraTools?: ToolSpec[];
  /** Maximum tool-call rounds per agent turn before stopping. Defaults to 16. */
  maxToolRounds?: number;
  updateSettings?: (settings: AppSettings) => void | Promise<void>;
  onAgentEvent?: (event: AgentEvent) => void;
  shouldNotifyAgentResponse?: () => boolean;
  /**
   * How the host stores recurrence rules, for the built-in capability
   * context (a host's own `capabilityContext` sets it itself).
   */
  recurrenceFormat?: CapabilityContext["recurrenceFormat"];
}

export interface AICommandOptions {
  sessionId?: string | null;
}

export function createAgentTurnHistory(
  previousHistory: ChatMessage[] | undefined,
  input: string,
): ChatMessage[] {
  return [...(previousHistory ?? []), { role: "user", content: input }];
}

export function appendAssistantMessageToHistory(
  history: ChatMessage[],
  text: string,
): ChatMessage[] {
  const trimmed = text.trim();
  return trimmed
    ? [...history, { role: "assistant", content: trimmed }]
    : history;
}

function validateAgentOptions(options: UseAIAgentOptions | undefined): {
  maxToolRounds: number;
  providerFactory: AIProviderFactory;
} {
  if (options?.capabilities && options.extraTools?.length) {
    throw new Error(
      "useAIAgent: `capabilities` (aiCapabilities) and `extraTools` (aiExtraTools) cannot be combined. " +
        "Pass extra tools to createCapabilities(ctx, { extraTools }) when building your own capabilities, or drop `capabilities`.",
    );
  }
  const maxToolRounds = options?.maxToolRounds ?? DEFAULT_AI_MAX_TOOL_ROUNDS;
  if (!Number.isInteger(maxToolRounds) || maxToolRounds < 1) {
    throw new Error(
      `useAIAgent: maxToolRounds (aiMaxToolRounds) must be a positive integer, got ${String(maxToolRounds)}.`,
    );
  }
  const providerFactory = resolveProviderFactory({
    providerFactory: options?.providerFactory,
    fetch: options?.fetch,
  });
  return { maxToolRounds, providerFactory };
}

export const useAIAgent = (
  tasks: Task[],
  onTaskAdded: (task: Task) => void | Task | Promise<void | Task>,
  onTaskUpdated: (task: Task, previous: Task) => void | Promise<void>,
  onTaskDeleted: (taskId: string, previous: Task) => void | Promise<void>,
  settings: AppSettings,
  _onManualAdd: (t: Partial<Task>) => void,
  onNotify: (
    type: "success" | "error" | "info" | "warning",
    title: string,
    desc?: string,
  ) => void,
  onTokenUsageUpdate?: (update: TokenUsageUpdate) => void,
  aiSystemPrompt?: string,
  onShowToast?: (toast: Omit<ToastMessage, "id">) => void,
  onConfirm?: (title: string, description?: string) => Promise<boolean | null>,
  onSelect?: (
    title: string,
    options: { label: string; value: string }[],
  ) => Promise<string | null>,
  onPrompt?: (question: string) => Promise<string | null>,
  options?: UseAIAgentOptions,
) => {
  const { maxToolRounds, providerFactory } = validateAgentOptions(options);
  const tasksRef = useRef(tasks),
    settingsRef = useRef(settings),
    historiesRef = useRef<Map<string, ChatMessage[]>>(new Map());

  // Update ref when tasks change to access latest state in async callbacks
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const handleAICommand = async (
    input: string,
    commandOptions?: AICommandOptions,
  ) => {
    const activeProvider = settings.aiConfig.activeProvider;
    const config = settings.aiConfig.providers[activeProvider];
    const requestedSessionId = commandOptions?.sessionId ?? null,
      previousHistory = requestedSessionId
        ? historiesRef.current.get(requestedSessionId)
        : undefined,
      isContinuation = Boolean(requestedSessionId && previousHistory),
      sessionId =
        isContinuation && requestedSessionId
          ? requestedSessionId
          : `agent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp = () => new Date().toISOString(),
      emitAgentEvent = (event: AgentEvent) => {
        options?.onAgentEvent?.(event);
      };

    if (isContinuation) {
      emitAgentEvent({
        kind: "user-message",
        sessionId,
        timestamp: timestamp(),
        text: input,
      });
    } else {
      emitAgentEvent({
        kind: "session-start",
        sessionId,
        timestamp: timestamp(),
        prompt: input,
        provider: activeProvider,
        model: config.model,
      });
    }

    let history = createAgentTurnHistory(previousHistory, input);
    historiesRef.current.set(sessionId, history);

    try {
      // Build capability context from React callbacks
      const ctx = createAgentCapabilityContext({
        getTasks: () => tasksRef.current,
        getSettings: () => settingsRef.current,
        onTaskAdded,
        onTaskUpdated,
        onTaskDeleted,
        updateSettings: options?.updateSettings,
        onNotify,
        onShowToast,
        onConfirm,
        onSelect,
        onPrompt,
        recurrenceFormat: options?.recurrenceFormat,
      });

      const capabilities =
        options?.capabilities ??
        createCapabilities(options?.capabilityContext ?? ctx, {
          extraTools: options?.extraTools,
        });

      // Convert ToolSpec[] to ToolDefinition[] for the provider
      const tools = capabilities.tools.map((t) => ({
        name: t.name,
        description: t.description,
        parameters: t.schema,
      }));

      const systemPrompt = capabilities.getSystemPrompt(
        aiSystemPrompt,
        settings.aiConfig.systemPrompt,
      );

      emitAgentEvent({
        kind: "status",
        sessionId,
        timestamp: timestamp(),
        message: "Connecting to provider",
      });
      const provider = await providerFactory(activeProvider, config);

      logger.info("AI", `Sending prompt to ${activeProvider}`, {
        input,
        model: config.model,
      });

      // Initial chat call
      emitAgentEvent({
        kind: "status",
        sessionId,
        timestamp: timestamp(),
        message: "Thinking",
      });
      let response = await provider.chat(
        systemPrompt,
        input,
        tools,
        undefined,
        history,
      );

      // Track Tokens
      if (onTokenUsageUpdate && (response.tokenUsage || response.tokenCount)) {
        const tokenUsage = response.tokenUsage || {
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: response.tokenCount || 0,
        };
        onTokenUsageUpdate({
          provider: activeProvider,
          model: config.model,
          tokenUsage,
          totalTokens: tokenUsage.totalTokens,
        });
        logger.debug("AI", "Token Usage", { tokenUsage });
      }

      // Process tool calls in a loop, bounded by maxToolRounds
      let toolRounds = 0;
      while (response.toolCalls && response.toolCalls.length > 0) {
        if (toolRounds >= maxToolRounds) {
          // The pending tool calls are not executed and not recorded, so the
          // history stays well-formed (every recorded tool call has a result).
          // A closing assistant note keeps user/assistant turns alternating.
          const message = `Stopped after ${maxToolRounds} tool rounds without a final answer`;
          history = appendAssistantMessageToHistory(history, `[${message}]`);
          historiesRef.current.set(sessionId, history);
          throw new Error(message);
        }
        toolRounds += 1;

        // Record assistant response with tool calls in history
        history.push({
          role: "assistant",
          content: response.text,
          toolCalls: response.toolCalls,
        });

        const toolResults: ToolResult[] = [];

        for (const call of response.toolCalls) {
          if (!call.name) continue;
          logger.info("AI", `Executing tool: ${call.name}`, call.args);
          emitAgentEvent({
            kind: "tool-call",
            sessionId,
            timestamp: timestamp(),
            toolCallId: call.id,
            toolName: call.name,
            args: call.args,
          });
          const result = await capabilities.executeTool(call.name, call.args);
          emitAgentEvent({
            kind: "tool-result",
            sessionId,
            timestamp: timestamp(),
            toolCallId: call.id,
            toolName: call.name,
            result: result.result,
          });
          toolResults.push({
            id: call.id,
            name: call.name,
            result: result.result,
          });
        }

        // Record tool results in history
        history.push({
          role: "tool",
          toolResults,
        });

        // Send tool results back to the provider with accumulated history
        emitAgentEvent({
          kind: "status",
          sessionId,
          timestamp: timestamp(),
          message: "Reviewing tool results",
        });
        response = await provider.chat(
          systemPrompt,
          input,
          tools,
          toolResults,
          history,
        );

        // Track Tokens for follow-up turns
        if (
          onTokenUsageUpdate &&
          (response.tokenUsage || response.tokenCount)
        ) {
          const tokenUsage = response.tokenUsage || {
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: response.tokenCount || 0,
          };
          onTokenUsageUpdate({
            provider: activeProvider,
            model: config.model,
            tokenUsage,
            totalTokens: tokenUsage.totalTokens,
          });
        }
      }

      // Show the model's final text response to the user
      if (response.text?.trim()) {
        const responseText = response.text.trim();
        emitAgentEvent({
          kind: "assistant-message",
          sessionId,
          timestamp: timestamp(),
          text: responseText,
        });
        history = appendAssistantMessageToHistory(history, responseText);
        if (options?.onAgentEvent && options.shouldNotifyAgentResponse?.()) {
          onNotify(
            "success",
            "Agent replied",
            "Response added to the agent conversation.",
          );
        } else if (!options?.onAgentEvent) {
          onNotify("info", "AI", responseText);
        }
      }
      historiesRef.current.set(sessionId, history);
      emitAgentEvent({
        kind: "session-complete",
        sessionId,
        timestamp: timestamp(),
      });
    } catch (e) {
      logger.error("AI", "Agent processing failed", e);
      emitAgentEvent({
        kind: "error",
        sessionId,
        timestamp: timestamp(),
        message:
          e instanceof Error
            ? e.message
            : "Something went wrong while processing your request.",
      });
      onNotify(
        "error",
        "AI Agent Error",
        e instanceof Error
          ? e.message
          : "Something went wrong while processing your request.",
      );
    }
  };

  return { handleAICommand };
};
