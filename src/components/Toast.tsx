import React, { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Icon } from "./Icon";
import { cn } from "../utils";
import { MotionDiv } from "./Motion";
import { DetailBlockRenderer } from "./toast/DetailBlockRenderer";
import type { ToastMessage } from "../types";

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  toast,
  onDismiss,
  isExpanded,
  onToggleExpand,
}) => {
  useEffect(() => {
    if (toast.timeout === null || toast.timeout <= 0) {
      return;
    }
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.timeout);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss, toast.timeout]);

  const getIcon = () => {
      switch (toast.variant) {
        case "success":
          return "CheckCircle2";
        case "error":
          return "AlertCircle";
        case "info":
          return "Info";
        case "warning":
          return "AlertTriangle";
      }
    },
    getStyles = () => {
      // Base: Neutral Paper with Blur + Subtle Shadow
      const base =
        "bg-white/95 backdrop-blur-md border shadow-xl shadow-slate-200/50 [.chronos-app[data-theme='dark']_&]:bg-slate-800/95 [.chronos-app[data-theme='dark']_&]:shadow-black/20 [.chronos-app[data-theme='dark']_&]:border-slate-700/50";

      // Semantic Borders (Subtle)
      switch (toast.variant) {
        case "success":
          return cn(
            base,
            "border-l-4 border-l-emerald-500 border-y-emerald-100/50 border-r-emerald-100/50 [.chronos-app[data-theme='dark']_&]:border-y-emerald-500/20 [.chronos-app[data-theme='dark']_&]:border-r-emerald-500/20",
          );
        case "error":
          return cn(
            base,
            "border-l-4 border-l-rose-500 border-y-rose-100/50 border-r-rose-100/50 [.chronos-app[data-theme='dark']_&]:border-y-rose-500/20 [.chronos-app[data-theme='dark']_&]:border-r-rose-500/20",
          );
        case "info":
          return cn(
            base,
            "border-l-4 border-l-blue-500 border-y-blue-100/50 border-r-blue-100/50 [.chronos-app[data-theme='dark']_&]:border-y-blue-500/20 [.chronos-app[data-theme='dark']_&]:border-r-blue-500/20",
          );
        case "warning":
          return cn(
            base,
            "border-l-4 border-l-amber-500 border-y-amber-100/50 border-r-amber-100/50 [.chronos-app[data-theme='dark']_&]:border-y-amber-500/20 [.chronos-app[data-theme='dark']_&]:border-r-amber-500/20",
          );
      }
    },
    getIconColor = () => {
      switch (toast.variant) {
        case "success":
          return "text-emerald-500 [.chronos-app[data-theme='dark']_&]:text-emerald-400";
        case "error":
          return "text-rose-500 [.chronos-app[data-theme='dark']_&]:text-rose-400";
        case "info":
          return "text-blue-500 [.chronos-app[data-theme='dark']_&]:text-blue-400";
        case "warning":
          return "text-amber-500 [.chronos-app[data-theme='dark']_&]:text-amber-400";
      }
    };

  return (
    <MotionDiv
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg w-full pointer-events-auto text-slate-800 [.chronos-app[data-theme='dark']_&]:text-slate-100",
        isExpanded ? "max-w-[350px]" : "max-w-sm",
        getStyles(),
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
        {toast.body && (
          <p className="text-xs mt-2 leading-relaxed text-slate-600 [.chronos-app[data-theme='dark']_&]:text-slate-300 whitespace-pre-wrap">
            {toast.body}
          </p>
        )}
        {toast.interaction.kind === "confirm" && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() =>
                toast.interaction.kind === "confirm" &&
                toast.interaction.onConfirm()
              }
              className="px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              {toast.interaction.kind === "confirm" &&
                (toast.interaction.confirmLabel || "Yes")}
            </button>
            <button
              onClick={() => {
                if (toast.interaction.kind === "confirm") {
                  toast.interaction.onCancel?.();
                }
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors [.chronos-app[data-theme='dark']_&]:bg-slate-700 [.chronos-app[data-theme='dark']_&]:text-slate-300"
            >
              {toast.interaction.kind === "confirm" &&
                (toast.interaction.cancelLabel || "No")}
            </button>
          </div>
        )}
        {toast.interaction.kind === "select" && (
          <div className="flex flex-col gap-1.5 mt-3">
            {toast.interaction.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() =>
                  toast.interaction.kind === "select" &&
                  toast.interaction.onSelect(opt.value)
                }
                className="text-left px-3 py-1.5 text-xs font-medium rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors [.chronos-app[data-theme='dark']_&]:bg-slate-700 [.chronos-app[data-theme='dark']_&]:border-slate-600 [.chronos-app[data-theme='dark']_&]:hover:bg-slate-600"
              >
                {opt.label}
              </button>
            ))}
            <button
              onClick={() =>
                toast.interaction.kind === "select" &&
                toast.interaction.onCancel?.()
              }
              className="text-center px-3 py-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
        {toast.detail && toast.detail.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => onToggleExpand?.(toast.id)}
              className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1 transition-colors"
            >
              <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={12} />
              {isExpanded ? "Hide details" : "Show details"}
            </button>
            <AnimatePresence>
              {isExpanded && (
                <MotionDiv
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 space-y-2 max-h-[40vh] overflow-y-auto">
                    {toast.detail.map((block, i) => (
                      <DetailBlockRenderer key={i} block={block} />
                    ))}
                  </div>
                </MotionDiv>
              )}
            </AnimatePresence>
          </div>
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
