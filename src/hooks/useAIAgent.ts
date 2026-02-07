import { useEffect, useRef } from "react";
import type { AppSettings, Task } from "../types";
import { getNowISO, getTodayISO } from "../utils";
import {
  createProvider,
  getToolDefinitions,
  getSystemPrompt,
} from "../providers";
import type { ChatMessage, ToolCall, ToolResult } from "../providers/types";
import { logger } from "../utils/logger";

interface ToolExecutionResult {
  success?: boolean;
  error?: string;
  message?: string;
  id?: string;
  // Allow dynamic properties for query results
  [key: string]: unknown;
}

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
) => {
  const tasksRef = useRef(tasks);

  // Update ref when tasks change to access latest state in async callbacks
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const executeTool = async (
      call: ToolCall,
    ): Promise<ToolExecutionResult | Task[]> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const args = call.args as Record<string, any>,
        currentTasks = tasksRef.current;
      logger.info("AI", `Executing tool: ${call.name}`, args);

      switch (call.name) {
        case "create_task": {
          const newTask: Task = {
            id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            title: args.title,
            description: args.description,
            status: "todo",
            priority: args.priority || "medium",
            createdAt: getNowISO(),
            dueAt: args.dueAt || getTodayISO(),
            category: args.category,
            tags: args.tags
              ? args.tags.map((t: string) => ({ id: `tag-${t}`, name: t }))
              : [],
          };

          // Call parent callback to add task
          await onTaskAdded(newTask);

          onNotify(
            "success",
            "Task Created",
            `"${newTask.title}" added to your list.`,
          );
          logger.info("AI", "Tool Result: Task Created", { id: newTask.id });
          return {
            success: true,
            id: newTask.id,
            message: "Task created successfully",
          };
        }

        case "query_tasks": {
          let results = currentTasks;
          if (args.status) {
            results = results.filter((t) => t.status === args.status);
          }
          if (args.date) {
            results = results.filter((t) => {
              const dates = [
                "startAt",
                "createdAt",
                "completedAt",
                "dueAt",
              ] satisfies (keyof typeof t)[];
              for (const d of dates) {
                if (t[d] && (t[d] satisfies string).startsWith(args.date)) {
                  return true;
                }
              }
              return false;
            });
          }
          if (args.search) {
            const q = args.search.toLowerCase();
            results = results.filter((t) => t.title.toLowerCase().includes(q));
          }
          logger.debug(
            "AI",
            `Tool Result: Query found ${results.length} tasks`,
          );
          return results.map(
            (t) =>
              ({
                id: t.id,
                title: t.title,
                dueAt: t.dueAt,
                status: t.status,
              }) as unknown as Task,
          ); // Returning partial objects is fine for context usually, but typing says Task[]
        }

        case "update_task": {
          const taskToUpdate = currentTasks.find((t) => t.id === args.id);
          if (!taskToUpdate) {
            onNotify(
              "error",
              "Update Failed",
              `Could not find task with ID ${args.id}`,
            );
            logger.warn("AI", "Tool Result: Update Failed (Not Found)", {
              id: args.id,
            });
            return { success: false, message: "Task not found" };
          }

          const changedFields: string[] = [];
          // Determine what changed for the notification
          Object.keys(args).forEach((key) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (key !== "id" && args[key] !== (taskToUpdate as any)[key]) {
              changedFields.push(key);
            }
          });

          const updatedTask = { ...taskToUpdate, ...args };

          // Call parent callback to update task
          await onTaskUpdated(updatedTask, taskToUpdate);

          const fieldText =
            changedFields.length > 0
              ? `Updated ${changedFields.join(", ")}`
              : "Updated properties";
          onNotify(
            "success",
            "Task Updated",
            `${fieldText} for "${taskToUpdate.title}"`,
          );
          logger.info("AI", "Tool Result: Task Updated", {
            id: args.id,
            fields: changedFields,
          });
          return { success: true, message: "Updated" };
        }

        case "delete_task": {
          const taskToDelete = currentTasks.find((t) => t.id === args.id);
          if (!taskToDelete) {
            onNotify(
              "error",
              "Delete Failed",
              `Could not find task with ID ${args.id}`,
            );
            logger.warn("AI", "Tool Result: Delete Failed (Not Found)", {
              id: args.id,
            });
            return { success: false, message: "Task not found" };
          }

          // Call parent callback to delete task
          await onTaskDeleted(args.id, taskToDelete);

          onNotify("info", "Task Deleted", `Removed "${taskToDelete.title}"`);
          logger.info("AI", "Tool Result: Task Deleted", { id: args.id });
          return { success: true, message: "Deleted" };
        }

        default:
          logger.error("AI", `Unknown tool called: ${call.name}`);
          return { error: "Unknown tool" };
      }
    },
    handleAICommand = async (input: string) => {
      const activeProvider = settings.aiConfig.activeProvider,
        config = settings.aiConfig.providers[activeProvider];

      try {
        const provider = await createProvider(activeProvider, config),
          tools = getToolDefinitions(),
          systemPrompt = getSystemPrompt();

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
            const result = await executeTool(call);
            toolResults.push({ id: call.id, name: call.name, result });
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
