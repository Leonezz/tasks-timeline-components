import React from "react";
import type { Task } from "../../types";
import { deriveTaskRenderState } from "../../utils/task";

const priorityColors: Record<string, string> = {
  high: "bg-rose-100 text-rose-700 [.tasks-timeline-app[data-theme='dark']_&]:bg-rose-900/30 [.tasks-timeline-app[data-theme='dark']_&]:text-rose-400",
  medium:
    "bg-amber-100 text-amber-700 [.tasks-timeline-app[data-theme='dark']_&]:bg-amber-900/30 [.tasks-timeline-app[data-theme='dark']_&]:text-amber-400",
  low: "bg-slate-100 text-slate-600 [.tasks-timeline-app[data-theme='dark']_&]:bg-slate-700 [.tasks-timeline-app[data-theme='dark']_&]:text-slate-400",
};

const statusDots: Record<string, string> = {
  done: "bg-emerald-500",
  overdue: "bg-rose-500",
  due: "bg-amber-500",
  doing: "bg-blue-500",
  scheduled: "bg-indigo-400",
  todo: "bg-slate-400",
  cancelled: "bg-slate-300",
  unplanned: "bg-purple-400",
};

interface DetailBlockTaskListProps {
  tasks: Task[];
  label?: string;
}

export const DetailBlockTaskList: React.FC<DetailBlockTaskListProps> = ({
  tasks,
  label,
}) => (
  <div>
    {label && (
      <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
        {label}
      </h5>
    )}
    <div className="space-y-1">
      {tasks.map((task) => {
        const { primaryStatus } = deriveTaskRenderState(task);
        return (
          <div
            key={task.id}
            className="flex items-center gap-2 px-2 py-1.5 rounded bg-slate-50 [.tasks-timeline-app[data-theme='dark']_&]:bg-slate-700/50"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDots[primaryStatus] || "bg-slate-400"}`}
            />
            <span className="text-xs font-medium truncate flex-1">
              {task.title}
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${priorityColors[task.priority] || ""}`}
            >
              {task.priority}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);
