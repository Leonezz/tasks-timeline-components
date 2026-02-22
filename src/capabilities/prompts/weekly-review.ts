import type { CapabilityContext, PromptSpec } from "../types";

export function createWeeklyReviewPrompt(ctx: CapabilityContext): PromptSpec {
  return {
    name: "weekly_review",
    description:
      "Review task progress for the week and suggest priorities for next week.",
    arguments: [
      {
        name: "weekStart",
        description: "Start of week (YYYY-MM-DD)",
        required: false,
      },
    ],

    async render() {
      const tasks = await ctx.getTasks();

      const completedTasks = tasks.filter((t) => t.status === "done");
      const overdueTasks = tasks.filter((t) => t.status === "overdue");
      const activeTasks = tasks.filter(
        (t) =>
          t.status !== "done" &&
          t.status !== "cancelled" &&
          t.status !== "overdue",
      );
      const total = tasks.length;

      const lines: string[] = [
        "Review my task progress for this week and suggest priorities for next week.",
        "",
        "## Summary",
        `- Completed: ${completedTasks.length}`,
        `- Overdue: ${overdueTasks.length}`,
        `- Active: ${activeTasks.length}`,
        `- Total: ${total}`,
        "",
        "## Completed Tasks",
      ];

      for (const t of completedTasks) {
        lines.push(`- ${t.title} (completed)`);
      }

      lines.push("");
      lines.push("## Still Active");

      for (const t of [...overdueTasks, ...activeTasks]) {
        const dueInfo = t.dueAt ? ` — due ${t.dueAt}` : "";
        lines.push(`- [${t.status}] ${t.title} (${t.priority})${dueInfo}`);
      }

      lines.push("");
      lines.push(
        "Suggest what to prioritize next week and which overdue tasks to reschedule or cancel.",
      );

      return [{ role: "user", content: lines.join("\n") }];
    },
  };
}
