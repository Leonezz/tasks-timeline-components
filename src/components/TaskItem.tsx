import React, { useEffect, useRef, useState } from "react";
import * as Lucide from "lucide-react";
import { DateTime } from "luxon";
import type { Task, TaskStatus } from "../types";
import {
  cn,
  formatRecurrence,
  formatSmartDate,
  formatTime,
  type DateValidationState,
} from "../utils";
import { Icon } from "./Icon";
import { MotionButton, MotionDiv } from "./Motion";
import { DateBadge } from "./DateBadge";
import { TagBadge } from "./TagBadge";
import { PriorityPopover } from "./PriorityPopover";
import { CategoryPopover } from "./CategoryPopover";
import { useTasksContext } from "../contexts/TasksContext";
import { useSettingsContext } from "../contexts/SettingsContext";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

interface TaskItemProps {
  task: Task;
  dateValidation?: DateValidationState;
}

/** Check if a date string is valid ISO format */
const isValidDate = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  return DateTime.fromISO(dateStr).isValid;
};

export const TaskItem: React.FC<TaskItemProps> = ({ task, dateValidation }) => {
  const {
      onUpdateTask,
      onDeleteTask,
      onEditTask,
      availableCategories,
      onItemClick,
    } = useTasksContext(),
    { settings } = useSettingsContext(),
    [isEditing, setIsEditing] = useState(false),
    [editTitle, setEditTitle] = useState(task.title),
    [deleteConfirm, setDeleteConfirm] = useState(false),
    deleteTimeoutRef = useRef<number | null>(null),
    inputRef = useRef<HTMLInputElement>(null),
    isDone = task.status === "done",
    isCancelled = task.status === "cancelled",
    today = new Date().toISOString().split("T")[0],
    // Highlight logic
    isUrgent =
      !isDone &&
      !isCancelled &&
      task.priority === "high" &&
      (task.status === "overdue" ||
        task.status === "due" ||
        (task.dueAt && task.dueAt <= today)),
    // Font size mapping
    fontSizeClass =
      {
        sm: "text-sm",
        base: "text-base",
        lg: "text-lg",
        xl: "text-xl",
      }[settings.fontSize] || "text-sm",
    iconTopSpacing =
      {
        sm: "mt-0.5",
        base: "mt-0.5",
        lg: "mt-1",
        xl: "mt-1.5",
      }[settings.fontSize] || "mt-0.5",
    metadataSizeClass =
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
      const now = DateTime.now().toISO();
      const updates: Partial<Task> = { status: newStatus };

      // Auto-populate startAt when transitioning to doing/scheduled from todo
      if (
        (newStatus === "doing" || newStatus === "scheduled") &&
        !task.startAt &&
        task.status === "todo"
      ) {
        updates.startAt = now || undefined;
      }

      // Auto-populate completedAt when transitioning to done
      if (newStatus === "done" && !task.completedAt) {
        updates.completedAt = now || undefined;
      }

      // Auto-populate cancelledAt when transitioning to cancelled
      if (newStatus === "cancelled" && !task.cancelledAt) {
        updates.cancelledAt = now || undefined;
      }

      onUpdateTask({ ...task, ...updates });
    },
    handleSaveEdit = () => {
      if (editTitle.trim()) {
        onUpdateTask({ ...task, title: editTitle });
      } else {
        setEditTitle(task.title);
      }
      setIsEditing(false);
    },
    handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSaveEdit();
      }
      if (e.key === "Escape") {
        setEditTitle(task.title);
        setIsEditing(false);
      }
    },
    handleDeleteClick = () => {
      if (deleteConfirm) {
        onDeleteTask(task.id);
        if (deleteTimeoutRef.current) {
          window.clearTimeout(deleteTimeoutRef.current);
        }
      } else {
        setDeleteConfirm(true);
        deleteTimeoutRef.current = window.setTimeout(() => {
          setDeleteConfirm(false);
        }, 2000); // 2 seconds to confirm
      }
    },
    getDueDateColor = (dateStr?: string, status?: TaskStatus) => {
      if (status === "done" || status === "cancelled") {
        return "text-emerald-600 bg-emerald-50 border-emerald-200";
      }
      if (!dateStr) {
        return "text-slate-400";
      }

      if (status === "overdue") {
        return "text-rose-600 bg-rose-50 border-rose-200";
      }
      if (dateStr < today) {
        return "text-rose-600 bg-rose-50 border-rose-200";
      }
      if (dateStr === today) {
        return "text-amber-600 bg-amber-50 border-amber-200";
      }

      return "text-emerald-600 bg-emerald-50 border-emerald-200";
    },
    getLineColor = (status: TaskStatus) => {
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
    },
    getStatusIconName = (status: TaskStatus): keyof typeof Lucide => {
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
    },
    getStatusColor = (status: TaskStatus) => {
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
    },
    renderStatusIcon = (status: TaskStatus, size = 16) => (
      <Icon
        name={getStatusIconName(status)}
        size={size}
        className={getStatusColor(status)}
        strokeWidth={status === "done" ? 2.5 : 2}
      />
    ),
    statusOptions: TaskStatus[] = [
      "todo",
      "doing",
      "scheduled",
      "done",
      "unplanned",
      "due",
      "overdue",
      "cancelled",
    ],
    dueTime = task.dueAt ? formatTime(task.dueAt) : null,
    startTime = task.startAt ? formatTime(task.startAt) : null,
    displayTime = dueTime || startTime,
    badgeClass =
      "flex items-center gap-1.5 px-2 h-5 rounded-full border font-medium leading-none cursor-pointer hover:bg-slate-50 transition-colors select-none text-[length:inherit]";

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
          : "hover:bg-slate-50 border border-transparent",
      )}
    >
      {/* Timeline Column */}
      <div
        className={cn(
          "relative flex flex-col items-center shrink-0 w-6",
          iconTopSpacing,
        )}
      >
        {/* Head Line */}
        <div
          className={cn(
            "absolute -top-1 h-6.5 w-px left-1/2 -translate-x-1/2 group-first:hidden",
            "bg-slate-200",
          )}
        />

        {/* Tail Line */}
        <div
          className={cn(
            "absolute top-5 -bottom-1 w-px left-1/2 -translate-x-1/2 group-last:hidden",
            getLineColor(task.status),
          )}
        />

        {/* Icon Button */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "relative z-10 w-6 h-6 flex items-center justify-center transition-transform active:scale-90 outline-none focus:ring-2 focus:ring-slate-200 rounded-full",
                isUrgent
                  ? "bg-rose-50 hover:bg-rose-100 shadow-sm"
                  : "bg-white hover:bg-slate-50",
              )}
              title={`Change Status (Current: ${task.status})`}
            >
              {renderStatusIcon(task.status, 18)}
            </button>
          </PopoverTrigger>

          <PopoverContent
            side="bottom"
            align="start"
            sideOffset={5}
            collisionPadding={10}
            className="z-9999 outline-none w-44 p-1.5"
          >
            <MotionDiv
              initial={{ opacity: 0, scale: 0.9, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex flex-col gap-0.5">
                {statusOptions.map((option) => (
                  <PopoverClose key={option} asChild>
                    <button onClick={() => handleStatusChange(option)}>
                      <div
                        className={cn(
                          // Base styles: removed justify-start! for better standard behavior
                          "w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium font-mono rounded-lg transition-all hover:bg-slate-300 text-left outline-none",
                          "justify-start! text-left!",
                          // Active (Selected) State: A solid, subtle background
                          task.status === option
                            ? "bg-slate-200/60 text-slate-900 font-semibold"
                            : "text-slate-600 hover:text-slate-900 hover:opacity-80 active:scale-[0.98]",
                        )}
                      >
                        <div
                          className={cn(
                            "shrink-0",
                            task.status === option
                              ? "opacity-100"
                              : "opacity-70",
                          )}
                        >
                          {renderStatusIcon(option, 14)}
                        </div>
                        <span className="capitalize">{option}</span>
                      </div>
                    </button>
                  </PopoverClose>
                ))}
                <div className="h-px bg-slate-100 my-1 mx-1" />
                <PopoverClose asChild>
                  <button onClick={() => onEditTask?.(task)}>
                    <div className="w-full flex items-center justify-start! gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:opacity-80 hover:bg-slate-300 transition-all text-left outline-none rounded-lg">
                      <Icon name="Pencil" size={14} className="opacity-70" />
                      <span>Edit Details</span>
                    </div>
                  </button>
                </PopoverClose>
              </div>
            </MotionDiv>
          </PopoverContent>
        </Popover>
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
                fontSizeClass,
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
                  isUrgent && "text-rose-700 font-semibold",
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
            metadataSizeClass,
          )}
          onClick={(e) => {
            if (!onItemClick) {
              return;
            }
            if (e.target !== e.currentTarget) {
              return;
            }
            onItemClick?.(task);
          }}
        >
          <PriorityPopover
            task={task}
            onUpdate={onUpdateTask}
            badgeClass={badgeClass}
          />

          {/* Date Validation Warning */}
          {dateValidation &&
            (dateValidation.hasInvalidDates ? (
              <div
                className="flex items-center gap-1.5 px-2 h-5 rounded-full border font-medium leading-none text-rose-600 bg-rose-50 border-rose-200"
                title="One or more dates have an invalid format"
              >
                <Icon name="AlertTriangle" size={10} />
                <span className="text-[10px]">Invalid Date</span>
              </div>
            ) : dateValidation.hasMissingDates ? (
              <div
                className="flex items-center gap-1.5 px-2 h-5 rounded-full border font-medium leading-none text-amber-600 bg-amber-50 border-amber-200"
                title="This task has no dates set"
              >
                <Icon name="AlertCircle" size={10} />
                <span className="text-[10px]">No Dates</span>
              </div>
            ) : null)}

          {task.category && (
            <CategoryPopover
              task={task}
              onUpdate={onUpdateTask}
              badgeClass={badgeClass}
              availableCategories={availableCategories}
            />
          )}

          {!settings.groupingStrategy.includes("createdAt") &&
            isValidDate(task.createdAt) && (
              <DateBadge
                type="createdAt"
                date={task.createdAt!}
                label={formatSmartDate(
                  task.createdAt!,
                  settings.useRelativeDates,
                  settings.dateFormat,
                )}
                task={task}
                onUpdate={onUpdateTask}
                icon="Plus"
                className={cn(
                  badgeClass,
                  "text-slate-500 bg-slate-50 border-slate-200",
                )}
              />
            )}
          {isValidDate(task.startAt) && (
            <DateBadge
              type="startAt"
              date={task.startAt!}
              label={formatSmartDate(
                task.startAt!,
                settings.useRelativeDates,
                settings.dateFormat,
              )}
              icon="PlayCircle"
              task={task}
              onUpdate={onUpdateTask}
              className={cn(
                badgeClass,
                "text-slate-500 bg-slate-50 border-slate-200",
              )}
            />
          )}
          {isValidDate(task.dueAt) && (
            <DateBadge
              type="dueDate"
              date={task.dueAt!}
              label={`Due: ${formatSmartDate(
                task.dueAt!,
                settings.useRelativeDates,
                settings.dateFormat,
              )}`}
              icon="Calendar"
              task={task}
              onUpdate={onUpdateTask}
              className={cn(
                badgeClass,
                getDueDateColor(task.dueAt!, task.status),
              )}
            />
          )}
          {isValidDate(task.completedAt) && (
            <DateBadge
              type="completedAt"
              date={task.completedAt!}
              label={`Done: ${formatSmartDate(
                task.completedAt!,
                settings.useRelativeDates,
                settings.dateFormat,
              )}`}
              icon="CheckCircle2"
              task={task}
              onUpdate={onUpdateTask}
              className={cn(
                badgeClass,
                "text-emerald-600 bg-emerald-50 border-emerald-200",
              )}
            />
          )}
          {task.isRecurring && task.recurringInterval && (
            <div
              className={cn(
                badgeClass,
                "text-slate-500 bg-slate-100 border-slate-200 cursor-default",
              )}
              title={formatRecurrence(task.recurringInterval)}
            >
              <Icon name="Repeat" size={10} />
              <span className="capitalize">Recurring</span>
            </div>
          )}
          {task.tags.map((tag, index) => (
            <TagBadge
              key={`${task.id}-tag-${index}`}
              tag={tag}
              task={task}
              onUpdate={onUpdateTask}
              badgeClass={badgeClass}
            />
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
        <div className="absolute right-8 top-3 text-[10px] font-mono font-bold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md">
          {displayTime}
        </div>
      )}

      {/* Delete Action */}
      <MotionButton
        onClick={handleDeleteClick}
        className={cn(
          "absolute top-2 right-1 p-1.5 rounded-md transition-all",
          deleteConfirm
            ? "bg-rose-100 text-rose-600 opacity-100"
            : "text-slate-300 opacity-0 group-hover:opacity-100 hover:text-rose-500 hover:bg-slate-100",
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
