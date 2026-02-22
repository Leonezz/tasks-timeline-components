import type { CapabilityContext, PromptSpec } from "../types";

export function createTaskTriagePrompt(ctx: CapabilityContext): PromptSpec {
  return {
    name: "task_triage",
    description:
      "Triage tasks by identifying stale items and suggesting actions.",

    async render() {
      const tasks = await ctx.getTasks();

      const overdueTasks = tasks.filter((t) => t.status === "overdue");
      const unscheduledTasks = tasks.filter(
        (t) => t.status === "unplanned" || (t.status === "todo" && !t.dueAt),
      );

      const lines: string[] = [
        "Triage my tasks: identify stale items and suggest actions.",
        "",
        `## Overdue (${overdueTasks.length})`,
      ];

      for (const t of overdueTasks) {
        lines.push(`- ${t.title} — due ${t.dueAt} (${t.priority})`);
      }

      lines.push("");
      lines.push(`## Unscheduled (${unscheduledTasks.length})`);

      for (const t of unscheduledTasks) {
        lines.push(`- ${t.title} (${t.priority})`);
      }

      lines.push("");
      lines.push(
        "For each task, suggest one action: reschedule to a specific date, cancel, or complete. Use the available tools to make changes.",
      );

      return [{ role: "user", content: lines.join("\n") }];
    },
  };
}
