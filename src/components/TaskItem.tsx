import React, { useEffect, useRef, useState } from "react";
import * as Lucide from "lucide-react";
import { DateTime } from "luxon";
import type {
  PrimaryVisualStatus,
  Task,
  TaskStatus,
  WorkflowStatus,
} from "../types";
import {
  cn,
  deriveTaskRenderState,
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
import { MarkdownText } from "./MarkdownText";

interface TaskItemProps {
  task: Task;
  dateValidation?: DateValidationState;
}

const MAX_INLINE_TAGS = 2;

/** Check if a date string is valid ISO format */
const isValidDate = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  return DateTime.fromISO(dateStr).isValid;
};

export const TaskItem: React.FC<TaskItemProps> = React.memo(
  ({ task, dateValidation }) => {
    const {
        onUpdateTask,
        onDeleteTask,
        onEditTask,
        availableCategories,
        onItemClick,
        renderTitle,
      } = useTasksContext(),
      { settings } = useSettingsContext(),
      [isEditing, setIsEditing] = useState(false),
      [editTitle, setEditTitle] = useState(task.title),
      [deleteConfirm, setDeleteConfirm] = useState(false),
      deleteTimeoutRef = useRef<number | null>(null),
      inputRef = useRef<HTMLInputElement>(null),
      renderState = deriveTaskRenderState(task),
      workflowStatus = renderState.workflowStatus,
      primaryStatus = renderState.primaryStatus,
      isDone = workflowStatus === "done",
      isCancelled = workflowStatus === "cancelled",
      // Highlight logic
      isUrgent =
        !isDone &&
        !isCancelled &&
        task.priority === "high" &&
        renderState.isUrgent,
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
          lg: "text-[11px]",
          xl: "text-xs",
        }[settings.fontSize] || "text-[11px]";

    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isEditing]);

    const handleStatusChange = (newStatus: WorkflowStatus) => {
        const now = DateTime.now().toISO();
        const updates: Partial<Task> = { status: newStatus };

        // Auto-populate startAt when transitioning to doing from todo
        if (
          newStatus === "doing" &&
          !task.startAt &&
          workflowStatus === "todo"
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
      getDueDateColor = () => {
        if (workflowStatus === "done" || workflowStatus === "cancelled") {
          return "text-emerald-700 bg-emerald-50/80 border-emerald-100";
        }
        if (renderState.temporalStatus === "overdue") {
          return "text-rose-700 bg-rose-50/90 border-rose-100";
        }
        if (renderState.temporalStatus === "due") {
          return "text-amber-700 bg-amber-50/90 border-amber-100";
        }

        return "text-emerald-700 bg-emerald-50/80 border-emerald-100";
      },
      getLineColor = (status: PrimaryVisualStatus) => {
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
            return "Check";
          case "doing":
            return "Play";
          case "scheduled":
            return "CalendarClock";
          case "due":
            return "Bell";
          case "overdue":
            return "AlertTriangle";
          case "cancelled":
            return "X";
          case "unplanned":
            return "Sparkles";
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
          strokeWidth={status === "done" || status === "cancelled" ? 2.5 : 2}
        />
      ),
      statusOptions: WorkflowStatus[] = ["todo", "doing", "done", "cancelled"],
      dueTime = task.dueAt ? formatTime(task.dueAt) : null,
      startTime = task.startAt ? formatTime(task.startAt) : null,
      displayTime = dueTime || startTime,
      visibleTags = task.tags.slice(0, MAX_INLINE_TAGS),
      overflowTags = task.tags.slice(MAX_INLINE_TAGS),
      badgeClass =
        "inline-flex h-5 max-w-[13rem] min-w-0 items-center gap-1 overflow-hidden whitespace-nowrap rounded-md border px-1.5 min-[400px]:px-2 font-medium leading-none cursor-pointer transition-all select-none text-[length:inherit] outline-none hover:-translate-y-px hover:shadow-sm hover:shadow-slate-900/5 focus-visible:ring-2 focus-visible:ring-blue-500/30";

    return (
      <MotionDiv
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className={cn(
          "group relative flex items-stretch gap-1 min-[400px]:gap-1.5 sm:gap-2 pb-1.5 pt-0.5 px-0.5 sm:px-1 transition-all rounded-lg",
          (isDone || isCancelled) && "opacity-60",
          isUrgent
            ? "bg-rose-50/60 border border-rose-100 shadow-sm shadow-rose-100/50 hover:bg-rose-100/50 mb-1"
            : "hover:bg-slate-50 border border-transparent",
        )}
      >
        {/* Timeline Column */}
        <div
          className={cn(
            "relative flex flex-col items-center shrink-0",
            "w-4 min-[400px]:w-5 sm:w-6",
            iconTopSpacing,
          )}
        >
          {/* Head Line */}
          <div
            className={cn(
              "absolute -top-1 h-2 w-px left-1/2 -translate-x-1/2 group-first:hidden",
              "bg-slate-200",
            )}
          />

          {/* Tail Line */}
          <div
            className={cn(
              "absolute top-7 -bottom-1 w-px left-1/2 -translate-x-1/2",
              getLineColor(primaryStatus),
            )}
          />

          {/* Icon Button */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "relative z-10 -m-1 flex h-6 min-h-8 w-6 min-w-8 items-center justify-center rounded-md bg-transparent transition-colors active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-1",
                  isUrgent ? "hover:bg-rose-50/80" : "hover:bg-slate-50/80",
                )}
                title={`Change status (current: ${workflowStatus})`}
                aria-label={`Change status for ${task.title}. Current status: ${workflowStatus}`}
              >
                {renderStatusIcon(workflowStatus, 17)}
              </button>
            </PopoverTrigger>

            <PopoverContent
              side="bottom"
              align="start"
              sideOffset={5}
              collisionPadding={10}
              className="z-9999 w-56 rounded-xl border border-slate-200/80 bg-white/95 p-1.5 shadow-xl shadow-slate-900/10 outline-none backdrop-blur"
            >
              <MotionDiv
                initial={{ opacity: 0, scale: 0.98, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -4 }}
                transition={{ duration: 0.12 }}
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-2.5 pb-2 pt-1.5">
                  <span className="text-xs font-semibold text-slate-700">
                    Status
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    Current: {workflowStatus}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  {statusOptions.map((option) => (
                    <PopoverClose key={option} asChild>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(option)}
                        aria-pressed={workflowStatus === option}
                        aria-label={`Set ${task.title} status to ${option}`}
                        className="w-full rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
                      >
                        <div
                          className={cn(
                            "grid min-h-8 w-full grid-cols-[1rem_1fr_1rem] items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors",
                            workflowStatus === option
                              ? "bg-blue-50/80 text-blue-700"
                              : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900",
                          )}
                        >
                          <div
                            className={cn(
                              "shrink-0",
                              workflowStatus === option
                                ? "opacity-100"
                                : "opacity-70",
                            )}
                          >
                            {renderStatusIcon(option, 14)}
                          </div>
                          <span className="capitalize">{option}</span>
                          {workflowStatus === option && (
                            <Icon
                              name="Check"
                              size={13}
                              className="justify-self-end"
                            />
                          )}
                        </div>
                      </button>
                    </PopoverClose>
                  ))}
                  <div className="my-1 h-px bg-slate-100" />
                  <PopoverClose asChild>
                    <button
                      type="button"
                      onClick={() => onEditTask?.(task)}
                      aria-label={`Edit details for ${task.title}`}
                      className="w-full rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
                    >
                      <div className="flex min-h-8 w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100/80 hover:text-blue-600">
                        <Icon name="Pencil" size={14} className="opacity-70" />
                        <span>Edit details</span>
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
          className={cn(
            "flex-1 min-w-0 pt-0.5",
            displayTime ? "pr-16 sm:pr-20" : "pr-6 sm:pr-8",
          )}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 min-h-5.5 mb-0.5">
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
                aria-label={`Edit title for ${task.title}`}
              />
            ) : (
              <>
                <MotionButton
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className={cn(
                    "font-medium leading-tight text-slate-800 transition-all cursor-text text-left border-none bg-transparent p-0 appearance-none font-inherit truncate flex-1 min-w-0 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-1 focus-visible:whitespace-normal focus-visible:overflow-visible",
                    fontSizeClass,
                    isDone &&
                      "line-through text-slate-500 decoration-slate-300",
                    isCancelled &&
                      "line-through text-slate-400 decoration-slate-300",
                    isUrgent && "text-rose-700 font-semibold",
                  )}
                  title={task.title}
                  aria-label={`Edit task title: ${task.title}`}
                >
                  {renderTitle ? (
                    renderTitle(task.title)
                  ) : (
                    <MarkdownText
                      content={task.title}
                      inline
                      compact
                      className="min-w-0"
                      paragraphClassName="inline whitespace-pre-wrap"
                      codeClassName="rounded bg-slate-100/80 px-1 py-0 font-mono text-[0.9em] text-slate-700"
                    />
                  )}
                </MotionButton>
              </>
            )}
            {!isEditing && (
              <MotionButton
                type="button"
                whileHover={{ scale: 1.1 }}
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-slate-300 hover:text-blue-500 p-1 shrink-0 bg-transparent border-none rounded-md outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
                aria-label={`Edit ${task.title}`}
                title="Edit task title"
              >
                <Icon name="Pencil" size={12} />
              </MotionButton>
            )}
          </div>

          {/* Tags, Priority, Etc */}
          <div
            className={cn(
              "flex flex-wrap items-center gap-1 font-medium text-slate-500",
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
                  className="inline-flex h-5 items-center gap-1 rounded-md border border-rose-100 bg-rose-50/90 px-1.5 font-medium leading-none text-rose-700"
                  title="One or more dates have an invalid format"
                  role="img"
                  aria-label="One or more dates have an invalid format"
                >
                  <Icon name="AlertTriangle" size={10} />
                  <span>Invalid date</span>
                </div>
              ) : dateValidation.hasMissingDates ? (
                <div
                  className="inline-flex h-5 items-center gap-1 rounded-md border border-amber-100 bg-amber-50/90 px-1.5 font-medium leading-none text-amber-700"
                  title="This task has no dates set"
                  role="img"
                  aria-label="This task has no dates set"
                >
                  <Icon name="AlertCircle" size={10} />
                  <span>No dates</span>
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
                    "border-transparent bg-transparent text-slate-400 hover:border-slate-200 hover:bg-slate-50",
                    "hidden sm:inline-flex",
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
                  "border-transparent bg-slate-50/70 text-slate-500 hover:border-slate-200 hover:bg-white",
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
                className={cn(badgeClass, getDueDateColor())}
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
                  "border-emerald-100 bg-emerald-50/80 text-emerald-700",
                )}
              />
            )}
            {task.isRecurring && task.recurringInterval && (
              <div
                className={cn(
                  badgeClass,
                  "cursor-default border-transparent bg-slate-50/70 text-slate-500 hover:translate-y-0 hover:border-slate-200",
                )}
                title={formatRecurrence(task.recurringInterval)}
                role="img"
                aria-label={`Recurring task: ${formatRecurrence(
                  task.recurringInterval,
                )}`}
              >
                <Icon name="Repeat" size={10} />
                <span className="capitalize">Recurring</span>
              </div>
            )}
            {visibleTags.map((tag, index) => (
              <TagBadge
                key={`${task.id}-tag-${index}`}
                tag={tag}
                task={task}
                onUpdate={onUpdateTask}
                badgeClass={badgeClass}
              />
            ))}
            {overflowTags.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      badgeClass,
                      "border-purple-100 bg-purple-50/80 text-purple-700",
                    )}
                    aria-label={`Show ${overflowTags.length} more tags for ${task.title}`}
                    title={`${overflowTags.length} more tags`}
                  >
                    +{overflowTags.length}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  side="bottom"
                  align="start"
                  sideOffset={5}
                  className="z-9999 w-56 rounded-xl border border-slate-200/80 bg-white/95 p-1.5 shadow-xl shadow-slate-900/10 outline-none backdrop-blur"
                >
                  <MotionDiv
                    initial={{ opacity: 0, scale: 0.98, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -4 }}
                    transition={{ duration: 0.12 }}
                  >
                    <div className="border-b border-slate-100 px-2.5 pb-2 pt-1.5 text-xs font-semibold text-slate-700">
                      Tags
                    </div>
                    <div className="flex flex-col gap-0.5 pt-1">
                      {overflowTags.map((tag) => (
                        <PopoverClose key={tag.id} asChild>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateTask({
                                ...task,
                                tags: task.tags.filter((t) => t.id !== tag.id),
                              })
                            }
                            className="grid min-h-8 w-full grid-cols-[1rem_1fr_1rem] items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-600 transition-colors hover:bg-rose-50/80 hover:text-rose-700 focus-visible:ring-2 focus-visible:ring-blue-500/30"
                            aria-label={`Remove tag ${tag.name} from ${task.title}`}
                          >
                            <Icon name="Tag" size={13} />
                            <span className="truncate">{tag.name}</span>
                            <Icon
                              name="X"
                              size={13}
                              className="justify-self-end opacity-60"
                            />
                          </button>
                        </PopoverClose>
                      ))}
                    </div>
                  </MotionDiv>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {task.description && (
            <div className="mt-1 flex items-start gap-1.5 text-slate-400">
              <Icon name="FileText" size={10} className="mt-0.5 shrink-0" />
              <MarkdownText
                content={task.description}
                compact
                className={cn(
                  "line-clamp-2 min-w-0 leading-relaxed",
                  metadataSizeClass,
                )}
                paragraphClassName="leading-relaxed"
                codeClassName="rounded bg-slate-100/80 px-1 py-0 font-mono text-[0.9em] text-slate-600"
              />
            </div>
          )}
        </div>

        {/* Absolute Time Badge */}
        {displayTime && (
          <div
            className="absolute right-8 top-3 text-[10px] font-mono font-bold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md"
            aria-label={`Task time ${displayTime}`}
          >
            {displayTime}
          </div>
        )}

        {/* Delete Action */}
        <MotionButton
          type="button"
          onClick={handleDeleteClick}
          className={cn(
            "absolute top-2 right-1 min-h-8 min-w-8 p-1.5 rounded-md transition-all outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30",
            deleteConfirm
              ? "bg-rose-100 text-rose-600 opacity-100"
              : "text-slate-300 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-rose-500 hover:bg-slate-100",
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title={
            deleteConfirm ? "Click again to confirm delete" : "Delete task"
          }
          aria-label={
            deleteConfirm
              ? `Confirm delete ${task.title}`
              : `Delete ${task.title}`
          }
        >
          <Icon name={deleteConfirm ? "Trash2" : "Trash"} size={14} />
        </MotionButton>
      </MotionDiv>
    );
  },
);
TaskItem.displayName = "TaskItem";
