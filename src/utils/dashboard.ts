import type { Task } from "../types";
import { deriveTaskRenderState, type TaskRenderState } from "./task";

/**
 * The stat cards above the timeline. Every open task belongs to exactly one
 * card, picked by its primary display status (the status a row shows):
 *
 * - `urgent`    due today/tomorrow or overdue ("Due & OD")
 * - `doing`     in progress, or scheduled to start later ("Doing")
 * - `unplanned` open, with no due or start date
 * - `todo`      open, planned, nothing else applies ("To Do")
 *
 * Done and cancelled tasks belong to no card. A card's number and the list
 * shown when it is selected come from this one classifier, so they always
 * agree.
 */
export type DashboardCard = "todo" | "unplanned" | "urgent" | "doing";

export type DashboardCardCounts = Readonly<Record<DashboardCard, number>>;

export const DASHBOARD_CARDS: readonly DashboardCard[] = [
  "todo",
  "unplanned",
  "urgent",
  "doing",
];

const assertDashboardCard = (card: string): DashboardCard => {
  if (!DASHBOARD_CARDS.includes(card as DashboardCard)) {
    throw new Error(
      `Unknown dashboard card "${card}". Expected one of: ${DASHBOARD_CARDS.join(", ")}.`,
    );
  }
  return card as DashboardCard;
};

export const dashboardCardForRenderState = (
  state: TaskRenderState,
): DashboardCard | null => {
  switch (state.primaryStatus) {
    case "due":
    case "overdue":
      return "urgent";
    case "doing":
    case "scheduled":
      return "doing";
    case "unplanned":
      return "unplanned";
    case "todo":
      return "todo";
    default:
      return null;
  }
};

export const deriveDashboardCard = (task: Task): DashboardCard | null =>
  dashboardCardForRenderState(deriveTaskRenderState(task));

export const countDashboardCards = (
  tasks: readonly Task[],
): DashboardCardCounts => {
  const counts: Record<DashboardCard, number> = {
    todo: 0,
    unplanned: 0,
    urgent: 0,
    doing: 0,
  };
  for (const task of tasks) {
    const card = deriveDashboardCard(task);
    if (card) {
      counts[card] += 1;
    }
  }
  return counts;
};

/** The tasks of one card; every task when no card is selected. */
export const filterByDashboardCard = (
  tasks: Task[],
  card: DashboardCard | null,
): Task[] => {
  if (card === null) {
    return tasks;
  }
  const selected = assertDashboardCard(card);
  return tasks.filter((task) => deriveDashboardCard(task) === selected);
};
