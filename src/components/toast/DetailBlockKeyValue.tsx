import React from "react";

interface DetailBlockKeyValueProps {
  entries: { key: string; value: string }[];
}

export const DetailBlockKeyValue: React.FC<DetailBlockKeyValueProps> = ({
  entries,
}) => (
  <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
    {entries.map((entry) => (
      <React.Fragment key={entry.key}>
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          {entry.key}
        </span>
        <span className="text-xs text-slate-600 [.tasks-timeline-app[data-theme='dark']_&]:text-slate-300">
          {entry.value}
        </span>
      </React.Fragment>
    ))}
  </div>
);
