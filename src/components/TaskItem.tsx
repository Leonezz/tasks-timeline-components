import React, { useState, useRef, useEffect } from "react";
import * as Popover from "@radix-ui/react-popover";
import * as Lucide from "lucide-react";
import type { Task, TaskStatus, AppSettings, Priority } from "../types";
import { cn, formatSmartDate, formatRecurrence, formatTime } from "../utils";
import { Icon } from "./Icon";
import { MotionDiv, MotionButton } from "./Motion";
import { useAppContext } from "./AppContext";
import { DateTime } from "luxon";

interface TaskItemProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
  onEdit?: (task: Task) => void;
  settings: AppSettings;
  missingStrategies?: string[];
  availableCategories: string[];
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onUpdate,
  onDelete,
  onEdit,
  settings,
  missingStrategies,
  availableCategories,
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
      case "doing":
        return "bg-sky-500";
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
      case "doing":
        return "PlayCircle";
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
      case "doing":
        return "text-sky-500";
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

  const PriorityPopover = () => {
    const p = task.priority;
    let colorClass = "text-slate-600 bg-slate-100 border-slate-200";
    if (p === "high") colorClass = "text-rose-700 bg-rose-100 border-rose-200";
    if (p === "medium")
      colorClass = "text-amber-700 bg-amber-100 border-amber-200";

    return (
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            className={cn(badgeClass, colorClass)}
            title="Change Priority"
          >
            <Icon name="Flag" size={10} strokeWidth={p === "high" ? 3 : 2} />
            <span className="capitalize">{p}</span>
          </button>
        </Popover.Trigger>
        <Popover.Portal container={portalContainer}>
          <Popover.Content
            side="bottom"
            align="start"
            sideOffset={4}
            className="z-9999 outline-none"
          >
            <MotionDiv
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-1 rounded-lg border flex flex-col gap-1 w-24 shadow-2xl overflow-hidden ring-1 ring-slate-900/5 backdrop-blur-xl border-slate-200/60"
            >
              {(["high", "medium", "low"] as Priority[]).map((opt) => (
                <Popover.Close key={opt} asChild>
                  <button
                    onClick={() => onUpdate({ ...task, priority: opt })}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 text-xs rounded-md text-left transition-colors justify-start!",
                      task.priority === opt
                        ? "bg-slate-100 font-bold"
                        : "hover:bg-slate-50 text-slate-600"
                    )}
                  >
                    <Icon
                      name="Flag"
                      size={10}
                      className={
                        opt === "high"
                          ? "text-rose-500"
                          : opt === "medium"
                          ? "text-amber-500"
                          : "text-slate-400"
                      }
                    />
                    <span className="capitalize">{opt}</span>
                  </button>
                </Popover.Close>
              ))}
            </MotionDiv>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  };

  const CategoryPopover = () => {
    const [val, setVal] = useState(task.category || "");
    // Filter available categories for suggestions
    const suggestions =
      availableCategories
        .filter((c) => c.toLowerCase().includes(val.toLowerCase()) && c !== val)
        .slice(0, 5) || [];

    return (
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            className={cn(
              badgeClass,
              "text-slate-600 bg-slate-100 border-slate-200"
            )}
            title="Change Category"
          >
            <Icon name="Folder" size={10} />
            <span>{task.category || "No Category"}</span>
          </button>
        </Popover.Trigger>
        <Popover.Portal container={portalContainer}>
          <Popover.Content
            side="bottom"
            align="start"
            sideOffset={4}
            className="z-9999 outline-none"
          >
            <MotionDiv
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-2 rounded-lg shadow-xl border w-48 overflow-hidden ring-1 ring-slate-900/5 backdrop-blur-xl border-slate-200/60"
            >
              <input
                autoFocus
                value={val}
                onChange={(e) => setVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onUpdate({ ...task, category: val });
                  }
                }}
                className="w-full text-xs border border-slate-200 rounded px-2 py-1 mb-2 focus:ring-2 focus:ring-blue-500/20 outline-none"
                placeholder="Category name..."
              />
              <div className="flex flex-col gap-0.5">
                {suggestions.map((s) => (
                  <Popover.Close key={s} asChild>
                    <button
                      onClick={() => onUpdate({ ...task, category: s })}
                      className="text-left px-2 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded flex items-center gap-2 justify-start!"
                    >
                      <Icon name="Folder" size={10} className="opacity-50" />
                      {s}
                    </button>
                  </Popover.Close>
                ))}
                <Popover.Close asChild>
                  <button
                    onClick={() => onUpdate({ ...task, category: val })}
                    className="text-center px-2 py-1.5 text-xs text-blue-600! hover:bg-blue-50 rounded font-medium mt-1"
                  >
                    Set to "{val}"
                  </button>
                </Popover.Close>
              </div>
            </MotionDiv>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  };

  const DateBadge = ({
    type,
    date,
    label,
    icon,
    className,
    prefix = "",
  }: {
    type: "dueDate" | "startAt" | "createdAt" | "completedAt";
    date?: string;
    label: string;
    icon: keyof typeof Lucide;
    className: string;
    prefix?: string;
  }) => {
    const [val, setVal] = useState(() => {
      if (!date) return "";
      const dt = DateTime.fromISO(date);
      return dt.isValid
        ? type === "startAt" || type === "createdAt" || type === "completedAt"
          ? dt.toFormat("yyyy-MM-dd'T'HH:mm")
          : dt.toISODate()
        : "";
    });

    const handleDateSave = () => {
      let newDate = "";
      if (val) {
        newDate =
          type === "startAt" || type === "createdAt" || type === "completedAt"
            ? DateTime.fromFormat(val, "yyyy-MM-dd'T'HH:mm").toISO() || ""
            : DateTime.fromISO(val).toISODate() || "";
      }
      onUpdate({ ...task, [type]: newDate });
    };

    const inputType =
      type === "startAt" || type === "createdAt" || type === "completedAt"
        ? "datetime-local"
        : "date";
    const titleMap = {
      dueDate: "Change Due Date",
      startAt: "Change Start Date",
      createdAt: "Change Created Date",
      completedAt: "Change Completed Date",
    };

    return (
      <Popover.Root>
        <Popover.Trigger asChild>
          <button className={cn(badgeClass, className)} title={titleMap[type]}>
            <Icon name={icon} size={10} />
            <span className="font-mono">
              {prefix}
              {label}
            </span>
          </button>
        </Popover.Trigger>
        <Popover.Portal container={portalContainer}>
          <Popover.Content
            side="bottom"
            align="start"
            sideOffset={4}
            className="z-9999 outline-none"
          >
            <MotionDiv
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-2.5 rounded-lg border shadow-2xl overflow-hidden ring-1 ring-slate-900/5 backdrop-blur-xl border-slate-200/60"
            >
              <input
                type={inputType}
                value={val || ""}
                onChange={(e) => setVal(e.target.value)}
                className="border border-slate-200 rounded px-2 py-1.5 text-xs outline-none focus:border-blue-500 mb-3 block w-full"
              />
              <Popover.Close asChild>
                <button
                  onClick={handleDateSave}
                  className="w-full text-blue-600! text-xs font-bold py-1.5 rounded shadow-sm transition-colors"
                >
                  Save
                </button>
              </Popover.Close>
            </MotionDiv>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  };

  const TagBadge = ({ tag }: { tag: { id: string; name: string } }) => {
    return (
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            className={cn(
              badgeClass,
              "text-blue-600 bg-blue-50/80 border-blue-100/50 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-colors"
            )}
            title="Click to remove"
          >
            <Icon name="Tag" size={10} />
            <span>{tag.name}</span>
          </button>
        </Popover.Trigger>
        <Popover.Portal container={portalContainer}>
          <Popover.Content
            side="top"
            align="center"
            sideOffset={4}
            className="z-9999 outline-none"
          >
            <MotionDiv
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-1 rounded-lg border shadow-2xl overflow-hidden ring-1 ring-slate-900/5 backdrop-blur-2xl border-slate-200/60"
            >
              <Popover.Close asChild>
                <button
                  onClick={() =>
                    onUpdate({
                      ...task,
                      tags: task.tags.filter((t) => t.id !== tag.id),
                    })
                  }
                  className="flex items-center gap-1.5 text-xs text-rose-600! px-2 py-1 rounded hover:bg-rose-50"
                >
                  <Icon name="Trash" size={12} />
                  Remove Tag
                </button>
              </Popover.Close>
            </MotionDiv>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  };

  const statusOptions: TaskStatus[] = [
    "todo",
    "doing",
    "scheduled",
    "done",
    "unplanned",
    "due",
    "overdue",
    "cancelled",
  ];
  const dueTime = task.dueDate ? formatTime(task.dueDate) : null;
  const startTime = task.startAt ? formatTime(task.startAt) : null;
  const displayTime = dueTime || startTime;
  const badgeClass =
    "flex items-center gap-1.5 px-2 h-5 rounded border font-medium leading-none cursor-pointer hover:bg-slate-50 transition-colors select-none text-[length:inherit]";

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        "group relative flex items-stretch gap-2 pb-1.5 pt-0.5 px-1 transition-all rounded-lg",
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
                className="w-44 backdrop-blur-xl border border-slate-200/60 shadow-2xl rounded-xl overflow-hidden p-1.5 ring-1 ring-slate-900/5"
              >
                <div className="flex flex-col gap-0.5 px-3">
                  {statusOptions.map((option) => (
                    <Popover.Close key={option} asChild>
                      <button
                        onClick={() => handleStatusChange(option)}
                        className={cn(
                          "w-full flex items-center justify-start! gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left outline-none",
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
                      className="w-full flex items-center justify-start! gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors text-left outline-none rounded-lg"
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
                  isUrgent && "text-rose-700 font-semibold"
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
          <PriorityPopover />

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

          {task.category && <CategoryPopover />}

          {!settings.groupingStrategy.includes("createdAt") && (
            <DateBadge
              type="createdAt"
              date={task.createdAt}
              label={formatSmartDate(
                task.createdAt,
                settings.useRelativeDates,
                settings.dateFormat
              )}
              icon="Plus"
              className="text-slate-500 bg-slate-50 border-slate-200"
            />
          )}
          {task.startAt && (
            <DateBadge
              type="startAt"
              date={task.startAt}
              label={formatSmartDate(
                task.startAt,
                settings.useRelativeDates,
                settings.dateFormat
              )}
              icon="PlayCircle"
              className="text-slate-500 bg-slate-50 border-slate-200"
            />
          )}
          {task.dueDate && (
            <DateBadge
              type="dueDate"
              date={task.dueDate}
              label={`Due: ${formatSmartDate(
                task.dueDate,
                settings.useRelativeDates,
                settings.dateFormat
              )}`}
              icon="Calendar"
              className={getDueDateColor(task.dueDate, task.status)}
            />
          )}
          {task.completedAt && (
            <DateBadge
              type="completedAt"
              date={task.completedAt}
              label={`Done: ${formatSmartDate(
                task.completedAt,
                settings.useRelativeDates,
                settings.dateFormat
              )}`}
              icon="CheckCircle2"
              className="text-emerald-600 bg-emerald-50 border-emerald-200"
            />
          )}
          {task.isRecurring && task.recurringInterval && (
            <div
              className={cn(
                badgeClass,
                "text-slate-500 bg-slate-100 border-slate-200 cursor-default"
              )}
              title={formatRecurrence(task.recurringInterval)}
            >
              <Icon name="Repeat" size={10} />
              <span className="capitalize">Recurring</span>
            </div>
          )}
          {task.tags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
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
