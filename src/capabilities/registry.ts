import type {
  CapabilityContext,
  Capabilities,
  CreateCapabilitiesOptions,
  ToolSpec,
  ResourceSpec,
  PromptSpec,
} from "./types";
import type { ToolResult } from "../providers/types";
import { createCreateTaskTool } from "./tools/create-task";
import { createQueryTasksTool } from "./tools/query-tasks";
import { createUpdateTaskTool } from "./tools/update-task";
import { createDeleteTaskTool } from "./tools/delete-task";
import { createCompleteTaskTool } from "./tools/complete-task";
import { createCancelTaskTool } from "./tools/cancel-task";
import { createBatchUpdateTasksTool } from "./tools/batch-update-tasks";
import { createGetTaskStatsTool } from "./tools/get-task-stats";
import { createGetTodayPlanTool } from "./tools/get-today-plan";
import { createNotifyUserTool } from "./tools/notify-user";
import { createAskUserTool } from "./tools/ask-user";
import {
  createGetViewSettingsTool,
  createResetViewSettingsTool,
  createSetTaskFiltersTool,
  createSetTaskSortTool,
  createUpdateViewSettingsTool,
} from "./tools/settings";
import { createAllTasksResource } from "./resources/all-tasks";
import { createTaskByIdResource } from "./resources/task-by-id";
import { createFilteredTasksResources } from "./resources/filtered-tasks";
import { createStatsResource } from "./resources/stats";
import { createPlanMyDayPrompt } from "./prompts/plan-my-day";
import { createWeeklyReviewPrompt } from "./prompts/weekly-review";
import { createTaskTriagePrompt } from "./prompts/task-triage";
import { getSystemPrompt } from "./system-prompt";

function buildUniqueMap<T extends { name: string }>(
  kind: string,
  items: T[],
): Map<string, T> {
  const map = new Map<string, T>();
  for (const item of items) {
    if (map.has(item.name)) {
      throw new Error(
        `createCapabilities: duplicate ${kind} name "${item.name}". Extra ${kind}s must not reuse a built-in or another extra ${kind} name.`,
      );
    }
    map.set(item.name, item);
  }
  return map;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function createCapabilities(
  ctx: CapabilityContext,
  options: CreateCapabilitiesOptions = {},
): Capabilities {
  const builtInTools: ToolSpec[] = [
    createCreateTaskTool(ctx),
    createQueryTasksTool(ctx),
    createUpdateTaskTool(ctx),
    createDeleteTaskTool(ctx),
    createCompleteTaskTool(ctx),
    createCancelTaskTool(ctx),
    createBatchUpdateTasksTool(ctx),
    createGetTaskStatsTool(ctx),
    createGetTodayPlanTool(ctx),
    createNotifyUserTool(ctx),
    createAskUserTool(ctx),
    createGetViewSettingsTool(ctx),
    createUpdateViewSettingsTool(ctx),
    createSetTaskFiltersTool(ctx),
    createSetTaskSortTool(ctx),
    createResetViewSettingsTool(ctx),
  ];
  const tools: ToolSpec[] = [...builtInTools, ...(options.extraTools ?? [])];

  const builtInResources: ResourceSpec[] = [
    createAllTasksResource(ctx),
    createTaskByIdResource(ctx),
    ...createFilteredTasksResources(ctx),
    createStatsResource(ctx),
  ];
  const resources: ResourceSpec[] = [
    ...builtInResources,
    ...(options.extraResources ?? []),
  ];

  const builtInPrompts: PromptSpec[] = [
    createPlanMyDayPrompt(ctx),
    createWeeklyReviewPrompt(ctx),
    createTaskTriagePrompt(ctx),
  ];
  const prompts: PromptSpec[] = [
    ...builtInPrompts,
    ...(options.extraPrompts ?? []),
  ];

  const toolMap = buildUniqueMap("tool", tools);
  const resourceMap = buildUniqueMap("resource", resources);
  const promptMap = buildUniqueMap("prompt", prompts);

  return {
    tools,
    resources,
    prompts,

    getTool: (name: string) => toolMap.get(name),
    getResource: (name: string) => resourceMap.get(name),
    getPrompt: (name: string) => promptMap.get(name),

    getSystemPrompt: (developerPrompt?: string, userPrompt?: string) =>
      getSystemPrompt(developerPrompt, userPrompt),

    async executeTool(
      name: string,
      args: Record<string, unknown>,
    ): Promise<ToolResult> {
      const tool = toolMap.get(name);
      if (!tool) {
        return { name, result: { error: `Unknown tool: ${name}` } };
      }
      try {
        return await tool.execute(args);
      } catch (error) {
        return { name, result: { error: errorMessage(error) } };
      }
    },
  };
}
