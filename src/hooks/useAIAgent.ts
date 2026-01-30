import { useEffect, useRef } from "react";
import { type FunctionCall, GoogleGenAI, type Part } from "@google/genai";
import { DateTime } from "luxon";
import type { AppSettings, Task } from "../types";
import { getToolDefinitions } from "../utils";
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
      call: FunctionCall,
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
            createdAt: DateTime.now().toISO()!,
            dueAt: args.dueAt || DateTime.now().toISODate()!,
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
      const config =
        settings.aiConfig.providers[settings.aiConfig.activeProvider];

      // Ensure Gemini is selected for this demo implementation
      if (settings.aiConfig.activeProvider !== "gemini") {
        onNotify(
          "error",
          "Provider Not Supported",
          "Only Gemini provider is fully implemented in this demo.",
        );
        return;
      }

      // Always initialize GoogleGenAI with the externally provided process.env.API_KEY
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }),
        tools = getToolDefinitions();

      try {
        logger.info("AI", "Sending prompt to Gemini", {
          input,
          model: config.model,
        });
        const chat = ai.chats.create({
          model: config.model || "gemini-3-flash-preview",
          config: {
            systemInstruction: `You are a task manager agent. You have tools to query, create, update, and delete tasks. When asked to modify tasks based on criteria (e.g. 'all tasks next week'), ALWAYS query_tasks first to get their IDs. Today is ${new Date().toISOString()}`,
            tools: [{ functionDeclarations: tools }],
          },
        });

        // Single Turn Execution Loop
        let chatResponse = await chat.sendMessage({ message: input });

        // Track Tokens
        if (chatResponse.usageMetadata && onTokenUsageUpdate) {
          const total = chatResponse.usageMetadata.totalTokenCount || 0;
          onTokenUsageUpdate(total);
          logger.debug("AI", "Token Usage", { tokens: total });
        }

        let loopCount = 0;
        const maxLoops = 5;

        // Process tool calls recursively if the model requests them
        while (
          chatResponse.functionCalls &&
          chatResponse.functionCalls.length > 0 &&
          loopCount < maxLoops
        ) {
          loopCount++;
          const functionResponses: Part[] = [];

          for (const call of chatResponse.functionCalls) {
            const result = await executeTool(call);
            functionResponses.push({
              functionResponse: {
                id: call.id,
                name: call.name,
                response: { result },
              },
            });
          }

          // Send tool outputs back to model to update context
          chatResponse = await chat.sendMessage({ message: functionResponses });

          // Track Tokens for follow-up turns
          if (chatResponse.usageMetadata && onTokenUsageUpdate) {
            const total = chatResponse.usageMetadata.totalTokenCount || 0;
            onTokenUsageUpdate(total);
          }
        }
      } catch (e) {
        console.error("AI Error", e);
        onNotify(
          "error",
          "AI Agent Error",
          "Something went wrong while processing your request.",
        );
        logger.error("AI", "Agent processing failed", e);
      }
    };

  return { handleAICommand };
};
