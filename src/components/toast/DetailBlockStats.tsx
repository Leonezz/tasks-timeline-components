import React from "react";

interface StatsData {
  total: number;
  byStatus: Record<string, number>;
  byDisplayStatus?: Record<string, number>;
  byPriority: Record<string, number>;
}

const statusColors: Record<string, string> = {
  done: "bg-emerald-500",
  overdue: "bg-rose-500",
  due: "bg-amber-500",
  doing: "bg-blue-500",
  scheduled: "bg-indigo-400",
  todo: "bg-slate-400",
  cancelled: "bg-slate-300",
  unplanned: "bg-purple-400",
};

export const DetailBlockStats: React.FC<{ data: StatsData }> = ({ data }) => (
  <div className="space-y-2">
    <div className="text-xs font-semibold text-slate-700 [.tasks-timeline-app[data-theme='dark']_&]:text-slate-200">
      {data.total} total tasks
    </div>
    {/* Status bar */}
    {data.total > 0 && (
      <div className="flex h-2 rounded-full overflow-hidden bg-slate-100 [.tasks-timeline-app[data-theme='dark']_&]:bg-slate-700">
        {Object.entries(data.byDisplayStatus ?? data.byStatus).map(
          ([status, count]) =>
            count > 0 ? (
              <div
                key={status}
                className={statusColors[status] || "bg-slate-400"}
                style={{ width: `${(count / data.total) * 100}%` }}
                title={`${status}: ${count}`}
              />
            ) : null,
        )}
      </div>
    )}
    {/* Priority badges */}
    <div className="flex gap-2 flex-wrap">
      {Object.entries(data.byPriority).map(([priority, count]) =>
        count > 0 ? (
          <span
            key={priority}
            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium [.tasks-timeline-app[data-theme='dark']_&]:bg-slate-700 [.tasks-timeline-app[data-theme='dark']_&]:text-slate-300"
          >
            {priority}: {count}
          </span>
        ) : null,
      )}
    </div>
  </div>
);
