import React, { useState } from "react";
import { motion } from "framer-motion";
import type { Task } from "../types";
import { TaskItem } from "./TaskItem";
import { Icon } from "./Icon";
import { useSettingsContext } from "../contexts/SettingsContext";
import { useLazyRender } from "../hooks/useLazyRender";
import { computeDateValidation } from "../utils";
import { Collapsible, CollapsibleTrigger } from "./ui/collapsible";

interface BacklogSectionProps {
  tasks: Task[];
  /** When false, skip lazy rendering (e.g. for standalone stories). Default: true */
  lazy?: boolean;
}

export const BacklogSection: React.FC<BacklogSectionProps> = ({
  tasks,
  lazy = true,
}) => {
  const { containerRef, contentRef, isNearViewport, placeholderHeight } =
      useLazyRender(tasks.length, { enabled: lazy }),
    { settings } = useSettingsContext(),
    [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mt-8 pt-4 border-t border-slate-100">
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
          <div
            ref={containerRef}
            className="space-y-0.5"
            style={{
              contentVisibility: lazy ? "auto" : undefined,
              containIntrinsicSize: lazy
                ? `auto ${placeholderHeight}px`
                : undefined,
            }}
          >
            {isNearViewport ? (
              <motion.div
                ref={contentRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      dateValidation={computeDateValidation(
                        task,
                        settings.groupingStrategy,
                      )}
                    />
                  ))
                ) : (
                  <div className="px-2 py-4 text-sm text-slate-400">
                    No undated tasks.
                  </div>
                )}
              </motion.div>
            ) : (
              <div
                style={{ height: placeholderHeight }}
                className="bg-slate-50/30 rounded"
              />
            )}
          </div>
        </motion.div>
      </Collapsible>
    </div>
  );
};
