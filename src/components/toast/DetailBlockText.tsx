import React from "react";

export const DetailBlockText: React.FC<{ content: string }> = ({ content }) => (
  <p className="text-xs text-slate-600 [.chronos-app[data-theme='dark']_&]:text-slate-400 leading-relaxed whitespace-pre-wrap">
    {content}
  </p>
);
