import type { DateGroupBy } from "@/types";

export const GROUP_STRATEGIES: { id: DateGroupBy; label: string }[] = [
  { id: "dueAt", label: "Due Date" },
  { id: "createdAt", label: "Created Date" },
  { id: "startAt", label: "Start Date" },
  { id: "completedAt", label: "Completed Date" },
];

export const DATE_FORMATS = [
  { value: "MMM d", label: "Oct 24" },
  { value: "EEE, MMM d", label: "Mon, Oct 24" },
  { value: "yyyy-MM-dd", label: "2023-10-24" },
  { value: "dd/MM/yyyy", label: "24/10/2023" },
];
