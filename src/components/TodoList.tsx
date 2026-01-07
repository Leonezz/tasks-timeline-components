import React, { useMemo } from "react";
import { DateTime } from "luxon";
import type { Task, DayGroup, AppSettings, DateGroupBy } from "../types";
import { groupTasksByYearAndDate } from "../utils";
import { YearSection } from "./YearSection";
import { DaySection } from "./DaySection";
import { BacklogSection } from "./BacklogSection";

interface TodoListProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onAddTask: (task: Partial<Task>) => void;
  onAICommand: (input: string) => Promise<void>;
  onEditTask?: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  className?: string;
  settings: AppSettings;
  isFocusMode: boolean;

  // Synced Props
  isAiMode: boolean;
  onVoiceError: (msg: string) => void;
  availableCategories: string[];
}

export const TodoList: React.FC<TodoListProps> = ({
  tasks,
  onUpdateTask,
  onAddTask,
  onAICommand,
  onEditTask,
  onDeleteTask,
  className,
  settings,
  isFocusMode,
  isAiMode,
  onVoiceError,
  availableCategories,
}) => {
  const { todayGroup, otherYearGroups, backlogTasks } = useMemo(() => {
    const today = DateTime.now();
    const todayStr = today.toISODate();

    // 1. Filter based on "Show Completed" setting
    const visibleTasks = settings.showCompleted
      ? tasks
      : tasks.filter((t) => t.status !== "done" && t.status !== "cancelled");

    // 2. Identify "Dated" vs "Truly Undated" tasks
    const datedTasks: Task[] = [];
    const trulyUndatedTasks: Task[] = [];

    const dateFields: DateGroupBy[] = [
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
      settings.groupingStrategy
    );

    // 4. Extract "Today" group from the hierarchy for featured display
    let foundTodayGroup: DayGroup | null = null;
    const finalYearGroups = [];

    for (const yearGrp of allGroups) {
      // Check if today exists in this year
      const todayGroupInYear = yearGrp.dayGroups.find(
        (dg) => dg.date === todayStr
      );

      if (todayGroupInYear) {
        foundTodayGroup = todayGroupInYear;
        const remainingDays = yearGrp.dayGroups.filter(
          (dg) => dg.date !== todayStr
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
          onUpdateTask={onUpdateTask}
          onAddTask={onAddTask}
          onAICommand={onAICommand}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          settings={settings}
          isAiMode={isAiMode}
          onVoiceError={onVoiceError}
          availableCategories={availableCategories}
        />
      </div>

      {/* Timeline - Hidden in Focus Mode */}
      {!isFocusMode &&
        otherYearGroups.map((group) => (
          <YearSection
            key={group.year}
            group={group}
            onUpdateTask={onUpdateTask}
            onAddTask={onAddTask}
            onAICommand={onAICommand}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            settings={settings}
            isAiMode={isAiMode}
            onVoiceError={onVoiceError}
            availableCategories={availableCategories}
          />
        ))}

      {/* Backlog Section - Hidden in Focus Mode */}
      {!isFocusMode && backlogTasks.length > 0 && (
        <BacklogSection
          tasks={backlogTasks}
          onUpdateTask={onUpdateTask}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          settings={settings}
          availableCategories={availableCategories}
        />
      )}

      {/* Empty State */}
      {!isFocusMode &&
        otherYearGroups.length === 0 &&
        tasks.length > 0 &&
        !todayGroup.tasks.length &&
        backlogTasks.length === 0 && (
          <div className="text-center text-slate-400 text-sm py-10">
            No tasks visible based on current filters.
          </div>
        )}

      {isFocusMode && !todayGroup.tasks.length && (
        <div className="text-center text-slate-400 text-sm py-10">
          Focus mode is on. No tasks for today.
        </div>
      )}
    </div>
  );
};
