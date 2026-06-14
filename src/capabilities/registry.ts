import type {
  CapabilityContext,
  Capabilities,
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

export function createCapabilities(ctx: CapabilityContext): Capabilities {
  const tools: ToolSpec[] = [
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

  const resources: ResourceSpec[] = [
    createAllTasksResource(ctx),
    createTaskByIdResource(ctx),
    ...createFilteredTasksResources(ctx),
    createStatsResource(ctx),
  ];

  const prompts: PromptSpec[] = [
    createPlanMyDayPrompt(ctx),
    createWeeklyReviewPrompt(ctx),
    createTaskTriagePrompt(ctx),
  ];

  const toolMap = new Map(tools.map((t) => [t.name, t]));
  const resourceMap = new Map(resources.map((r) => [r.name, r]));
  const promptMap = new Map(prompts.map((p) => [p.name, p]));

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
      return tool.execute(args);
    },
  };
}
