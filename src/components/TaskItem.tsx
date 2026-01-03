import React, { useState, useRef, useEffect } from "react";
import * as Popover from "@radix-ui/react-popover";
import * as Lucide from "lucide-react";
import type { Task, TaskStatus, AppSettings } from "../types";
import { cn, formatSmartDate, formatRecurrence, formatTime } from "../utils";
import { Icon } from "./Icon";
import { MotionDiv, MotionButton } from "./Motion";
import { useAppContext } from "./AppContext";

interface TaskItemProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
  onEdit?: (task: Task) => void;
  settings: AppSettings;
  missingStrategies?: string[];
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onUpdate,
  onDelete,
  onEdit,
  settings,
  missingStrategies,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const deleteTimeoutRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { portalContainer } = useAppContext();

  const isDone = task.status === "done";
  const isCancelled = task.status === "cancelled";
  const today = new Date().toISOString().split("T")[0];

  // Highlight logic
  const isUrgent =
    !isDone &&
    !isCancelled &&
    task.priority === "high" &&
    (task.status === "overdue" ||
      task.status === "due" ||
      (task.dueDate && task.dueDate <= today));

  // Font size mapping
  const fontSizeClass =
    {
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    }[settings.fontSize] || "text-sm";

  const iconTopSpacing =
    {
      sm: "mt-0.5",
      base: "mt-0.5",
      lg: "mt-1",
      xl: "mt-1.5",
    }[settings.fontSize] || "mt-0.5";

  const metadataSizeClass =
    {
      sm: "text-[10px]",
      base: "text-[11px]",
      lg: "text-xs",
      xl: "text-sm",
    }[settings.fontSize] || "text-[11px]";

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleStatusChange = (newStatus: TaskStatus) => {
    onUpdate({ ...task, status: newStatus });
  };

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      onUpdate({ ...task, title: editTitle });
    } else {
      setEditTitle(task.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSaveEdit();
    if (e.key === "Escape") {
      setEditTitle(task.title);
      setIsEditing(false);
    }
  };

  const handleDeleteClick = () => {
    if (deleteConfirm) {
      onDelete(task.id);
      if (deleteTimeoutRef.current)
        window.clearTimeout(deleteTimeoutRef.current);
    } else {
      setDeleteConfirm(true);
      deleteTimeoutRef.current = window.setTimeout(() => {
        setDeleteConfirm(false);
      }, 2000); // 2 seconds to confirm
    }
  };

  const getDueDateColor = (dateStr?: string, status?: TaskStatus) => {
    if (status === "done" || status === "cancelled")
      return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (!dateStr) return "text-slate-400";

    if (status === "overdue") return "text-rose-600 bg-rose-50 border-rose-200";
    if (dateStr < today) return "text-rose-600 bg-rose-50 border-rose-200";
    if (dateStr === today) return "text-amber-600 bg-amber-50 border-amber-200";

    return "text-emerald-600 bg-emerald-50 border-emerald-200";
  };

  const getLineColor = (status: TaskStatus) => {
    switch (status) {
      case "done":
        return "bg-emerald-500";
      case "scheduled":
        return "bg-blue-500";
      case "due":
        return "bg-amber-500";
      case "overdue":
        return "bg-rose-500";
      case "cancelled":
        return "bg-slate-300";
      case "unplanned":
        return "bg-purple-500";
      default:
        return "bg-slate-200";
    }
  };

  const getStatusIconName = (status: TaskStatus): keyof typeof Lucide => {
    switch (status) {
      case "done":
        return "CheckCircle2";
      case "scheduled":
        return "Clock";
      case "due":
        return "AlertCircle";
      case "overdue":
        return "AlertTriangle";
      case "cancelled":
        return "XCircle";
      case "unplanned":
        return "Zap";
      default:
        return "Circle";
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "done":
        return "text-emerald-500";
      case "scheduled":
        return "text-blue-500";
      case "due":
        return "text-amber-500";
      case "overdue":
        return "text-rose-500";
      case "cancelled":
        return "text-slate-300";
      case "unplanned":
        return "text-purple-500";
      default:
        return "text-slate-300 group-hover:text-slate-400";
    }
  };

  const getStrategyLabel = (s: string) => {
    switch (s) {
      case "dueDate":
        return "Due Date";
      case "createdAt":
        return "Created Date";
      case "startAt":
        return "Start Date";
      case "completedAt":
        return "Completed Date";
      default:
        return s;
    }
  };

  const renderStatusIcon = (status: TaskStatus, size = 16) => {
    return (
      <Icon
        name={getStatusIconName(status)}
        size={size}
        className={getStatusColor(status)}
        strokeWidth={status === "done" ? 2.5 : 2}
      />
    );
  };

  const getPriorityBadge = (priority: string) => {
    const badgeBase =
      "flex items-center gap-1.5 px-2 h-5 rounded border font-medium leading-none";
    switch (priority) {
      case "high":
        return (
          <div
            className={cn(
              badgeBase,
              "text-rose-700 bg-rose-100 border-rose-200"
            )}
          >
            <Icon name="Flag" size={10} strokeWidth={3} />
            <span>High</span>
          </div>
        );
      case "medium":
        return (
          <div
            className={cn(
              badgeBase,
              "text-amber-700 bg-amber-100 border-amber-200"
            )}
          >
            <Icon name="Flag" size={10} />
            <span>Medium</span>
          </div>
        );
      case "low":
        return (
          <div
            className={cn(
              badgeBase,
              "text-slate-600 bg-slate-100 border-slate-200"
            )}
          >
            <Icon name="Flag" size={10} />
            <span>Low</span>
          </div>
        );
      default:
        return null;
    }
  };

  const statusOptions: TaskStatus[] = [
    "todo",
    "done",
    "scheduled",
    "unplanned",
    "due",
    "overdue",
    "cancelled",
  ];
  const dueTime = task.dueDate ? formatTime(task.dueDate) : null;
  const startTime = task.startAt ? formatTime(task.startAt) : null;
  const displayTime = dueTime || startTime;
  const badgeClass =
    "flex items-center gap-1.5 px-2 h-5 rounded border font-medium leading-none";

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        "group relative flex items-stretch gap-2 py-1.5 px-1 transition-all rounded-lg",
        (isDone || isCancelled) && "opacity-60",
        isUrgent
          ? "bg-rose-50/60 border border-rose-100 shadow-sm shadow-rose-100/50 hover:bg-rose-100/50"
          : "hover:bg-slate-50 border border-transparent"
      )}
    >
      {/* Timeline Column */}
      <div
        className={cn(
          "relative flex flex-col items-center shrink-0 w-6",
          iconTopSpacing
        )}
      >
        {/* Head Line */}
        <div
          className={cn(
            "absolute -top-1 h-6.5 w-px left-1/2 -translate-x-1/2 group-first:hidden",
            "bg-slate-200"
          )}
        />

        {/* Tail Line */}
        <div
          className={cn(
            "absolute top-5 -bottom-1 w-px left-1/2 -translate-x-1/2 group-last:hidden",
            getLineColor(task.status)
          )}
        />

        {/* Icon Button */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              className={cn(
                "relative z-10 w-6 h-6 flex items-center justify-center transition-transform active:scale-90 outline-none focus:ring-2 focus:ring-slate-200 rounded-full",
                isUrgent
                  ? "bg-rose-50 hover:bg-rose-100 shadow-sm"
                  : "bg-white hover:bg-slate-50"
              )}
              title={`Change Status (Current: ${task.status})`}
            >
              {renderStatusIcon(task.status, 18)}
            </button>
          </Popover.Trigger>

          <Popover.Portal container={portalContainer}>
            <Popover.Content
              side="bottom"
              align="start"
              sideOffset={5}
              collisionPadding={10}
              className="z-9999 outline-none"
            >
              <MotionDiv
                initial={{ opacity: 0, scale: 0.9, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -5 }}
                transition={{ duration: 0.15 }}
                className="w-44 bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-2xl rounded-xl overflow-hidden p-1.5 ring-1 ring-slate-900/5"
              >
                <div className="flex flex-col gap-0.5">
                  {statusOptions.map((option) => (
                    <Popover.Close key={option} asChild>
                      <button
                        onClick={() => handleStatusChange(option)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left outline-none",
                          task.status === option
                            ? "bg-slate-100 text-slate-900 font-semibold"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                        )}
                      >
                        {renderStatusIcon(option, 14)}
                        <span className="capitalize">{option}</span>
                      </button>
                    </Popover.Close>
                  ))}
                  <div className="h-px bg-slate-100 my-1 mx-2" />
                  <Popover.Close asChild>
                    <button
                      onClick={() => onEdit?.(task)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors text-left outline-none rounded-lg"
                    >
                      <Icon name="Pencil" size={14} className="opacity-70" />
                      <span>Edit Details</span>
                    </button>
                  </Popover.Close>
                </div>
              </MotionDiv>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>

      {/* Content */}
      <div
        className={cn("flex-1 min-w-0 pt-0.5", displayTime ? "pr-16" : "pr-8")}
      >
        <div className="flex items-center gap-2 min-h-5.5 mb-0.5">
          {isEditing ? (
            <input
              ref={inputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={handleKeyDown}
              className={cn(
                "flex-1 min-w-0 bg-transparent border-b border-blue-400 focus:outline-none font-medium text-slate-800 pb-0.5",
                fontSizeClass
              )}
            />
          ) : (
            <>
              <MotionButton
                onClick={() => setIsEditing(true)}
                className={cn(
                  "font-medium leading-tight text-slate-800 transition-all cursor-text text-left border-none bg-transparent p-0 appearance-none font-inherit",
                  fontSizeClass,
                  isDone && "line-through text-slate-500 decoration-slate-300",
                  isCancelled &&
                    "line-through text-slate-400 decoration-slate-300",
                  isUrgent && "text-rose-900 font-semibold"
                )}
              >
                {task.title}
              </MotionButton>
            </>
          )}
          {!isEditing && (
            <MotionButton
              whileHover={{ scale: 1.1 }}
              onClick={() => setIsEditing(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-blue-500 p-1 shrink-0 bg-transparent border-none"
            >
              <Icon name="Pencil" size={12} />
            </MotionButton>
          )}
        </div>

        {/* Tags, Priority, Etc */}
        <div
          className={cn(
            "flex flex-wrap items-center gap-2 font-medium text-slate-500",
            metadataSizeClass
          )}
        >
          {getPriorityBadge(task.priority)}

          {/* Missing Warnings */}
          {missingStrategies &&
            missingStrategies.length > 0 &&
            missingStrategies.map((s) => (
              <div
                key={s}
                className="flex items-center gap-1.5 px-2 h-5 rounded border font-medium leading-none text-rose-600 bg-rose-50 border-rose-200"
                title={`This task has no ${getStrategyLabel(s)}`}
              >
                <Icon name="AlertCircle" size={10} />
                <span className="text-[10px]">
                  Missing {getStrategyLabel(s)}
                </span>
              </div>
            ))}

          {task.category && (
            <div
              className={cn(
                badgeClass,
                "text-slate-600 bg-slate-100 border-slate-200"
              )}
            >
              <Icon name="Folder" size={10} />
              <span>{task.category}</span>
            </div>
          )}
          {["scheduled", "unplanned", "overdue", "cancelled"].includes(
            task.status
          ) && (
            <span
              className={cn(
                badgeClass,
                "uppercase tracking-wider font-bold opacity-70 border-slate-200 text-[9px]"
              )}
            >
              {task.status}
            </span>
          )}
          {!settings.groupingStrategy.includes("createdAt") && (
            <div
              className={cn(
                badgeClass,
                "text-slate-500 bg-slate-50 border-slate-200"
              )}
            >
              <Icon name="Plus" size={10} />
              <span className="font-mono">
                {formatSmartDate(
                  task.createdAt,
                  settings.useRelativeDates,
                  settings.dateFormat
                )}
              </span>
            </div>
          )}
          {task.startAt && (
            <div
              className={cn(
                badgeClass,
                "text-slate-500 bg-slate-50 border-slate-200"
              )}
            >
              <Icon name="PlayCircle" size={10} />
              <span className="font-mono">
                {formatSmartDate(
                  task.startAt,
                  settings.useRelativeDates,
                  settings.dateFormat
                )}
              </span>
            </div>
          )}
          {task.dueDate && (
            <div
              className={cn(
                badgeClass,
                getDueDateColor(task.dueDate, task.status)
              )}
            >
              <Icon name="Calendar" size={10} />
              <span className="font-mono">
                Due:{" "}
                {formatSmartDate(
                  task.dueDate,
                  settings.useRelativeDates,
                  settings.dateFormat
                )}
              </span>
            </div>
          )}
          {task.completedAt && (
            <div
              className={cn(
                badgeClass,
                "text-emerald-600 bg-emerald-50 border-emerald-200"
              )}
            >
              <Icon name="CheckCircle2" size={10} />
              <span className="font-mono">
                Done:{" "}
                {formatSmartDate(
                  task.completedAt,
                  settings.useRelativeDates,
                  settings.dateFormat
                )}
              </span>
            </div>
          )}
          {task.isRecurring && task.recurringInterval && (
            <div
              className={cn(
                badgeClass,
                "text-slate-500 bg-slate-100 border-slate-200"
              )}
            >
              <Icon name="Repeat" size={10} />
              <span className="capitalize">
                {formatRecurrence(task.recurringInterval)}
              </span>
            </div>
          )}
          {task.tags.map((tag) => (
            <div
              key={tag.id}
              className={cn(
                badgeClass,
                "text-blue-600 bg-blue-50/80 border-blue-100/50"
              )}
            >
              <Icon name="Tag" size={10} />
              <span>{tag.name}</span>
            </div>
          ))}
        </div>

        {task.description && (
          <div className="mt-1 flex items-start gap-1.5 text-slate-400">
            <Icon name="FileText" size={10} className="mt-0.5 shrink-0" />
            <p
              className={cn("leading-relaxed line-clamp-2", metadataSizeClass)}
            >
              {task.description}
            </p>
          </div>
        )}
      </div>

      {/* Absolute Time Badge */}
      {displayTime && (
        <div className="absolute right-8 top-3 text-[10px] font-mono font-bold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
          {displayTime}
        </div>
      )}

      {/* Delete Action */}
      <MotionButton
        onClick={handleDeleteClick}
        className={cn(
          "absolute top-2 right-1 p-1.5 rounded transition-all",
          deleteConfirm
            ? "bg-rose-100 text-rose-600 opacity-100"
            : "text-slate-300 opacity-0 group-hover:opacity-100 hover:text-rose-500 hover:bg-slate-100"
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title={deleteConfirm ? "Click again to confirm delete" : "Delete task"}
      >
        <Icon name={deleteConfirm ? "Trash2" : "Trash"} size={14} />
      </MotionButton>
    </MotionDiv>
  );
};
