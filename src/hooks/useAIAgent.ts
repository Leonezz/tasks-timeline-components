import { useEffect, useRef } from "react";
import type {
  AgentEvent,
  AppSettings,
  Task,
  ToastMessage,
  TokenUsageRecord,
} from "../types";
import { createProvider as createDefaultProvider } from "../providers";
import type { ChatMessage, IAIProvider, ToolResult } from "../providers/types";
import { createCapabilities } from "../capabilities";
import type { Capabilities, CapabilityContext } from "../capabilities";
import { logger } from "../utils/logger";

interface TokenUsageUpdate {
  provider: string;
  model: string;
  tokenUsage: TokenUsageRecord;
  totalTokens: number;
}

export type AIProviderFactory = (
  provider: AppSettings["aiConfig"]["activeProvider"],
  config: AppSettings["aiConfig"]["providers"][AppSettings["aiConfig"]["activeProvider"]],
) => Promise<IAIProvider>;

export interface UseAIAgentOptions {
  providerFactory?: AIProviderFactory;
  capabilities?: Capabilities;
  capabilityContext?: CapabilityContext;
  updateSettings?: (settings: AppSettings) => void | Promise<void>;
  onAgentEvent?: (event: AgentEvent) => void;
  shouldNotifyAgentResponse?: () => boolean;
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

export const useAIAgent = (
  tasks: Task[],
  onTaskAdded: (task: Task) => void | Promise<void>,
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

    // Build capability context from React callbacks
    const ctx: CapabilityContext = {
      getTasks: async () => tasksRef.current,
      getTask: async (id) => tasksRef.current.find((t) => t.id === id) ?? null,
      addTask: async (task) => {
        await onTaskAdded(task);
      },
      updateTask: async (task) => {
        const previous = tasksRef.current.find((t) => t.id === task.id);
        if (previous) {
          await onTaskUpdated(task, previous);
        }
      },
      deleteTask: async (id) => {
        const previous = tasksRef.current.find((t) => t.id === id);
        if (previous) {
          await onTaskDeleted(id, previous);
        }
      },
      getSettings: () => settingsRef.current,
      updateSettings: options?.updateSettings
        ? async (nextSettings) => {
            await options.updateSettings?.(nextSettings);
          }
        : undefined,
      notify: (type, message) => onNotify(type, message),
      showToast: onShowToast
        ? (toast) =>
            onShowToast({
              ...toast,
              interaction: { kind: "dismiss" },
              timeout: toast.timeout ?? null,
            })
        : undefined,
      confirm: onConfirm,
      select: onSelect,
      prompt: onPrompt,
    };

    const capabilities =
      options?.capabilities ??
      createCapabilities(options?.capabilityContext ?? ctx);

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
    let history = createAgentTurnHistory(previousHistory, input);
    historiesRef.current.set(sessionId, history);

    try {
      const providerFactory = options?.providerFactory ?? createDefaultProvider;
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

      // Process tool calls in a loop
      while (response.toolCalls && response.toolCalls.length > 0) {
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
