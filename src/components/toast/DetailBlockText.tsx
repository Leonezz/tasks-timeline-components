import React from "react";
import { MarkdownText } from "../MarkdownText";

export const DetailBlockText: React.FC<{ content: string }> = ({ content }) => (
  <MarkdownText
    content={content}
    className="text-xs leading-relaxed text-slate-600 [.tasks-timeline-app[data-theme='dark']_&]:text-slate-400"
    compact
  />
);
