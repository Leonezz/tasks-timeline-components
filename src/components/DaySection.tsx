import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DateTime } from "luxon";
import type { DayGroup } from "../types";
import { TaskItem } from "./TaskItem";
import { Icon } from "./Icon";
import { cn, formatRelativeDate } from "../utils";
import { useVoiceInput } from "../hooks/useVoiceInput";
import { useTasksContext } from "../contexts/TasksContext";
import { useSettingsContext } from "../contexts/SettingsContext";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

interface DaySectionProps {
  group: DayGroup;
}

export const DaySection: React.FC<DaySectionProps> = ({ group }) => {
  const { onAddTask, onAICommand } = useTasksContext(),
    { settings, isAiMode, onVoiceError } = useSettingsContext(),
    [isOpen, setIsOpen] = useState(true),
    [isAdding, setIsAdding] = useState(false),
    [newTaskTitle, setNewTaskTitle] = useState(""),
    [selectedCategory, setSelectedCategory] = useState(
      settings.defaultCategory,
    ),
    [isLoading, setIsLoading] = useState(false),
    inputRef = useRef<HTMLInputElement>(null);

  // Reset category to default when adding starts
  useEffect(() => {
    if (isAdding) {
      setSelectedCategory(settings.defaultCategory);
    }
  }, [isAdding, settings.defaultCategory]);

  // Voice Input for this section
  const {
      isListening,
      start: startVoice,
      stop: stopVoice,
    } = useVoiceInput(
      settings.voiceConfig,
      (text) => setNewTaskTitle((prev) => (prev ? `${prev} ${text}` : text)),
      onVoiceError,
    ),
    // Parse the ISO date string from the group key
    dt = DateTime.fromISO(group.date),
    dayOfWeek = dt.toFormat("ccc"), // Mon, Tue
    isWeekend = dt.weekday > 5,
    calendarColor = isWeekend
      ? "text-rose-500 bg-rose-50 border-rose-100"
      : "text-slate-600 bg-slate-50 border-slate-200",
    relative = formatRelativeDate(group.date),
    isRelative =
      relative === "Today" ||
      relative === "Tomorrow" ||
      relative === "Yesterday",
    displayDate = dt.toFormat(settings.dateFormat);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const stats = useMemo(
      () =>
        group.tasks.reduce(
          (acc, task) => {
            if (task.status === "done") {
              acc.done++;
            } else if (task.status === "overdue" || task.status === "due") {
              acc.urgent++;
            } else if (
              ["todo", "scheduled", "unplanned"].includes(task.status)
            ) {
              acc.open++;
            }
            return acc;
          },
          { done: 0, urgent: 0, open: 0 },
        ),
      [group.tasks],
    ),
    handleCreate = async () => {
      if (!newTaskTitle.trim()) {
        setIsAdding(false);
        return;
      }

      setIsLoading(true);
      try {
        if (settings.aiConfig.enabled && isAiMode) {
          // Inject context for AI to know which date we are adding to
          const prompt = `Add task to ${group.date}: ${newTaskTitle} (Category: ${selectedCategory})`;
          await onAICommand(prompt);
        } else {
          onAddTask({
            title: newTaskTitle,
            dueAt: group.date,
            category: selectedCategory,
          });
        }
        setNewTaskTitle("");
        // Don't close immediately if using AI to allow seeing result/errors, or maybe keep adding?
        // For now, assume single add flow similar to manual.
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    },
    handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleCreate();
      }
      if (e.key === "Escape") {
        setIsAdding(false);
        setNewTaskTitle("");
      }
    },
    iconTopSpacing =
      {
        sm: "mt-0.5",
        base: "mt-0.5",
        lg: "mt-1",
        xl: "mt-1.5",
      }[settings.fontSize] || "mt-0.5";

  return (
    <div className="mb-2 relative">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Date Header */}
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between mb-1 sticky top-0 bg-paper/95 backdrop-blur-sm z-20 py-1.5 border-b border-dashed border-slate-200 group hover:border-slate-300 transition-colors text-left outline-none pl-2">
            <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
              <div className="flex items-center gap-2 shrink-0">
                <motion.div
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-slate-400"
                >
                  <Icon name="ChevronRight" size={14} />
                </motion.div>

                <div className="flex items-baseline gap-2">
                  {isRelative && (
                    <span className="text-xs font-bold text-blue-600 font-mono uppercase tracking-tight">
                      {relative}
                    </span>
                  )}
                  <h3
                    className={`text-sm font-bold text-slate-800 font-mono tracking-tight group-hover:text-blue-600 transition-colors ${
                      isRelative ? "opacity-60 font-normal" : ""
                    }`}
                  >
                    {displayDate}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                {stats.urgent > 0 && (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-100/50 text-rose-600 border border-rose-200/50 shadow-sm shadow-rose-100">
                    <Icon name="AlertCircle" size={10} strokeWidth={2.5} />
                    <span className="text-[10px] font-bold leading-none">
                      {stats.urgent}
                    </span>
                  </div>
                )}
                {stats.open > 0 && (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 shadow-sm shadow-slate-100">
                    <Icon name="Circle" size={10} strokeWidth={2.5} />
                    <span className="text-[10px] font-bold leading-none">
                      {stats.open}
                    </span>
                  </div>
                )}
                {stats.done > 0 && (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-100/50 text-emerald-600 border border-emerald-200/50 shadow-sm shadow-emerald-100">
                    <Icon name="CheckCircle2" size={10} strokeWidth={2.5} />
                    <span className="text-[10px] font-bold leading-none">
                      {stats.done}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div
              className={`flex flex-col items-center justify-center w-8 h-8 rounded-lg border ${calendarColor} shadow-sm shrink-0 ml-2`}
            >
              <span className="text-[10px] font-bold uppercase leading-none">
                {dayOfWeek}
              </span>
              <span className="text-[10px] opacity-60 leading-none mt-0.5">
                {group.tasks.length}
              </span>
            </div>
          </button>
        </CollapsibleTrigger>

        {/* Tasks List */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <CollapsibleContent forceMount asChild>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="space-y-0.5 relative pb-2">
                  {group.tasks.map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))}

                  {/* Add Item Row - Aligned with TaskItem grid */}
                  <div className="group relative flex items-stretch gap-2 py-1.5 px-1 transition-all rounded-lg">
                    {/* 1. Left Spacing Column (Matches Timeline Column Width of TaskItem) */}
                    <div
                      className={cn(
                        "relative flex flex-col items-center shrink-0 w-6",
                        iconTopSpacing,
                      )}
                    >
                      {/* Line coming from top (connects to previous tasks) */}
                      {group.tasks.length > 0 && (
                        <div className="absolute -top-1 h-4 w-px left-1/2 -translate-x-1/2 bg-slate-200" />
                      )}

                      {/* The Dot / Action Icon */}
                      <button
                        onClick={() => setIsAdding(true)}
                        className={cn(
                          "relative z-10 w-6 h-6 flex items-center justify-center rounded-full transition-all outline-none",
                          isAdding
                            ? isAiMode
                              ? "bg-purple-100 text-purple-600"
                              : "bg-blue-100 text-blue-600"
                            : "bg-white hover:bg-slate-100 text-slate-300 hover:text-blue-500",
                        )}
                      >
                        {isLoading ? (
                          <div className="animate-spin">
                            <Icon name="Loader2" size={12} />
                          </div>
                        ) : (
                          <Icon
                            name={isAiMode ? "Sparkles" : "Plus"}
                            size={14}
                          />
                        )}
                      </button>
                    </div>

                    {/* 2. Input Content Area */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      {isAdding ? (
                        <motion.div
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2"
                        >
                          <input
                            ref={inputRef}
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                            // Delay blur to allow clicking the category input or mic
                            onBlur={(e) => {
                              if (
                                !e.relatedTarget ||
                                !e.relatedTarget.closest(".add-row-actions")
                              ) {
                                if (!newTaskTitle) {
                                  setIsAdding(false);
                                }
                              }
                            }}
                            placeholder={
                              isListening
                                ? "Listening..."
                                : isAiMode
                                  ? "Describe task for this day..."
                                  : "Type a new task..."
                            }
                            className={cn(
                              "flex-1 bg-transparent border-b focus:outline-none text-sm py-0.5 transition-colors",
                              isAiMode
                                ? "border-purple-300 focus:border-purple-500 placeholder:text-purple-300 text-purple-900"
                                : "border-blue-300 focus:border-blue-500",
                            )}
                            disabled={isLoading || isListening}
                          />

                          {/* Inline Actions (Category & Mic) */}
                          <div className="flex items-center gap-1 add-row-actions">
                            {/* Category Picker */}
                            <div className="relative group/cat">
                              <input
                                list={`cat-list-${group.date}`}
                                className="w-20 text-[10px] bg-slate-100 hover:bg-slate-200 border-none rounded px-1.5 py-0.5 text-slate-600 focus:bg-white focus:ring-1 focus:ring-blue-300 outline-none transition-all placeholder:text-slate-400 truncate"
                                placeholder="Category"
                                value={selectedCategory}
                                onChange={(e) =>
                                  setSelectedCategory(e.target.value)
                                }
                                onFocus={() => {}}
                                title="Task Category"
                              />
                              <datalist id={`cat-list-${group.date}`}>
                                {/* We rely on the parent or context for available categories, simplified here by assuming common defaults + user typed ones */}
                                <option value="Work" />
                                <option value="Personal" />
                                <option value="Home" />
                                <option value="Health" />
                                <option value="Finance" />
                                <option value="Urgent" />
                              </datalist>
                            </div>

                            {settings.voiceConfig.enabled && (
                              <button
                                onClick={isListening ? stopVoice : startVoice}
                                className={cn(
                                  "p-1 rounded hover:bg-slate-100 transition-colors",
                                  isListening && "text-rose-500 animate-pulse",
                                )}
                                tabIndex={-1}
                                title={
                                  isListening
                                    ? "Stop Recording"
                                    : "Start Voice Input"
                                }
                              >
                                <Icon
                                  name={isListening ? "Square" : "Mic"}
                                  size={14}
                                />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ) : (
                        <button
                          onClick={() => setIsAdding(true)}
                          className="text-left text-sm text-slate-400 hover:text-blue-500 transition-colors h-5.5 flex items-end font-medium"
                        >
                          Add task...
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </CollapsibleContent>
          )}
        </AnimatePresence>
      </Collapsible>
    </div>
  );
};
