import React, { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useIsPresent } from "framer-motion";
import { Frequency, RRule } from "rrule";
import { DateTime } from "luxon";
import type { Priority, Task } from "../types";
import { Icon } from "./Icon";
import { cn, deriveWorkflowStatus, isTaskRecurring } from "../utils";
import {
  previewRecurrence,
  readRecurrenceRule,
  recurrenceSaveFormat,
  resolveRecurrenceOnSave,
} from "../utils/recurrence";
import {
  keepTabInShadowRoot,
  trapFocusInShadowRoot,
} from "../utils/focus-loop";
import { captureFocusReturn, restoreFocus } from "../utils/focus-return";
import { DatePicker } from "./ui/date-picker";
import { Dialog, DialogPortal } from "./ui/dialog";

/**
 * How edited recurrence rules are written. "text" always writes Obsidian
 * Tasks text; "auto" writes text for text rules and tasks from the Obsidian
 * Tasks parser, and RRULE syntax otherwise.
 */
export type RecurrenceFormat = "auto" | "text";

interface TaskEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  /** May return a promise; if it rejects, the editor stays open and shows why. */
  onSave: (task: Task) => void | Promise<void>;
  availableCategories: string[];
  recurrenceFormat?: RecurrenceFormat;
}

const LAST_DAY_OF_MONTH = -1;

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
  onSave: (task: Task) => void | Promise<void>;
  onClose: () => void;
  availableCategories: string[];
  recurrenceFormat: RecurrenceFormat;
}

