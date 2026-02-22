import type { CapabilityContext, ResourceSpec } from "../types";
import { getTodayISO, getDaysFromNowISO } from "../../utils/date-helpers";

export function createFilteredTasksResources(
  ctx: CapabilityContext,
): ResourceSpec[] {
  const overdueResource: ResourceSpec = {
    name: "overdue-tasks",
    uri: "tasks://overdue",
    description: "Tasks that are currently overdue.",
    mimeType: "application/json",

    async read() {
      const tasks = await ctx.getTasks();
      const overdueTasks = tasks.filter((t) => t.status === "overdue");

      return {
        contents: [
          {
            uri: "tasks://overdue",
            text: JSON.stringify({
              tasks: overdueTasks,
              count: overdueTasks.length,
              generatedAt: new Date().toISOString(),
            }),
            mimeType: "application/json",
          },
        ],
      };
    },
  };

  const todayResource: ResourceSpec = {
    name: "today-tasks",
    uri: "tasks://today",
    description: "Tasks due today or starting today.",
    mimeType: "application/json",

    async read() {
      const tasks = await ctx.getTasks();
      const today = getTodayISO();
      const todayTasks = tasks.filter(
        (t) => t.dueAt === today || t.startAt === today,
      );

      return {
        contents: [
          {
            uri: "tasks://today",
            text: JSON.stringify({
              tasks: todayTasks,
              count: todayTasks.length,
              generatedAt: new Date().toISOString(),
            }),
            mimeType: "application/json",
          },
        ],
      };
    },
  };

  const upcomingResource: ResourceSpec = {
    name: "upcoming-tasks",
    uri: "tasks://upcoming",
    description: "Tasks due in the next 7 days (excluding today).",
    mimeType: "application/json",

    async read() {
      const tasks = await ctx.getTasks();
      const today = getTodayISO();
      const sevenDaysOut = getDaysFromNowISO(7);

      const upcomingTasks = tasks.filter((t) => {
        if (!t.dueAt) return false;
        return t.dueAt > today && t.dueAt <= sevenDaysOut;
      });

      return {
        contents: [
          {
            uri: "tasks://upcoming",
            text: JSON.stringify({
              tasks: upcomingTasks,
              count: upcomingTasks.length,
              generatedAt: new Date().toISOString(),
            }),
            mimeType: "application/json",
          },
        ],
      };
    },
  };

  return [overdueResource, todayResource, upcomingResource];
}
