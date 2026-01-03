import { DateTime } from "luxon";
import type { Task } from "./types";

export const generateMockData = (): Task[] => {
  const now = DateTime.now();
  const today = now.toISODate(); // YYYY-MM-DD
  const tomorrow = now.plus({ days: 1 }).toISODate();
  const nextWeek = now.plus({ weeks: 1 }).toISODate();
  const yesterday = now.minus({ days: 1 }).toISODate();
  const lastMonth = now.minus({ months: 1 }).set({ day: 15 }).toISODate();
  const lastYear = now.minus({ years: 1 }).set({ day: 10 }).toISODate();
  const twoYearsAgo = now.minus({ years: 2 }).toISODate();

  return [
    // --- TODAY ---
    {
      id: "t-1",
      title: "Review PR #405 for design system",
      status: "todo",
      createdAt: yesterday,
      dueDate: today,
      priority: "medium",
      tags: [{ id: "tag-1", name: "dev" }],
      category: "Work",
    },
    {
      id: "t-2",
      title: "Weekly sync with product team",
      status: "scheduled",
      createdAt: lastMonth,
      startAt: `${today}T10:00:00`,
      dueDate: today,
      priority: "high",
      tags: [{ id: "tag-2", name: "meeting" }],
      isRecurring: true,
      recurringInterval: "FREQ=WEEKLY;INTERVAL=1;BYDAY=MO",
      description: "Discuss roadmap for v2.0 and Q4 goals",
      category: "Work",
    },
    {
      id: "t-3",
      title: "Pick up dry cleaning",
      status: "todo",
      createdAt: today,
      dueDate: today,
      priority: "low",
      tags: [{ id: "tag-3", name: "personal" }],
      category: "Personal",
    },

    // --- TOMORROW ---
    {
      id: "t-4",
      title: "Prepare slides for All-Hands",
      status: "todo",
      createdAt: today,
      dueDate: tomorrow,
      priority: "high",
      tags: [{ id: "tag-4", name: "work" }],
      category: "Work",
    },
    {
      id: "t-9",
      title: "Gym Session: Leg Day",
      status: "scheduled",
      createdAt: yesterday,
      dueDate: tomorrow,
      startAt: `${tomorrow}T07:00:00`,
      priority: "medium",
      tags: [{ id: "tag-health", name: "health" }],
      category: "Health",
      isRecurring: true,
      recurringInterval: "FREQ=WEEKLY;INTERVAL=1;BYDAY=TU,TH",
    },

    // --- NEXT WEEK ---
    {
      id: "t-10",
      title: "Car Service Appointment",
      status: "unplanned",
      createdAt: lastMonth,
      dueDate: nextWeek,
      priority: "medium",
      tags: [{ id: "tag-car", name: "maintenance" }],
      description: "Oil change and tire rotation at the dealership.",
      category: "Personal",
    },

    // --- YESTERDAY ---
    {
      id: "t-5",
      title: "Send invoice to Client X",
      status: "done",
      createdAt: yesterday,
      dueDate: yesterday,
      completedAt: `${yesterday}T14:30:00`,
      priority: "medium",
      tags: [{ id: "tag-5", name: "finance" }],
      category: "Work",
    },
    {
      id: "t-6",
      title: "Email catch-up",
      status: "overdue",
      createdAt: now.minus({ days: 3 }).toISODate(),
      dueDate: yesterday,
      priority: "low",
      tags: [],
      category: "Work",
    },

    // --- PAST DATES ---
    {
      id: "t-7",
      title: "Update monthly report metrics",
      status: "done",
      createdAt: lastMonth,
      dueDate: lastMonth,
      completedAt: lastMonth,
      priority: "medium",
      tags: [{ id: "tag-2", name: "reporting" }],
      category: "Work",
    },

    // --- PAST YEAR ---
    {
      id: "t-8",
      title: "Legacy system migration planning",
      status: "cancelled",
      createdAt: lastYear,
      dueDate: lastYear,
      priority: "low",
      tags: [{ id: "tag-1", name: "dev" }],
      description: "Postponed indefinitely due to budget cuts",
      category: "Work",
    },

    // --- OLD ARCHIVE ---
    {
      id: "t-11",
      title: "Initial Project Setup",
      status: "done",
      createdAt: twoYearsAgo,
      dueDate: twoYearsAgo,
      completedAt: twoYearsAgo,
      priority: "high",
      tags: [{ id: "t-setup", name: "setup" }],
      category: "Work",
    },

    // --- BACKLOG (Truly Undated) ---
    // Note: To be backlog, they must lack meaningful dates in the active strategy or entirely.
    // In our logic, backlog items have NO valid date fields at all.
    {
      id: "t-12",
      title: 'Read "Clean Code" book',
      status: "todo",
      createdAt: "", // Intentionally empty to force backlog if grouping logic checks
      dueDate: "",
      priority: "low",
      tags: [{ id: "tag-learning", name: "learning" }],
      category: "Personal",
    },
    {
      id: "t-13",
      title: "Research new frontend frameworks",
      status: "todo",
      createdAt: "",
      dueDate: "",
      priority: "low",
      description: "Look into Svelte and SolidJS",
      tags: [{ id: "dev", name: "dev" }],
      category: "Work",
    },
    {
      id: "t-14",
      title: "Learn Italian",
      status: "todo",
      createdAt: "",
      dueDate: "",
      priority: "low",
      category: "Personal",
      tags: [],
    },
    {
      id: "t-15",
      title: "Clean out garage",
      status: "todo",
      createdAt: "",
      dueDate: "",
      priority: "medium",
      category: "Home",
      tags: [],
    },
  ];
};