const errorText = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const EditForm: React.FC<EditFormProps> = ({
  task,
  onSave,
  onClose,
  availableCategories,
  recurrenceFormat,
}) => {
  const [editedTask, setEditedTask] = useState<Task>(() => ({
      ...task,
      isRecurring: isTaskRecurring(task),
    })),
    editedWorkflowStatus = deriveWorkflowStatus(editedTask),
    [isCategoryOpen, setIsCategoryOpen] = useState(false),
    [storedRule] = useState(() => readRecurrenceRule(task.recurringInterval)),
    [recurrenceState, setRecurrenceState] = useState(storedRule.state),
    // Until the controls change, saving keeps the stored rule verbatim
    [recurrenceControlsTouched, setRecurrenceControlsTouched] = useState(false),
    [saveError, setSaveError] = useState<string | null>(null),
    [isSaving, setIsSaving] = useState(false),
    // Obsidian Tasks lines only hold text rules ("every 2 weeks on Monday")
    saveFormat = recurrenceSaveFormat(
      recurrenceFormat,
      storedRule.source,
      task,
    ),
    updateRecurrence = (updates: Partial<typeof recurrenceState>) => {
      setRecurrenceControlsTouched(true);
      setRecurrenceState((prev) => ({ ...prev, ...updates }));
    },
    handleSave = async () => {
      let recurrence: ReturnType<typeof resolveRecurrenceOnSave>;
      try {
        recurrence = resolveRecurrenceOnSave(task, {
          isRecurring: Boolean(editedTask.isRecurring),
          controlsTouched: recurrenceControlsTouched,
          state: recurrenceState,
          format: saveFormat,
          whenDone: storedRule.whenDone,
        });
      } catch (error) {
        setSaveError(
          `Could not build the recurrence rule: ${errorText(error)}`,
        );
        return;
      }
      setSaveError(null);
      setIsSaving(true);
      try {
        // Stays open on failure so the user's edits are not lost
        await onSave({ ...editedTask, ...recurrence });
      } catch (error) {
        setSaveError(`Could not save the task: ${errorText(error)}`);
      } finally {
        setIsSaving(false);
      }
    },
    toggleRecurrence = () => {
      setEditedTask((prev) => ({ ...prev, isRecurring: !prev.isRecurring }));
    },
    filteredCategories = availableCategories.filter(
      (c) =>
        c.toLowerCase().includes((editedTask.category || "").toLowerCase()) &&
        c.toLowerCase() !== (editedTask.category || "").toLowerCase(),
    );

  const unsupportedParts = storedRule.unsupportedParts.join(", "),
    keepsStoredRule =
      !recurrenceControlsTouched &&
      (storedRule.source === "text" ||
        storedRule.source === "unparsed" ||
        unsupportedParts !== ""),
    recurrencePreview = keepsStoredRule ? (
      <>
        Current rule:{" "}
        <span className="not-italic">{task.recurringInterval}</span>
        {storedRule.source === "unparsed" &&
          ". These settings can't show it; it is kept unless you change them."}
        {unsupportedParts !== "" &&
          `. These settings can't show: ${unsupportedParts}. The rule is kept as written unless you change them, which replaces it.`}
      </>
    ) : (
      <>
        {(() => {
          try {
            // In text format, the text saving writes
            return previewRecurrence(
              recurrenceState,
              saveFormat,
              storedRule.whenDone,
            );
          } catch (error) {
            return `Invalid rule: ${errorText(error)}`;
          }
        })()}
        {unsupportedParts !== "" && (
          <span className="block not-italic text-amber-800">
            Saving replaces the stored rule and drops the parts these settings
            can&apos;t show: {unsupportedParts}.
          </span>
        )}
      </>
    );

  return (
    <div className="flex flex-col max-h-[85vh]">
      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-paper/50 sticky top-0 backdrop-blur-md z-10 shrink-0">
        {/* Names the dialog (aria-labelledby) */}
        <DialogPrimitive.Title className="font-bold text-slate-800">
          Edit Task
        </DialogPrimitive.Title>
        <button
          onClick={onClose}
          aria-label="Close edit task modal"
          className="p-2 text-slate-500 hover:text-slate-600 rounded-full hover:bg-slate-100"
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
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-900"
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
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none min-h-20 resize-none text-slate-900"
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
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none pl-9 text-slate-900"
              />
              <div className="absolute left-3 top-2.5 text-slate-500 pointer-events-none">
                <Icon name="Folder" size={14} />
              </div>
              <div
                className="absolute right-3 top-2.5 text-slate-500 pointer-events-none transition-transform duration-200"
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
                          className="text-slate-500"
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
              className="flex bg-slate-50 p-1 rounded-lg border border-slate-200 h-9.5"
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
                      ? "bg-white shadow-sm text-slate-800 border border-slate-100"
                      : "text-slate-500 hover:text-slate-700",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">
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
                  editedWorkflowStatus !== "done" &&
                  editedWorkflowStatus !== "cancelled"
                }
              />
            </div>
          </div>

          {/* Recurrence Control */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/60 transition-colors">
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
                  <span className="text-sm font-medium text-slate-700">
                    Recurrence
                  </span>
                  <span className="text-[10px] text-slate-500">
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
                  editedTask.isRecurring ? "bg-blue-500" : "bg-slate-200",
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
                  <div className="pt-3 border-t border-slate-200/60 space-y-3">
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
                        className="w-12 px-1.5 py-1 text-center bg-white border border-slate-300 rounded-md text-xs focus:border-blue-500 outline-none text-slate-700"
                      />
                      <select
                        aria-label="Recurrence frequency"
                        value={recurrenceState.freq}
                        onChange={(e) =>
                          updateRecurrence({
                            freq: parseInt(e.target.value) as Frequency,
                          })
                        }
                        className="flex-1 bg-white border border-slate-300 text-slate-700 text-xs rounded-md focus:ring-blue-500 focus:border-blue-500 block p-1 outline-none"
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
                          className="text-[10px] font-semibold text-slate-500 uppercase"
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
                                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                    : "bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-500",
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
                            <label className="text-[10px] font-semibold text-slate-500 uppercase">
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
                                    type="button"
                                    aria-pressed={isSelected}
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
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white border-slate-200 text-slate-500 hover:border-blue-300",
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
                          <label className="text-[10px] font-semibold text-slate-500 uppercase">
                            Days
                          </label>
                          <div className="grid grid-cols-7 gap-1">
                            {/* -1 is the month's last day, whatever its length */}
                            {[
                              ...Array.from({ length: 31 }, (_, i) => i + 1),
                              LAST_DAY_OF_MONTH,
                            ].map((d) => {
                              const isSelected =
                                recurrenceState.byMonthDay.includes(d);
                              return (
                                <button
                                  key={d}
                                  type="button"
                                  aria-pressed={isSelected}
                                  onClick={() => {
                                    const prev = recurrenceState.byMonthDay;
                                    updateRecurrence({
                                      byMonthDay: prev.includes(d)
                                        ? prev.filter((x) => x !== d)
                                        : [...prev, d],
                                    });
                                  }}
                                  className={cn(
                                    "w-full flex items-center justify-center text-[15px] rounded border transition-colors",
                                    d === LAST_DAY_OF_MONTH
                                      ? "col-span-4 text-xs"
                                      : "aspect-square",
                                    isSelected
                                      ? "bg-blue-600 text-white border-blue-600"
                                      : "bg-white border-slate-200 text-slate-500 hover:border-blue-300",
                                  )}
                                >
                                  {d === LAST_DAY_OF_MONTH ? "Last day" : d}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/50">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase">
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
                        <label className="text-[10px] font-semibold text-slate-500 uppercase">
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

                    <div className="text-[10px] text-slate-500 italic bg-white/50 p-2 rounded border border-slate-100 text-center">
                      {recurrencePreview}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 z-10 shrink-0">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        {saveError && (
          <p role="alert" className="mr-auto self-center text-xs text-rose-700">
            {saveError}
          </p>
        )}
        <button
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-200 transition-colors disabled:opacity-60"
        >
          {isSaving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

/** The open editor: its backdrop and dialog. */
const EditorDialog: React.FC<EditFormProps> = (props) => {
  // Radix returns focus to a Dialog.Trigger, and the editor has none. Read
  // the opener while rendering, before this commit closes a popup holding it
  const [focusReturn] = useState(captureFocusReturn);
  const [dialog, setDialog] = useState<HTMLElement | null>(null);
  // Like Radix's own trap, only while open, not during the exit animation
  const isOpen = useIsPresent();
  useEffect(
    () => (dialog && isOpen ? trapFocusInShadowRoot(dialog) : undefined),
    [dialog, isOpen],
  );

  return (
    <DialogPortal forceMount>
      {/* Not Radix's Overlay: its scroll lock checks a document listener's
          event.target, which in a shadow root is the shadow host, so it
          cancelled wheel and touch scrolling inside the editor too. Clicks
          here still close the editor (Content's pointer-down-outside). */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
        // Radix disables pointer events outside the dialog; take them here
        style={{ pointerEvents: "auto" }}
      />
      <DialogPrimitive.Content
        ref={setDialog}
        asChild
        forceMount
        aria-modal="true"
        // Named by its title; it has no description
        aria-describedby={undefined}
        onKeyDown={keepTabInShadowRoot}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          restoreFocus(focusReturn);
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%" }}
          animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
          exit={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%" }}
          className="fixed top-1/2 left-1/2 w-full max-w-lg bg-paper rounded-xl shadow-2xl z-50 border border-slate-200 overflow-hidden text-slate-900"
        >
          <EditForm key={props.task.id} {...props} />
        </motion.div>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
};

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  isOpen,
  onClose,
  task,
  onSave,
  availableCategories,
  recurrenceFormat = "auto",
}) => (
  // A modal dialog: Escape and clicks outside close it, focus stays inside,
  // and the rest of the page is hidden from assistive technology meanwhile.
  // Radix keeps the parts mounted (forceMount) so framer-motion animates exit.
  <Dialog
    open={isOpen && task !== null}
    onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}
  >
    <AnimatePresence>
      {isOpen && task && (
        <EditorDialog
          task={task}
          onSave={onSave}
          onClose={onClose}
          availableCategories={availableCategories}
          recurrenceFormat={recurrenceFormat}
        />
      )}
    </AnimatePresence>
  </Dialog>
);
