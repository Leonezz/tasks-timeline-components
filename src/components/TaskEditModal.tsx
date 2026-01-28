import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Frequency, RRule, Weekday } from "rrule";
import { DateTime } from "luxon";
import type { Priority, Task } from "../types";
import { Icon } from "./Icon";
import { cn } from "../utils";
import { DatePicker } from "./ui/date-picker";

interface TaskEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSave: (task: Task) => void;
  availableCategories: string[];
}

const FREQUENCY_OPTIONS = [
    { value: RRule.DAILY, label: "Daily" },
    { value: RRule.WEEKLY, label: "Weekly" },
    { value: RRule.MONTHLY, label: "Monthly" },
    { value: RRule.YEARLY, label: "Yearly" },
  ],
  WEEKDAYS = [
    { label: "M", val: RRule.MO },
    { label: "T", val: RRule.TU },
    { label: "W", val: RRule.WE },
    { label: "T", val: RRule.TH },
    { label: "F", val: RRule.FR },
    { label: "S", val: RRule.SA },
    { label: "S", val: RRule.SU },
  ],
  MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

interface EditFormProps {
  task: Task;
  onSave: (task: Task) => void;
  onClose: () => void;
  availableCategories: string[];
}

const EditForm: React.FC<EditFormProps> = ({
  task,
  onSave,
  onClose,
  availableCategories,
}) => {
  const [editedTask, setEditedTask] = useState<Task>(task),
    [isCategoryOpen, setIsCategoryOpen] = useState(false),
    // Initialize Recurrence State lazily
    [recurrenceState, setRecurrenceState] = useState(() => {
      let freq: Frequency = RRule.WEEKLY,
        interval = 1,
        byWeekDay: Weekday[] = [],
        byMonth: number[] = [],
        byMonthDay: number[] = [],
        start = "",
        end = "";

      if (task.isRecurring && task.recurringInterval) {
        try {
          const rule = RRule.fromString(task.recurringInterval);
          freq = rule.options.freq;
          interval = rule.options.interval;

          const rawByWeekday = rule.options.byweekday;
          if (rawByWeekday) {
            const asArray = Array.isArray(rawByWeekday)
              ? rawByWeekday
              : [rawByWeekday];
            byWeekDay = asArray.map((d) =>
              typeof d === "number" ? new Weekday(d) : d,
            );
          }

          byMonth = rule.options.bymonth
            ? Array.isArray(rule.options.bymonth)
              ? rule.options.bymonth
              : [rule.options.bymonth]
            : [];
          byMonthDay = rule.options.bymonthday
            ? Array.isArray(rule.options.bymonthday)
              ? rule.options.bymonthday
              : [rule.options.bymonthday]
            : [];

          if (rule.options.dtstart) {
            start = DateTime.fromJSDate(rule.options.dtstart).toISODate() || "";
          }
          if (rule.options.until) {
            end = DateTime.fromJSDate(rule.options.until).toISODate() || "";
          }
        } catch (e) {
          console.error(`parse recurrence rule failed with err: ${e}`);
          // Defaults
        }
      }
      return { freq, interval, byWeekDay, byMonth, byMonthDay, start, end };
    }),
    updateRecurrence = (updates: Partial<typeof recurrenceState>) => {
      setRecurrenceState((prev) => ({ ...prev, ...updates }));
    },
    handleSave = () => {
      const finalTask = { ...editedTask };

      // Construct RRule string if recurring
      if (finalTask.isRecurring) {
        try {
          const { start, end, freq, interval, byWeekDay, byMonth, byMonthDay } =
              recurrenceState,
            // Helper to convert ISO string to JS Date for RRule
            dtStart = start ? DateTime.fromISO(start).toJSDate() : undefined,
            until = end
              ? DateTime.fromISO(end).endOf("day").toJSDate()
              : undefined,
            rule = new RRule({
              freq,
              interval,
              byweekday: freq === RRule.WEEKLY ? byWeekDay : null,
              bymonth:
                freq === RRule.YEARLY && byMonth.length > 0 ? byMonth : null,
              bymonthday:
                (freq === RRule.MONTHLY || freq === RRule.YEARLY) &&
                byMonthDay.length > 0
                  ? byMonthDay
                  : null,
              dtstart: dtStart,
              until,
            });
          finalTask.recurringInterval = rule.toString();
        } catch (e) {
          console.error("Failed to generate RRule", e);
        }
      } else {
        finalTask.recurringInterval = undefined;
      }

      onSave(finalTask);
    },
    toggleRecurrence = () => {
      setEditedTask((prev) => ({ ...prev, isRecurring: !prev.isRecurring }));
    },
    filteredCategories = availableCategories.filter(
      (c) =>
        c.toLowerCase().includes((editedTask.category || "").toLowerCase()) &&
        c.toLowerCase() !== (editedTask.category || "").toLowerCase(),
    );

  return (
    <div className="flex flex-col max-h-[85vh]">
      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-paper/50 sticky top-0 backdrop-blur-md z-10 shrink-0">
        <h2 className="font-bold text-slate-800">Edit Task</h2>
        <button
          onClick={onClose}
          aria-label="Close edit task modal"
          className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Icon name="X" size={20} />
        </button>
      </div>

      <div className="p-6 space-y-5 overflow-y-auto flex-1">
        {/* Title */}
        <div className="space-y-1">
          <label
            htmlFor="task-title"
            className="text-xs font-semibold text-slate-500 uppercase"
          >
            Title
          </label>
          <input
            id="task-title"
            value={editedTask.title}
            onChange={(e) =>
              setEditedTask({ ...editedTask, title: e.target.value })
            }
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label
            htmlFor="task-description"
            className="text-xs font-semibold text-slate-500 uppercase"
          >
            Description
          </label>
          <textarea
            id="task-description"
            value={editedTask.description || ""}
            onChange={(e) =>
              setEditedTask({ ...editedTask, description: e.target.value })
            }
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none min-h-20 resize-none text-slate-900"
            placeholder="Add details..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Category Selector */}
          <div className="space-y-1 relative group">
            <label
              htmlFor="task-category"
              className="text-xs font-semibold text-slate-500 uppercase"
            >
              Category
            </label>
            <div className="relative">
              <input
                id="task-category"
                type="text"
                value={editedTask.category || ""}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, category: e.target.value })
                }
                onFocus={() => setIsCategoryOpen(true)}
                onBlur={() => setTimeout(() => setIsCategoryOpen(false), 200)} // Delay to allow click
                placeholder="Work, Personal..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none pl-9 text-slate-900"
              />
              <div className="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
                <Icon name="Folder" size={14} />
              </div>
              <div
                className="absolute right-3 top-2.5 text-slate-400 pointer-events-none transition-transform duration-200"
                style={{
                  transform: isCategoryOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <Icon name="ChevronDown" size={14} />
              </div>
            </div>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {isCategoryOpen &&
                (filteredCategories.length > 0 ||
                  (editedTask.category &&
                    !availableCategories.includes(editedTask.category))) && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute z-20 w-full mt-1 bg-white border border-slate-100 rounded-lg shadow-xl max-h-40 overflow-y-auto py-1"
                  >
                    {filteredCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() =>
                          setEditedTask({ ...editedTask, category: cat })
                        }
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Icon
                          name="Folder"
                          size={12}
                          className="text-slate-400"
                        />
                        {cat}
                      </button>
                    ))}
                    {editedTask.category &&
                      !availableCategories.includes(editedTask.category) && (
                        <div className="px-3 py-2 text-xs text-blue-600 bg-blue-50/50 border-t border-blue-100 flex items-center gap-2">
                          <Icon name="Plus" size={12} />
                          Create "{editedTask.category}"
                        </div>
                      )}
                  </motion.div>
                )}
            </AnimatePresence>
          </div>

          {/* Priority */}
          <div className="space-y-1">
            <span
              id="priority-label"
              className="text-xs font-semibold text-slate-500 uppercase"
            >
              Priority
            </span>
            <div
              role="radiogroup"
              aria-labelledby="priority-label"
              className="flex bg-slate-50 dark:bg-slate-800/50 p-1 rounded-lg border border-slate-200 dark:border-slate-700 h-9.5"
            >
              {(["low", "medium", "high"] as Priority[]).map((p) => (
                <button
                  key={p}
                  role="radio"
                  aria-checked={editedTask.priority === p}
                  onClick={() => setEditedTask({ ...editedTask, priority: p })}
                  className={cn(
                    "flex-1 text-xs font-medium rounded-md capitalize transition-all flex items-center justify-center",
                    editedTask.priority === p
                      ? "bg-white dark:bg-slate-600 shadow-sm text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-500"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">
            Task Dates
          </label>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase">
                Created
              </label>
              <DatePicker
                value={editedTask.createdAt}
                onChange={(value) =>
                  setEditedTask({
                    ...editedTask,
                    createdAt: value || editedTask.createdAt,
                  })
                }
                showTime
                placeholder="Select created date"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase">
                Due
              </label>
              <DatePicker
                value={editedTask.dueAt}
                onChange={(value) =>
                  setEditedTask({
                    ...editedTask,
                    dueAt: value,
                  })
                }
                showTime
                placeholder="Select due date"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase">
                Start At
              </label>
              <DatePicker
                value={editedTask.startAt}
                onChange={(value) =>
                  setEditedTask({
                    ...editedTask,
                    startAt: value,
                  })
                }
                showTime
                placeholder="Select start date"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase">
                Completed
              </label>
              <DatePicker
                value={editedTask.completedAt}
                onChange={(value) =>
                  setEditedTask({
                    ...editedTask,
                    completedAt: value,
                  })
                }
                showTime
                placeholder="Select completed date"
                disabled={
                  editedTask.status !== "done" &&
                  editedTask.status !== "cancelled"
                }
              />
            </div>
          </div>

          {/* Recurrence Control */}
          <div className="bg-slate-50 dark:bg-slate-800/30 rounded-lg p-3 border border-slate-200/60 dark:border-slate-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "p-1.5 rounded-md",
                    editedTask.isRecurring
                      ? "bg-blue-100 text-blue-600"
                      : "bg-slate-200 text-slate-500",
                  )}
                >
                  <Icon name="Repeat" size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Recurrence
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Repeats automatically
                  </span>
                </div>
              </div>
              <button
                onClick={toggleRecurrence}
                role="switch"
                aria-checked={editedTask.isRecurring}
                aria-label="Toggle task recurrence"
                className={cn(
                  "relative w-9 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400",
                  editedTask.isRecurring
                    ? "bg-blue-500"
                    : "bg-slate-200 dark:bg-slate-700",
                )}
              >
                <motion.div
                  layout
                  className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm"
                  animate={{ x: editedTask.isRecurring ? 16 : 0 }}
                />
              </button>
            </div>

            {/* Recurrence Details */}
            <AnimatePresence>
              {editedTask.isRecurring && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700 space-y-3">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="recurrence-interval"
                        className="text-xs font-medium text-slate-500"
                      >
                        Every
                      </label>
                      <input
                        id="recurrence-interval"
                        type="number"
                        min="1"
                        max="99"
                        aria-label="Recurrence interval"
                        value={recurrenceState.interval}
                        onChange={(e) =>
                          updateRecurrence({
                            interval: parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-12 px-1.5 py-1 text-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-xs focus:border-blue-500 outline-none text-slate-700 dark:text-slate-200"
                      />
                      <select
                        aria-label="Recurrence frequency"
                        value={recurrenceState.freq}
                        onChange={(e) =>
                          updateRecurrence({
                            freq: parseInt(e.target.value) as Frequency,
                          })
                        }
                        className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs rounded-md focus:ring-blue-500 focus:border-blue-500 block p-1 outline-none"
                      >
                        {FREQUENCY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {recurrenceState.freq === RRule.WEEKLY && (
                      <div className="space-y-1">
                        <span
                          id="weekdays-label"
                          className="text-[10px] font-semibold text-slate-400 uppercase"
                        >
                          On days
                        </span>
                        <div
                          role="group"
                          aria-labelledby="weekdays-label"
                          className="flex justify-between"
                        >
                          {WEEKDAYS.map((day, index) => {
                            const isSelected = recurrenceState.byWeekDay.some(
                                (d) => d.weekday === day.val.weekday,
                              ),
                              dayNames = [
                                "Monday",
                                "Tuesday",
                                "Wednesday",
                                "Thursday",
                                "Friday",
                                "Saturday",
                                "Sunday",
                              ];
                            return (
                              <button
                                key={day.label + day.val.weekday}
                                aria-label={dayNames[index]}
                                aria-pressed={isSelected}
                                onClick={() => {
                                  const prev = recurrenceState.byWeekDay,
                                    exists = prev.some(
                                      (d) => d.weekday === day.val.weekday,
                                    );
                                  updateRecurrence({
                                    byWeekDay: exists
                                      ? prev.filter(
                                          (d) => d.weekday !== day.val.weekday,
                                        )
                                      : [...prev, day.val],
                                  });
                                }}
                                className={cn(
                                  "w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium transition-all border",
                                  isSelected
                                    ? "bg-blue-500 text-white border-blue-600 shadow-sm"
                                    : "bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-blue-300 hover:text-blue-500",
                                )}
                              >
                                {day.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {(recurrenceState.freq === RRule.MONTHLY ||
                      recurrenceState.freq === RRule.YEARLY) && (
                      <div className="space-y-3">
                        {recurrenceState.freq === RRule.YEARLY && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-slate-400 uppercase">
                              Months
                            </label>
                            <div className="grid grid-cols-6 gap-1">
                              {MONTHS.map((m, idx) => {
                                const mVal = idx + 1,
                                  isSelected =
                                    recurrenceState.byMonth.includes(mVal);
                                return (
                                  <button
                                    key={m}
                                    onClick={() => {
                                      const prev = recurrenceState.byMonth;
                                      updateRecurrence({
                                        byMonth: prev.includes(mVal)
                                          ? prev.filter((x) => x !== mVal)
                                          : [...prev, mVal],
                                      });
                                    }}
                                    className={cn(
                                      "py-1 text-[15px] rounded border transition-colors",
                                      isSelected
                                        ? "bg-blue-500 text-white border-blue-600"
                                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-blue-300",
                                    )}
                                  >
                                    {m}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-slate-400 uppercase">
                            Days
                          </label>
                          <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(
                              (d) => {
                                const isSelected =
                                  recurrenceState.byMonthDay.includes(d);
                                return (
                                  <button
                                    key={d}
                                    onClick={() => {
                                      const prev = recurrenceState.byMonthDay;
                                      updateRecurrence({
                                        byMonthDay: prev.includes(d)
                                          ? prev.filter((x) => x !== d)
                                          : [...prev, d],
                                      });
                                    }}
                                    className={cn(
                                      "w-full aspect-square flex items-center justify-center text-[15px] rounded border transition-colors",
                                      isSelected
                                        ? "bg-blue-500 text-white border-blue-600"
                                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-blue-300",
                                    )}
                                  >
                                    {d}
                                  </button>
                                );
                              },
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase">
                          Start Recurrence
                        </label>
                        <DatePicker
                          value={recurrenceState.start}
                          onChange={(value) =>
                            updateRecurrence({
                              start: value
                                ? DateTime.fromISO(value).toISODate() || ""
                                : "",
                            })
                          }
                          placeholder="Select start"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase">
                          End Recurrence
                        </label>
                        <DatePicker
                          value={recurrenceState.end}
                          onChange={(value) =>
                            updateRecurrence({
                              end: value
                                ? DateTime.fromISO(value).toISODate() || ""
                                : "",
                            })
                          }
                          placeholder="Select end"
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 italic bg-white/50 dark:bg-slate-800/50 p-2 rounded border border-slate-100 dark:border-slate-700 text-center">
                      {(() => {
                        try {
                          const {
                              freq,
                              interval,
                              byWeekDay,
                              byMonth,
                              byMonthDay,
                              start,
                              end,
                            } = recurrenceState,
                            rule = new RRule({
                              freq,
                              interval,
                              byweekday:
                                freq === RRule.WEEKLY ? byWeekDay : null,
                              bymonth:
                                freq === RRule.YEARLY && byMonth.length > 0
                                  ? byMonth
                                  : null,
                              bymonthday:
                                (freq === RRule.MONTHLY ||
                                  freq === RRule.YEARLY) &&
                                byMonthDay.length > 0
                                  ? byMonthDay
                                  : null,
                              dtstart: start
                                ? DateTime.fromISO(start).toJSDate()
                                : undefined,
                              until: end
                                ? DateTime.fromISO(end).endOf("day").toJSDate()
                                : undefined,
                            });
                          return rule.toText();
                        } catch (e) {
                          console.error(`invalid recurrence rule: ${e}`);
                          return "Invalid Rule";
                        }
                      })()}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 sticky bottom-0 z-10 shrink-0">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-200 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  isOpen,
  onClose,
  task,
  onSave,
  availableCategories,
}) => (
  <AnimatePresence>
    {isOpen && task && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%" }}
          animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
          exit={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%" }}
          className="fixed top-1/2 left-1/2 w-full max-w-lg bg-paper rounded-xl shadow-2xl z-50 border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-900"
        >
          <EditForm
            key={task.id}
            task={task}
            onSave={onSave}
            onClose={onClose}
            availableCategories={availableCategories}
          />
        </motion.div>
      </>
    )}
  </AnimatePresence>
);
