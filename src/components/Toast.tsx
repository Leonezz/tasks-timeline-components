import React, { useEffect } from "react";
import { Icon } from "./Icon";
import { cn } from "../utils";
import { MotionDiv } from "./Motion";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000); // Auto dismiss after 4 seconds
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return "CheckCircle2";
      case "error":
        return "AlertCircle";
      case "info":
        return "Info";
    }
  };

  const getStyles = () => {
    // Base: Neutral Paper with Blur + Subtle Shadow
    const base =
      "bg-white/95 backdrop-blur-md border shadow-xl shadow-slate-200/50 [.chronos-app[data-theme='dark']_&]:bg-slate-800/95 [.chronos-app[data-theme='dark']_&]:shadow-black/20 [.chronos-app[data-theme='dark']_&]:border-slate-700/50";

    // Semantic Borders (Subtle)
    switch (toast.type) {
      case "success":
        return cn(
          base,
          "border-l-4 border-l-emerald-500 border-y-emerald-100/50 border-r-emerald-100/50 [.chronos-app[data-theme='dark']_&]:border-y-emerald-500/20 [.chronos-app[data-theme='dark']_&]:border-r-emerald-500/20"
        );
      case "error":
        return cn(
          base,
          "border-l-4 border-l-rose-500 border-y-rose-100/50 border-r-rose-100/50 [.chronos-app[data-theme='dark']_&]:border-y-rose-500/20 [.chronos-app[data-theme='dark']_&]:border-r-rose-500/20"
        );
      case "info":
        return cn(
          base,
          "border-l-4 border-l-blue-500 border-y-blue-100/50 border-r-blue-100/50 [.chronos-app[data-theme='dark']_&]:border-y-blue-500/20 [.chronos-app[data-theme='dark']_&]:border-r-blue-500/20"
        );
    }
  };

  const getIconColor = () => {
    switch (toast.type) {
      case "success":
        return "text-emerald-500 [.chronos-app[data-theme='dark']_&]:text-emerald-400";
      case "error":
        return "text-rose-500 [.chronos-app[data-theme='dark']_&]:text-rose-400";
      case "info":
        return "text-blue-500 [.chronos-app[data-theme='dark']_&]:text-blue-400";
    }
  };

  return (
    <MotionDiv
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg max-w-sm w-full pointer-events-auto text-slate-800 [.chronos-app[data-theme='dark']_&]:text-slate-100",
        getStyles()
      )}
    >
      <div className={cn("mt-0.5 shrink-0", getIconColor())}>
        <Icon name={getIcon()} size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold leading-tight">{toast.title}</h4>
        {toast.description && (
          <p className="text-xs opacity-80 mt-1 leading-snug font-medium text-slate-500 [.chronos-app[data-theme='dark']_&]:text-slate-400">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="opacity-40 hover:opacity-100 transition-opacity p-0.5 -mr-1 -mt-1"
      >
        <Icon name="X" size={14} />
      </button>
    </MotionDiv>
  );
};
