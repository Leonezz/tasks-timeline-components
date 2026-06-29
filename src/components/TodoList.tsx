import React, { useMemo, useRef } from "react";
import { DateTime } from "luxon";
import type { DateGroupBy, DayGroup, Task } from "../types";
import { groupTasksByYearAndDate } from "../utils";
import { deriveWorkflowStatus } from "../utils/task";
import { YearSection } from "./YearSection";
import { DaySection } from "./DaySection";
import { BacklogSection } from "./BacklogSection";
import { Icon } from "./Icon";
import { useTasksContext } from "../contexts/TasksContext";
import { useSettingsContext } from "../contexts/SettingsContext";

interface TodoListProps {
  className?: string;
}

export const TodoList: React.FC<TodoListProps> = ({ className }) => {
  const { tasks } = useTasksContext(),
    { settings, isFocusMode, toggleFocusMode } = useSettingsContext(),
    todayAddTaskButtonRef = useRef<HTMLButtonElement>(null),
    handleAddTodayTask = () => {
      todayAddTaskButtonRef.current?.click();
      todayAddTaskButtonRef.current?.focus();
    },
    { todayGroup, otherYearGroups, backlogTasks } = useMemo(() => {
      const today = DateTime.now(),
        todayStr = today.toISODate(),
        // 1. Filter based on "Show Completed" setting
        visibleTasks = settings.showCompleted
          ? tasks
          : tasks.filter((t) => {
              const workflowStatus = deriveWorkflowStatus(t);
              return (
                workflowStatus !== "done" && workflowStatus !== "cancelled"
              );
            }),
        // 2. Identify "Dated" vs "Truly Undated" tasks
        datedTasks: Task[] = [],
        trulyUndatedTasks: Task[] = [],
        dateFields: DateGroupBy[] = [
          "dueAt",
          "startAt",
          "createdAt",
          "completedAt",
        ];

      visibleTasks.forEach((task) => {
        // A task is only backlog if it has NO valid dates in ANY field
        const hasAnyValidDate = dateFields.some((field) => {
          const val = task[field];
          return val && DateTime.fromISO(val).isValid;
        });

        if (hasAnyValidDate) {
          datedTasks.push(task);
        } else {
          trulyUndatedTasks.push(task);
        }
      });

      // 3. Group the "Dated" tasks.
      const allGroups = groupTasksByYearAndDate(
        datedTasks,
        settings.groupingStrategy,
      );

      // 4. Extract "Today" group from the hierarchy for featured display
      let foundTodayGroup: DayGroup | null = null;
      const finalYearGroups = [];

      for (const yearGrp of allGroups) {
        // Check if today exists in this year
        const todayGroupInYear = yearGrp.dayGroups.find(
          (dg) => dg.date === todayStr,
        );

        if (todayGroupInYear) {
          foundTodayGroup = todayGroupInYear;
          const remainingDays = yearGrp.dayGroups.filter(
            (dg) => dg.date !== todayStr,
          );
          // Only keep year if it has days left
          if (remainingDays.length > 0) {
            finalYearGroups.push({ ...yearGrp, dayGroups: remainingDays });
          }
        } else {
          finalYearGroups.push(yearGrp);
        }
      }

      const finalToday = foundTodayGroup || { date: todayStr!, tasks: [] };

      return {
        todayGroup: finalToday,
        otherYearGroups: finalYearGroups,
        backlogTasks: trulyUndatedTasks,
      };
    }, [tasks, settings.showCompleted, settings.groupingStrategy]);

  return (
    <div className={className}>
      {/* Today Section - Always Visible */}
      <div className="mb-5 pb-3 border-b-2 border-dashed border-slate-100/80">
        <div className="flex items-center gap-2 mb-2 pl-2 opacity-60">
          <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-slate-400">
            Current Focus
            {settings.groupingStrategy.length === 1 &&
            settings.groupingStrategy[0] !== "dueAt"
              ? ` (${settings.groupingStrategy[0]
                  .replace("At", "")
                  .replace("Date", "")})`
              : ""}
          </span>
        </div>
        <DaySection
          group={todayGroup}
          lazy={false}
          addTaskButtonRef={todayAddTaskButtonRef}
        />
      </div>

      {/* Timeline - Hidden in Focus Mode */}
      {!isFocusMode &&
        otherYearGroups.map((group) => (
          <YearSection key={group.year} group={group} />
        ))}

      {/* Backlog Section - Hidden in Focus Mode */}
      {!isFocusMode && backlogTasks.length > 0 && (
        <BacklogSection tasks={backlogTasks} />
      )}

      {isFocusMode && backlogTasks.length > 0 && (
        <div
          className="mx-2 mb-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500"
          role="note"
        >
          <Icon name="Archive" size={14} className="shrink-0 text-slate-400" />
          <span className="min-w-0 flex-1">
            {backlogTasks.length} backlog task
            {backlogTasks.length === 1 ? "" : "s"} hidden in focus mode.
          </span>
          <button
            type="button"
            onClick={toggleFocusMode}
            className="shrink-0 rounded-md px-2 py-1 font-semibold text-blue-600 outline-none hover:bg-white hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500/30"
            aria-label="Show backlog tasks by leaving focus mode"
          >
            Show backlog
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isFocusMode &&
        otherYearGroups.length === 0 &&
        tasks.length > 0 &&
        !todayGroup.tasks.length &&
        backlogTasks.length === 0 && (
          <div
            className="text-center text-slate-400 text-sm py-10"
            role="status"
          >
            No tasks visible based on current filters.
          </div>
        )}

      {isFocusMode && !todayGroup.tasks.length && (
        <div
          className="mx-auto max-w-sm px-4 py-10 text-center text-sm text-slate-400"
          role="status"
        >
          <p>Focus mode is on. No tasks for today.</p>
          <button
            type="button"
            onClick={handleAddTodayTask}
            className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-600 outline-none transition-colors hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-500/30"
          >
            <Icon name="Plus" size={14} />
            Add today&apos;s first task
          </button>
        </div>
      )}
    </div>
  );
};
