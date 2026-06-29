import type { CapabilityContext, PromptSpec } from "../types";
import { getTodayISO } from "../../utils/date-helpers";
import { deriveTaskRenderState } from "../../utils/task";

export function createPlanMyDayPrompt(ctx: CapabilityContext): PromptSpec {
  return {
    name: "plan_my_day",
    description:
      "Review today's tasks and create a prioritized plan for the day.",
    arguments: [
      {
        name: "focusArea",
        description: "What to prioritize today",
        required: false,
      },
    ],

    async render(args?: Record<string, string>) {
      const tasks = await ctx.getTasks();
      const today = getTodayISO();

      const todayTasks = tasks.filter((t) => {
        const renderState = deriveTaskRenderState(t);
        return (
          t.dueAt?.startsWith(today) &&
          renderState.workflowStatus !== "done" &&
          renderState.workflowStatus !== "cancelled"
        );
      });

      const overdueTasks = tasks.filter(
        (t) => deriveTaskRenderState(t).temporalStatus === "overdue",
      );

      const lines: string[] = [
        "Review my tasks for today and create a prioritized plan.",
      ];

      if (args?.focusArea) {
        lines.push(`Focus area: ${args.focusArea}`);
      }

      lines.push("");
      lines.push(`## Today's Tasks (${todayTasks.length})`);
      for (const t of todayTasks) {
        const renderState = deriveTaskRenderState(t);
        lines.push(
          `- [${renderState.workflowStatus}/${renderState.primaryStatus}] ${t.title} (${t.priority})`,
        );
      }

      lines.push("");
      lines.push(`## Overdue (${overdueTasks.length})`);
      for (const t of overdueTasks) {
        lines.push(`- ${t.title} — due ${t.dueAt}`);
      }

      lines.push("");
      lines.push(
        "Use the available tools to reschedule, complete, or update tasks as needed.",
      );

      return [{ role: "user", content: lines.join("\n") }];
    },
  };
}
