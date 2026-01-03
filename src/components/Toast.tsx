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

  const getColors = () => {
    switch (toast.type) {
      case "success":
        return "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-100";
      case "error":
        return "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-100";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-100";
    }
  };

  return (
    <MotionDiv
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md max-w-sm w-full pointer-events-auto",
        getColors()
      )}
    >
      <div className="mt-0.5 shrink-0 opacity-80">
        <Icon name={getIcon()} size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold leading-tight">{toast.title}</h4>
        {toast.description && (
          <p className="text-xs opacity-80 mt-1 leading-snug">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="opacity-40 hover:opacity-100 transition-opacity p-0.5"
      >
        <Icon name="X" size={14} />
      </button>
    </MotionDiv>
  );
};
