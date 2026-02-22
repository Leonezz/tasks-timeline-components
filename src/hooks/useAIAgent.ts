import { useEffect, useRef } from "react";
import type { AppSettings, Task } from "../types";
import { createProvider } from "../providers";
import type { ChatMessage, ToolResult } from "../providers/types";
import { createCapabilities } from "../capabilities";
import type { CapabilityContext } from "../capabilities";
import { logger } from "../utils/logger";

export const useAIAgent = (
  tasks: Task[],
  onTaskAdded: (task: Task) => void | Promise<void>,
  onTaskUpdated: (task: Task, previous: Task) => void | Promise<void>,
  onTaskDeleted: (taskId: string, previous: Task) => void | Promise<void>,
  settings: AppSettings,
  _onManualAdd: (t: Partial<Task>) => void,
  onNotify: (
    type: "success" | "error" | "info",
    title: string,
    desc?: string,
  ) => void,
  onTokenUsageUpdate?: (tokens: number) => void,
  aiSystemPrompt?: string,
) => {
  const tasksRef = useRef(tasks);

  // Update ref when tasks change to access latest state in async callbacks
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const handleAICommand = async (input: string) => {
    const activeProvider = settings.aiConfig.activeProvider;
    const config = settings.aiConfig.providers[activeProvider];

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
      getSettings: () => settings,
      notify: (type, message) => onNotify(type, message),
    };

    const capabilities = createCapabilities(ctx);

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

    try {
      const provider = await createProvider(activeProvider, config);

      logger.info("AI", `Sending prompt to ${activeProvider}`, {
        input,
        model: config.model,
      });

      // Initial chat call
      let response = await provider.chat(systemPrompt, input, tools);

      // Track Tokens
      if (response.tokenCount && onTokenUsageUpdate) {
        onTokenUsageUpdate(response.tokenCount);
        logger.debug("AI", "Token Usage", { tokens: response.tokenCount });
      }

      let loopCount = 0;
      const maxLoops = 5;
      const history: ChatMessage[] = [{ role: "user", content: input }];

      // Process tool calls in a loop
      while (
        response.toolCalls &&
        response.toolCalls.length > 0 &&
        loopCount < maxLoops
      ) {
        loopCount++;

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
          const result = await capabilities.executeTool(call.name, call.args);
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
        response = await provider.chat(
          systemPrompt,
          input,
          tools,
          toolResults,
          history,
        );

        // Track Tokens for follow-up turns
        if (response.tokenCount && onTokenUsageUpdate) {
          onTokenUsageUpdate(response.tokenCount);
        }
      }
    } catch (e) {
      logger.error("AI", "Agent processing failed", e);
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
