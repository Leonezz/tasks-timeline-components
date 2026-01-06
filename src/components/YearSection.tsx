import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { YearGroup, Task, AppSettings } from "../types";
import { DaySection } from "./DaySection";
import { cn } from "../utils";
import { Icon } from "./Icon";

interface YearSectionProps {
  group: YearGroup;
  onUpdateTask: (task: Task) => void;
  onAddTask: (task: Partial<Task>) => void;
  onAICommand: (input: string) => Promise<void>;
  onEditTask?: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  settings: AppSettings;

  // Synced Props
  isAiMode: boolean;
  onVoiceError: (msg: string) => void;
  availableCategories: string[];
}

export const YearSection: React.FC<YearSectionProps> = ({
  group,
  onUpdateTask,
  onAddTask,
  onAICommand,
  onEditTask,
  onDeleteTask,
  settings,
  isAiMode,
  onVoiceError,
  availableCategories,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const progressPercent =
    Math.round((group.completedTasks / group.totalTasks) * 100) || 0;

  return (
    <div className="mb-4">
      {/* Year Header & Progress - Clickable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left mb-1.5 group outline-none"
      >
        <div className="flex items-end justify-between mb-1">
          <div className="flex items-baseline gap-4">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-slate-400"
              >
                <Icon name="ChevronRight" size={20} />
              </motion.div>
              <h2 className="text-3xl font-black text-blue-600 tracking-tighter group-hover:text-slate-800 transition-colors">
                {group.year}
              </h2>
            </div>
            <div className="text-xs text-slate-400 font-mono hidden sm:inline-block">
              <span className="text-rose-500 font-bold">
                {group.totalTasks - group.completedTasks}
              </span>{" "}
              unfinished tasks in{" "}
              <span className="text-rose-500 font-bold">
                {group.dayGroups.length}
              </span>{" "}
              active days.
            </div>
          </div>

          {/* Progress Numbers Moved Here */}
          <div className="flex items-center gap-2 pb-1">
            <span className="text-[10px] text-slate-400 font-mono">
              {group.completedTasks} / {group.totalTasks}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        {settings.showProgressBar && (
          <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className={cn(
                "absolute top-0 left-0 h-full rounded-full",
                progressPercent === 100 ? "bg-emerald-400" : "bg-slate-800"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        )}
      </button>

      {/* Days with AnimatePresence */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {group.dayGroups.map((dayGroup) => (
              <DaySection
                key={dayGroup.date}
                group={dayGroup}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
