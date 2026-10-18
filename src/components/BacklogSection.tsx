import React, { useCallback, useState } from "react";
import { motion } from "framer-motion";
import type { Task } from "../types";
import { Icon } from "./Icon";
import { useSettingsContext } from "../contexts/SettingsContext";
import { computeDateValidation } from "../utils";
import { Collapsible, CollapsibleTrigger } from "./ui/collapsible";
import { TaskChunkList } from "./TaskChunkList";

interface BacklogSectionProps {
  tasks: Task[];
  /** When false, skip lazy rendering (e.g. for standalone stories). Default: true */
  lazy?: boolean;
  /**
   * Controlled open state. Pass `onOpenChange` with it; the section never
   * opens or closes on its own.
   */
  open?: boolean;
  /** Initial open state when uncontrolled. Default: false (collapsed). */
  defaultOpen?: boolean;
  /** Called when the user expands or collapses the section. */
  onOpenChange?: (open: boolean) => void;
}

const useOpenState = (
  open: boolean | undefined,
  defaultOpen: boolean,
  onOpenChange: ((open: boolean) => void) | undefined,
): [boolean, (open: boolean) => void] => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );
  if (isControlled && !onOpenChange) {
    throw new Error(
      "BacklogSection: `open` was passed without `onOpenChange`, so the user could never expand or collapse it. Pass both, or use `defaultOpen`.",
    );
  }
  return [open ?? uncontrolledOpen, setOpen];
};

export const BacklogSection: React.FC<BacklogSectionProps> = ({
  tasks,
  lazy = true,
  open,
  defaultOpen = false,
  onOpenChange,
}) => {
  const { settings } = useSettingsContext(),
    [isOpen, setIsOpen] = useOpenState(open, defaultOpen, onOpenChange),
    { groupingStrategy } = settings,
    getDateValidation = useCallback(
      (task: Task) => computeDateValidation(task, groupingStrategy),
      [groupingStrategy],
    );

  return (
    <div
      className="mt-8 pt-4 border-t border-slate-100"
      data-backlog-section=""
      data-task-count={tasks.length}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex items-start gap-2 mb-4 pl-2 w-full group outline-none rounded-sm focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-1"
            aria-label={`${isOpen ? "Collapse" : "Expand"} backlog, ${
              tasks.length
            } undated task${tasks.length === 1 ? "" : "s"}`}
            title={`${tasks.length} undated task${
              tasks.length === 1 ? "" : "s"
            } in backlog`}
          >
            <motion.div
              initial={false}
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="mt-1 text-slate-400"
            >
              <Icon name="ChevronRight" size={14} />
            </motion.div>

            <Icon name="Archive" size={14} className="mt-1 text-slate-400" />
            <div className="flex min-w-0 flex-col items-start">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-700 transition-colors">
                Backlog / Undated
              </h3>
              <span className="text-[10px] font-medium normal-case tracking-normal text-slate-400">
                Tasks without any recognized date
              </span>
            </div>
            <span
              className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono"
              aria-label={`${tasks.length} undated task${
                tasks.length === 1 ? "" : "s"
              }`}
            >
              {tasks.length}
            </span>
          </button>
        </CollapsibleTrigger>

        <motion.div
          initial={false}
          animate={
            isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }
          }
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          {/* Collapsed: nothing mounted and no placeholder space reserved */}
          {isOpen && (
            <div className="space-y-0.5">
              {tasks.length > 0 ? (
                <TaskChunkList
                  tasks={tasks}
                  lazy={lazy}
                  getDateValidation={getDateValidation}
                />
              ) : (
                <div className="px-2 py-4 text-sm text-slate-400">
                  No undated tasks.
                </div>
              )}
            </div>
          )}
        </motion.div>
      </Collapsible>
    </div>
  );
};
